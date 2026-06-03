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


def seed_database(db: Session) -> None:
    for item in load_json("seed_sources.json"):
        existing = db.scalar(select(Source).where(Source.url == item["url"]))
        if existing:
            existing.name = item["name"]
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
