from urllib.parse import urlparse

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Source
from .settings import get_settings


TARGET_COUNTRIES = [
    *[("Latinoamerica", country) for country in [
        "Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Costa Rica", "Cuba", "Ecuador",
        "El Salvador", "Guatemala", "Honduras", "Mexico", "Nicaragua", "Panama", "Paraguay",
        "Peru", "Republica Dominicana", "Uruguay", "Venezuela",
    ]],
    *[("Europa", country) for country in [
        "Albania", "Alemania", "Andorra", "Armenia", "Austria", "Belgica", "Bielorrusia",
        "Bosnia y Herzegovina", "Bulgaria", "Chipre", "Croacia", "Dinamarca", "Eslovaquia",
        "Eslovenia", "Espana", "Estonia", "Finlandia", "Francia", "Georgia", "Grecia",
        "Hungria", "Irlanda", "Islandia", "Italia", "Kosovo", "Letonia", "Liechtenstein",
        "Lituania", "Luxemburgo", "Macedonia del Norte", "Malta", "Moldavia", "Monaco",
        "Montenegro", "Noruega", "Paises Bajos", "Polonia", "Portugal", "Reino Unido",
        "Republica Checa", "Rumania", "San Marino", "Serbia", "Suecia", "Suiza", "Turquia",
        "Ucrania", "Vaticano",
    ]],
]

SEARCH_MISSION_TEMPLATES = [
    'site:instagram.com/p "{country}" festival bandas rock convocatoria',
    'site:instagram.com/reel "{country}" buscan teloneros rock concierto',
    'site:instagram.com/p "{country}" showcase bandas convocatoria musica',
    'site:instagram.com "{country}" productora booking bandas rock',
    'site:tiktok.com "{country}" festival rock bandas convocatoria',
    '"{country}" fondos musica bandas rock convocatoria',
    '"{country}" municipio centro cultural musica bandas pago',
    '"{country}" productora booking bandas rock fusion',
    '"{country}" revista musica rock programa radio bandas',
    '"{country}" sello independiente rock experimental booking',
    '"{country}" intercambio musical bandas latinoamerica europa',
]

CHILE_REGIONAL_TARGETS = [
    "Santiago",
    "Valparaiso",
    "Limache",
    "Chillan",
    "Los Angeles Bio Bio",
    "Concepcion",
    "Valle de Elqui",
    "La Serena",
    "Coquimbo",
    "Norte de Chile",
    "Sur de Chile",
]

CHILE_REGIONAL_MISSION_TEMPLATES = [
    'site:instagram.com/p "{region}" agenda cultural conciertos bandas rock',
    'site:instagram.com/reel "{region}" festival convocatoria teloneros musica',
    '"{region}" centro cultural musica conciertos convocatoria entrada liberada',
    '"{region}" municipio cultura bandas festival musica pago honorarios',
]


def build_discovery_queries(country: str) -> list[str]:
    queries = [template.replace("{country}", country) for template in SEARCH_MISSION_TEMPLATES]
    if country == "Chile":
        for region in CHILE_REGIONAL_TARGETS:
            queries.extend(template.replace("{region}", region) for template in CHILE_REGIONAL_MISSION_TEMPLATES)
    return queries


def infer_source_type(url: str, title: str, snippet: str) -> str:
    text = f"{url} {title} {snippet}".lower()
    if "instagram.com" in text or "tiktok.com" in text:
        return "red_social"
    if "municip" in text:
        return "municipalidad"
    if "centro cultural" in text or "cultura" in text:
        return "centro_cultural"
    if "radio" in text:
        return "radio"
    if "revista" in text or "magazine" in text or "prensa" in text:
        return "prensa"
    if "sello" in text or "records" in text or "label" in text:
        return "sello"
    if "productora" in text or "booking" in text or "agency" in text:
        return "productora"
    if "festival" in text:
        return "festival"
    return "perfil_publico"


def source_name_from_result(title: str, url: str) -> str:
    clean_title = " ".join(title.split())
    if clean_title:
        return clean_title[:210]
    host = urlparse(url).netloc.replace("www.", "")
    return host[:210] or url[:210]


async def google_cse_search(query: str) -> list[dict]:
    settings = get_settings()
    if not settings.google_search_api_key or not settings.google_search_engine_id:
        return []
    params = {
        "key": settings.google_search_api_key,
        "cx": settings.google_search_engine_id,
        "q": query,
        "num": min(settings.discovery_results_per_query, 10),
        "safe": "active",
    }
    async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
        response = await client.get("https://www.googleapis.com/customsearch/v1", params=params)
        response.raise_for_status()
    return response.json().get("items", [])


async def discover_sources_from_search(db: Session) -> int:
    settings = get_settings()
    if not settings.google_search_api_key or not settings.google_search_engine_id:
        return 0

    created = 0
    countries = TARGET_COUNTRIES[: settings.discovery_country_limit]
    for continent, country in countries:
        for query in build_discovery_queries(country)[: settings.discovery_queries_per_country]:
            for item in await google_cse_search(query):
                url = item.get("link")
                if not url:
                    continue
                existing = db.scalar(select(Source).where(Source.url == url))
                if existing:
                    continue
                title = item.get("title") or ""
                snippet = item.get("snippet") or ""
                db.add(
                    Source(
                        name=source_name_from_result(title, url),
                        url=url,
                        country=country,
                        region="Digital" if "site:" in query else None,
                        type=infer_source_type(url, title, snippet),
                        priority=58 if continent == "Europa" else 72,
                        query_hint=query,
                    )
                )
                created += 1
    db.commit()
    return created
