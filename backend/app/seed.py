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
    if not db.scalar(select(Source.id).limit(1)):
        for item in load_json("seed_sources.json"):
            db.add(Source(**item))
        db.commit()

    source_by_name = {source.name: source for source in db.scalars(select(Source)).all()}

    if not db.scalar(select(Opportunity.id).limit(1)):
        for item in load_json("seed_opportunities.json"):
            source = source_by_name.get(item["source_name"])
            item["deadline"] = parse_date(item.get("deadline"))
            item["event_date"] = parse_date(item.get("event_date"))
            item["source_id"] = source.id if source else None
            item["link_status"] = "requires_review"
            db.add(Opportunity(**item))
        db.commit()
