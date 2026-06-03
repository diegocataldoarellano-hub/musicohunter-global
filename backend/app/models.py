from datetime import date, datetime
from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Source(Base):
    __tablename__ = "sources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    url: Mapped[str] = mapped_column(String(1000), unique=True)
    country: Mapped[str] = mapped_column(String(80), index=True)
    region: Mapped[str | None] = mapped_column(String(120), nullable=True)
    type: Mapped[str] = mapped_column(String(80), index=True)
    priority: Mapped[int] = mapped_column(Integer, default=50)
    query_hint: Mapped[str | None] = mapped_column(String(400), nullable=True)
    link_status: Mapped[str] = mapped_column(String(40), default="requires_review", index=True)
    last_checked: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    opportunities: Mapped[list["Opportunity"]] = relationship(back_populates="source")


class Opportunity(Base):
    __tablename__ = "opportunities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(260), index=True)
    category: Mapped[str] = mapped_column(String(80), index=True)
    country: Mapped[str] = mapped_column(String(80), index=True)
    region: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    event_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    genres: Mapped[str] = mapped_column(String(500), default="")
    requirements: Mapped[str] = mapped_column(Text, default="")
    url: Mapped[str] = mapped_column(String(1000), unique=True, index=True)
    source_name: Mapped[str] = mapped_column(String(220), index=True)
    source_type: Mapped[str] = mapped_column(String(80), index=True)
    summary: Mapped[str] = mapped_column(Text, default="")
    link_status: Mapped[str] = mapped_column(String(40), default="requires_review", index=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.5)
    published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    last_checked: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    source_id: Mapped[int | None] = mapped_column(ForeignKey("sources.id"), nullable=True)

    source: Mapped[Source | None] = relationship(back_populates="opportunities")


class PublicProfile(Base):
    __tablename__ = "public_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(220), index=True)
    url: Mapped[str] = mapped_column(String(1000), unique=True)
    country: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    region: Mapped[str | None] = mapped_column(String(120), nullable=True)
    type: Mapped[str] = mapped_column(String(80), index=True)
    genres: Mapped[str] = mapped_column(String(500), default="")
    summary: Mapped[str] = mapped_column(Text, default="")
    link_status: Mapped[str] = mapped_column(String(40), default="requires_review", index=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.5)
    last_checked: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class LinkCheck(Base):
    __tablename__ = "link_checks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    url: Mapped[str] = mapped_column(String(1000), index=True)
    status: Mapped[str] = mapped_column(String(40), index=True)
    http_status: Mapped[int | None] = mapped_column(Integer, nullable=True)
    final_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
