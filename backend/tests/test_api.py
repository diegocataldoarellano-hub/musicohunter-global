from fastapi.testclient import TestClient

from app.main import app
from app.curator_agent import extract_deadline_date, extract_event_date
from app.discovery import build_discovery_queries
from app.schemas import split_csv


def test_split_csv_filters_empty_values():
    assert split_csv("rock, folk, ,experimental") == ["rock", "folk", "experimental"]


def test_discovery_queries_include_social_and_public_sources():
    queries = build_discovery_queries("Espana")
    joined = "\n".join(queries)
    assert "site:instagram.com/p" in joined
    assert "site:instagram.com/reel" in joined
    assert "site:tiktok.com" in joined
    assert "municipio" in joined
    assert "booking" in joined


def test_chile_discovery_queries_include_regional_targets():
    joined = "\n".join(build_discovery_queries("Chile"))
    assert "Santiago" in joined
    assert "Valparaiso" in joined
    assert "Concepcion" in joined
    assert "Valle de Elqui" in joined
    assert "agendacultural" in joined
    assert "tocatasantiago" in joined
    assert "postula hasta" in joined


def test_extract_event_date_from_public_post_text():
    written = extract_event_date("Sabado 13 de junio, 19:00 horas en Teatro Biobio")
    numeric = extract_event_date("Concierto gratuito 29/05 a las 19:00 hrs")
    assert written is not None
    assert written.month == 6
    assert written.day == 13
    assert numeric is not None
    assert numeric.month == 5
    assert numeric.day == 29


def test_extract_deadline_date_from_call_text():
    deadline = extract_deadline_date("Convocatoria abierta: postula hasta el 20 de junio a las 23:59")
    event_date = extract_deadline_date("Concierto este 20 de junio a las 20:00 hrs")
    assert deadline is not None
    assert deadline.month == 6
    assert deadline.day == 20
    assert event_date is None


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
