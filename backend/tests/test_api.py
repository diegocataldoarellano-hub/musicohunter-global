from fastapi.testclient import TestClient
from bs4 import BeautifulSoup

from app.main import app
from app.application_inspector import build_application_snapshot, extract_contact, infer_application_cost
from app.curator_agent import contact_bits_from_soup, extract_application_requirements, extract_deadline_date, extract_event_date, is_navigation_noise, score_text, semantic_signal_hits
from app.discovery import (
    ARGENTINA_CANADA_US_DEEP_REVIEW,
    ASIA_DEEP_REVIEW_TARGETS,
    ASIA_FUNDS_PRODUCERS_FOREIGN_CALLS,
    CHILE_DEEP_SEARCH_TARGETS,
    CHILE_MEDIA_PROFILE_TARGETS,
    CHILE_PUBLIC_SPACE_TARGETS,
    COUNTRY_PUBLIC_SPACE_TARGETS,
    EXPANSION_PRIORITY_ORDER,
    EUROPE_DEEP_REVIEW_TARGETS,
    FOCUS_COUNTRY_FUNDS_PRODUCERS_FOREIGN_CALLS,
    GREENLAND_DEEP_REVIEW_TARGETS,
    GLOBAL_TERRITORIAL_AREA_SEEDS,
    GLOBAL_SUPPORT_FUNDING_PATTERNS,
    GLOBAL_SUPPORT_FUNDING_TERMS,
    GLOBAL_SUPPORT_INSTITUTION_TARGETS,
    GLOBAL_RADAR_DEEP_EXPANSION,
    HIGH_VALUE_SEMANTIC_TERMS,
    LATAM_RECOGNIZED_TARGETS,
    SEMANTIC_INTENT_GROUPS,
    SOUTH_AMERICA_DEEP_EXPANSION,
    TARGET_COUNTRIES,
    build_discovery_queries,
    build_global_discovery_queries,
    build_global_support_funding_queries,
    build_semantic_discovery_queries,
    build_territorial_discovery_queries,
    global_mission_capacity,
)
from app.schemas import split_csv
from app.seed import load_seed_sources


def test_split_csv_filters_empty_values():
    assert split_csv("rock, folk, ,experimental") == ["rock", "folk", "experimental"]


def test_application_inspector_extracts_simple_result_fields():
    text = "Open call free application. Send EPK, bio, video and links to booking@example.org before deadline."
    snapshot = build_application_snapshot("Festival", text, "Prepare EPK and application form", "https://example.org")
    assert infer_application_cost(text) == "Gratuito"
    assert extract_contact(text) == "booking@example.org"
    assert snapshot["cost"] == "Gratuito"
    assert "EPK/dossier" in snapshot["checklist"]
    assert "booking@example.org" in snapshot["summary"]


def test_application_inspector_handles_hidden_and_form_contacts():
    hidden = "Consultas: booking [at] festival dot org. Free application."
    assert extract_contact(hidden) == "booking@festival.org"

    mailto = "For bands use mailto:submissions%40venue.cl?subject=EPK"
    assert extract_contact(mailto) == "submissions@venue.cl"

    form = "Apply using contact link: Artist form https://forms.gle/abc123"
    assert extract_contact(form) == "Formulario/contacto: https://forms.gle/abc123"


def test_curator_collects_contact_links_from_html():
    soup = BeautifulSoup(
        """
        <html><body>
          <a href="mailto:booking@venue.cl">Booking</a>
          <a href="/contact">Contact</a>
          <a href="https://festival.typeform.com/to/apply">Apply now</a>
        </body></html>
        """,
        "html.parser",
    )
    bits = " ".join(contact_bits_from_soup(soup, "https://venue.cl/open-call"))
    assert "mailto:booking@venue.cl" in bits
    assert "https://venue.cl/contact" in bits
    assert "https://festival.typeform.com/to/apply" in bits


def test_admin_refresh_fast_endpoint_contract(monkeypatch):
    async def fake_fast_refresh():
        return {
            "mode": "fast_global",
            "countries_scanned": 199,
            "queries_per_country": 4,
            "results_per_query": 2,
            "discovered_sources": 3,
            "created": 1,
            "reviewed": 2,
            "link_counts": {"ok": 2},
            "before": {"sources": 10, "opportunities": 4},
            "after": {"sources": 13, "opportunities": 5},
            "added": {"sources": 3, "opportunities": 1},
            "errors": [],
        }

    monkeypatch.setattr("app.main.run_fast_global_refresh", fake_fast_refresh)
    monkeypatch.setattr("app.main.settings.admin_token", "test-token")

    client = TestClient(app)
    response = client.post("/api/admin/refresh-fast", headers={"x-admin-token": "test-token"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["mode"] == "fast_global"
    assert payload["added"]["sources"] == 3
    assert payload["added"]["opportunities"] == 1


def test_discovery_queries_include_social_and_public_sources():
    queries = build_discovery_queries("Espana")
    joined = "\n".join(queries)
    assert "site:instagram.com/p" in joined
    assert "site:instagram.com/reel" in joined
    assert "site:tiktok.com" in joined
    assert "municipio" in joined
    assert "booking" in joined
    assert "open call" in joined
    assert "band submissions" in joined


def test_chile_discovery_queries_include_regional_targets():
    joined = "\n".join(build_discovery_queries("Chile"))
    assert "Santiago" in joined
    assert "GAM Centro Cultural Gabriela Mistral" in joined
    assert "Las Condes" in joined
    assert "Valparaiso" in joined
    assert "V Region" in joined
    assert "VI Region" in joined
    assert "VII Region" in joined
    assert "Antofagasta" in joined
    assert "Calama" in joined
    assert "Concepcion" in joined
    assert "Valdivia" in joined
    assert "Puerto Montt" in joined
    assert "Frutillar Teatro del Lago" in joined
    assert "Region de Aysen" in joined
    assert "Puerto Cisnes" in joined
    assert "Chile Chico" in joined
    assert "Cochrane" in joined
    assert "Puerto Williams" in joined
    assert "Valle de Elqui" in joined
    assert "Region de Atacama" in joined
    assert "Caldera" in joined
    assert "Chanaral" in joined
    assert "Diego de Almagro" in joined
    assert "Huasco" in joined
    assert "Alto del Carmen" in joined
    assert "agendacultural" in joined
    assert "tocatasantiago" in joined
    assert "gamcl" in joined
    assert "postula hasta" in joined
    assert "buscamos bandas" in joined


def test_chile_discovery_queries_include_public_spaces_from_north_to_south():
    joined = "\n".join(build_discovery_queries("Chile"))
    assert len(CHILE_PUBLIC_SPACE_TARGETS) >= 100
    assert "Municipalidad de Arica Cultura" in joined
    assert "Teatro Municipal de Antofagasta" in joined
    assert "Casa de la Cultura de Copiapo" in joined
    assert "Centro Cultural Estacion Caldera" in joined
    assert "Municipalidad de Huasco Cultura" in joined
    assert "Museo de la Memoria" in joined
    assert "Teatro Regional del Maule" in joined
    assert "Teatro Diego Rivera Puerto Montt" in joined
    assert "Teatro del Lago Frutillar Programacion" in joined
    assert "Semanas Musicales de Frutillar" in joined
    assert "Gobierno Regional de Aysen Cultura" in joined
    assert "Centro Cultural Coyhaique" in joined
    assert "Municipalidad de Puerto Cisnes Cultura" in joined
    assert "Teatro Municipal Jose Bohr Punta Arenas" in joined
    assert "Municipalidad de Punta Arenas Cultura" in joined
    assert "presentar artistas" in joined
    assert "postula tu proyecto" in joined


def test_chile_discovery_queries_include_media_profiles_and_partners():
    joined = "\n".join(build_discovery_queries("Chile"))
    assert len(CHILE_MEDIA_PROFILE_TARGETS) >= 18
    assert "GAM media partners La Tercera Radio 13C" in joined
    assert "Rockaxis Instagram oficial" in joined
    assert "Radio Futuro Instagram Futuro FM" in joined
    assert "Sonar FM rock Chile" in joined
    assert "enviar single" in joined
    assert "site:instagram.com" in joined


def test_expanded_target_lists_have_required_depth():
    latam_target_count = sum(len(targets) for targets in LATAM_RECOGNIZED_TARGETS.values())
    assert len(CHILE_DEEP_SEARCH_TARGETS) >= 100
    assert latam_target_count >= 340


def test_south_america_priority_countries_have_deep_benchmarks():
    required = {
        "Argentina": ["Usina del Arte convocatorias musica", "Club Paraguay Cordoba bandas", "MICA Mercado de Industrias Culturales Argentinas"],
        "Uruguay": ["INMUS Uruguay musica convocatorias", "Usinas Culturales Uruguay", "Montevideo Music Box"],
        "Paraguay": ["Centro Cultural Juan de Salazar musica", "ReciclArte Paraguay bandas", "Teatro Municipal Ignacio A Pane musica"],
        "Bolivia": ["mARTadero Cochabamba musica", "Teatro Nuna La Paz bandas", "Sonidos de la Tierra Bolivia"],
        "Peru": ["Ministerio de Cultura Peru Estimulos Economicos musica", "La Noche de Barranco bandas", "ICPNA Cultural musica"],
        "Brasil": ["SESC Sao Paulo chamada musica", "FUNARTE musica edital", "No Ar Coquetel Molotov Recife"],
    }
    for country, expected_terms in required.items():
        bank = SOUTH_AMERICA_DEEP_EXPANSION[country]
        assert len(bank["territorial"]) >= 18
        assert len(bank["recognized"]) >= 8
        assert len(bank["public_spaces"]) >= 14
        joined = "\n".join(build_discovery_queries(country))
        territorial = "\n".join(build_territorial_discovery_queries(country))
        for term in expected_terms:
            assert term in joined or term in territorial
        assert "support act" in territorial
        assert "international bands" in territorial


def test_latam_semantic_queries_detect_support_international_and_mobility():
    joined = "\n".join(build_semantic_discovery_queries("Argentina"))
    assert len(SEMANTIC_INTENT_GROUPS["teloneros"]) >= 16
    assert "support act" in joined
    assert "opening band" in joined
    assert "foreign artists" in joined
    assert "music market" in joined
    assert "touring grant" in joined
    assert "new sounds" in HIGH_VALUE_SEMANTIC_TERMS
    assert "programming submissions" in HIGH_VALUE_SEMANTIC_TERMS
    assert "site:instagram.com/reel" in joined


def test_semantic_scoring_lifts_implicit_international_support_calls():
    text = "Festival busca opening band para international artists from abroad con showcase application, touring support and new sounds."
    signals = semantic_signal_hits(text)
    assert {"teloneros", "internacional", "showcase", "movilidad", "nuevos_sonidos"}.issubset(set(signals))
    assert score_text(text) >= 0.7


def test_territorial_queries_use_country_specific_admin_language():
    chile = "\n".join(build_territorial_discovery_queries("Chile"))
    argentina = "\n".join(build_territorial_discovery_queries("Argentina"))
    uruguay = "\n".join(build_territorial_discovery_queries("Uruguay"))
    usa = "\n".join(build_territorial_discovery_queries("Estados Unidos"))
    assert "comuna" in chile
    assert "Region de Atacama Copiapo Caldera Chanaral Vallenar Huasco" in chile
    assert "provincia" in argentina
    assert "departamento" in uruguay
    assert "county" in usa
    assert len(GLOBAL_TERRITORIAL_AREA_SEEDS["Chile"]) >= 10


def test_global_territorial_seeds_cover_priority_world_regions():
    required = {
        "Inglaterra": "Brighton music showcase",
        "Reino Unido": "Wide Days artist application Edinburgh",
        "Irlanda": "Dublin arts office music",
        "Islandia": "Iceland Airwaves artist application",
        "Francia": "Paris musique open call",
        "Alemania": "Berlin musicboard",
        "Paises Bajos": "Groningen Eurosonic artists",
        "Marruecos": "Visa For Music Rabat",
        "Sudafrica": "Cape Town music office",
        "Australia": "New South Wales music grants",
        "Japon": "Tokyo music market",
        "Corea del Sur": "Seoul music week",
        "Taiwan": "Taipei music center",
        "Vietnam": "Ho Chi Minh City music festival",
    }
    for country, seed in required.items():
        joined = "\n".join(build_territorial_discovery_queries(country))
        assert seed in GLOBAL_TERRITORIAL_AREA_SEEDS[country]
        assert seed in joined
        assert "international bands" in joined
        assert "support act" in joined


def test_brazil_and_colombia_are_reinforced_after_review():
    checks = {
        "Brasil": ["Natura Musical edital", "Festival Se Rasgum", "Opiniao Porto Alegre"],
        "Colombia": ["Idartes convocatorias musica", "Rock al Parque convocatoria bandas", "Paramo Presenta bandas"],
    }
    for country, terms in checks.items():
        assert country in GLOBAL_RADAR_DEEP_EXPANSION
        joined = "\n".join(build_discovery_queries(country))
        territorial = "\n".join(build_territorial_discovery_queries(country))
        for term in terms:
            assert term in joined or term in territorial
        assert "support act" in territorial
        assert "international bands" in territorial


def test_canada_europe_africa_and_asia_have_deeper_priority_banks():
    required = {
        "Canada": ["FACTOR Canada music", "North by Northeast artist application"],
        "Francia": ["Babel Music XP showcase", "Trans Musicales Rennes candidature"],
        "Alemania": ["Pop-Kultur Nachwuchs", "Initiative Musik Germany"],
        "Inglaterra": ["Liverpool Sound City artist application", "PRS Foundation international music"],
        "Marruecos": ["L'Uzine Casablanca", "Festival Timitar Agadir"],
        "Sudafrica": ["Concerts SA mobility fund", "Moshito Music Conference"],
        "Nigeria": ["Felabration Lagos", "Alliance Francaise Lagos music"],
        "Ghana": ["Chale Wote Accra", "Ghana Music Week"],
        "Kenia": ["Blankets and Wine Kenya", "GoDown Arts Centre"],
        "Japon": ["Kansai Music Conference", "Fukuoka Music Month"],
        "Corea del Sur": ["KOCCA music", "Busan Rock Festival"],
        "India": ["NH7 Weekender artist application", "Serendipity Arts Festival music"],
        "Indonesia": ["Java Jazz Festival", "Synchronize Fest"],
        "Tailandia": ["Wonderfruit Festival artists", "Maho Rasop Festival"],
    }
    by_country = {country for _, country in TARGET_COUNTRIES}
    for country, terms in required.items():
        assert country in GLOBAL_RADAR_DEEP_EXPANSION
        assert country in by_country or country in {"Francia", "Alemania", "Inglaterra"}
        joined = "\n".join(build_discovery_queries(country))
        territorial = "\n".join(build_territorial_discovery_queries(country))
        for term in terms:
            assert term in joined or term in territorial
        assert "international artists" in territorial


def test_argentina_canada_and_usa_have_review_depth():
    required = {
        "Argentina": ["Fondo Nacional de las Artes musica Argentina", "Ciudad Emergente Buenos Aires convocatoria bandas", "Harlem Festival Santa Fe"],
        "Canada": ["Canadian Music Week artist submission", "BreakOut West showcase", "Musicaction Canada"],
        "Estados Unidos": ["New Music USA project grants", "USArtists International music", "NPR Tiny Desk Contest"],
    }
    for country, terms in required.items():
        bank = ARGENTINA_CANADA_US_DEEP_REVIEW[country]
        assert len(bank["territorial"]) >= 20
        assert len(bank["public_spaces"]) >= 15
        joined = "\n".join(build_discovery_queries(country))
        territorial = "\n".join(build_territorial_discovery_queries(country))
        for term in terms:
            assert term in joined or term in territorial
        assert "support act" in territorial
        assert "international bands" in territorial


def test_greenland_has_cultural_music_radar():
    by_country = {country: continent for continent, country in TARGET_COUNTRIES}
    joined = "\n".join(build_discovery_queries("Groenlandia"))
    territorial = "\n".join(build_territorial_discovery_queries("Groenlandia"))
    assert by_country["Groenlandia"] == "Norteamerica"
    assert len(GREENLAND_DEEP_REVIEW_TARGETS) >= 8
    assert "Katuaq Cultural Centre Nuuk music" in joined
    assert "Arctic Sounds Festival Sisimiut artist application" in territorial
    assert "Kalaallit Nunaat" in joined
    assert "international bands" in territorial


def test_all_europe_target_countries_have_deep_review_targets():
    europe_countries = {country for continent, country in TARGET_COUNTRIES if continent == "Europa"}
    assert europe_countries.issubset(EUROPE_DEEP_REVIEW_TARGETS.keys())
    required = {
        "Dinamarca": "SPOT Festival Denmark artist application",
        "Portugal": "MIL Lisbon artist application",
        "Italia": "Linecheck Milan Music Meeting",
        "Polonia": "OFF Festival Katowice artist application",
        "Suecia": "Future Echoes artist application",
        "Suiza": "Pro Helvetia music",
        "Ucrania": "Music Export Ukraine",
    }
    for country, term in required.items():
        joined = "\n".join(build_discovery_queries(country))
        territorial = "\n".join(build_territorial_discovery_queries(country))
        assert len(EUROPE_DEEP_REVIEW_TARGETS[country]) >= 3
        assert term in joined or term in territorial
        assert "support act" in territorial
        assert "international bands" in territorial


def test_all_asia_target_countries_have_deep_review_targets():
    asia_countries = {country for continent, country in TARGET_COUNTRIES if continent == "Asia"}
    assert asia_countries.issubset(ASIA_DEEP_REVIEW_TARGETS.keys())
    required = {
        "China": "China Shanghai International Arts Festival",
        "Corea del Sur": "Zandari Festa artist application",
        "Japon": "Fuji Rock Rookie A Go-Go",
        "Filipinas": "Wanderland Music Festival artists",
        "Malasia": "Malaysia Music Week showcase",
        "Palestina": "Palestine Music Expo artist application",
        "Uzbekistan": "Sharq Taronalari Samarkand music festival",
    }
    for country, term in required.items():
        joined = "\n".join(build_discovery_queries(country))
        territorial = "\n".join(build_territorial_discovery_queries(country))
        assert len(ASIA_DEEP_REVIEW_TARGETS[country]) >= 3
        assert term in joined or term in territorial
        assert "international artists" in territorial


def test_asia_has_funds_producers_and_foreign_band_calls():
    asia_countries = {country for continent, country in TARGET_COUNTRIES if continent == "Asia"}
    assert asia_countries.issubset(ASIA_FUNDS_PRODUCERS_FOREIGN_CALLS.keys())
    checks = {
        "Japon": ["Japan Foundation performing arts grants music", "Smash Corporation Japan booking foreign bands", "Creativeman Productions artist submissions"],
        "Corea del Sur": ["KOCCA music export funding", "Zandari Festa foreign bands application", "MPMG Korea booking bands"],
        "China": ["Modern Sky foreign bands booking China", "Split Works China international artists"],
        "India": ["Only Much Louder artist booking", "Indiearth XChange international artists", "SkillBox India band submissions"],
        "Indonesia": ["Ismaya Live international artists", "Studiorama Indonesia foreign bands"],
        "Tailandia": ["Fungjai Thailand band submissions", "Have You Heard Bangkok booking foreign bands"],
        "Singapur": ["National Arts Council Singapore music grants", "LAMC Productions Singapore booking"],
        "Libano": ["AFAC Arab Fund for Arts and Culture music grants", "Beirut and Beyond international artists"],
    }
    for country, terms in checks.items():
        joined = "\n".join(build_discovery_queries(country))
        territorial = "\n".join(build_territorial_discovery_queries(country))
        assert len(ASIA_FUNDS_PRODUCERS_FOREIGN_CALLS[country]) >= 3
        for term in terms:
            assert term in joined or term in territorial
        assert "foreign artists" in joined or "foreign bands" in joined or "international artists" in joined


def test_focus_countries_have_funds_producers_and_foreign_calls():
    checks = {
        "Irlanda": [
            "Culture Ireland music funding international performance",
            "Music From Ireland export support",
            "Ireland Music Week international showcase application",
            "Whelans Dublin booking bands",
        ],
        "China": [
            "Modern Sky Lab booking foreign bands China",
            "Split Works China international artists booking",
            "Midi Festival China foreign bands",
            "Yuyintang Shanghai booking bands",
        ],
        "Japon": [
            "Japan Foundation performing arts grants music international",
            "Smash Corporation Japan booking foreign bands",
            "Summer Sonic artist application Japan",
            "Live Nation Japan international artists",
        ],
        "Canada": [
            "Canada Council for the Arts music grants international collaboration",
            "FACTOR Canada artist development funding",
            "Music BC export funding international showcase",
            "M for Montreal artist submission international",
        ],
    }
    for country, terms in checks.items():
        joined = "\n".join(build_discovery_queries(country))
        territorial = "\n".join(build_territorial_discovery_queries(country))
        assert len(FOCUS_COUNTRY_FUNDS_PRODUCERS_FOREIGN_CALLS[country]) >= 10
        for term in terms:
            assert term in joined or term in territorial
        assert "foreign bands" in joined or "international artists" in joined or "international performance" in joined


def test_latam_small_country_coverage_is_not_empty():
    required = {
        "Belice": "Belize International Music and Food Festival",
        "Guyana": "National Cultural Centre Guyana",
        "Surinam": "Suriname Jazz Festival",
        "Jamaica": "Reggae Month Jamaica",
        "Haiti": "FOKAL Haiti culture",
        "Trinidad y Tobago": "Queen's Hall Trinidad music",
        "Bahamas": "Bahamas National Festival Commission music",
        "Barbados": "NIFCA Barbados music",
        "Santa Lucia": "Saint Lucia Jazz",
        "Dominica": "World Creole Music Festival Dominica",
        "San Cristobal y Nieves": "St Kitts Music Festival",
    }
    for country, target in required.items():
        joined = "\n".join(build_territorial_discovery_queries(country))
        assert target in LATAM_RECOGNIZED_TARGETS[country]
        assert target in GLOBAL_TERRITORIAL_AREA_SEEDS[country]
        assert target in joined


def test_deep_research_findings_are_folded_into_territorial_queries():
    checks = {
        "Reino Unido": ["SXSW London artist application", "UK Music Export Growth Scheme"],
        "Alemania": ["Reeperbahn artist application", "Goethe Institut music residency"],
        "Francia": ["Institut francais PAIR music residency"],
        "Australia": ["Music Australia Export Fund international touring"],
        "Suecia": ["Export Music Sweden showcase"],
        "Estados Unidos": ["San Jose Arts and Cultural Exchange Grants", "Arts Envoy music international"],
    }
    for country, expected_terms in checks.items():
        joined = "\n".join(build_territorial_discovery_queries(country))
        for term in expected_terms:
            assert term in GLOBAL_TERRITORIAL_AREA_SEEDS[country]
            assert term in joined


def test_global_discovery_bank_exceeds_100k_missions():
    assert len(TARGET_COUNTRIES) >= 190
    assert global_mission_capacity() >= 100_000


def test_support_funding_layer_covers_all_target_countries():
    assert len(GLOBAL_SUPPORT_FUNDING_TERMS) >= 30
    assert len(GLOBAL_SUPPORT_FUNDING_PATTERNS) >= 18
    assert len(GLOBAL_SUPPORT_INSTITUTION_TARGETS) >= 20
    per_country_capacity = (
        len(GLOBAL_SUPPORT_FUNDING_TERMS) * len(GLOBAL_SUPPORT_FUNDING_PATTERNS)
        + len(GLOBAL_SUPPORT_INSTITUTION_TARGETS) * 8
    )
    assert len(TARGET_COUNTRIES) * per_country_capacity >= 100_000
    for _, country in TARGET_COUNTRIES:
        queries = "\n".join(build_global_support_funding_queries(country, limit=80))
        assert country in queries or country in queries.replace("Canadá", "Canada")
        assert "music grant" in queries or "fondo" in queries
        assert "foreign" in queries or "extranjeros" in queries or "international" in queries


def test_support_funding_queries_include_ngos_and_foreign_cultural_institutes():
    chile = "\n".join(build_discovery_queries("Chile"))
    japan = "\n".join(build_global_support_funding_queries("Japon"))
    morocco = "\n".join(build_global_support_funding_queries("Marruecos"))
    assert "NGO music fund artists" in chile
    assert "ayuda monetaria musicos extranjeros" in chile
    assert "On the Move mobility funding guide" in chile
    assert "Goethe Institut music residency" in chile
    assert "UNESCO International Fund for Cultural Diversity music" in japan
    assert "Prince Claus Fund cultural grants" in morocco
    assert "foreign artists" in japan
    assert "artist residency" in morocco


def test_expansion_priority_keeps_user_requested_order():
    assert EXPANSION_PRIORITY_ORDER[:4] == ["Chile", "Latinoamerica", "Estados Unidos", "Canada"]
    assert EXPANSION_PRIORITY_ORDER[-3:] == ["Australia", "Africa", "Medio Oriente"]


def test_global_discovery_queries_include_english_and_local_language_terms():
    france_queries = "\n".join(build_discovery_queries("Francia"))
    japan_queries = "\n".join(build_global_discovery_queries("Japon"))
    morocco_queries = "\n".join(build_global_discovery_queries("Marruecos"))
    assert "France" in france_queries
    assert "appel a candidatures musique" in france_queries
    assert "international artists" in france_queries
    assert "ショーケース 応募 音楽" in japan_queries
    assert "دعوة مفتوحة موسيقى" in morocco_queries


def test_global_discovery_queries_include_github_public_lists():
    queries = "\n".join(build_global_discovery_queries("Canada"))
    assert "site:github.com" in queries
    assert "music opportunities" in queries
    assert "festival submissions" in queries


def test_curated_official_sources_are_loaded():
    sources = load_seed_sources()
    names = {source["name"] for source in sources}
    assert len(sources) >= 150
    assert "Teatro Municipal de Las Condes - Presenta tu proyecto" in names
    assert "Convocatorias Cultura Puerto Montt" in names
    assert "SXSW Music Showcase Applications" in names
    assert "Visa For Music" in names
    assert "GAM - Convocatoria Nacional Programacion 2026-2027" in names
    assert "Culturas Musica Instagram" in names
    assert "Mondo.NYC Artist Application" in names
    assert "Tallinn Music Week Artist Applications" in names
    assert "La Tercera Culto" in names
    assert "Radio 13C" in names
    assert "Sonar FM" in names


def test_target_countries_include_requested_global_regions():
    by_country = {country: continent for continent, country in TARGET_COUNTRIES}
    expected = {
        "Estados Unidos": "Norteamerica",
        "Canada": "Norteamerica",
        "Australia": "Oceania",
        "China": "Asia",
        "Corea del Sur": "Asia",
        "Japon": "Asia",
        "Taiwan": "Asia",
        "Vietnam": "Asia",
        "India": "Asia",
        "Indonesia": "Asia",
        "Tailandia": "Asia",
        "Libano": "Asia",
        "Sudafrica": "Africa",
        "Marruecos": "Africa",
        "Nigeria": "Africa",
        "Ghana": "Africa",
        "Kenia": "Africa",
        "Senegal": "Africa",
        "Egipto": "Africa",
        "Rusia": "Europa",
        "Inglaterra": "Europa",
        "Holanda": "Europa",
        "Gales": "Europa",
    }
    for country, continent in expected.items():
        assert by_country[country] == continent


def test_requested_countries_have_specific_public_space_targets():
    required = {
        "Argentina": "Usina del Arte",
        "Brasil": "SESC Sao Paulo",
        "Paraguay": "Centro Cultural Juan de Salazar",
        "Uruguay": "Sala Zitarrosa",
        "Colombia": "Idartes",
        "Peru": "Gran Teatro Nacional Peru",
        "Bolivia": "Teatro Municipal Alberto Saavedra Perez",
        "Mexico": "Cenart Mexico",
        "Canada": "Canada Council for the Arts music",
        "Irlanda": "Culture Ireland music",
        "Gales": "Wales Arts Council music",
        "Islandia": "Iceland Airwaves showcase",
        "Japon": "Japan Foundation music",
        "Corea del Sur": "MUCON Korea",
        "China": "China Shanghai International Arts Festival",
    }
    for country, target in required.items():
        assert target in COUNTRY_PUBLIC_SPACE_TARGETS[country]
        assert target in "\n".join(build_discovery_queries(country))


def test_discovery_queries_use_public_aliases_for_common_names():
    us_queries = "\n".join(build_discovery_queries("Estados Unidos"))
    england_queries = "\n".join(build_discovery_queries("Inglaterra"))
    assert "USA" in us_queries
    assert "United States" in us_queries
    assert "England" in england_queries
    assert "UK" in england_queries


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


def test_application_extractor_ignores_transparency_and_builds_postulation_steps():
    assert is_navigation_noise("TRANSPARENCIA Politicas de privacidad Mapa del sitio")
    requirements = extract_application_requirements(
        "Convocatoria abierta: buscamos bandas emergentes. Postula por formulario con EPK, press kit, links y contacto de booking hasta el 20 de junio.",
        "booking_agency",
    )
    assert "formulario" in requirements
    assert "EPK" in requirements
    assert "bandas" in requirements
    assert "booking" in requirements


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
        assert data["items"][0]["applicationCost"]
        assert data["items"][0]["applicationContact"]
        assert data["items"][0]["applicationChecklist"]
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
