import json
from datetime import date
from pathlib import Path
from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Opportunity, Source


DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    return date.fromisoformat(value)


def load_json(name: str) -> list[dict]:
    with (DATA_DIR / name).open("r", encoding="utf-8") as handle:
        return json.load(handle)


def load_seed_sources() -> list[dict]:
    sources = load_json("seed_sources.json")
    curated_path = DATA_DIR / "seed_curated_sources.json"
    if curated_path.exists():
        with curated_path.open("r", encoding="utf-8") as handle:
            sources.extend(json.load(handle))
    return sources


def unique_seed_sources() -> list[dict]:
    unique = []
    seen_names = set()
    seen_urls = set()
    for item in reversed(load_seed_sources()):
        name_key = item["name"].strip().lower()
        url_key = item["url"].strip().lower()
        if name_key in seen_names or url_key in seen_urls:
            continue
        seen_names.add(name_key)
        seen_urls.add(url_key)
        unique.append(item)
    return list(reversed(unique))


def seed_database(db: Session) -> None:
    for item in unique_seed_sources():
        existing = db.scalar(select(Source).where((Source.url == item["url"]) | (Source.name == item["name"])))
        if existing:
            existing.name = item["name"]
            existing.url = item["url"]
            existing.country = item["country"]
            existing.region = item.get("region")
            existing.type = item["type"]
            existing.priority = item.get("priority", existing.priority)
            existing.query_hint = item.get("query_hint")
        else:
            db.add(Source(**item))
    db.commit()

    source_by_name = {source.name: source for source in db.scalars(select(Source)).all()}

    for raw_item in load_json("seed_opportunities.json"):
        item = raw_item.copy()
        existing = db.scalar(select(Opportunity).where(Opportunity.url == item["url"]))
        source = source_by_name.get(item["source_name"])
        item["deadline"] = parse_date(item.get("deadline"))
        item["event_date"] = parse_date(item.get("event_date"))
        item["source_id"] = source.id if source else None
        item["link_status"] = "requires_review"
        if existing:
            existing.title = item["title"]
            existing.category = item["category"]
            existing.country = item["country"]
            existing.region = item.get("region")
            existing.city = item.get("city")
            existing.lat = item.get("lat")
            existing.lng = item.get("lng")
            existing.deadline = item.get("deadline")
            existing.event_date = item.get("event_date")
            existing.genres = item["genres"]
            existing.requirements = item["requirements"]
            existing.source_name = item["source_name"]
            existing.source_type = item["source_type"]
            existing.source_id = item.get("source_id")
            existing.summary = item["summary"]
            existing.confidence = item.get("confidence", existing.confidence)
            existing.published = item.get("published", existing.published)
        else:
            db.add(Opportunity(**item))
    db.commit()
