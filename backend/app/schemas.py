from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field


def split_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


class SourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    name: str
    url: str
    continent: str
    country: str
    region: str | None = None
    type: str
    priority: int
    linkStatus: str = Field(alias="link_status")
    lastChecked: datetime | None = Field(default=None, alias="last_checked")


class OpportunityOut(BaseModel):
    id: int
    title: str
    category: str
    continent: str
    country: str
    region: str | None = None
    city: str | None = None
    lat: float | None = None
    lng: float | None = None
    deadline: date | None = None
    eventDate: date | None = None
    genres: list[str]
    requirements: list[str]
    url: str
    sourceName: str
    sourceType: str
    summary: str
    linkStatus: str
    confidence: float
    published: bool
    lastChecked: datetime | None = None


class PaginatedOpportunities(BaseModel):
    items: list[OpportunityOut]
    count: int


class PaginatedSources(BaseModel):
    items: list[SourceOut]
    count: int


class HealthOut(BaseModel):
    ok: bool
    database: str
    open_model_configured: bool
    public_opportunities: int
    sources: int
