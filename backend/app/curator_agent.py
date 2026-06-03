import asyncio
from datetime import datetime, timezone
from hashlib import sha256
import unicodedata
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup
from sqlalchemy import select

from .database import SessionLocal, init_db
from .link_checker import check_url, refresh_link_statuses
from .models import Opportunity, PublicProfile, Source
from .open_model import summarize_with_open_model
from .settings import get_settings


OPPORTUNITY_TERMS = [
    "convocatoria",
    "open call",
    "postula",
    "postulacion",
    "bases",
    "festival",
    "showcase",
    "booking",
    "programacion",
    "bandas emergentes",
    "rueda de negocios",
    "mercado musical",
]

GENRE_TERMS = [
    "rock",
    "folk",
    "fusion",
    "experimental",
    "progresivo",
    "psicodelico",
    "alternativo",
    "indie",
]

PROFILE_TERMS = ["booking", "manager", "radio", "programa", "prensa", "medio", "festival", "sala"]


def clean_text(value: str) -> str:
    return " ".join(value.split())


def normalize_text(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value)
    return "".join(char for char in decomposed if not unicodedata.combining(char)).lower()


def score_text(text: str) -> float:
    lower = normalize_text(text)
    opportunity_hits = sum(1 for term in OPPORTUNITY_TERMS if term in lower)
    genre_hits = sum(1 for term in GENRE_TERMS if term in lower)
    return min(0.98, 0.24 + opportunity_hits * 0.09 + genre_hits * 0.07)


def infer_category(text: str, source_type: str) -> str:
    lower = normalize_text(text)
    if "fondo" in lower or "financ" in lower or "subvencion" in lower:
        return "fondo"
    if "radio" in lower or "prensa" in lower or "medio" in lower:
        return "prensa"
    if "booking" in lower or "sala" in lower or "programacion" in lower:
        return "booking"
    if "showcase" in lower or "mercado" in lower:
        return "showcase"
    if "festival" in lower:
        return "festival"
    return source_type or "fuente"


def genre_csv(text: str) -> str:
    lower = normalize_text(text)
    genres = []
    for term in GENRE_TERMS:
        if term in lower and term not in genres:
            genres.append(term)
    return ",".join(genres or ["rock", "folk", "fusion", "experimental"])


def make_candidate_url(source_url: str, href: str | None) -> str:
    if not href:
        return source_url
    return urljoin(source_url, href)


async def fetch_source(source: Source) -> list[dict]:
    settings = get_settings()
    headers = {"User-Agent": "MusicHunterBot/1.0 (+public curated music opportunities)"}
    async with httpx.AsyncClient(timeout=settings.request_timeout_seconds, follow_redirects=True, headers=headers) as client:
        response = await client.get(source.url)
        response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()

    candidates = []
    for anchor in soup.find_all("a", href=True):
        label = clean_text(anchor.get_text(" ", strip=True))
        if len(label) < 6:
            continue
        context = clean_text(anchor.parent.get_text(" ", strip=True)) if anchor.parent else label
        text = f"{label} {context}"
        confidence = score_text(text)
        if confidence < 0.45:
            continue
        candidates.append(
            {
                "title": label[:240],
                "url": make_candidate_url(source.url, anchor.get("href")),
                "summary": context[:700],
                "confidence": confidence,
                "category": infer_category(text, source.type),
                "genres": genre_csv(text),
            }
        )
        if len(candidates) >= 12:
            break
    return candidates


def upsert_opportunity(db, source: Source, candidate: dict, link_status: str, summary: str | None) -> bool:
    existing = db.scalar(select(Opportunity).where(Opportunity.url == candidate["url"]))
    if existing:
        existing.summary = summary or candidate["summary"]
        existing.confidence = max(existing.confidence, candidate["confidence"])
        existing.link_status = link_status
        existing.last_checked = datetime.now(timezone.utc)
        existing.published = link_status in {"ok", "redirected"} and existing.confidence >= 0.5
        return False

    stable_id = sha256(candidate["url"].encode("utf-8")).hexdigest()[:10]
    db.add(
        Opportunity(
            title=candidate["title"] or f"Fuente detectada {stable_id}",
            category=candidate["category"],
            country=source.country,
            region=source.region,
            city=source.region,
            lat=None,
            lng=None,
            deadline=None,
            event_date=None,
            genres=candidate["genres"],
            requirements="Revisar requisitos en la fuente oficial; preparar EPK; validar fecha limite antes de postular.",
            url=candidate["url"],
            source_name=source.name,
            source_type=source.type,
            source_id=source.id,
            summary=summary or candidate["summary"],
            link_status=link_status,
            confidence=candidate["confidence"],
            published=link_status in {"ok", "redirected"} and candidate["confidence"] >= 0.5,
            last_checked=datetime.now(timezone.utc),
        )
    )
    return True


def upsert_profile(db, source: Source) -> None:
    lower = f"{source.name} {source.type} {source.query_hint or ''}".lower()
    if not any(term in lower for term in PROFILE_TERMS):
        return
    existing = db.scalar(select(PublicProfile).where(PublicProfile.url == source.url))
    if existing:
        existing.link_status = source.link_status
        existing.last_checked = source.last_checked
        return
    db.add(
        PublicProfile(
            name=source.name,
            url=source.url,
            country=source.country,
            region=source.region,
            type=source.type,
            genres="rock,folk,fusion,experimental,indie",
            summary=f"Perfil publico vigilado: {source.name}.",
            link_status=source.link_status,
            confidence=0.62,
            last_checked=source.last_checked,
        )
    )


async def run_curator() -> dict:
    init_db()
    settings = get_settings()
    created = 0
    reviewed = 0
    errors = []

    with SessionLocal() as db:
        await refresh_link_statuses(db, limit=settings.curator_max_pages)
        sources = db.scalars(select(Source).order_by(Source.priority.desc()).limit(settings.curator_max_pages)).all()
        for source in sources:
            if source.link_status in {"broken", "timeout"}:
                continue
            try:
                candidates = await fetch_source(source)
                for candidate in candidates:
                    result = await check_url(candidate["url"])
                    if result.status in {"broken", "timeout"}:
                        continue
                    summary = await summarize_with_open_model(candidate["title"], candidate["summary"])
                    if upsert_opportunity(db, source, candidate, result.status, summary):
                        created += 1
                    reviewed += 1
                upsert_profile(db, source)
                db.commit()
            except Exception as exc:
                errors.append({"source": source.name, "error": str(exc)})
                db.rollback()

    return {"created": created, "reviewed": reviewed, "errors": errors}


def main() -> None:
    result = asyncio.run(run_curator())
    print(result)


if __name__ == "__main__":
    main()
