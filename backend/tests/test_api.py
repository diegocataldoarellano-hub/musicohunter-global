from fastapi.testclient import TestClient

from app.main import app
from app.discovery import build_discovery_queries
from app.schemas import split_csv


def test_split_csv_filters_empty_values():
    assert split_csv("rock, folk, ,experimental") == ["rock", "folk", "experimental"]


def test_discovery_queries_include_social_and_public_sources():
    queries = build_discovery_queries("Espana")
    joined = "\n".join(queries)
    assert "site:instagram.com" in joined
    assert "site:tiktok.com" in joined
    assert "municipio" in joined
    assert "booking" in joined


def test_health_and_public_opportunities_load():
    with TestClient(app) as client:
        health = client.get("/api/health")
        assert health.status_code == 200
        assert health.json()["ok"] is True

        opportunities = client.get("/api/opportunities")
        assert opportunities.status_code == 200
        data = opportunities.json()
        assert data["count"] >= 1
        assert "url" in data["items"][0]
        assert data["items"][0]["continent"] in {"Latinoamerica", "Global", "Internacional"}

        latin = client.get("/api/opportunities?continent=Latinoamerica")
        assert latin.status_code == 200
        assert latin.json()["count"] >= 1


def test_sources_load():
    with TestClient(app) as client:
        response = client.get("/api/sources")
        assert response.status_code == 200
        data = response.json()
        assert data["count"] >= 1
        assert data["items"][0]["url"].startswith("http")
        assert "continent" in data["items"][0]
