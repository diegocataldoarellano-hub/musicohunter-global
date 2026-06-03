from urllib.parse import urlparse

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Source
from .settings import get_settings


WORLD_EXTRA_COUNTRIES = {
    "Africa": [
        "Argelia", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde",
        "Camerun", "Chad", "Comoras", "Congo", "Costa de Marfil", "Djibouti", "Egipto",
        "Eritrea", "Eswatini", "Etiopia", "Gabon", "Gambia", "Ghana", "Guinea",
        "Guinea-Bisau", "Guinea Ecuatorial", "Kenia", "Lesoto", "Liberia", "Libia",
        "Madagascar", "Malawi", "Mali", "Mauricio", "Mauritania", "Mozambique", "Namibia",
        "Niger", "Nigeria", "Republica Centroafricana", "Republica Democratica del Congo",
        "Ruanda", "Santo Tome y Principe", "Senegal", "Seychelles", "Sierra Leona",
        "Somalia", "Sudan", "Sudan del Sur", "Tanzania", "Togo", "Tunez", "Uganda",
        "Zambia", "Zimbabue",
    ],
    "Asia": [
        "Afganistan", "Arabia Saudita", "Azerbaiyan", "Bangladesh", "Barein", "Brunei",
        "Butan", "Camboya", "Emiratos Arabes Unidos", "Filipinas", "India", "Indonesia",
        "Irak", "Iran", "Israel", "Jordania", "Kazajistan", "Kirguistan", "Kuwait", "Laos",
        "Malasia", "Maldivas", "Mongolia", "Myanmar", "Nepal", "Oman", "Pakistan",
        "Palestina", "Qatar", "Singapur", "Siria", "Sri Lanka", "Tailandia", "Tayikistan",
        "Timor Oriental", "Turkmenistan", "Uzbekistan", "Yemen",
    ],
    "Europa": [
        "Albania", "Alemania", "Andorra", "Armenia", "Austria", "Belgica", "Bielorrusia",
        "Bosnia y Herzegovina", "Bulgaria", "Chipre", "Croacia", "Dinamarca", "Eslovaquia",
        "Eslovenia", "Espana", "Estonia", "Finlandia", "Francia", "Georgia", "Grecia",
        "Gales", "Holanda", "Hungria", "Inglaterra", "Irlanda", "Islandia", "Italia", "Kosovo",
        "Letonia", "Liechtenstein", "Lituania", "Luxemburgo", "Macedonia del Norte", "Malta",
        "Moldavia", "Monaco", "Montenegro", "Noruega", "Paises Bajos", "Polonia", "Portugal",
        "Reino Unido", "Republica Checa", "Rumania", "Rusia", "San Marino", "Serbia",
        "Suecia", "Suiza", "Turquia", "Ucrania", "Vaticano",
    ],
    "Norteamerica": ["Canada", "Estados Unidos"],
    "Latinoamerica": [
        "Antigua y Barbuda", "Argentina", "Bahamas", "Barbados", "Belice", "Bolivia",
        "Brasil", "Chile", "Colombia", "Costa Rica", "Cuba", "Dominica", "Ecuador",
        "El Salvador", "Granada", "Guatemala", "Guyana", "Haiti", "Honduras", "Jamaica",
        "Mexico", "Nicaragua", "Panama", "Paraguay", "Peru", "Republica Dominicana",
        "San Cristobal y Nieves", "San Vicente y las Granadinas", "Santa Lucia", "Surinam",
        "Trinidad y Tobago", "Uruguay", "Venezuela",
    ],
    "Oceania": [
        "Australia", "Fiji", "Islas Marshall", "Islas Salomon", "Kiribati", "Micronesia",
        "Nauru", "Nueva Zelanda", "Palaos", "Papua Nueva Guinea", "Samoa", "Tonga", "Tuvalu",
        "Vanuatu",
    ],
}

WORLD_COUNTRY_ROWS = [
    (continent, country)
    for continent, countries in WORLD_EXTRA_COUNTRIES.items()
    for country in countries
]


TARGET_COUNTRIES = [
    *[("Latinoamerica", country) for country in [
        "Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Costa Rica", "Cuba", "Ecuador",
        "El Salvador", "Guatemala", "Honduras", "Mexico", "Nicaragua", "Panama", "Paraguay",
        "Peru", "Republica Dominicana", "Uruguay", "Venezuela",
    ]],
    *[("Norteamerica", country) for country in [
        "Canada", "Estados Unidos",
    ]],
    *[("Europa", country) for country in [
        "Albania", "Alemania", "Andorra", "Armenia", "Austria", "Belgica", "Bielorrusia",
        "Bosnia y Herzegovina", "Bulgaria", "Chipre", "Croacia", "Dinamarca", "Eslovaquia",
        "Eslovenia", "Espana", "Estonia", "Finlandia", "Francia", "Georgia", "Grecia",
        "Holanda", "Hungria", "Inglaterra", "Irlanda", "Islandia", "Italia", "Kosovo", "Letonia", "Liechtenstein",
        "Lituania", "Luxemburgo", "Macedonia del Norte", "Malta", "Moldavia", "Monaco",
        "Montenegro", "Noruega", "Paises Bajos", "Polonia", "Portugal", "Reino Unido",
        "Republica Checa", "Rumania", "Rusia", "San Marino", "Serbia", "Suecia", "Suiza", "Turquia",
        "Ucrania", "Vaticano",
    ]],
    *[("Oceania", country) for country in [
        "Australia",
    ]],
    *[("Asia", country) for country in [
        "China", "Corea del Sur", "Japon", "Taiwan", "Vietnam", "Libano",
    ]],
    *[("Africa", country) for country in [
        "Marruecos", "Sudafrica",
    ]],
]

for continent, country in WORLD_COUNTRY_ROWS:
    if (continent, country) not in TARGET_COUNTRIES:
        TARGET_COUNTRIES.append((continent, country))

SEARCH_MISSION_TEMPLATES = [
    'site:instagram.com/p "{country}" festival bandas rock convocatoria',
    'site:instagram.com/reel "{country}" buscan teloneros rock concierto',
    'site:instagram.com/p "{country}" showcase bandas convocatoria musica',
    'site:instagram.com "{country}" productora booking bandas rock',
    'site:instagram.com/p "{country}" "open call" bands music festival',
    'site:instagram.com/reel "{country}" "support act" band concert',
    'site:tiktok.com "{country}" festival rock bandas convocatoria',
    'site:tiktok.com "{country}" "open call" bands festival music',
    '"{country}" fondos musica bandas rock convocatoria',
    '"{country}" municipio centro cultural musica bandas pago',
    '"{country}" productora booking bandas rock fusion',
    '"{country}" revista musica rock programa radio bandas',
    '"{country}" sello independiente rock experimental booking',
    '"{country}" intercambio musical bandas latinoamerica europa',
    '"{country}" "music festival" "band submissions"',
    '"{country}" "artist open call" "music"',
    '"{country}" "arts council" "music grants"',
    '"{country}" "cultural center" "live music" "open call"',
    '"{country}" "booking agency" "independent bands"',
    '"{country}" "demo submission" "record label"',
    '"{country}" "artist submissions" "booking agency"',
    '"{country}" "submit your music" "label"',
    '"{country}" "opening act" "bands wanted"',
    '"{country}" "support act" "independent bands"',
    '"{country}" "A&R" "new artists"',
    '"{country}" "artist roster" "booking"',
    '"{country}" "presentar artistas" "programacion"',
    '"{country}" "recepcion de propuestas" "musica"',
    '"{country}" "postula tu proyecto" "musica"',
    '"{country}" "buscamos bandas" "productora"',
]

SEMANTIC_INTENT_GROUPS = {
    "teloneros": [
        "teloneros", "telonero", "banda soporte", "banda invitada", "artista invitado",
        "support act", "opening act", "opening band", "warm up band", "buscamos bandas",
        "se buscan bandas", "abrir concierto", "abrir show", "support slot",
        "local support", "special guest band", "guest artist", "premiere partie",
        "vorband", "supportband", "bandas soporte", "acto de apertura",
    ],
    "internacional": [
        "bandas internacionales", "artistas internacionales", "bandas extranjeras",
        "artistas de otros paises", "foreign artists", "international artists",
        "from abroad", "overseas artists", "latam artists", "iberoamerica",
        "mercado internacional", "circulacion internacional", "global artists",
        "worldwide artists", "artists outside", "cross-border", "international applicants",
        "open to international", "international touring artists",
    ],
    "showcase": [
        "showcase", "music market", "mercado musical", "rueda de negocios",
        "delegacion artistica", "artist application", "band submissions",
        "apply to play", "festival submissions", "postulacion showcase",
        "delegate application", "export office", "music export", "industry conference",
        "artist pitch", "networking session", "professionals meeting",
    ],
    "movilidad": [
        "gira", "tour", "touring", "residencia", "intercambio", "movilidad",
        "mobility grant", "touring grant", "residency", "artist residency",
        "circulacion", "itinerancia", "coproduccion internacional",
        "travel support", "international mobility", "cultural exchange",
        "residence artistique", "residenz", "artist exchange",
    ],
    "nuevos_sonidos": [
        "nuevos sonidos", "nuevo sonido", "sonidos emergentes", "bandas emergentes",
        "artistas emergentes", "new sounds", "fresh sounds", "emerging artists",
        "emerging bands", "new talent", "new music discovery", "undiscovered artists",
        "next wave", "up-and-coming bands", "new voices", "independent artists",
        "alternative sounds", "experimental sounds", "musica independiente",
        "talento emergente", "descubrimiento musical",
    ],
    "programacion": [
        "programacion artistica", "curatoria musical", "curaduria musical",
        "recepcion de propuestas", "presentar artistas", "artist proposals",
        "programming submissions", "booking inquiry", "programme proposals",
        "live music programming", "cultural programming", "call for proposals",
        "open programming", "artist call", "music programming",
    ],
}

LATAM_SEMANTIC_MISSION_TEMPLATES = [
    'site:instagram.com/p "{country}" "{term}" musica bandas',
    'site:instagram.com/reel "{country}" "{term}" rock festival',
    'site:facebook.com/events "{country}" "{term}" bandas',
    '"{country}" "{term}" "rock" OR "folk" OR "fusion" OR "experimental"',
    '"{country}" "{term}" "convocatoria" "bandas"',
    '"{country}" "{term}" "showcase" "artists"',
    '"{country}" "{term}" "festival" "apply"',
    '"{country}" "{term}" "booking" "bandas"',
]

HIGH_VALUE_SEMANTIC_TERMS = [
    "international bands",
    "foreign artists",
    "open to international artists",
    "support act",
    "opening band",
    "bands wanted",
    "apply to play",
    "band submissions",
    "artist submissions",
    "new sounds",
    "emerging bands",
    "music export",
    "showcase application",
    "artist open call",
    "programming submissions",
    "convocatoria bandas internacionales",
    "bandas extranjeras",
    "buscamos bandas",
    "teloneros",
    "sonidos emergentes",
    "recepcion de propuestas",
]

ADMIN_DIVISION_TERMS = {
    "Chile": ["region", "comuna", "municipalidad", "gobierno regional", "corporacion cultural"],
    "Argentina": ["provincia", "municipio", "departamento", "secretaria de cultura", "centro cultural"],
    "Uruguay": ["departamento", "municipio", "intendencia", "direccion de cultura", "centro cultural"],
    "Paraguay": ["departamento", "municipalidad", "gobernacion", "direccion de cultura"],
    "Bolivia": ["departamento", "municipio", "gobierno autonomo municipal", "casa de la cultura"],
    "Peru": ["region", "municipalidad", "provincia", "distrito", "direccion desconcentrada de cultura"],
    "Colombia": ["departamento", "municipio", "alcaldia", "secretaria de cultura", "instituto de cultura"],
    "Brasil": ["estado", "municipio", "prefeitura", "secretaria de cultura", "sesc"],
    "Mexico": ["estado", "municipio", "alcaldia", "secretaria de cultura", "instituto de cultura"],
    "Estados Unidos": ["state", "county", "city arts council", "municipal arts", "cultural affairs"],
    "Canada": ["province", "territory", "city arts council", "municipality", "cultural grants"],
    "Inglaterra": ["county", "borough", "city council", "arts council", "cultural programme"],
    "Reino Unido": ["county", "borough", "city council", "arts council", "cultural programme"],
    "Irlanda": ["county", "city council", "arts office", "county council"],
    "Gales": ["county", "council", "arts council", "cymru music"],
    "Francia": ["region", "departement", "commune", "mairie", "drac"],
    "Espana": ["comunidad autonoma", "provincia", "ayuntamiento", "concejalia de cultura"],
    "Alemania": ["bundesland", "stadt", "kulturamt", "bezirk"],
    "Australia": ["state", "territory", "local council", "arts grants"],
    "Nueva Zelanda": ["region", "city council", "creative communities", "local board"],
    "Sudafrica": ["province", "municipality", "arts council", "cultural affairs"],
    "Marruecos": ["region", "commune", "province", "festival", "centre culturel"],
    "Japon": ["prefecture", "city cultural foundation", "music festival", "artist support"],
    "Corea del Sur": ["province", "metropolitan city", "arts council", "music showcase"],
    "China": ["province", "municipality", "arts festival", "cultural center"],
    "Taiwan": ["county", "city", "cultural bureau", "music festival"],
    "Vietnam": ["province", "city", "department of culture", "music festival"],
    "Libano": ["municipality", "festival", "cultural center", "music programme"],
    "India": ["state", "city", "arts festival", "cultural centre"],
    "Indonesia": ["province", "city", "cultural office", "music festival"],
    "Tailandia": ["province", "city", "cultural centre", "music festival"],
    "Singapur": ["arts council", "district", "music festival", "showcase"],
    "Italia": ["regione", "comune", "assessorato cultura", "festival musica"],
    "Portugal": ["regiao", "municipio", "camara municipal", "festival musica"],
    "Paises Bajos": ["province", "gemeente", "music venue", "cultural fund"],
    "Holanda": ["province", "gemeente", "music venue", "cultural fund"],
    "Belgica": ["region", "commune", "gemeente", "music venue"],
    "Dinamarca": ["region", "kommune", "music venue", "cultural fund"],
    "Suecia": ["region", "kommun", "music venue", "cultural grant"],
    "Suiza": ["canton", "gemeinde", "commune", "music festival"],
    "Noruega": ["county", "kommune", "music festival", "cultural grant"],
    "Finlandia": ["region", "municipality", "music festival", "cultural grant"],
    "Polonia": ["voivodeship", "city", "cultural centre", "music festival"],
    "Republica Checa": ["region", "city", "cultural centre", "music festival"],
}

DEFAULT_ADMIN_DIVISION_TERMS = [
    "region", "province", "state", "department", "county", "municipality",
    "city council", "cultural center", "arts council", "music festival",
]

GLOBAL_TERRITORIAL_AREA_SEEDS = {
    "Chile": [
        "Region de Atacama Copiapo Caldera Chanaral Vallenar Huasco Freirina Alto del Carmen",
        "Gobierno Regional de Atacama cultura musica",
        "Municipalidad de Copiapo Cultura",
        "Municipalidad de Caldera Cultura",
        "Municipalidad de Chanaral Cultura",
        "Municipalidad de Diego de Almagro Cultura",
        "Municipalidad de Tierra Amarilla Cultura",
        "Municipalidad de Vallenar Cultura",
        "Municipalidad de Huasco Cultura",
        "Municipalidad de Freirina Cultura",
        "Municipalidad de Alto del Carmen Cultura",
    ],
    "Argentina": ["Provincia de Buenos Aires cultura musica", "Cordoba Cultura municipios", "Santa Fe Cultura Rosario", "Mendoza Cultura municipios", "Patagonia Argentina cultura musica"],
    "Uruguay": ["Montevideo departamento cultura musica", "Canelones Cultura", "Maldonado Cultura", "Colonia Cultura", "Paysandu Cultura", "Salto Cultura"],
    "Paraguay": ["Asuncion Cultura", "Departamento Central cultura musica", "Alto Parana Cultura", "Itapua Cultura", "Guaira Cultura"],
    "Bolivia": ["La Paz Culturas", "Santa Cruz Cultura", "Cochabamba Cultura", "Sucre Cultura", "Tarija Cultura"],
    "Peru": ["Lima Cultura", "Arequipa Cultura", "Cusco Cultura", "La Libertad Trujillo Cultura", "Piura Cultura"],
    "Colombia": ["Bogota Cultura", "Antioquia Medellin Cultura", "Valle del Cauca Cali Cultura", "Atlantico Barranquilla Cultura", "Bolivar Cartagena Cultura"],
    "Brasil": ["Sao Paulo Secretaria de Cultura musica", "Rio de Janeiro Cultura", "Minas Gerais Cultura", "Bahia Cultura", "Rio Grande do Sul Cultura"],
    "Mexico": ["Ciudad de Mexico Cultura", "Jalisco Cultura Guadalajara", "Nuevo Leon Cultura Monterrey", "Baja California Cultura Tijuana", "Yucatan Cultura Merida"],
    "Estados Unidos": ["Texas arts council music", "California arts council music", "New York state arts music", "Los Angeles county arts music", "Austin music commission", "San Jose Arts and Cultural Exchange Grants", "Arts Envoy music international"],
    "Canada": ["Ontario arts council music", "Quebec music council", "British Columbia arts council music", "Toronto arts council music", "Montreal culture music"],
    "Inglaterra": ["London borough arts music", "Manchester music venues", "Brighton music showcase", "Liverpool music office", "Bristol live music", "SXSW London artist application", "2000trees band application Cheltenham"],
    "Reino Unido": ["SXSW London artist application", "The Great Escape artist application", "Wide Days artist application Edinburgh", "2000trees band application Cheltenham", "UK Music Export Growth Scheme"],
    "Irlanda": ["Dublin arts office music", "Cork city arts music", "Galway arts office music", "Limerick culture music", "Culture Ireland music"],
    "Gales": ["Cardiff music board", "Wales Arts Council music", "Swansea culture music", "Newport live music", "Wrexham music"],
    "Islandia": ["Reykjavik music city", "Iceland Airwaves artist application", "Akureyri culture music", "Iceland Music Export", "Reykjavik arts festival music", "Iceland Music export office"],
    "Espana": ["Madrid cultura musica", "Barcelona cultura musica", "Valencia musica cultura", "Bilbao kultura musica", "Sevilla cultura musica"],
    "Francia": ["Paris musique open call", "Marseille culture musique", "Lyon musique festival", "Nantes culture music", "Toulouse musique", "Institut francais PAIR music residency"],
    "Alemania": ["Berlin musicboard", "Hamburg music city", "Cologne music festival", "Munich kulturreferat musik", "Leipzig music", "Goethe Institut music residency", "Reeperbahn artist application"],
    "Paises Bajos": ["Amsterdam music fund", "Rotterdam music city", "Utrecht music festival", "Groningen Eurosonic artists", "The Hague music"],
    "Dinamarca": ["Copenhagen music city", "Aarhus music culture", "Odense music festival", "Aalborg music", "Roskilde festival artists"],
    "Suecia": ["Stockholm music city", "Gothenburg culture music", "Malmo music city", "Umea music", "Swedish Arts Council music", "Export Music Sweden showcase"],
    "Suiza": ["Zurich music festival", "Geneva culture music", "Basel music city", "Lausanne music", "Swiss music export"],
    "Marruecos": ["Casablanca music festival", "Rabat culture music", "Marrakech culture music", "Essaouira Gnaoua artists", "Visa For Music Rabat"],
    "Sudafrica": ["Cape Town music office", "Johannesburg arts council music", "Durban music festival", "Gauteng culture music", "Western Cape arts music"],
    "Australia": ["New South Wales music grants", "Victoria music festival", "Melbourne music city", "Sydney arts music", "Queensland music trails", "Music Australia Export Fund international touring"],
    "Nueva Zelanda": ["Auckland music city", "Wellington music", "Christchurch arts music", "Creative New Zealand music", "Dunedin music"],
    "Japon": ["Tokyo music market", "Osaka music festival", "Kyoto culture music", "Hokkaido music festival", "Fukuoka music"],
    "Corea del Sur": ["Seoul music week", "Busan music festival", "Incheon culture music", "Gwangju music", "MUCON Korea"],
    "China": ["Shanghai international arts festival", "Beijing music festival", "Shenzhen culture music", "Guangzhou music festival", "Chengdu music"],
    "Taiwan": ["Taipei music center", "Kaohsiung music festival", "Taichung culture music", "Tainan culture music", "Taiwan music showcase"],
    "Vietnam": ["Ho Chi Minh City music festival", "Hanoi culture music", "Da Nang music festival", "Hue festival music", "Vietnam music week"],
    "Libano": ["Beirut music festival", "Beirut and Beyond", "Byblos festival artists", "Baalbeck festival music", "Zouk Mikael festival"],
}

TERRITORIAL_MISSION_TEMPLATES = [
    '"{country}" "{term}" cultura musica bandas convocatoria',
    '"{country}" "{term}" centro cultural conciertos bandas',
    '"{country}" "{term}" festival musica teloneros',
    'site:instagram.com/p "{country}" "{term}" musica convocatoria',
    'site:instagram.com/reel "{country}" "{term}" concierto bandas',
    '"{country}" "{term}" "{intent}" musica',
    'site:instagram.com/p "{country}" "{term}" "{intent}"',
    '"{area}" convocatoria musica bandas',
    '"{area}" centro cultural conciertos rock',
    'site:instagram.com/p "{area}" cultura musica bandas',
    '"{area}" "{intent}" festival musica',
    'site:instagram.com/reel "{area}" "{intent}" bandas',
]

COUNTRY_SEARCH_ALIASES = {
    "Estados Unidos": "Estados Unidos EEUU USA United States",
    "Inglaterra": "Inglaterra England Reino Unido UK",
    "Holanda": "Holanda Paises Bajos Netherlands",
    "Paises Bajos": "Paises Bajos Holanda Netherlands Nederland",
    "Libano": "Libano Lebanon",
    "Japon": "Japon Japan",
    "Corea del Sur": "Corea del Sur South Korea",
    "Sudafrica": "Sudafrica South Africa",
    "Alemania": "Alemania Germany Deutschland",
    "Francia": "Francia France",
    "Espana": "Espana Spain España",
    "Marruecos": "Marruecos Morocco Maroc المغرب",
    "China": "China 中国",
    "Taiwan": "Taiwan 臺灣 台灣",
    "Vietnam": "Vietnam Việt Nam",
    "Irlanda": "Irlanda Ireland Eire",
    "Australia": "Australia",
    "Canada": "Canada Canadá",
    "Rusia": "Rusia Russia Россия",
    "Gales": "Gales Wales Cymru",
    "Brasil": "Brasil Brazil",
    "Mexico": "Mexico México",
    "Peru": "Peru Perú",
    "Uruguay": "Uruguay",
    "Paraguay": "Paraguay",
    "Argentina": "Argentina",
    "Colombia": "Colombia",
    "Bolivia": "Bolivia",
    "Islandia": "Islandia Iceland Ísland",
}

CHILE_REGIONAL_TARGETS = [
    "Santiago",
    "GAM Centro Cultural Gabriela Mistral Santiago",
    "Las Condes Teatro Municipal Corporacion Cultural musica",
    "Providencia Teatro Oriente musica conciertos",
    "Nunoa Corporacion Cultural musica conciertos",
    "La Reina centro cultural musica conciertos",
    "San Joaquin centro cultural musica bandas",
    "Maipu teatro municipal musica conciertos",
    "Valparaiso",
    "V Region Valparaiso Vina del Mar Quilpue Villa Alemana musica",
    "Limache",
    "Region de O'Higgins Rancagua VI Region musica conciertos",
    "Region del Maule Talca Curico VII Region musica conciertos",
    "Chillan",
    "Los Angeles Bio Bio",
    "Concepcion",
    "Valle de Elqui",
    "La Serena",
    "Coquimbo",
    "Antofagasta teatro municipal cultura musica conciertos",
    "Calama corporacion cultural musica conciertos",
    "Region de Atacama Copiapo Caldera Chanaral Vallenar Huasco musica cultura",
    "Copiapo cultura municipal musica conciertos bandas",
    "Caldera cultura municipal musica festival bandas",
    "Chanaral cultura municipal musica conciertos",
    "Diego de Almagro cultura municipal musica",
    "Tierra Amarilla cultura municipal musica",
    "Vallenar cultura municipal musica conciertos",
    "Huasco cultura municipal musica festival",
    "Freirina cultura municipal musica",
    "Alto del Carmen cultura musica valle",
    "Valdivia teatro cervantes fluvial musica conciertos",
    "Puerto Montt teatro diego rivera cultura musica conciertos",
    "Norte de Chile",
    "Sur de Chile",
]

CHILE_INSTAGRAM_TAGS = [
    "agendacultural",
    "panoramaschile",
    "panoramassantiago",
    "tocatasantiago",
    "tocatasvalparaiso",
    "conciertoschile",
    "conciertossantiago",
    "conciertosconcepcion",
    "rockchileno",
    "bandaschilenas",
    "musicachilena",
    "festivalrec",
    "culturavalparaiso",
    "culturabiobio",
    "culturanuble",
    "culturacoquimbo",
    "valledelelqui",
    "gamcl",
    "lascondes",
    "providencia",
    "nunoa",
    "antofagasta",
    "calama",
    "valdivia",
    "puertomontt",
]

CHILE_REGIONAL_MISSION_TEMPLATES = [
    'site:instagram.com/p "{region}" agenda cultural conciertos bandas rock',
    'site:instagram.com/reel "{region}" festival convocatoria teloneros musica',
    'site:instagram.com/p "{region}" "buscamos bandas" musica',
    'site:instagram.com/p "{region}" "se buscan bandas" concierto',
    'site:instagram.com/p "{region}" "bandas emergentes" convocatoria',
    'site:instagram.com/reel "{region}" "tocata" "bandas"',
    'site:instagram.com/p "{region}" "postula hasta" musica bandas',
    'site:instagram.com/p "{region}" convocatoria cierre bases cultura musica',
    '"{region}" "convocatoria" "musica en vivo" centro cultural',
    '"{region}" "programacion" "musica" "centro cultural"',
    '"{region}" centro cultural musica conciertos convocatoria entrada liberada',
    '"{region}" municipio cultura bandas festival musica pago honorarios',
]

CHILE_TAG_MISSION_TEMPLATES = [
    "site:instagram.com/explore/tags/{tag}/",
    'site:instagram.com/p "#{tag}" convocatoria musica bandas',
    'site:instagram.com/reel "#{tag}" conciertos agenda cultural',
]

CHILE_MEDIA_PROFILE_TARGETS = """
GAM media partners La Tercera Radio 13C
GAM prensa musica popular media partner
Rockaxis revista rock Chile
Rockaxis Instagram oficial
Radio Futuro rock Chile programas
Radio Futuro Instagram Futuro FM
Radio 13C musica cultura GAM
La Tercera Culto musica chilena
SCD Chile prensa musica salas
Sonar FM rock Chile
Radio Rock and Pop Chile musica
Radio Concierto Chile rock
Subela Radio musica independiente
Portal Disc musica chilena
Pousta musica entrevistas bandas
Ibero 90.9 Chile musica independiente
Agenda Musica Chile medios
Medios musicales Chile bandas emergentes
Programas de radio rock chileno bandas
Prensa musical Chile enviar single EPK
""".strip().splitlines()

MEDIA_PROFILE_MISSION_TEMPLATES = [
    '"{target}" contacto prensa musica bandas',
    '"{target}" enviar single banda EPK',
    '"{target}" entrevista banda rock chileno',
    '"{target}" programa radio musica chilena bandas',
    'site:instagram.com "{target}" musica bandas rock',
    'site:instagram.com/p "{target}" banda rock entrevista',
    'site:instagram.com/reel "{target}" musica chilena bandas',
    '"{target}" media partner musica GAM',
    '"{target}" cartelera conciertos bandas',
]

CHILE_PUBLIC_SPACE_TARGETS = """
Culturas Musica Instagram Convocatoria 2026
Fondos Cultura Musica 2026
Mercados FOCO 2026 musica bandas
Linea Apoyo Circulacion Musica Chilena 2026
Red Rockodromo 2026 bandas solistas
GAM Convocatoria Nacional Programacion 2026 2027
CONARTE Valdivia 2026 musica
Concurso Luis Advis 2026 musica
Concurso Roberto Parra Sandoval 2026 musica
Municipalidad de Arica Cultura
Municipalidad de Iquique Cultura
Municipalidad de Alto Hospicio Cultura
Teatro Municipal de Iquique
Museo Regional de Iquique
Municipalidad de Antofagasta Cultura
Teatro Municipal de Antofagasta
Municipalidad de Calama Cultura
Corporacion de Cultura y Turismo Calama
Municipalidad de Tocopilla Cultura
Municipalidad de Mejillones Cultura
Municipalidad de Copiapo Cultura
Centro Cultural Atacama Copiapo
Casa de la Cultura de Copiapo
Centro Cultural Ser Humano Atacama
Gobierno Regional de Atacama Cultura
Municipalidad de Caldera Cultura
Centro Cultural Estacion Caldera
Municipalidad de Chanaral Cultura
Municipalidad de Diego de Almagro Cultura
Municipalidad de Tierra Amarilla Cultura
Municipalidad de Vallenar Cultura
Centro Cultural Vallenar
Municipalidad de Huasco Cultura
Municipalidad de Freirina Cultura
Municipalidad de Alto del Carmen Cultura
Municipalidad de La Serena Cultura
Teatro Centenario La Serena
Municipalidad de Coquimbo Cultura
Centro Cultural Palace Coquimbo
Municipalidad de Ovalle Cultura
Municipalidad de Vicuna Cultura
Municipalidad de Paihuano Cultura
Municipalidad de Valparaiso Cultura
Parque Cultural de Valparaiso
CENTEX Valparaiso
Municipalidad de Vina del Mar Cultura
Teatro Municipal de Vina del Mar
Municipalidad de Quilpue Cultura
Municipalidad de Villa Alemana Cultura
Municipalidad de Limache Cultura
Municipalidad de Quillota Cultura
Municipalidad de San Antonio Cultura
Municipalidad de Los Andes Cultura
Municipalidad de San Felipe Cultura
Municipalidad de Santiago Cultura
GAM Centro Cultural Gabriela Mistral
Matucana 100
Centro Cultural La Moneda
Museo de la Memoria y los Derechos Humanos
Museo Violeta Parra
Museo de Arte Contemporaneo Santiago
Teatro Municipal de Santiago
Municipalidad de Providencia Cultura
Teatro Oriente Providencia
Municipalidad de Las Condes Cultura
Teatro Municipal Las Condes
Centro Cultural Las Condes
Municipalidad de Nunoa Cultura
Corporacion Cultural Nunoa
Sala SCD Nunoa
Municipalidad de La Reina Cultura
Municipalidad de San Joaquin Cultura
Centro Cultural San Joaquin
Municipalidad de Maipu Cultura
Teatro Municipal de Maipu
Municipalidad de Puente Alto Cultura
Municipalidad de La Florida Cultura
Municipalidad de Penalolen Cultura
Centro Cultural Chimkowe Penalolen
Municipalidad de Lo Barnechea Cultura
Municipalidad de Vitacura Cultura
Municipalidad de Recoleta Cultura
Municipalidad de Independencia Cultura
Municipalidad de Quilicura Cultura
Municipalidad de Renca Cultura
Municipalidad de San Miguel Cultura
Municipalidad de Estacion Central Cultura
Municipalidad de Pudahuel Cultura
Municipalidad de La Pintana Cultura
Municipalidad de San Bernardo Cultura
Municipalidad de Colina Cultura
Municipalidad de Buin Cultura
Municipalidad de Talagante Cultura
Municipalidad de Melipilla Cultura
Municipalidad de Rancagua Cultura
Teatro Regional Lucho Gatica
Municipalidad de Machali Cultura
Municipalidad de San Fernando Cultura
Municipalidad de Santa Cruz Cultura
Municipalidad de Pichilemu Cultura
Municipalidad de Talca Cultura
Teatro Regional del Maule
Municipalidad de Curico Cultura
Municipalidad de Linares Cultura
Municipalidad de Cauquenes Cultura
Municipalidad de Constitucion Cultura
Municipalidad de Chillan Cultura
Teatro Municipal de Chillan
Centro Cultural Municipal de Chillan
Municipalidad de San Carlos Cultura
Municipalidad de Concepcion Cultura
Teatro Biobio
Festival REC Concepcion
Municipalidad de Talcahuano Cultura
Municipalidad de Chiguayante Cultura
Municipalidad de Coronel Cultura
Municipalidad de Lota Cultura
Municipalidad de Los Angeles Cultura
Corporacion Cultural Municipal Los Angeles
Municipalidad de Arauco Cultura
Municipalidad de Temuco Cultura
Teatro Municipal de Temuco
Municipalidad de Padre Las Casas Cultura
Municipalidad de Villarrica Cultura
Municipalidad de Pucon Cultura
Municipalidad de Angol Cultura
Municipalidad de Valdivia Cultura
Teatro Regional Cervantes Valdivia
Fluvial Valdivia
Municipalidad de La Union Cultura
Municipalidad de Osorno Cultura
Municipalidad de Puerto Montt Cultura
Teatro Diego Rivera Puerto Montt
Municipalidad de Puerto Varas Cultura
Teatro del Lago Frutillar
Municipalidad de Castro Cultura
Municipalidad de Ancud Cultura
Municipalidad de Coyhaique Cultura
Municipalidad de Puerto Aysen Cultura
Municipalidad de Punta Arenas Cultura
Municipalidad de Puerto Natales Cultura
""".strip().splitlines()

PUBLIC_SPACE_MISSION_TEMPLATES = [
    'site:instagram.com/p "{target}" "convocatoria" "musica"',
    'site:instagram.com/p "{target}" "presentar artistas"',
    'site:instagram.com/p "{target}" "postula tu proyecto"',
    'site:instagram.com/reel "{target}" "programacion artistica" musica',
    'site:instagram.com/reel "{target}" "buscamos bandas"',
    '"{target}" "programacion artistica" "musica"',
    '"{target}" "presentar artistas" "musica"',
    '"{target}" "postula tu proyecto" "musica"',
    '"{target}" "recepcion de propuestas" "artistas"',
    '"{target}" "agenda cultural" "conciertos"',
    '"{target}" "teatro" "convocatoria" "musica"',
    '"{target}" "museo" "musica en vivo" "convocatoria"',
    '"{target}" "como postular" "musica"',
    '"{target}" "formulario de postulacion" "musica"',
    '"{target}" "convocatoria bandas emergentes"',
    '"{target}" "llamado a bandas"',
]

CHILE_DEEP_SEARCH_TARGETS = """
GAM Centro Cultural Gabriela Mistral
Matucana 100
Centro Cultural La Moneda
Balmaceda Arte Joven Santiago
Teatro Nescafe de las Artes
Teatro Oriente Providencia
Corporacion Cultural Providencia
Centro Cultural Las Condes
Teatro Municipal Las Condes
Corporacion Cultural Nunoa
Sala SCD Nunoa
Corporacion Cultural La Reina
Centro Cultural San Joaquin
Teatro Municipal de Maipu
Centro Cultural Puente Alto
Corporacion Cultural La Florida
Centro Cultural Chimkowe Penalolen
Centro Cultural Lo Barnechea
Vitacura Cultura
Corporacion Cultural Recoleta
Centro Cultural Casona Dubois
Independencia Cultura
Huechuraba Cultura
Quilicura Cultura
Renca Cultura
Estacion Central Cultura
San Miguel Cultura
La Pintana Cultura
Pudahuel Cultura
Cerrillos Cultura
Arica Cultura
Iquique Cultura
Alto Hospicio Cultura
Teatro Municipal de Antofagasta
Corporacion Cultural Calama
Mejillones Cultura
Tocopilla Cultura
Copiapo Cultura
Gobierno Regional de Atacama Cultura
Casa de la Cultura de Copiapo
Caldera Cultura
Centro Cultural Estacion Caldera
Chanaral Cultura
Diego de Almagro Cultura
Tierra Amarilla Cultura
Vallenar Cultura
Centro Cultural Vallenar
Huasco Cultura
Freirina Cultura
Alto del Carmen Cultura
Centro Cultural Teatro Centenario La Serena
Coquimbo Cultura
Centro Cultural Municipal Ovalle
Valle de Elqui cultura Vicuna
Parque Cultural de Valparaiso
CENTEX Valparaiso
Vina del Mar Cultura
Quilpue Cultura
Villa Alemana Cultura
Limache Cultura
San Antonio Cultura
Los Andes Cultura
San Felipe Cultura
Teatro Regional Lucho Gatica Rancagua
Machali Cultura
San Fernando Cultura
Santa Cruz Cultura
Pichilemu Cultura
Teatro Regional del Maule
Curico Cultura
Linares Cultura
Cauquenes Cultura
Constitucion Cultura
Teatro Municipal de Chillan
Centro Cultural Municipal de Chillan
San Carlos Cultura
Teatro Biobio
Festival REC Concepcion
Talcahuano Cultura
Chiguayante Cultura
Coronel Cultura
Lota Cultura
Corporacion Cultural Municipal Los Angeles
Arauco Cultura
Teatro Municipal de Temuco
Padre Las Casas Cultura
Villarrica Cultura
Pucon Cultura
Angol Cultura
Fluvial Valdivia
Teatro Regional Cervantes Valdivia
La Union Cultura
Osorno Cultura
Teatro Diego Rivera Puerto Montt
Puerto Varas Cultura
Teatro del Lago Frutillar
Castro Cultura Chiloe
Ancud Cultura
Coyhaique Cultura
Puerto Aysen Cultura
Punta Arenas Cultura
Puerto Natales Cultura
Melipilla Cultura
Talagante Cultura
Buin Cultura
Colina Cultura
San Bernardo Cultura
Penaflor Cultura
Lampa Cultura
Curacavi Cultura
Paine Cultura
Los Vilos Cultura
Quillota Cultura
Rengo Cultura
""".strip().splitlines()

LATAM_RECOGNIZED_TARGETS = {
    "Argentina": ["INAMU", "BAFIM", "Centro Cultural Recoleta", "Ciudad Cultural Konex", "La Trastienda", "Niceto Club", "Cosquin Rock", "Rosario Cultura", "Mendoza Cultura", "La Plata Cultura"],
    "Colombia": ["Rock al Parque", "Idartes", "BOmm Bogota Music Market", "Teatro Mayor Julio Mario Santo Domingo", "Circulart", "Medellin Cultura", "Cali Cultura", "Barranquilla Cultura", "Cartagena Cultura", "Bucaramanga Cultura"],
    "Peru": ["Ministerio de Cultura Peru", "Gran Teatro Nacional Peru", "Centro Cultural de Espana en Lima", "Festival Selvamomos", "Vivo x el Rock", "Cusco Cultura", "Arequipa Cultura", "Trujillo Cultura", "Chiclayo Cultura", "Piura Cultura"],
    "Uruguay": ["INMUS Uruguay", "Montevideo Cultura", "Sala Zitarrosa", "Teatro Solis", "Montevideo Rock", "Durazno Rock", "Canelones Cultura", "Maldonado Cultura"],
    "Paraguay": ["Secretaria Nacional de Cultura Paraguay", "Centro Cultural Juan de Salazar", "Asuncionico", "Municipalidad de Asuncion Cultura", "San Lorenzo Cultura", "Ciudad del Este Cultura", "Encarnacion Cultura", "Villarrica Paraguay Cultura"],
    "Bolivia": ["Ministerio de Culturas Bolivia", "Teatro Municipal Alberto Saavedra Perez", "La Paz Culturas", "Santa Cruz Cultura", "Cochabamba Cultura", "Sucre Cultura", "Tarija Cultura", "Oruro Cultura"],
    "Brasil": ["SIM Sao Paulo", "Centro Cultural Sao Paulo", "SESC Sao Paulo", "Porto Musical", "Circo Voador", "Rock in Rio", "Salvador Cultura", "Belo Horizonte Cultura", "Curitiba Cultura", "Porto Alegre Cultura"],
    "Mexico": ["FIMPRO", "Vive Latino", "Indie Rocks", "Centro Cultural de Espana en Mexico", "Secretaria de Cultura Mexico", "Monterrey Cultura", "Guadalajara Cultura", "Puebla Cultura", "Tijuana Cultura", "Merida Cultura"],
    "Ecuador": ["Quito Cultura", "Teatro Nacional Sucre", "Quitofest", "Guayaquil Cultura", "Cuenca Cultura", "Manta Cultura", "Loja Cultura", "Ibarra Cultura"],
    "Costa Rica": ["Ministerio de Cultura Costa Rica", "FIA Costa Rica", "Jazz Cafe Costa Rica", "Teatro Nacional Costa Rica", "Alajuela Cultura"],
    "Panama": ["MiCultura Panama", "Panama Jazz Festival", "Teatro Nacional Panama", "Ciudad de Panama Cultura", "David Cultura"],
    "Cuba": ["Instituto Cubano de la Musica", "Fabrica de Arte Cubano", "La Habana Cultura"],
    "Republica Dominicana": ["Ministerio de Cultura Republica Dominicana", "Santo Domingo Cultura", "Centro Cultural de Espana Santo Domingo"],
    "Guatemala": ["Ministerio de Cultura Guatemala", "Ciudad de Guatemala Cultura"],
    "Honduras": ["Secretaria de Cultura Honduras", "Tegucigalpa Cultura"],
    "Nicaragua": ["Instituto Nicaraguense de Cultura", "Managua Cultura"],
    "El Salvador": ["Ministerio de Cultura El Salvador", "San Salvador Cultura"],
    "Venezuela": ["Centro Cultural BOD", "Caracas Cultura"],
}

LATAM_EXTRA_RECOGNIZED_TARGETS = {
    "Argentina": [
        "MICA Mercado de Industrias Culturales Argentinas", "Club Paraguay Cordoba",
        "Teatro Vorterix", "CC Matienzo", "Makena Buenos Aires", "Festival Bandera Rosario",
        "Cosquin Rock convocatoria bandas", "Centro Cultural San Martin musica",
        "La Tangente Buenos Aires", "Camping Buenos Aires musica",
    ],
    "Brasil": [
        "SIM Sao Paulo showcase", "Festival Bananada", "DoSol Natal", "Psicodalia Brasil",
        "MADA Natal", "No Ar Coquetel Molotov", "Casa Natura Musical", "Sesc Avenida Paulista",
        "Audio Rebel Rio", "A Autentica Belo Horizonte", "Balaclava Records",
    ],
    "Colombia": [
        "Festival Estereo Picnic", "Altavoz Fest", "Shock Musica", "Radionica Colombia",
        "Teatro Pablo Tobon Uribe", "Casa del Teatro Nacional Bogota", "Festival Centro Bogota",
        "Suenan Las Guitarras Colombia", "Llorona Records", "Locus Festival Colombia",
    ],
    "Peru": [
        "Festival Selvamomos convocatoria", "Lima Music Fest", "La Noche de Barranco",
        "Yield Rock Lima", "Sargento Pimienta Barranco", "Ministerio de Cultura Estimulos Economicos Peru",
        "Asociacion Cultural Peruano Britanica musica", "ICPNA Cultural musica",
    ],
    "Mexico": [
        "Festival Nrmal", "Festival Marvin", "Foro Indie Rocks", "Bajo Circuito CDMX",
        "Caradura CDMX", "Departamento Studio Bar", "Semana Indie Rocks", "IMJUVE musica",
        "Circuito Indio", "FIM GDL", "NODO Cultura Guadalajara",
    ],
    "Uruguay": [
        "Montevideo Music Box", "Sala del Museo", "Bluzz Live Montevideo", "Inmigrantes Uruguay",
        "MVD Music", "La Trastienda Montevideo", "Centro Cultural Florencio Sanchez",
        "Usina Cultural Uruguay", "Tundra Bar Montevideo",
    ],
    "Paraguay": [
        "ReciclArte Paraguay", "Kilkenny Asuncion musica", "La Chispa Asuncion",
        "FestiRock Paraguay", "Teatro Municipal Ignacio A Pane", "Centro Cultural Manzana de la Rivera",
    ],
    "Bolivia": [
        "FestiJazz Bolivia", "Alive Music Bar La Paz", "Teatro Nuna La Paz",
        "Centro Simon I Patino", "Casa Grito La Paz", "Sonidos de la Tierra Bolivia",
    ],
    "Ecuador": [
        "QuitoFest convocatoria", "Teatro Capitol Quito", "Casa de la Musica Quito",
        "Borkis Entertainment", "Festivalfff Ecuador", "Manso Guayaquil musica",
    ],
    "Costa Rica": [
        "Festival Epicentro Costa Rica", "Jazz Cafe Escazu", "Mundoloco El Chante",
        "Amon Solar Costa Rica", "Steinvorth San Jose", "Parque Viva conciertos",
    ],
    "Panama": [
        "Teatro Amador Panama", "Danilo's Jazz Club Panama", "Festival MUPA Panama",
        "Rock and Folk Panama", "Ateneo Ciudad del Saber musica",
    ],
    "Cuba": [
        "Havana World Music", "Agencia Cubana de Rock", "Casa de las Americas musica",
        "Centro Cultural Bertolt Brecht musica",
    ],
    "Republica Dominicana": [
        "Festival Presidente musica", "Casa de Teatro Santo Domingo", "Hard Rock Cafe Santo Domingo",
        "Centro Leon musica", "Dominican Fiesta musica",
    ],
    "Guatemala": [
        "Festival Centro Historico Guatemala", "TrovaJazz Guatemala", "El Ataque Guatemala",
        "Rock'ol Vuh Guatemala", "Centro Cultural de Espana Guatemala musica",
    ],
    "Honduras": [
        "Festival Nuestras Raices Honduras", "Centro Cultural de Espana Tegucigalpa musica",
        "Rocktober Fest Honduras", "Teatro Nacional Manuel Bonilla musica",
    ],
    "Nicaragua": [
        "Festival Internacional Boleros Nicaragua", "Ruta Maya Managua", "Teatro Nacional Ruben Dario musica",
        "Centro Cultural de Espana Nicaragua musica",
    ],
    "El Salvador": [
        "Secretaria de Cultura El Salvador musica", "La Casa Tomada musica", "Centro Cultural de Espana El Salvador",
        "Teatro Nacional San Salvador musica",
    ],
    "Venezuela": [
        "Festival Nuevas Bandas", "Teatro Teresa Carreno musica", "Centro Cultural Chacao musica",
        "Cusica Venezuela", "Centro Cultural BOD conciertos",
    ],
}

for country, targets in LATAM_EXTRA_RECOGNIZED_TARGETS.items():
    existing = LATAM_RECOGNIZED_TARGETS.setdefault(country, [])
    for target in targets:
        if target not in existing:
            existing.append(target)

GLOBAL_PRIORITY_TARGETS = {
    "Estados Unidos": ["SXSW Music Festival", "Lincoln Center Open Calls", "Brooklyn Academy of Music", "The Echo Los Angeles", "Chicago Cultural Center"],
    "Canada": ["Canadian Music Week", "M for Montreal", "Music BC"],
    "Irlanda": ["First Music Contact Ireland", "Whelan's Dublin"],
    "Inglaterra": ["The Great Escape Festival", "Arts Council England Music", "Roundhouse London"],
    "Reino Unido": ["The Great Escape Festival", "Arts Council England Music", "Roundhouse London"],
    "Espana": ["Primavera Pro", "BIME", "INJUVE Musica"],
    "Marruecos": ["Visa For Music", "Hiba Foundation"],
    "Francia": ["Centre National de la Musique", "MaMA Music & Convention", "La Gaite Lyrique"],
    "Alemania": ["Reeperbahn Festival", "Musicboard Berlin"],
    "Paises Bajos": ["Eurosonic Noorderslag"],
    "Holanda": ["Eurosonic Noorderslag"],
    "Dinamarca": ["Music Export Denmark"],
    "Suecia": ["Export Music Sweden"],
    "Suiza": ["Pro Helvetia Music"],
    "Australia": ["BIGSOUND"],
    "Japon": ["Music Lane Festival Okinawa", "Tokyo music open call"],
    "Corea del Sur": ["Zandari Festa"],
    "Taiwan": ["LUCfest"],
    "Vietnam": ["Hozo Music Festival"],
    "China": ["Music China"],
    "Sudafrica": ["Music In Africa"],
    "Libano": ["Beirut and Beyond"],
    "Rusia": ["Moscow Music Week"],
}

COUNTRY_PUBLIC_SPACE_TARGETS = {
    "Argentina": [
        "Buenos Aires Cultura", "Usina del Arte", "Centro Cultural Recoleta", "Tecnopolis",
        "Ciudad Cultural Konex", "Centro Cultural Kirchner", "La Plata Cultura",
        "Rosario Cultura", "Cordoba Cultura", "Mendoza Cultura", "Mar del Plata Cultura",
        "Tucuman Cultura", "Salta Cultura", "Neuquen Cultura", "Bariloche Cultura",
    ],
    "Brasil": [
        "Sao Paulo Cultura", "Centro Cultural Sao Paulo", "SESC Sao Paulo", "SESC Pompeia",
        "Rio de Janeiro Cultura", "Circo Voador", "Fundicao Progresso", "Belo Horizonte Cultura",
        "Curitiba Cultura", "Porto Alegre Cultura", "Recife Cultura", "Salvador Cultura",
        "Brasilia Cultura", "Fortaleza Cultura", "Florianopolis Cultura", "Goiania Cultura",
    ],
    "Paraguay": [
        "Asuncion Cultura", "Centro Cultural Juan de Salazar", "Manzana de la Rivera",
        "Municipalidad de Asuncion Cultura", "San Lorenzo Cultura", "Ciudad del Este Cultura",
        "Encarnacion Cultura", "Villarrica Paraguay Cultura", "Aregua Cultura",
    ],
    "Uruguay": [
        "Montevideo Cultura", "Sala Zitarrosa", "Teatro Solis", "Centro Cultural de Espana Montevideo",
        "Canelones Cultura", "Maldonado Cultura", "Punta del Este Cultura", "Colonia Cultura",
        "Paysandu Cultura", "Salto Cultura", "Durazno Cultura",
    ],
    "Colombia": [
        "Bogota Cultura", "Idartes", "Teatro Jorge Eliecer Gaitan", "Teatro Mayor Julio Mario Santo Domingo",
        "Medellin Cultura", "Parque de los Deseos Medellin", "Cali Cultura", "Barranquilla Cultura",
        "Cartagena Cultura", "Bucaramanga Cultura", "Manizales Cultura", "Pereira Cultura",
        "Rock al Parque", "BOmm Bogota Music Market", "Circulart",
    ],
    "Peru": [
        "Lima Cultura", "Gran Teatro Nacional Peru", "Centro Cultural de Espana en Lima",
        "Ministerio de Cultura Peru", "Municipalidad de Lima Cultura", "Barranco Cultura",
        "Miraflores Cultura", "Cusco Cultura", "Arequipa Cultura", "Trujillo Cultura",
        "Chiclayo Cultura", "Piura Cultura", "Puno Cultura", "Iquitos Cultura",
    ],
    "Bolivia": [
        "La Paz Culturas", "Teatro Municipal Alberto Saavedra Perez", "Centro Cultural de Espana La Paz",
        "Santa Cruz Cultura", "Cochabamba Cultura", "Sucre Cultura", "Tarija Cultura",
        "Oruro Cultura", "Potosi Cultura", "El Alto Cultura",
    ],
    "Mexico": [
        "Ciudad de Mexico Cultura", "Secretaria de Cultura Mexico", "Centro Cultural de Espana en Mexico",
        "Foro Indie Rocks", "Cenart Mexico", "Monterrey Cultura", "Guadalajara Cultura",
        "Puebla Cultura", "Tijuana Cultura", "Merida Cultura", "Queretaro Cultura",
        "Oaxaca Cultura", "Leon Guanajuato Cultura", "San Luis Potosi Cultura",
    ],
    "Canada": [
        "Toronto music open call", "Toronto Arts Council music", "Harbourfront Centre music",
        "Montreal music showcase", "M for Montreal", "Place des Arts Montreal",
        "Vancouver music open call", "Music BC", "Calgary arts music", "Edmonton arts music",
        "Ottawa music showcase", "Canada Council for the Arts music", "FACTOR Canada music",
    ],
    "Irlanda": [
        "Dublin music open call", "First Music Contact Ireland", "Whelan's Dublin",
        "Culture Ireland music", "Galway arts music", "Cork music open call",
        "Limerick culture music", "Belfast music showcase",
    ],
    "Gales": [
        "Wales Arts Council music", "Cardiff music open call", "Wales Millennium Centre music",
        "Focus Wales showcase", "BBC Horizons Wales music", "Swansea music open call",
        "Aberystwyth Arts Centre music", "Cymru music showcase",
    ],
    "Islandia": [
        "Iceland Airwaves showcase", "Reykjavik music open call", "Iceland Music Export",
        "Harpa Reykjavik music", "Reykjavik Arts Festival music",
    ],
    "Inglaterra": [
        "London music open call", "Roundhouse London", "Southbank Centre music",
        "Barbican music open call", "Arts Council England music", "Manchester music showcase",
        "Liverpool music open call", "Bristol music open call", "The Great Escape Festival",
    ],
    "Reino Unido": [
        "UK music open call", "Arts Council England music", "British Council music",
        "PRS Foundation music", "Help Musicians UK", "Creative Scotland music",
        "Wales Arts Council music", "The Great Escape Festival",
    ],
    "Francia": [
        "Centre National de la Musique", "Institut Francais musique", "Paris music open call",
        "La Gaite Lyrique", "MaMA Music Convention", "Rennes Trans Musicales",
        "Lyon culture musique", "Marseille culture musique",
    ],
    "Alemania": [
        "Berlin music open call", "Musicboard Berlin", "Reeperbahn Festival",
        "Goethe Institut Musik", "Hamburg music showcase", "Cologne music open call",
        "Munich culture music", "Leipzig music open call",
    ],
    "Espana": [
        "Madrid Cultura musica", "Matadero Madrid musica", "Barcelona Cultura musica",
        "Primavera Pro", "BIME Bilbao", "Valencia Cultura musica", "Sevilla Cultura musica",
        "Zaragoza Cultura musica", "INJUVE Musica",
    ],
    "Paises Bajos": [
        "Amsterdam music open call", "Eurosonic Noorderslag", "Dutch Music Export",
        "Rotterdam music open call", "Utrecht music showcase", "Paradiso Amsterdam",
    ],
    "Japon": [
        "Tokyo music open call", "Music Lane Okinawa", "Fuji Rock rookie a go go",
        "Osaka music showcase", "Kyoto music open call", "Japan Foundation music",
    ],
    "Corea del Sur": [
        "Seoul music showcase", "Zandari Festa", "MUCON Korea", "Korea Creative Content Agency music",
        "Busan music open call", "Incheon music open call",
    ],
    "China": [
        "Shanghai music festival open call", "Beijing music open call", "Music China Shanghai",
        "Shenzhen music open call", "Guangzhou music festival", "China Shanghai International Arts Festival",
    ],
    "Taiwan": [
        "Taipei music open call", "LUCfest Taiwan", "Taiwan Creative Content Agency music",
        "Kaohsiung music open call", "Taiwan Beats music",
    ],
    "Vietnam": [
        "Ho Chi Minh City music open call", "HOZO Music Festival", "Hanoi music open call",
        "Monsoon Music Festival Vietnam", "Vietnam music showcase",
    ],
}

EXPANDED_TARGET_TEMPLATES = [
    'site:instagram.com/p "{target}" musica bandas convocatoria',
    'site:instagram.com/reel "{target}" concierto bandas tocata',
    '"{target}" "convocatoria" "musica"',
    '"{target}" "programacion" "musica en vivo"',
    '"{target}" "open call" "music"',
]

GLOBAL_INVITATION_TERMS = [
    "open call musicians international",
    "artist open call international music",
    "international artists open call music",
    "band submissions festival",
    "showcase application artists",
    "convocatoria artistas internacionales musica",
    "convocatoria bandas festival",
    "appel a candidatures musique",
    "bewerbung bands festival",
    "edital musica festival",
    "ショーケース 応募 音楽",
    "아티스트 공모 음악",
    "音乐 节 招募 乐队",
    "دعوة مفتوحة موسيقى",
    "apply to play festival",
    "support act wanted",
    "international artist residency music",
    "music mobility grant",
    "touring grant musicians",
    "arts council music grant",
    "festival submissions bands",
    "conference showcase artists",
    "booking call bands",
    "unsigned bands wanted",
    "emerging artists call",
    "buscamos bandas festival",
    "postulacion musicos festival",
    "residencia artistica musica",
    "subvencion musica internacional",
    "appel a candidatures musique",
    "appel artistes internationaux musique",
    "candidature festival musique",
    "artistes emergents appel",
    "aide a la mobilite musique",
    "aide export musique",
    "bewerbung bands festival",
    "musiker gesucht festival",
    "kunstler bewerbung musik",
    "musik export forderung",
    "band aanmelding festival",
    "open oproep muziek",
    "artiesten gezocht festival",
    "bando artisti musica",
    "call artisti festival musica",
    "concorso band emergenti",
    "inscricao artistas musica",
    "edital musica festival",
    "chamada publica artistas musica",
    "apoio a circulacao musical",
    "convocatoria artistas musica",
    "inscripcion bandas festival",
    "opencall musicians",
    "ショーケース 応募 音楽",
    "音楽 フェス 出演者 募集",
    "아티스트 공모 음악",
    "뮤직 쇼케이스 지원",
    "徵件 音樂 節",
    "音樂人 徵選",
    "音乐 节 招募 乐队",
    "音乐人 申请 演出",
    "دعوة مفتوحة موسيقى",
    "مهرجان موسيقي دعوة فنانين",
]

GLOBAL_SOURCE_PATTERNS = [
    'site:instagram.com/p "{country}" "{term}"',
    'site:instagram.com/reel "{country}" "{term}"',
    'site:tiktok.com "{country}" "{term}"',
    'site:facebook.com/events "{country}" "{term}"',
    'site:musicinafrica.net "{country}" "{term}"',
    'site:festhome.com "{country}" "{term}"',
    'site:filmfreeway.com "{country}" "{term}" music',
    'site:submittable.com "{country}" "{term}" music',
    'site:opencall.org "{country}" "{term}" music',
    'site:callforentry.org "{country}" "{term}" music',
    'site:culture360.asef.org "{country}" "{term}" music',
    'site:on-the-move.org "{country}" "{term}" music',
    'site:arts.gov "{country}" "{term}" music',
    'site:creative-capital.org "{country}" "{term}" music',
    'site:goethe.de "{country}" "{term}" music',
    'site:institutfrancais.com "{country}" "{term}" music',
    'site:britishcouncil.org "{country}" "{term}" music',
    'site:prohelvetia.ch "{country}" "{term}" music',
    'site:musicexport* "{country}" "{term}"',
    'site:github.com "{country}" "{term}" "music opportunities"',
    'site:github.com "{country}" "{term}" "festival submissions"',
    'site:github.com "{country}" "{term}" "booking"',
    'site:bandcamp.com "{country}" "{term}" festival',
    '"{country}" "{term}" "rock"',
    '"{country}" "{term}" "indie"',
    '"{country}" "{term}" "folk"',
    '"{country}" "{term}" "experimental"',
    '"{country}" "{term}" "progressive rock"',
    '"{country}" "{term}" "fusion"',
    '"{country}" "{term}" "world music"',
    '"{country}" "{term}" "alternative"',
    '"{country}" "{term}" "music export"',
    '"{country}" "{term}" "cultural institute"',
    '"{country}" "{term}" "foreign artists"',
    '"{country}" "{term}" "international artists"',
]


def global_mission_capacity() -> int:
    return len(TARGET_COUNTRIES) * len(GLOBAL_INVITATION_TERMS) * len(GLOBAL_SOURCE_PATTERNS)


def build_global_discovery_queries(country: str, limit: int | None = None) -> list[str]:
    search_country = COUNTRY_SEARCH_ALIASES.get(country, country)
    queries = [
        pattern.replace("{country}", search_country).replace("{term}", term)
        for pattern in GLOBAL_SOURCE_PATTERNS
        for term in GLOBAL_INVITATION_TERMS
    ]
    return queries[:limit] if limit else queries


def build_semantic_discovery_queries(country: str) -> list[str]:
    search_country = COUNTRY_SEARCH_ALIASES.get(country, country)
    semantic_terms = [
        term
        for terms in SEMANTIC_INTENT_GROUPS.values()
        for term in terms
    ]
    return [
        template.replace("{country}", search_country).replace("{term}", term)
        for term in semantic_terms
        for template in LATAM_SEMANTIC_MISSION_TEMPLATES
    ]


def build_territorial_discovery_queries(country: str) -> list[str]:
    search_country = COUNTRY_SEARCH_ALIASES.get(country, country)
    admin_terms = ADMIN_DIVISION_TERMS.get(country, DEFAULT_ADMIN_DIVISION_TERMS)
    areas = GLOBAL_TERRITORIAL_AREA_SEEDS.get(country, [])
    queries = []
    priority_intents = HIGH_VALUE_SEMANTIC_TERMS[:8]
    for term in admin_terms:
        for template in TERRITORIAL_MISSION_TEMPLATES[:5]:
            queries.append(template.replace("{country}", search_country).replace("{term}", term).replace("{area}", f"{search_country} {term}").replace("{intent}", "music open call"))
        for intent in priority_intents:
            for template in TERRITORIAL_MISSION_TEMPLATES[5:7]:
                queries.append(template.replace("{country}", search_country).replace("{term}", term).replace("{area}", f"{search_country} {term}").replace("{intent}", intent))
    for area in areas:
        for template in TERRITORIAL_MISSION_TEMPLATES[7:10]:
            queries.append(template.replace("{country}", search_country).replace("{term}", area).replace("{area}", area).replace("{intent}", "music open call"))
        for intent in priority_intents:
            for template in TERRITORIAL_MISSION_TEMPLATES[10:]:
                queries.append(template.replace("{country}", search_country).replace("{term}", area).replace("{area}", area).replace("{intent}", intent))
    return queries


def build_discovery_queries(country: str) -> list[str]:
    search_country = COUNTRY_SEARCH_ALIASES.get(country, country)
    queries = [template.replace("{country}", search_country) for template in SEARCH_MISSION_TEMPLATES]
    queries.extend(build_territorial_discovery_queries(country))
    if country in WORLD_EXTRA_COUNTRIES["Latinoamerica"]:
        queries.extend(build_semantic_discovery_queries(country))
    if country == "Chile":
        for region in CHILE_REGIONAL_TARGETS:
            queries.extend(template.replace("{region}", region) for template in CHILE_REGIONAL_MISSION_TEMPLATES)
        for tag in CHILE_INSTAGRAM_TAGS:
            queries.extend(template.replace("{tag}", tag) for template in CHILE_TAG_MISSION_TEMPLATES)
        for target in CHILE_MEDIA_PROFILE_TARGETS:
            queries.extend(template.replace("{target}", target) for template in MEDIA_PROFILE_MISSION_TEMPLATES)
        for target in CHILE_PUBLIC_SPACE_TARGETS:
            queries.extend(template.replace("{target}", target) for template in PUBLIC_SPACE_MISSION_TEMPLATES)
        for target in CHILE_DEEP_SEARCH_TARGETS:
            queries.extend(template.replace("{target}", target) for template in EXPANDED_TARGET_TEMPLATES)
    for target in LATAM_RECOGNIZED_TARGETS.get(country, []):
        queries.extend(template.replace("{target}", target) for template in EXPANDED_TARGET_TEMPLATES)
    for target in GLOBAL_PRIORITY_TARGETS.get(country, []):
        queries.extend(template.replace("{target}", target) for template in EXPANDED_TARGET_TEMPLATES)
    for target in COUNTRY_PUBLIC_SPACE_TARGETS.get(country, []):
        queries.extend(template.replace("{target}", target) for template in PUBLIC_SPACE_MISSION_TEMPLATES)
    queries.extend(build_global_discovery_queries(country, limit=220))
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
