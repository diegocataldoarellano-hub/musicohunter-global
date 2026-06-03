from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from .curator_agent import run_curator
from .database import SessionLocal, get_db, init_db
from .discovery import TARGET_COUNTRIES
from .link_checker import refresh_link_statuses
from .models import Opportunity, Source
from .schemas import HealthOut, OpportunityOut, PaginatedOpportunities, PaginatedSources, SourceOut, split_csv
from .seed import seed_database
from .settings import get_settings


settings = get_settings()


def continent_for_country(country: str | None) -> str:
    if not country or country == "Global":
        return "Global"
    for continent, target_country in TARGET_COUNTRIES:
        if country == target_country:
            return continent
    return "Internacional"


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    with SessionLocal() as db:
        seed_database(db)
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)

allow_origins = ["*"] if settings.cors_origin_list == ["*"] else settings.cors_origin_list
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def verify_admin(x_admin_token: Annotated[str | None, Header()] = None) -> None:
    if not settings.admin_token:
        raise HTTPException(status_code=403, detail="Admin token is not configured.")
    if x_admin_token != settings.admin_token:
        raise HTTPException(status_code=401, detail="Invalid admin token.")


def opportunity_to_out(item: Opportunity) -> OpportunityOut:
    return OpportunityOut(
        id=item.id,
        title=item.title,
        category=item.category,
        continent=continent_for_country(item.country),
        country=item.country,
        region=item.region,
        city=item.city,
        lat=item.lat,
        lng=item.lng,
        deadline=item.deadline,
        eventDate=item.event_date,
        genres=split_csv(item.genres),
        requirements=split_csv(item.requirements.replace(";", ",")),
        url=item.url,
        sourceName=item.source_name,
        sourceType=item.source_type,
        summary=item.summary,
        linkStatus=item.link_status,
        confidence=item.confidence,
        published=item.published,
        lastChecked=item.last_checked,
    )


def source_to_out(item: Source) -> SourceOut:
    return SourceOut(
        id=item.id,
        name=item.name,
        url=item.url,
        continent=continent_for_country(item.country),
        country=item.country,
        region=item.region,
        type=item.type,
        priority=item.priority,
        linkStatus=item.link_status,
        lastChecked=item.last_checked,
    )


@app.get("/api/health", response_model=HealthOut)
def health(db: Session = Depends(get_db)) -> HealthOut:
    return HealthOut(
        ok=True,
        database=settings.database_url.split(":", 1)[0],
        open_model_configured=bool(settings.open_model_base_url and settings.open_model_api_key),
        public_opportunities=db.query(Opportunity).filter(Opportunity.published.is_(True)).count(),
        sources=db.query(Source).count(),
    )


@app.get("/api/opportunities", response_model=PaginatedOpportunities)
def list_opportunities(
    db: Session = Depends(get_db),
    q: str | None = Query(default=None, max_length=200),
    continent: str | None = None,
    country: str | None = None,
    region: str | None = None,
    category: str | None = None,
    genre: str | None = None,
    link_status: str | None = None,
    include_unpublished: bool = False,
    limit: int = Query(default=120, le=500),
    offset: int = Query(default=0, ge=0),
) -> PaginatedOpportunities:
    query = db.query(Opportunity)
    if not include_unpublished:
        query = query.filter(Opportunity.published.is_(True))
    if q:
        needle = f"%{q}%"
        query = query.filter(
            or_(
                Opportunity.title.ilike(needle),
                Opportunity.summary.ilike(needle),
                Opportunity.country.ilike(needle),
                Opportunity.region.ilike(needle),
                Opportunity.city.ilike(needle),
                Opportunity.genres.ilike(needle),
                Opportunity.source_name.ilike(needle),
            )
        )
    if continent:
        countries = [country for country in {row[0] for row in db.query(Opportunity.country).distinct()} if continent_for_country(country) == continent]
        query = query.filter(Opportunity.country.in_(countries or ["__none__"]))
    if country:
        query = query.filter(Opportunity.country == country)
    if region:
        query = query.filter(Opportunity.region == region)
    if category:
        query = query.filter(Opportunity.category == category)
    if genre:
        query = query.filter(Opportunity.genres.ilike(f"%{genre}%"))
    if link_status:
        query = query.filter(Opportunity.link_status == link_status)

    count = query.count()
    rows = (
        query.order_by(Opportunity.deadline.is_(None), Opportunity.deadline.asc(), Opportunity.confidence.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return PaginatedOpportunities(items=[opportunity_to_out(row) for row in rows], count=count)


@app.get("/api/opportunities/{opportunity_id}", response_model=OpportunityOut)
def get_opportunity(opportunity_id: int, db: Session = Depends(get_db)) -> OpportunityOut:
    item = db.get(Opportunity, opportunity_id)
    if not item or not item.published:
        raise HTTPException(status_code=404, detail="Opportunity not found.")
    return opportunity_to_out(item)


@app.get("/api/sources", response_model=PaginatedSources)
def list_sources(
    db: Session = Depends(get_db),
    q: str | None = Query(default=None, max_length=200),
    continent: str | None = None,
    country: str | None = None,
    source_type: str | None = None,
    limit: int = Query(default=120, le=500),
    offset: int = Query(default=0, ge=0),
) -> PaginatedSources:
    query = db.query(Source)
    if q:
        needle = f"%{q}%"
        query = query.filter(or_(Source.name.ilike(needle), Source.query_hint.ilike(needle), Source.url.ilike(needle)))
    if continent:
        countries = [country for country in {row[0] for row in db.query(Source.country).distinct()} if continent_for_country(country) == continent]
        query = query.filter(Source.country.in_(countries or ["__none__"]))
    if country:
        query = query.filter(Source.country == country)
    if source_type:
        query = query.filter(Source.type == source_type)
    count = query.count()
    rows = query.order_by(Source.priority.desc(), Source.name.asc()).offset(offset).limit(limit).all()
    return PaginatedSources(items=[source_to_out(row) for row in rows], count=count)


@app.get("/api/search", response_model=PaginatedOpportunities)
def search(q: str = Query(min_length=2, max_length=200), db: Session = Depends(get_db)) -> PaginatedOpportunities:
    return list_opportunities(db=db, q=q, include_unpublished=False, limit=80, offset=0)


@app.post("/api/admin/check-links", dependencies=[Depends(verify_admin)])
async def admin_check_links(db: Session = Depends(get_db)) -> dict:
    counts = await refresh_link_statuses(db)
    return {"ok": True, "counts": counts}


@app.post("/api/admin/refresh", dependencies=[Depends(verify_admin)])
async def admin_refresh() -> dict:
    result = await run_curator()
    return {"ok": True, **result}
