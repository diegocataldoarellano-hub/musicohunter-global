import asyncio
from datetime import date, datetime, timezone
from hashlib import sha256
import re
import unicodedata
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup
from sqlalchemy import select

from .application_inspector import build_application_snapshot
from .database import SessionLocal, init_db
from .discovery import TARGET_COUNTRIES, discover_sources_from_search
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
    "fondos",
    "concurso",
    "concursos",
    "inscripcion",
    "acreditacion",
    "festival",
    "showcase",
    "showcases",
    "booking",
    "programacion",
    "cartelera",
    "concierto",
    "conciertos",
    "telonero",
    "teloneros",
    "gira",
    "giras",
    "intercambio",
    "intercambios",
    "sala",
    "centro cultural",
    "municipio",
    "municipalidad",
    "ong",
    "residencia",
    "pago",
    "honorarios",
    "cachet",
    "contratacion",
    "productora",
    "sello",
    "revista",
    "radio",
    "programa de radio",
    "prensa musical",
    "medio musical",
    "media partner",
    "entrevista",
    "estreno",
    "agenda musical",
    "instagram",
    "tiktok",
    "bandas emergentes",
    "buscamos bandas",
    "se buscan bandas",
    "llamado a bandas",
    "llamado a artistas",
    "presentar artistas",
    "postula tu proyecto",
    "programacion artistica",
    "recepcion de propuestas",
    "formulario de postulacion",
    "dossier",
    "epk",
    "press kit",
    "submit your music",
    "artist submissions",
    "band submissions",
    "apply to play",
    "opening act",
    "support act",
    "submit demo",
    "send demos",
    "demo submission",
    "a&r",
    "roster",
    "pitch",
    "enviar single",
    "nota de prensa",
    "comunicado de prensa",
    "rueda de negocios",
    "mercado musical",
    "programming submissions",
    "call for proposals",
    "artist proposals",
    "new sounds",
    "fresh sounds",
    "emerging artists",
    "emerging bands",
    "new talent",
    "up-and-coming bands",
    "international artists",
    "foreign artists",
    "open to international",
    "music export",
    "travel support",
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

PROFILE_TERMS = [
    "booking",
    "manager",
    "radio",
    "programa",
    "prensa",
    "medio",
    "revista",
    "media partner",
    "prensa musical",
    "programa de radio",
    "entrevista",
    "festival",
    "sala",
    "centro cultural",
    "municipio",
    "municipalidad",
    "ong",
    "productora",
    "sello",
    "instagram",
    "tiktok",
]

IGNORED_NAV_TERMS = [
    "transparencia",
    "politica de privacidad",
    "politicas de privacidad",
    "privacy policy",
    "terminos y condiciones",
    "accesibilidad",
    "mapa del sitio",
    "newsletter",
    "suscribete",
]

APPLICATION_SIGNAL_TERMS = [
    "postula",
    "postulacion",
    "formulario",
    "bases",
    "inscripcion",
    "convocatoria",
    "application",
    "apply",
    "submit",
    "submission",
    "open call",
    "enviar single",
    "enviar material",
    "nota de prensa",
    "comunicado de prensa",
]

CONTACT_SIGNAL_TERMS = [
    "contacto",
    "correo",
    "email",
    "mailto:",
    "booking",
    "manager",
    "produccion",
    "programacion",
    "a&r",
    "prensa",
    "medio",
    "radio",
    "media partner",
]

SEMANTIC_SIGNAL_GROUPS = {
    "teloneros": [
        "telonero", "teloneros", "banda soporte", "banda invitada", "artista invitado",
        "abrir concierto", "abrir show", "buscamos bandas", "se buscan bandas",
        "support act", "opening act", "opening band", "support slot", "warm up band",
        "local support", "special guest band", "guest artist", "premiere partie",
        "vorband", "supportband", "acto de apertura",
    ],
    "internacional": [
        "bandas internacionales", "artistas internacionales", "bandas extranjeras",
        "artistas de otros paises", "proyectos internacionales", "latinoamerica",
        "iberoamerica", "foreign artists", "international artists", "artists from abroad",
        "overseas artists", "touring artists", "from other countries",
        "global artists", "worldwide artists", "international applicants",
        "open to international", "international touring artists",
    ],
    "showcase": [
        "showcase", "music market", "mercado musical", "rueda de negocios",
        "delegacion artistica", "artist application", "band submissions",
        "apply to play", "festival submissions", "postulacion showcase",
    ],
    "movilidad": [
        "gira", "giras", "tour", "touring", "residencia", "residency",
        "intercambio", "movilidad", "circulacion", "itinerancia",
        "mobility grant", "touring grant", "artist residency", "coproduccion internacional",
        "travel support", "international mobility", "cultural exchange",
    ],
    "nuevos_sonidos": [
        "nuevos sonidos", "nuevo sonido", "sonidos emergentes", "bandas emergentes",
        "artistas emergentes", "new sounds", "fresh sounds", "emerging artists",
        "emerging bands", "new talent", "new music discovery", "undiscovered artists",
        "next wave", "up-and-coming bands", "new voices", "independent artists",
        "alternative sounds", "experimental sounds", "musica independiente",
        "talento emergente", "descubrimiento musical",
    ],
    "programacion": [
        "programacion artistica", "curatoria musical", "recepcion de propuestas",
        "presentar artistas", "artist proposals", "programming submissions",
        "booking inquiry", "programme proposals", "live music programming",
        "cultural programming", "call for proposals", "artist call", "music programming",
    ],
}


def clean_text(value: str) -> str:
    return " ".join(value.split())


def normalize_text(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value)
    return "".join(char for char in decomposed if not unicodedata.combining(char)).lower()


def contains_any(text: str, terms: list[str]) -> bool:
    return any(normalize_text(term) in text for term in terms)


def semantic_signal_hits(text: str) -> list[str]:
    lower = normalize_text(text)
    return [
        group
        for group, terms in SEMANTIC_SIGNAL_GROUPS.items()
        if contains_any(lower, terms)
    ]


def score_text(text: str) -> float:
    lower = normalize_text(text)
    opportunity_hits = sum(1 for term in OPPORTUNITY_TERMS if normalize_text(term) in lower)
    genre_hits = sum(1 for term in GENRE_TERMS if normalize_text(term) in lower)
    profile_hits = sum(1 for term in PROFILE_TERMS if normalize_text(term) in lower)
    semantic_hits = len(semantic_signal_hits(text))
    return min(0.98, 0.2 + opportunity_hits * 0.07 + genre_hits * 0.05 + profile_hits * 0.04 + semantic_hits * 0.12)


def is_navigation_noise(text: str) -> bool:
    lower = normalize_text(text)
    return contains_any(lower, IGNORED_NAV_TERMS)


def extract_application_requirements(text: str, source_type: str) -> str:
    lower = normalize_text(text)
    requirements = []
    signals = semantic_signal_hits(text)
    if contains_any(lower, APPLICATION_SIGNAL_TERMS):
        requirements.append("Entrar a la pagina oficial y buscar bases, formulario, plazo y condiciones de postulacion.")
    if contains_any(lower, ["epk", "press kit", "dossier", "bio", "video", "links", "material"]):
        requirements.append("Preparar EPK/dossier: bio breve, links de audio/video, registro en vivo, fotos, redes publicas y contacto.")
    if contains_any(lower, ["bandas", "solistas", "artists", "musicians", "support act", "opening act"]) or "teloneros" in signals:
        requirements.append("Confirmar si aceptan bandas, solistas o artistas extranjeros y que generos estan buscando.")
    if contains_any(lower, CONTACT_SIGNAL_TERMS):
        requirements.append("Usar solo el correo/formulario/canal de booking indicado por la fuente; no enviar mensajes genericos.")
    if contains_any(lower, ["prensa", "radio", "media partner", "entrevista", "enviar single", "nota de prensa", "comunicado de prensa"]):
        requirements.append("Para prensa/radio: preparar comunicado breve, fecha de lanzamiento o concierto, EPK, links publicos y una propuesta de nota/entrevista concreta.")
    if "internacional" in signals:
        requirements.append("Como hay senal internacional, confirmar si aceptan artistas de otros paises, visa/viaje, idioma de postulacion y disponibilidad de gira.")
    if "showcase" in signals:
        requirements.append("Para showcase/mercado: preparar pitch exportable, objetivos de networking, links en vivo y disponibilidad para reuniones.")
    if "movilidad" in signals:
        requirements.append("Para movilidad/gira: revisar financiamiento, fechas, rutas, carta de invitacion y requisitos de residencia o intercambio.")
    if "nuevos_sonidos" in signals:
        requirements.append("Como hay senal de nuevos sonidos, preparar pitch de identidad sonora: influencias, propuesta diferencial, registro en vivo y por que encaja con la curatoria.")
    if "programacion" in signals:
        requirements.append("Como hay senal de programacion artistica, buscar seccion de propuestas, correo de programacion, calendario curatorial y requisitos tecnicos.")
    if contains_any(lower, DEADLINE_TERMS) or contains_any(lower, ["deadline", "apply by", "applications close"]):
        requirements.append("Verificar fecha de publicacion, cierre de convocatoria, fecha del evento y zona horaria.")
    if contains_any(lower, ["productora", "booking", "agency", "sello", "label", "a&r", "roster", "demo"]):
        requirements.append("Enviar pitch corto alineado al catalogo/lineup: sonido, ciudad, logros, links y propuesta de valor.")
    if not requirements:
        requirements.append("Abrir la fuente y ubicar seccion de postulacion, contacto, programacion o convocatoria antes de escribir.")
    if source_type in {"sello", "productora", "booking_agency"} and len(requirements) < 3:
        requirements.append("Revisar roster/catalogo antes de postular para no enviar material fuera de linea editorial.")
    return "; ".join(requirements)


def infer_category(text: str, source_type: str) -> str:
    lower = normalize_text(text)
    signals = semantic_signal_hits(text)
    if "teloneros" in signals:
        return "telonero"
    if "showcase" in signals:
        return "showcase"
    if "internacional" in signals or "movilidad" in signals:
        return "circulacion"
    if "nuevos_sonidos" in signals:
        return "busqueda_sonidos"
    if "programacion" in signals:
        return "programacion"
    if "fondo" in lower or "financ" in lower or "subvencion" in lower:
        return "fondo"
    if "concurso" in lower or "certamen" in lower:
        return "concurso"
    if "telonero" in lower or "teloneros" in lower:
        return "telonero"
    if "gira" in lower or "intercambio" in lower:
        return "circulacion"
    if "municipio" in lower or "municipalidad" in lower:
        return "municipalidad"
    if "ong" in lower or "fundacion" in lower:
        return "ong"
    if "centro cultural" in lower or "residencia" in lower:
        return "centro_cultural"
    if "sello" in lower or "catalogo" in lower:
        return "sello"
    if "productora" in lower or "promotora" in lower:
        return "productora"
    if "instagram" in lower or "tiktok" in lower or "perfil publico" in lower:
        return "perfil_publico"
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


SPANISH_MONTHS = {
    "enero": 1,
    "febrero": 2,
    "marzo": 3,
    "abril": 4,
    "mayo": 5,
    "junio": 6,
    "julio": 7,
    "agosto": 8,
    "septiembre": 9,
    "setiembre": 9,
    "octubre": 10,
    "noviembre": 11,
    "diciembre": 12,
}

DEADLINE_TERMS = [
    "postula hasta",
    "postulaciones hasta",
    "convocatoria hasta",
    "cierre de postulaciones",
    "recepcion hasta",
    "cierre",
    "fecha limite",
    "plazo",
    "bases hasta",
    "inscripciones hasta",
    "deadline",
    "submission deadline",
    "apply by",
    "applications close",
    "applications until",
]


def infer_year(month: int, day: int) -> int:
    today = datetime.now(timezone.utc).date()
    inferred = date(today.year, month, day)
    # If a public post says "30 de mayo" and that already passed, treat it as
    # next cycle unless the text explicitly includes a year.
    if inferred < today:
        return today.year + 1
    return today.year


def extract_event_date(text: str) -> date | None:
    normalized = normalize_text(text)
    month_names = "|".join(SPANISH_MONTHS)
    match = re.search(rf"\b(\d{{1,2}})\s+de\s+({month_names})(?:\s+de\s+(\d{{4}}))?\b", normalized)
    if match:
        day = int(match.group(1))
        month = SPANISH_MONTHS[match.group(2)]
        year = int(match.group(3)) if match.group(3) else infer_year(month, day)
        try:
            return date(year, month, day)
        except ValueError:
            return None

    numeric = re.search(r"\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b", normalized)
    if numeric:
        day = int(numeric.group(1))
        month = int(numeric.group(2))
        year_raw = numeric.group(3)
        year = int(year_raw) if year_raw else infer_year(month, day)
        if year < 100:
            year += 2000
        try:
            return date(year, month, day)
        except ValueError:
            return None
    return None


def extract_deadline_date(text: str) -> date | None:
    normalized = normalize_text(text)
    if not any(term in normalized for term in DEADLINE_TERMS):
        return None
    return extract_event_date(text)


def make_candidate_url(source_url: str, href: str | None) -> str:
    if not href:
        return source_url
    return urljoin(source_url, href)


def contact_bits_from_soup(soup: BeautifulSoup, page_url: str) -> list[str]:
    contact_bits = []
    contact_terms = [
        "contact",
        "contacto",
        "booking",
        "programacion",
        "programming",
        "apply",
        "application",
        "submission",
        "submit",
        "form",
        "postula",
        "convocatoria",
    ]
    form_hosts = ("typeform", "forms.gle", "google.com/forms", "airtable", "jotform")
    for anchor in soup.find_all("a", href=True):
        href = anchor.get("href", "").strip()
        label = clean_text(anchor.get_text(" ", strip=True))
        lower = f"{label} {href}".lower()
        absolute_url = urljoin(page_url, href)
        if href.lower().startswith("mailto:"):
            contact_bits.append(f"email {href}")
        elif any(term in lower for term in contact_terms) or any(host in lower for host in form_hosts):
            contact_bits.append(f"contact link: {label} {absolute_url}")
        if len(contact_bits) >= 12:
            break
    return contact_bits


async def inspect_candidate_text(client: httpx.AsyncClient, url: str) -> str:
    if not url.startswith(("http://", "https://")):
        return ""
    try:
        response = await client.get(url)
        response.raise_for_status()
    except Exception:
        return ""
    content_type = response.headers.get("content-type", "")
    if "html" not in content_type and "text" not in content_type:
        return ""
    soup = BeautifulSoup(response.text, "html.parser")
    contact_bits = contact_bits_from_soup(soup, url)
    for tag in soup(["script", "style", "noscript", "svg"]):
        tag.decompose()
    page_text = clean_text(soup.get_text(" ", strip=True))
    return clean_text(f"{page_text} {' '.join(contact_bits)}")[:6500]


async def fetch_source(source: Source) -> list[dict]:
    settings = get_settings()
    headers = {"User-Agent": "RadarComeGuagaBot/1.0 (+public curated music opportunities)"}
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
        if is_navigation_noise(text):
            continue
        confidence = score_text(text)
        if confidence < 0.45:
            continue
        candidate_url = make_candidate_url(source.url, anchor.get("href"))
        detail_text = await inspect_candidate_text(client, candidate_url)
        inspected_text = f"{text} {detail_text}"
        requirements = extract_application_requirements(inspected_text, source.type)
        snapshot = build_application_snapshot(label, inspected_text, requirements, candidate_url)
        deadline_date = extract_deadline_date(inspected_text)
        candidates.append(
            {
                "title": label[:240],
                "url": candidate_url,
                "summary": f"{snapshot['summary']} {(detail_text or context)[:520]}",
                "confidence": max(confidence, score_text(inspected_text)),
                "category": infer_category(inspected_text, source.type),
                "genres": genre_csv(inspected_text),
                "requirements": requirements,
                "event_date": None if deadline_date else extract_event_date(inspected_text),
                "deadline": deadline_date,
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
        existing.requirements = candidate.get("requirements") or existing.requirements
        existing.deadline = candidate.get("deadline") or existing.deadline
        existing.event_date = candidate.get("event_date") or existing.event_date
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
            deadline=candidate.get("deadline"),
            event_date=candidate.get("event_date"),
            genres=candidate["genres"],
            requirements=candidate.get("requirements") or "Abrir la fuente oficial; revisar como postular, plazo, bases, formulario y contacto publico.",
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
    discovered_sources = 0
    reviewed = 0
    errors = []

    with SessionLocal() as db:
        discovered_sources = await discover_sources_from_search(db)
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

    return {"created": created, "discovered_sources": discovered_sources, "reviewed": reviewed, "errors": errors}


async def run_fast_global_refresh() -> dict:
    init_db()
    settings = get_settings()
    created = 0
    reviewed = 0
    errors = []

    with SessionLocal() as db:
        before_sources = db.query(Source).count()
        before_opportunities = db.query(Opportunity).count()
        discovered_sources = await discover_sources_from_search(
            db,
            country_limit=len(TARGET_COUNTRIES),
            queries_per_country=4,
            results_per_query=2,
        )
        link_counts = await refresh_link_statuses(db, limit=min(settings.curator_max_pages, 80))
        sources = db.scalars(select(Source).order_by(Source.last_checked.desc().nullsfirst(), Source.priority.desc()).limit(min(settings.curator_max_pages, 28))).all()
        for source in sources:
            if source.link_status in {"broken", "timeout"}:
                continue
            try:
                candidates = await fetch_source(source)
                for candidate in candidates[:4]:
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

        after_sources = db.query(Source).count()
        after_opportunities = db.query(Opportunity).count()

    return {
        "mode": "fast_global",
        "countries_scanned": len(TARGET_COUNTRIES),
        "queries_per_country": 4,
        "results_per_query": 2,
        "discovered_sources": discovered_sources,
        "created": created,
        "reviewed": reviewed,
        "link_counts": link_counts,
        "before": {"sources": before_sources, "opportunities": before_opportunities},
        "after": {"sources": after_sources, "opportunities": after_opportunities},
        "added": {
            "sources": after_sources - before_sources,
            "opportunities": after_opportunities - before_opportunities,
        },
        "errors": errors,
    }


def main() -> None:
    result = asyncio.run(run_curator())
    print(result)


if __name__ == "__main__":
    main()
