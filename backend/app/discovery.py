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
    "Norteamerica": ["Canada", "Estados Unidos", "Groenlandia"],
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

EXPANSION_PRIORITY_ORDER = [
    "Chile",
    "Latinoamerica",
    "Estados Unidos",
    "Canada",
    "Europa",
    "Asia",
    "Oceania",
    "Australia",
    "Africa",
    "Medio Oriente",
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
        "India", "Indonesia", "Tailandia", "Filipinas", "Malasia", "Singapur",
        "Israel", "Emiratos Arabes Unidos", "Kazajistan",
    ]],
    *[("Africa", country) for country in [
        "Marruecos", "Sudafrica", "Nigeria", "Ghana", "Kenia", "Senegal",
        "Egipto", "Tunez", "Etiopia", "Camerun",
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
    "Groenlandia": ["kommune", "municipality", "cultural centre", "arts council", "Nordic culture"],
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
        "Teatro del Lago Frutillar Programacion musica",
        "Semanas Musicales de Frutillar convocatoria musica",
        "Region de Aysen Coyhaique Puerto Aysen Puerto Cisnes Chile Chico Cochrane musica",
        "Gobierno Regional de Aysen Cultura musica",
        "Centro Cultural Coyhaique musica",
        "Municipalidad de Puerto Cisnes Cultura",
        "Municipalidad de Chile Chico Cultura",
        "Municipalidad de Cochrane Cultura",
        "Magallanes Punta Arenas Puerto Natales Porvenir Puerto Williams musica cultura",
    ],
    "Argentina": ["Provincia de Buenos Aires cultura musica", "Cordoba Cultura municipios", "Santa Fe Cultura Rosario", "Mendoza Cultura municipios", "Patagonia Argentina cultura musica", "Tucuman Cultura musica", "Salta Cultura musica", "Mar del Plata Cultura musica", "Neuquen Cultura musica", "Bariloche Cultura musica"],
    "Uruguay": ["Montevideo departamento cultura musica", "Canelones Cultura", "Maldonado Cultura", "Colonia Cultura", "Paysandu Cultura", "Salto Cultura", "Durazno Rock cultura", "Rocha Cultura musica", "Rivera Cultura musica", "Tacuarembo Cultura musica"],
    "Paraguay": ["Asuncion Cultura", "Departamento Central cultura musica", "Alto Parana Cultura", "Itapua Cultura", "Guaira Cultura", "Encarnacion Cultura", "Ciudad del Este Cultura", "Caaguazu Cultura", "Concepcion Paraguay Cultura"],
    "Bolivia": ["La Paz Culturas", "Santa Cruz Cultura", "Cochabamba Cultura", "Sucre Cultura", "Tarija Cultura", "Oruro Cultura", "Potosi Cultura", "El Alto Cultura musica", "Beni Cultura musica"],
    "Peru": ["Lima Cultura", "Arequipa Cultura", "Cusco Cultura", "La Libertad Trujillo Cultura", "Piura Cultura", "Chiclayo Cultura", "Iquitos Cultura", "Puno Cultura", "Tacna Cultura", "Huancayo Cultura"],
    "Colombia": ["Bogota Cultura", "Antioquia Medellin Cultura", "Valle del Cauca Cali Cultura", "Atlantico Barranquilla Cultura", "Bolivar Cartagena Cultura", "Santander Bucaramanga Cultura", "Nariño Pasto Cultura", "Eje Cafetero Pereira Cultura", "Tolima Ibague Cultura"],
    "Brasil": ["Sao Paulo Secretaria de Cultura musica", "Rio de Janeiro Cultura", "Minas Gerais Cultura", "Bahia Cultura", "Rio Grande do Sul Cultura", "Pernambuco Recife Cultura", "Parana Curitiba Cultura", "Ceara Fortaleza Cultura", "Distrito Federal Brasilia Cultura", "Para Belem Cultura"],
    "Mexico": ["Ciudad de Mexico Cultura", "Jalisco Cultura Guadalajara", "Nuevo Leon Cultura Monterrey", "Baja California Cultura Tijuana", "Yucatan Cultura Merida", "Puebla Cultura", "Oaxaca Cultura", "Queretaro Cultura", "Guanajuato Cultura", "Chiapas Cultura"],
    "Ecuador": ["Quito Cultura", "Guayaquil Cultura", "Cuenca Cultura", "Manta Cultura", "Loja Cultura", "Ibarra Cultura"],
    "Costa Rica": ["San Jose Cultura", "Alajuela Cultura", "Cartago Cultura", "Heredia Cultura", "Guanacaste Cultura", "Puntarenas Cultura"],
    "Panama": ["Ciudad de Panama Cultura", "David Chiriqui Cultura", "Colon Cultura", "Los Santos Cultura", "Veraguas Cultura"],
    "Cuba": ["La Habana Cultura", "Santiago de Cuba Cultura", "Camaguey Cultura", "Santa Clara Cultura", "Holguin Cultura"],
    "Republica Dominicana": ["Santo Domingo Cultura", "Santiago de los Caballeros Cultura", "Puerto Plata Cultura", "La Romana Cultura"],
    "Guatemala": ["Ciudad de Guatemala Cultura", "Antigua Guatemala Cultura", "Quetzaltenango Cultura", "Huehuetenango Cultura"],
    "Honduras": ["Tegucigalpa Cultura", "San Pedro Sula Cultura", "La Ceiba Cultura", "Comayagua Cultura"],
    "Nicaragua": ["Managua Cultura", "Leon Cultura", "Granada Cultura", "Masaya Cultura"],
    "El Salvador": ["San Salvador Cultura", "Santa Ana Cultura", "San Miguel Cultura", "Suchitoto Cultura"],
    "Venezuela": ["Caracas Cultura", "Maracaibo Cultura", "Valencia Venezuela Cultura", "Merida Venezuela Cultura"],
    "Belice": ["Belize International Music and Food Festival", "Belize City culture music", "Belmopan culture music", "San Ignacio music festival"],
    "Guyana": ["National Cultural Centre Guyana", "Georgetown Guyana culture music", "Guyana cultural centre music"],
    "Surinam": ["Suriname Jazz Festival", "Paramaribo culture music", "Suriname music festival"],
    "Jamaica": ["Reggae Month Jamaica", "Kingston music culture", "Jamaica music festival", "Edna Manley College music"],
    "Haiti": ["FOKAL Haiti culture", "Port-au-Prince culture music", "Jacmel music festival"],
    "Trinidad y Tobago": ["Queen's Hall Trinidad music", "Port of Spain music festival", "Trinidad culture music", "Tobago music festival"],
    "Bahamas": ["Bahamas National Festival Commission music", "Nassau culture music", "Bahamas music festival"],
    "Barbados": ["NIFCA Barbados music", "Bridgetown culture music", "Barbados music festival"],
    "Santa Lucia": ["Saint Lucia Jazz", "Castries culture music", "Saint Lucia Jazz artists"],
    "Granada": ["Grenada culture music", "SpiceMas music artists"],
    "Dominica": ["Roseau culture music", "World Creole Music Festival Dominica"],
    "Antigua y Barbuda": ["Antigua culture music", "Antigua Carnival music"],
    "San Vicente y las Granadinas": ["Kingstown culture music", "Vincy Mas music"],
    "San Cristobal y Nieves": ["St Kitts Music Festival", "Basseterre culture music"],
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
    "Groenlandia": "Groenlandia Greenland Kalaallit Nunaat Nuuk Sisimiut",
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
    "Frutillar Teatro del Lago Semanas Musicales musica conciertos",
    "Region de Aysen Coyhaique Puerto Aysen Puerto Cisnes Chile Chico Cochrane cultura musica",
    "Coyhaique centro cultural teatro municipal musica conciertos bandas",
    "Puerto Aysen cultura municipal musica festival bandas",
    "Chile Chico cultura Patagonia musica conciertos",
    "Cochrane cultura municipal musica Patagonia",
    "Puerto Cisnes cultura musica festival Patagonia",
    "Magallanes Punta Arenas Puerto Natales Porvenir Puerto Williams cultura musica",
    "Arica Parinacota Putre Camarones cultura musica",
    "Tarapaca Iquique Alto Hospicio Pozo Almonte cultura musica",
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
    "teatrodellago",
    "frutillar",
    "semanasmusicalesdefrutillar",
    "culturaaysen",
    "coyhaique",
    "puertoaysen",
    "patagoniacultural",
    "puntaarenas",
    "puertonatales",
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
Teatro del Lago Frutillar Programacion
Semanas Musicales de Frutillar
Municipalidad de Frutillar Cultura
Corporacion Cultural Puerto Varas
Municipalidad de Castro Cultura
Municipalidad de Ancud Cultura
Municipalidad de Quellon Cultura
Municipalidad de Chaiten Cultura
Municipalidad de Hualaihue Cultura
Seremi de las Culturas Aysen
Gobierno Regional de Aysen Cultura
Municipalidad de Coyhaique Cultura
Centro Cultural Coyhaique
Casa de la Cultura Coyhaique
Municipalidad de Puerto Aysen Cultura
Municipalidad de Puerto Cisnes Cultura
Municipalidad de Chile Chico Cultura
Municipalidad de Cochrane Cultura
Municipalidad de Aysen Cultura
Municipalidad de Rio Ibanez Cultura
Municipalidad de Guaitecas Cultura
Biblioteca Regional de Aysen eventos musica
Municipalidad de Punta Arenas Cultura
Municipalidad de Puerto Natales Cultura
Municipalidad de Porvenir Cultura
Municipalidad de Puerto Williams Cultura
Centro Cultural Claudio Paredes Chamorro Punta Arenas
Teatro Municipal Jose Bohr Punta Arenas
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
Semanas Musicales de Frutillar
Frutillar Cultura
Castro Cultura Chiloe
Ancud Cultura
Quellon Cultura
Chaiten Cultura
Hualaihue Cultura
Gobierno Regional de Aysen Cultura
Coyhaique Cultura
Centro Cultural Coyhaique
Casa de la Cultura Coyhaique
Puerto Aysen Cultura
Puerto Cisnes Cultura
Chile Chico Cultura
Cochrane Cultura
Rio Ibanez Cultura
Guaitecas Cultura
Punta Arenas Cultura
Puerto Natales Cultura
Porvenir Cultura
Puerto Williams Cultura
Centro Cultural Claudio Paredes Chamorro Punta Arenas
Teatro Municipal Jose Bohr Punta Arenas
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
    "Belice": ["Belize International Music and Food Festival", "Belize City culture music", "San Ignacio music"],
    "Guyana": ["National Cultural Centre Guyana", "Georgetown culture music", "Guyana Music Festival"],
    "Surinam": ["Paramaribo culture music", "Suriname Jazz Festival", "Nationale Stichting Surinaamse Kunst"],
    "Jamaica": ["Kingston music culture", "Reggae Month Jamaica", "Edna Manley College music"],
    "Haiti": ["Port-au-Prince culture music", "Jacmel music festival", "FOKAL Haiti culture"],
    "Trinidad y Tobago": ["Port of Spain music festival", "Queen's Hall Trinidad music", "Tobago Jazz"],
    "Bahamas": ["Nassau culture music", "Bahamas National Festival Commission music"],
    "Barbados": ["Bridgetown culture music", "NIFCA Barbados music", "Barbados Music Awards"],
    "Santa Lucia": ["Saint Lucia Jazz", "Castries culture music"],
    "Granada": ["Grenada culture music", "SpiceMas music"],
    "Dominica": ["World Creole Music Festival Dominica", "Roseau culture music"],
    "Antigua y Barbuda": ["Antigua Carnival music", "Antigua culture music"],
    "San Vicente y las Granadinas": ["Vincy Mas music", "Kingstown culture music"],
    "San Cristobal y Nieves": ["St Kitts Music Festival", "Basseterre culture music"],
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

SOUTH_AMERICA_DEEP_EXPANSION = {
    "Argentina": {
        "territorial": [
            "Ciudad de Buenos Aires cultura musica salas independientes",
            "Usina del Arte convocatorias musica Buenos Aires",
            "Centro Cultural Recoleta musica convocatoria bandas",
            "Centro Cultural San Martin programacion musica",
            "Ministerio de Cultura Argentina MICA musica convocatorias",
            "INAMU fomento musica argentina convocatorias",
            "BAFIM Buenos Aires Music Market showcase",
            "Provincia de Buenos Aires Instituto Cultural musica",
            "La Plata cultura musica centros culturales",
            "Mar del Plata cultura musica convocatoria bandas",
            "Cordoba Agencia Cordoba Cultura musica",
            "Club Paraguay Cordoba bandas",
            "Rosario Secretaria de Cultura musica",
            "Festival Bandera Rosario bandas",
            "Santa Fe cultura musica municipios",
            "Mendoza Cultura musica municipios",
            "Salta Cultura musica municipios",
            "Tucuman Cultura musica municipios",
            "Neuquen Cultura musica Patagonia",
            "Bariloche Cultura musica Patagonia",
            "Tierra del Fuego Cultura musica Ushuaia",
            "Jujuy Cultura musica",
            "Misiones Cultura musica Posadas",
            "Entre Rios Cultura musica Parana",
        ],
        "recognized": [
            "Ministerio de Cultura Argentina convocatorias musica",
            "Instituto Cultural Provincia de Buenos Aires musica",
            "Usina del Arte programacion musica",
            "Centro Cultural San Martin musica",
            "Centro Cultural Borges musica",
            "Tecnopolis musica convocatoria",
            "Teatro Vorterix convocatoria bandas",
            "C Complejo Art Media bandas",
            "La Tangente convocatoria bandas",
            "Camping Buenos Aires musica",
            "Uniclub Buenos Aires bandas",
            "El Emergente Almagro bandas",
            "Club Lucille Buenos Aires bandas",
            "Casa Brandon musica",
            "Congo Club Cultural musica",
            "FestiMugre Argentina",
            "Gonna Go producciones Argentina",
            "IndieFuertes Argentina",
        ],
        "public_spaces": [
            "Ministerio de Cultura Argentina convocatorias musica",
            "Instituto Nacional de la Musica INAMU",
            "MICA Argentina musica",
            "Usina del Arte Buenos Aires",
            "Centro Cultural Recoleta",
            "Centro Cultural San Martin",
            "Centro Cultural Borges",
            "Tecnopolis musica",
            "Ciudad Cultural Konex",
            "Centro Cultural Kirchner musica",
            "Teatro Vorterix",
            "C Complejo Art Media",
            "La Tangente Buenos Aires",
            "Camping Buenos Aires musica",
            "Club Paraguay Cordoba",
            "Rosario Cultura musica",
            "Festival Bandera Rosario",
            "Mendoza Cultura musica",
            "Salta Cultura musica",
            "Tucuman Cultura musica",
            "Neuquen Cultura musica",
            "Bariloche Cultura musica",
        ],
    },
    "Uruguay": {
        "territorial": [
            "Montevideo Intendencia cultura musica",
            "INMUS Uruguay musica convocatorias",
            "Sala Zitarrosa programacion musica",
            "Teatro Solis musica Montevideo",
            "Centro Cultural de Espana Montevideo musica",
            "Usinas Culturales Uruguay musica",
            "Montevideo Music Box bandas",
            "La Trastienda Montevideo bandas",
            "Sala del Museo Montevideo musica",
            "Bluzz Live Montevideo bandas",
            "Canelones Cultura musica",
            "Maldonado Cultura musica Punta del Este",
            "Rocha Cultura musica La Paloma",
            "Colonia Cultura musica",
            "Paysandu Cultura musica",
            "Salto Cultura musica",
            "Durazno Rock convocatoria bandas",
            "Tacuarembo Cultura musica",
            "Rivera Cultura musica",
            "San Jose Cultura musica",
        ],
        "recognized": [
            "Agadu musica Uruguay convocatorias",
            "Ministerio de Educacion y Cultura Uruguay musica",
            "INMUS Uruguay convocatorias",
            "Usinas Culturales Uruguay",
            "Centro Cultural Florencio Sanchez musica",
            "Sala Camacua musica",
            "Paullier y Guana musica",
            "Inmigrantes Uruguay bandas",
            "MVD Music Uruguay",
            "Tundra Bar Montevideo",
            "Sodre musica Uruguay",
            "Montevideo Rock convocatoria",
        ],
        "public_spaces": [
            "Intendencia de Montevideo Cultura",
            "INMUS Uruguay",
            "Sala Zitarrosa",
            "Teatro Solis",
            "Centro Cultural de Espana Montevideo",
            "Usinas Culturales Uruguay",
            "Montevideo Music Box",
            "La Trastienda Montevideo",
            "Sala del Museo",
            "Bluzz Live Montevideo",
            "Canelones Cultura",
            "Maldonado Cultura",
            "Rocha Cultura",
            "Colonia Cultura",
            "Paysandu Cultura",
            "Salto Cultura",
            "Durazno Rock",
        ],
    },
    "Paraguay": {
        "territorial": [
            "Asuncion Secretaria Nacional de Cultura musica",
            "Municipalidad de Asuncion cultura musica",
            "Centro Cultural Juan de Salazar musica",
            "Manzana de la Rivera musica Asuncion",
            "Teatro Municipal Ignacio A Pane musica",
            "Asuncionico Paraguay bandas",
            "ReciclArte Paraguay bandas",
            "Kilkenny Asuncion musica",
            "La Chispa Asuncion musica",
            "Central San Lorenzo cultura musica",
            "Aregua Cultura musica",
            "Luque Cultura musica",
            "Alto Parana Ciudad del Este cultura musica",
            "Itapua Encarnacion cultura musica",
            "Guaira Villarrica cultura musica",
            "Caaguazu Cultura musica",
            "Concepcion Paraguay Cultura musica",
            "Boqueron Filadelfia cultura musica",
        ],
        "recognized": [
            "Secretaria Nacional de Cultura Paraguay convocatorias musica",
            "El Granel Asuncion musica",
            "Dracena Asuncion musica",
            "Rock en Py Paraguay",
            "FestiRock Paraguay",
            "Jopara Musical Paraguay",
            "Centro Cultural Paraguayo Americano musica",
            "Alianza Francesa Asuncion musica",
        ],
        "public_spaces": [
            "Secretaria Nacional de Cultura Paraguay",
            "Municipalidad de Asuncion Cultura",
            "Centro Cultural Juan de Salazar",
            "Manzana de la Rivera",
            "Teatro Municipal Ignacio A Pane",
            "Asuncionico",
            "ReciclArte Paraguay",
            "Kilkenny Asuncion musica",
            "La Chispa Asuncion",
            "San Lorenzo Cultura",
            "Aregua Cultura",
            "Ciudad del Este Cultura",
            "Encarnacion Cultura",
            "Villarrica Paraguay Cultura",
        ],
    },
    "Bolivia": {
        "territorial": [
            "La Paz Culturas musica convocatorias",
            "Teatro Municipal Alberto Saavedra Perez musica",
            "Centro Cultural de Espana La Paz musica",
            "Teatro Nuna La Paz bandas",
            "Alive Music Bar La Paz bandas",
            "Casa Grito La Paz musica",
            "Centro Simon I Patino La Paz musica",
            "El Alto Cultura musica",
            "Santa Cruz Cultura musica",
            "Santa Cruz Casa de la Cultura musica",
            "Cochabamba Cultura musica",
            "mARTadero Cochabamba musica",
            "Sucre Cultura musica",
            "Tarija Cultura musica",
            "Oruro Cultura musica",
            "Potosi Cultura musica",
            "Beni Cultura musica",
            "Pando Cultura musica",
            "Sonidos de la Tierra Bolivia",
            "FestiJazz Bolivia convocatoria",
        ],
        "recognized": [
            "Ministerio de Culturas Bolivia convocatorias musica",
            "Fundacion Cultural del Banco Central de Bolivia musica",
            "Centro Simon I Patino musica",
            "mARTadero Cochabamba musica",
            "Teatro Nuna La Paz",
            "Alive Music Bar La Paz",
            "Casa Grito La Paz",
            "Sonidos de la Tierra Bolivia",
            "FestiJazz Bolivia",
        ],
        "public_spaces": [
            "Ministerio de Culturas Bolivia",
            "La Paz Culturas",
            "Teatro Municipal Alberto Saavedra Perez",
            "Centro Cultural de Espana La Paz",
            "Centro Simon I Patino",
            "Teatro Nuna La Paz",
            "Alive Music Bar La Paz",
            "Casa Grito La Paz",
            "Santa Cruz Cultura",
            "Cochabamba Cultura",
            "mARTadero Cochabamba",
            "Sucre Cultura",
            "Tarija Cultura",
            "Oruro Cultura",
            "Potosi Cultura",
            "El Alto Cultura musica",
        ],
    },
    "Peru": {
        "territorial": [
            "Ministerio de Cultura Peru Estimulos Economicos musica",
            "Lima Cultura musica Municipalidad de Lima",
            "Gran Teatro Nacional Peru musica",
            "Centro Cultural de Espana en Lima musica",
            "ICPNA Cultural musica",
            "Asociacion Cultural Peruano Britanica musica",
            "Barranco Cultura musica",
            "La Noche de Barranco bandas",
            "Sargento Pimienta Barranco bandas",
            "Yield Rock Lima bandas",
            "Festival Selvamomos convocatoria",
            "Vivo x el Rock bandas",
            "Cusco Cultura musica",
            "Arequipa Cultura musica",
            "La Libertad Trujillo Cultura musica",
            "Lambayeque Chiclayo Cultura musica",
            "Piura Cultura musica",
            "Loreto Iquitos Cultura musica",
            "Puno Cultura musica",
            "Tacna Cultura musica",
            "Junin Huancayo Cultura musica",
            "Ayacucho Cultura musica",
        ],
        "recognized": [
            "Ministerio de Cultura Peru Estimulos Economicos",
            "Alianza Francesa Lima musica",
            "Britanico Cultural musica",
            "ICPNA Cultural musica",
            "Centro Cultural PUCP musica",
            "Lugar de la Memoria LUM musica",
            "Jazz Zone Lima bandas",
            "Cocodrilo Verde Lima musica",
            "Selvamomos convocatoria bandas",
            "Festival Alternativo Musicultura Peru",
        ],
        "public_spaces": [
            "Ministerio de Cultura Peru",
            "Estimulos Economicos Cultura Peru musica",
            "Gran Teatro Nacional Peru",
            "Centro Cultural de Espana en Lima",
            "ICPNA Cultural musica",
            "Asociacion Cultural Peruano Britanica musica",
            "Municipalidad de Lima Cultura",
            "Barranco Cultura",
            "La Noche de Barranco",
            "Sargento Pimienta Barranco",
            "Yield Rock Lima",
            "Festival Selvamomos",
            "Cusco Cultura",
            "Arequipa Cultura",
            "Trujillo Cultura",
            "Chiclayo Cultura",
            "Piura Cultura",
            "Iquitos Cultura",
            "Puno Cultura",
            "Huancayo Cultura",
        ],
    },
    "Brasil": {
        "territorial": [
            "Sao Paulo Secretaria de Cultura edital musica",
            "Centro Cultural Sao Paulo programacao musica",
            "SESC Sao Paulo chamada musica",
            "SESC Pompeia programacao musica",
            "Casa Natura Musical chamadas artistas",
            "SIM Sao Paulo showcase",
            "Rio de Janeiro Cultura edital musica",
            "Circo Voador bandas Rio de Janeiro",
            "Fundicao Progresso programacao musica",
            "Audio Rebel Rio bandas",
            "Minas Gerais Cultura edital musica",
            "A Autentica Belo Horizonte bandas",
            "Bahia Cultura edital musica Salvador",
            "Pernambuco Recife Cultura musica",
            "Porto Musical Recife showcase",
            "No Ar Coquetel Molotov Recife",
            "Ceara Fortaleza Cultura musica",
            "Rio Grande do Sul Porto Alegre cultura musica",
            "Parana Curitiba cultura musica",
            "Santa Catarina Florianopolis cultura musica",
            "Distrito Federal Brasilia cultura musica",
            "Para Belem cultura musica",
            "Goias Goiania cultura musica",
            "MADA Natal festival bandas",
            "DoSol Natal festival bandas",
            "Festival Bananada Goiania",
        ],
        "recognized": [
            "SESC edital musica Brasil",
            "FUNARTE musica edital",
            "Ibermusicas Brasil convocatorias",
            "SIM Sao Paulo chamada artistas",
            "Festival Bananada Goiania",
            "DoSol Natal",
            "MADA Natal",
            "No Ar Coquetel Molotov",
            "Psicodalia Brasil",
            "Balaclava Records demo submission",
            "PWR Records Brasil",
            "HBB producoes Brasil",
        ],
        "public_spaces": [
            "FUNARTE musica edital",
            "SESC Sao Paulo",
            "SESC Pompeia",
            "Centro Cultural Sao Paulo",
            "Casa Natura Musical",
            "SIM Sao Paulo",
            "Rio de Janeiro Cultura",
            "Circo Voador",
            "Fundicao Progresso",
            "Audio Rebel Rio",
            "Belo Horizonte Cultura",
            "A Autentica Belo Horizonte",
            "Salvador Cultura",
            "Recife Cultura",
            "Porto Musical",
            "No Ar Coquetel Molotov",
            "Fortaleza Cultura",
            "Curitiba Cultura",
            "Porto Alegre Cultura",
            "Florianopolis Cultura",
            "Brasilia Cultura",
            "Belem Cultura",
            "Festival Bananada",
            "DoSol Natal",
            "MADA Natal",
        ],
    },
}

for country, bank in SOUTH_AMERICA_DEEP_EXPANSION.items():
    for target in bank["territorial"]:
        existing = GLOBAL_TERRITORIAL_AREA_SEEDS.setdefault(country, [])
        if target not in existing:
            existing.append(target)
    for target in bank["recognized"]:
        existing = LATAM_RECOGNIZED_TARGETS.setdefault(country, [])
        if target not in existing:
            existing.append(target)
    for target in bank["public_spaces"]:
        existing = COUNTRY_PUBLIC_SPACE_TARGETS.setdefault(country, [])
        if target not in existing:
            existing.append(target)

SOUTH_AMERICA_PRODUCER_BENCHMARKS = {
    "Argentina": [
        "PopArt Music Argentina", "300 Producciones Argentina", "DF Entertainment Argentina",
        "Crack Producciones Argentina", "Estamos Felices sello Argentina", "Geiser Discos Argentina",
        "Casa del Puente Discos Argentina", "Fuego Amigo Discos Argentina",
    ],
    "Uruguay": [
        "Bizarro Records Uruguay", "Little Butterfly Records Uruguay", "Montevideo Portal Musica",
        "No Te Va Gustar producciones Uruguay", "Magnolio Sala Montevideo", "Sala Lazaroff musica",
        "Espacio Guambia Montevideo", "Undermovie Uruguay musica",
    ],
    "Paraguay": [
        "Planeador Producciones Paraguay", "G5Pro Paraguay musica", "Rock en Py",
        "Die Mannschaft Paraguay musica", "Blue Caps Paraguay", "4Kcho Records Paraguay",
        "HEi Films Paraguay musica", "Japiaguar Paraguay musica",
    ],
    "Bolivia": [
        "Wayna Tambo musica Bolivia", "Equinoccio Records Bolivia", "Discolandia Bolivia",
        "RockandBol Bolivia", "Bolivia Festijazz produccion", "Salar Producciones Bolivia",
        "Cultura Viva Comunitaria Bolivia musica", "Mujeres Creando cultura musica",
    ],
    "Peru": [
        "Veltrac Music Peru", "A Tutiplen Records Peru", "Necio Records Peru", "Hensley Bar Lima",
        "Vichama Rock Bar Lima", "Culturaymi Peru", "Buh Records Peru", "Repsychled Records Peru",
    ],
    "Brasil": [
        "Deckdisc Brasil", "Natura Musical edital", "Tratore Brasil", "Monstro Discos Brasil",
        "Slap Som Livre Brasil", "YB Music Brasil", "Sesc Brasil programacao musical",
        "Centro Cultural Banco do Brasil musica", "Itau Cultural musica", "Oi Futuro musica",
    ],
}

for country, targets in SOUTH_AMERICA_PRODUCER_BENCHMARKS.items():
    existing = LATAM_RECOGNIZED_TARGETS.setdefault(country, [])
    for target in targets:
        if target not in existing:
            existing.append(target)

GLOBAL_RADAR_DEEP_EXPANSION = {
    "Brasil": {
        "territorial": [
            "Rio de Janeiro Audio Rebel bandas independentes",
            "Sao Paulo Centro Cultural Sao Paulo chamada artistas",
            "Sao Paulo Sesc Pompeia programacao musical",
            "Sao Paulo Casa Natura Musical edital artistas",
            "Bahia Salvador Secult edital musica",
            "Minas Gerais Circuito Liberdade musica",
            "Rio Grande do Sul Opiniao Porto Alegre bandas",
            "Parana Oficina de Musica de Curitiba",
            "Amazonas Manaus cultura musica",
            "Para Festival Se Rasgum Belem",
        ],
        "public_spaces": [
            "Natura Musical edital", "Festival Se Rasgum", "Festival DoSol", "Festival Bananada",
            "MADA Natal", "No Ar Coquetel Molotov", "Psicodalia Brasil", "Sesc Brasil musica",
            "Centro Cultural Banco do Brasil musica", "Itau Cultural musica", "Oi Futuro musica",
            "Audio Rebel Rio", "Opiniao Porto Alegre", "Oficina de Musica de Curitiba",
        ],
        "recognized": [
            "Festival Se Rasgum Belem", "Festival Sarara Belo Horizonte", "Coala Festival Brasil",
            "Popload Festival artistas", "Balaclava Records Brasil", "PWR Records Brasil",
            "HBB producoes Brasil", "Queremos Brasil shows", "Natura Musical edital",
        ],
    },
    "Colombia": {
        "territorial": [
            "Bogota Idartes convocatorias musica",
            "Bogota Rock al Parque convocatoria bandas",
            "BOmm Bogota Music Market showcase",
            "Medellin Altavoz Fest convocatoria bandas",
            "Medellin Teatro Pablo Tobon Uribe musica",
            "Cali Festival Ajazzgo musica",
            "Cali Secretaria de Cultura musica",
            "Barranquilla Secretaria de Cultura musica",
            "Cartagena Instituto de Patrimonio y Cultura musica",
            "Bucaramanga Instituto Municipal de Cultura musica",
            "Manizales Cultura musica",
            "Pereira Cultura musica Eje Cafetero",
            "Pasto Nariño Cultura musica",
            "Ibague Capital Musical cultura",
        ],
        "public_spaces": [
            "Idartes convocatorias musica", "Rock al Parque convocatoria bandas",
            "BOmm Bogota Music Market", "Circulart Medellin", "Altavoz Fest",
            "Teatro Pablo Tobon Uribe", "Casa del Teatro Nacional Bogota",
            "Festival Centro Bogota", "Radionica Colombia", "Shock Musica",
            "Llorona Records", "Suenan Las Guitarras Colombia", "Festival Estereo Picnic",
            "Locus Festival Colombia", "Teatro Mayor Julio Mario Santo Domingo",
        ],
        "recognized": [
            "Idartes musica convocatorias", "Radionica Colombia bandas", "Shock Musica convocatorias",
            "Llorona Records Colombia", "Suenan Las Guitarras Colombia", "Biche Producciones Colombia",
            "Paramo Presenta Colombia", "Paramo Presenta bandas", "Festival Centro Bogota",
        ],
    },
    "Canada": {
        "territorial": [
            "Toronto Arts Council music grants", "Ontario Creates music fund", "Ontario Arts Council music",
            "Montreal M for Montreal artist application", "Quebec music council grants",
            "Vancouver Music BC showcase", "British Columbia Arts Council music",
            "Calgary arts music grants", "Edmonton Arts Council music", "Ottawa music strategy",
            "Halifax Pop Explosion artist application", "Winnipeg arts council music",
        ],
        "public_spaces": [
            "Canada Council for the Arts music", "FACTOR Canada music", "Ontario Creates music fund",
            "Toronto Arts Council music", "Harbourfront Centre music", "M for Montreal",
            "Music BC", "Calgary Arts Development music", "Edmonton Arts Council music",
            "Pop Montreal artist application", "Canadian Music Week", "North by Northeast artist application",
        ],
        "priority": [
            "FACTOR Canada music", "Pop Montreal artist application", "North by Northeast artist application",
            "Halifax Pop Explosion artist application", "Calgary Arts Development music",
        ],
    },
    "Francia": {
        "territorial": [
            "Centre National de la Musique aides internationales", "Institut francais musique residencies",
            "Paris La Gaite Lyrique appel artistes", "FGO Barbara Paris musique",
            "Marseille Babel Music XP showcase", "Trans Musicales Rennes candidature",
            "Nantes Stereolux appel artistes", "Lyon Ninkasi musique groupes",
        ],
        "public_spaces": [
            "Centre National de la Musique", "Institut Francais musique", "La Gaite Lyrique",
            "FGO Barbara", "Babel Music XP", "Trans Musicales Rennes", "MaMA Music Convention",
            "Stereolux Nantes", "Ninkasi Lyon",
        ],
        "priority": ["Babel Music XP showcase", "Trans Musicales Rennes candidature", "FGO Barbara Paris musique"],
    },
    "Alemania": {
        "territorial": [
            "Berlin Musicboard funding artists", "Berlin Pop-Kultur Nachwuchs",
            "Hamburg Reeperbahn Festival artist application", "Hamburg RockCity artists",
            "Cologne c/o pop artist application", "Munich Kulturreferat Musik",
            "Leipzig Pop Fest bands", "Goethe Institut music residency",
        ],
        "public_spaces": [
            "Musicboard Berlin", "Reeperbahn Festival", "Pop-Kultur Berlin", "c/o pop Cologne",
            "Goethe Institut Musik", "Initiative Musik Germany", "RockCity Hamburg",
            "Kulturreferat Munchen Musik",
        ],
        "priority": ["Initiative Musik Germany", "Pop-Kultur Nachwuchs", "RockCity Hamburg"],
    },
    "Inglaterra": {
        "territorial": [
            "London Roundhouse emerging artists", "Southbank Centre music open call",
            "Manchester Band on the Wall artists", "Brighton The Great Escape artist application",
            "Bristol Exchange music bands", "Liverpool Sound City artist application",
            "Cheltenham 2000trees band application", "Arts Council England music project grants",
        ],
        "public_spaces": [
            "Roundhouse London", "Southbank Centre music", "Band on the Wall Manchester",
            "The Great Escape Festival", "Liverpool Sound City", "2000trees band application",
            "Arts Council England music", "PRS Foundation international music",
        ],
        "priority": ["PRS Foundation international music", "Liverpool Sound City artist application", "Band on the Wall Manchester"],
    },
    "Espana": {
        "territorial": [
            "Madrid Matadero musica convocatoria", "Barcelona Mercat de Musica Viva de Vic",
            "Bilbao BIME live showcase", "Valencia La Rambleta musica", "Sevilla Monkey Week showcase",
            "Zaragoza musica cultura", "Primavera Pro artist application", "INJUVE musica convocatoria",
        ],
        "public_spaces": [
            "Primavera Pro", "BIME Bilbao", "Monkey Week showcase", "Mercat de Musica Viva de Vic",
            "INJUVE Musica", "Matadero Madrid musica", "La Rambleta musica",
        ],
        "priority": ["Monkey Week showcase", "Mercat de Musica Viva de Vic", "La Rambleta musica"],
    },
    "Marruecos": {
        "territorial": [
            "Rabat Visa For Music artist application", "Casablanca L'Uzine musique",
            "Marrakech Oasis festival artists", "Essaouira Gnaoua festival artistes",
            "Fes culture music festival", "Agadir Timitar festival artists",
        ],
        "public_spaces": [
            "Visa For Music", "Hiba Foundation", "L'Uzine Casablanca", "Gnaoua Festival Essaouira",
            "Festival Timitar Agadir", "Jazzablanca artists", "Fes Festival music",
        ],
        "priority": ["L'Uzine Casablanca", "Jazzablanca artists", "Festival Timitar Agadir"],
    },
    "Sudafrica": {
        "territorial": [
            "Cape Town music office artists", "Johannesburg Bassline live artists",
            "Johannesburg Music In Africa opportunities", "Durban music festival artists",
            "Gauteng arts culture music grants", "Western Cape cultural affairs music",
            "Oppikoppi festival artists", "Moshito Music Conference showcase",
        ],
        "public_spaces": [
            "Music In Africa opportunities", "Moshito Music Conference", "Bassline Johannesburg",
            "Cape Town Music Academy", "Oppikoppi festival artists", "National Arts Council South Africa music",
            "Concerts SA mobility fund",
        ],
        "priority": ["Concerts SA mobility fund", "National Arts Council South Africa music", "Moshito Music Conference"],
    },
    "Nigeria": {
        "territorial": ["Lagos music week artists", "Lagos culture music venues", "Abuja cultural centre music", "Felabration Lagos artists"],
        "public_spaces": ["Felabration Lagos", "Lagos Music Week", "Alliance Francaise Lagos music", "British Council Nigeria music"],
        "priority": ["Felabration Lagos", "Alliance Francaise Lagos music"],
    },
    "Ghana": {
        "territorial": ["Accra music culture artists", "Accra Indie Filmfest music", "Chale Wote music Accra", "Alliance Francaise Accra music"],
        "public_spaces": ["Chale Wote Accra", "Alliance Francaise Accra music", "Ghana Music Week", "Accra Cultural Arts music"],
        "priority": ["Chale Wote Accra", "Ghana Music Week"],
    },
    "Kenia": {
        "territorial": ["Nairobi music culture artists", "Nairobi Festival music", "Blankets and Wine Kenya artists", "GoDown Arts Centre music"],
        "public_spaces": ["Blankets and Wine Kenya", "GoDown Arts Centre", "Alliance Francaise Nairobi music", "Nairobi Festival music"],
        "priority": ["Blankets and Wine Kenya", "GoDown Arts Centre"],
    },
    "Senegal": {
        "territorial": ["Dakar music festival artists", "Dakar Biennale music", "Institut Francais Dakar musique", "Saint-Louis Jazz artists"],
        "public_spaces": ["Saint-Louis Jazz Senegal", "Institut Francais Dakar musique", "Dakar Music Expo", "Afropop Dakar music"],
        "priority": ["Saint-Louis Jazz Senegal", "Dakar Music Expo"],
    },
    "Egipto": {
        "territorial": ["Cairo Jazz Club bands", "Cairo culture music", "Bibliotheca Alexandrina music", "El Sawy Culturewheel music"],
        "public_spaces": ["Cairo Jazz Club", "El Sawy Culturewheel", "Bibliotheca Alexandrina music", "Downtown Contemporary Arts Festival Cairo"],
        "priority": ["El Sawy Culturewheel", "Downtown Contemporary Arts Festival Cairo"],
    },
    "Japon": {
        "territorial": [
            "Tokyo music market showcase", "Tokyo Music Lane artist application", "Fuji Rock Rookie A Go Go",
            "Osaka music festival artists", "Kyoto cultural foundation music", "Fukuoka music month artists",
        ],
        "public_spaces": [
            "Music Lane Okinawa", "Tokyo Music Market", "Fuji Rock Rookie A Go Go",
            "Japan Foundation music", "Kansai Music Conference", "Fukuoka Music Month",
        ],
        "priority": ["Kansai Music Conference", "Fukuoka Music Month", "Tokyo Music Lane artist application"],
    },
    "Corea del Sur": {
        "territorial": ["Seoul music week showcase", "Zandari Festa artist application", "MUCON Korea", "Busan Rock Festival artists"],
        "public_spaces": ["Zandari Festa", "MUCON Korea", "Seoul Music Week", "Busan Rock Festival", "KOCCA music"],
        "priority": ["KOCCA music", "Busan Rock Festival"],
    },
    "China": {
        "territorial": ["Shanghai international arts festival music", "Beijing music festival artists", "Shenzhen culture music", "Chengdu music festival artists"],
        "public_spaces": ["China Shanghai International Arts Festival", "Music China Shanghai", "Beijing Music Festival", "Modern Sky Festival China"],
        "priority": ["Modern Sky Festival China", "Beijing Music Festival"],
    },
    "India": {
        "territorial": ["Mumbai music festival artists", "Delhi music week artists", "Bangalore independent music venues", "NH7 Weekender artist application"],
        "public_spaces": ["NH7 Weekender artist application", "Serendipity Arts Festival music", "Bacardi NH7 Weekender", "Magnetic Fields Festival artists"],
        "priority": ["Serendipity Arts Festival music", "Magnetic Fields Festival artists"],
    },
    "Indonesia": {
        "territorial": ["Jakarta music festival artists", "Bali music festival artists", "Java Jazz artist application", "Synchronize Fest artists"],
        "public_spaces": ["Java Jazz Festival", "Synchronize Fest", "We The Fest Indonesia", "BaliSpirit Festival music"],
        "priority": ["Java Jazz Festival", "Synchronize Fest"],
    },
    "Tailandia": {
        "territorial": ["Bangkok music festival artists", "Bangkok culture centre music", "Wonderfruit artist application", "Maho Rasop Festival artists"],
        "public_spaces": ["Wonderfruit Festival artists", "Maho Rasop Festival", "Bangkok Art and Culture Centre music", "Very Festival Thailand"],
        "priority": ["Wonderfruit Festival artists", "Maho Rasop Festival"],
    },
}

for country, bank in GLOBAL_RADAR_DEEP_EXPANSION.items():
    for target in bank.get("territorial", []):
        existing = GLOBAL_TERRITORIAL_AREA_SEEDS.setdefault(country, [])
        if target not in existing:
            existing.append(target)
    for target in bank.get("public_spaces", []):
        existing = COUNTRY_PUBLIC_SPACE_TARGETS.setdefault(country, [])
        if target not in existing:
            existing.append(target)
    if country in LATAM_RECOGNIZED_TARGETS:
        existing = LATAM_RECOGNIZED_TARGETS.setdefault(country, [])
        for target in bank.get("recognized", []):
            if target not in existing:
                existing.append(target)
    else:
        existing = GLOBAL_PRIORITY_TARGETS.setdefault(country, [])
        for target in bank.get("priority", []):
            if target not in existing:
                existing.append(target)

ARGENTINA_CANADA_US_DEEP_REVIEW = {
    "Argentina": {
        "territorial": [
            "Lollapalooza Argentina bandas emergentes",
            "Quilmes Rock Argentina bandas",
            "Festival Buena Vibra Argentina artistas",
            "Harlem Festival Santa Fe bandas",
            "Music Wins Festival Argentina artistas",
            "Ciudad Emergente Buenos Aires convocatoria bandas",
            "El Emergente Almagro bandas",
            "CC Richards Buenos Aires bandas",
            "Strummer Bar Buenos Aires bandas",
            "The Roxy Live Buenos Aires bandas",
            "Uniclub Buenos Aires bandas",
            "Humboldt Niceto Club Buenos Aires bandas",
            "Teatro Flores Buenos Aires bandas rock",
            "Centro Cultural Nueva Uriarte musica",
            "Casa del Bicentenario musica Argentina",
            "Instituto Nacional del Teatro Argentina musica escena",
            "Ibermusicas Argentina convocatorias",
            "Fondo Nacional de las Artes musica Argentina",
            "Fondo Metropolitano Cultura Buenos Aires musica",
            "Provincia de Cordoba cultura musica festivales",
            "Rosario Distrito Siete bandas",
            "Mendoza Nave Cultural musica",
            "Jujuy Cultura musica",
            "Misiones Posadas cultura musica",
        ],
        "recognized": [
            "Lollapalooza Argentina bandas emergentes", "Quilmes Rock Argentina bandas",
            "Festival Buena Vibra Argentina", "Harlem Festival Santa Fe", "Music Wins Festival Argentina",
            "Ciudad Emergente Buenos Aires convocatoria bandas", "El Emergente Almagro bandas",
            "CC Richards Buenos Aires", "Strummer Bar Buenos Aires", "The Roxy Live Buenos Aires",
            "Fondo Nacional de las Artes musica Argentina", "Ibermusicas Argentina convocatorias",
        ],
        "public_spaces": [
            "Fondo Nacional de las Artes musica Argentina", "Ibermusicas Argentina convocatorias",
            "Fondo Metropolitano Cultura Buenos Aires musica", "Ciudad Emergente Buenos Aires",
            "Casa del Bicentenario musica Argentina", "Centro Cultural Nueva Uriarte",
            "El Emergente Almagro", "CC Richards Buenos Aires", "Strummer Bar Buenos Aires",
            "The Roxy Live Buenos Aires", "Uniclub Buenos Aires", "Teatro Flores Buenos Aires",
            "Distrito Siete Rosario", "Nave Cultural Mendoza", "Harlem Festival Santa Fe",
        ],
    },
    "Canada": {
        "territorial": [
            "Toronto North by Northeast artist application",
            "Toronto Canadian Music Week artist submission",
            "Toronto City Cultural Hotspot music",
            "Ontario Music Investment Fund",
            "Montreal Pop Montreal artist application",
            "Montreal Conseil des arts music",
            "Quebec SODEC musique aide",
            "Musicaction Canada francophone music funding",
            "Vancouver BreakOut West showcase",
            "Vancouver Civic Theatres music",
            "British Columbia Creative BC music fund",
            "Calgary Sled Island artist application",
            "Calgary Folk Music Festival artist submission",
            "Edmonton Folk Music Festival artist submission",
            "Winnipeg Folk Festival artist submission",
            "Manitoba Music showcase",
            "SaskMusic showcase",
            "Halifax Pop Explosion artist submission",
            "Music Nova Scotia showcase",
            "East Coast Music Association showcase",
            "Ottawa Bluesfest artist submission",
            "National Arts Centre Ottawa music",
            "Yukon Arts Centre music",
            "Music Yukon funding",
        ],
        "public_spaces": [
            "Canadian Music Week artist submission", "North by Northeast artist application",
            "Pop Montreal artist application", "BreakOut West showcase", "Sled Island artist application",
            "Calgary Folk Music Festival artist submission", "Winnipeg Folk Festival artist submission",
            "East Coast Music Association showcase", "Music Nova Scotia showcase", "Manitoba Music showcase",
            "SaskMusic showcase", "Musicaction Canada", "SODEC musique", "Creative BC music fund",
            "Ontario Music Investment Fund", "National Arts Centre Ottawa music", "Music Yukon funding",
        ],
        "priority": [
            "Canadian Music Week artist submission", "BreakOut West showcase",
            "Sled Island artist application", "East Coast Music Association showcase",
            "Musicaction Canada", "Ontario Music Investment Fund",
        ],
    },
    "Estados Unidos": {
        "territorial": [
            "New Music USA project grants",
            "Mid Atlantic Arts USArtists International music",
            "South Arts jazz road tours",
            "Western States Arts Federation WESTAF music",
            "California Arts Council music grants",
            "Los Angeles Department of Cultural Affairs music",
            "San Francisco Grants for the Arts music",
            "Seattle Office of Arts music",
            "The Crocodile Seattle bands",
            "Portland Regional Arts and Culture Council music",
            "Doug Fir Lounge Portland bands",
            "Austin Music Commission grants",
            "Texas Music Office opportunities",
            "SXSW Music Festival artist application",
            "Levitation Austin bands",
            "Hotel Vegas Austin bands",
            "New York Foundation for the Arts music",
            "Mondo NYC artist application",
            "New Colossus Festival artist application",
            "Brooklyn Academy of Music music",
            "Baby's All Right Brooklyn bands",
            "Chicago Department of Cultural Affairs music",
            "Empty Bottle Chicago bands",
            "Metro Chicago bands",
            "First Avenue Minneapolis bands",
            "Walker Art Center music",
            "Nashville Metro Arts music",
            "AmericanaFest artist application",
            "Big Ears Festival Knoxville artists",
            "Hopscotch Music Festival Raleigh artists",
            "Treefort Music Fest artist submission",
            "Folk Alliance International showcase application",
            "NPR Tiny Desk Contest",
            "Kennedy Center Millennium Stage artists",
            "National Endowment for the Arts music grants",
            "Creative Capital music performing arts",
        ],
        "public_spaces": [
            "New Music USA project grants", "Mid Atlantic Arts USArtists International music",
            "South Arts jazz road tours", "WESTAF music", "National Endowment for the Arts music grants",
            "California Arts Council music grants", "Los Angeles Department of Cultural Affairs music",
            "New York Foundation for the Arts music", "Mondo NYC artist application",
            "New Colossus Festival artist application", "SXSW Music Festival artist application",
            "Levitation Austin bands", "Treefort Music Fest artist submission",
            "Folk Alliance International showcase application", "AmericanaFest artist application",
            "Big Ears Festival Knoxville artists", "Hopscotch Music Festival Raleigh artists",
            "NPR Tiny Desk Contest", "Kennedy Center Millennium Stage artists",
        ],
        "priority": [
            "New Music USA project grants", "USArtists International music",
            "South Arts jazz road tours", "Mondo NYC artist application",
            "New Colossus Festival artist application", "Treefort Music Fest artist submission",
            "Folk Alliance International showcase application", "NPR Tiny Desk Contest",
        ],
    },
}

for country, bank in ARGENTINA_CANADA_US_DEEP_REVIEW.items():
    for target in bank.get("territorial", []):
        existing = GLOBAL_TERRITORIAL_AREA_SEEDS.setdefault(country, [])
        if target not in existing:
            existing.append(target)
    for target in bank.get("public_spaces", []):
        existing = COUNTRY_PUBLIC_SPACE_TARGETS.setdefault(country, [])
        if target not in existing:
            existing.append(target)
    if country in LATAM_RECOGNIZED_TARGETS:
        existing = LATAM_RECOGNIZED_TARGETS.setdefault(country, [])
        for target in bank.get("recognized", []):
            if target not in existing:
                existing.append(target)
    else:
        existing = GLOBAL_PRIORITY_TARGETS.setdefault(country, [])
        for target in bank.get("priority", []):
            if target not in existing:
                existing.append(target)

GREENLAND_DEEP_REVIEW_TARGETS = [
    "Katuaq Cultural Centre Nuuk music",
    "NAPA Nordic Institute in Greenland music grants",
    "Arctic Sounds Festival Sisimiut artist application",
    "Nuuk Nordic Culture Festival music",
    "Taseralik Culture House Sisimiut music",
    "Kommuneqarfik Sermersooq culture music",
    "Qeqqata Kommunia culture music",
    "Avannaata Kommunia culture music",
    "Kujalleq Kommune culture music",
    "Nunatta Isiginnaartitsisarfia Greenland National Theatre music",
]

EUROPE_DEEP_REVIEW_TARGETS = {
    "Albania": ["Tirana International Guitar Festival artist application", "Reja Tirana cultural center music", "Balkan Trafik Albania music"],
    "Alemania": ["Reeperbahn Festival artist application", "Musicboard Berlin funding", "Initiative Musik Germany export", "c/o pop Cologne showcase"],
    "Andorra": ["Andorra la Vella cultura musica", "Escena Nacional Andorra musica", "Andorra Sax Fest artist application"],
    "Armenia": ["Yerevan Music Week showcase", "TUMO Center Yerevan music", "Golden Apricot Yerevan music events"],
    "Austria": ["Waves Vienna artist application", "Austrian Music Export showcase", "Music Austria mica funding", "Donauinselfest band application"],
    "Belgica": ["Botanique Brussels music", "Ancienne Belgique artist application", "Flanders Arts Institute music", "Wallonie Bruxelles Musiques"],
    "Bielorrusia": ["Minsk cultural center music", "Belarus music festival open call", "Eastern Partnership culture Belarus music"],
    "Bosnia y Herzegovina": ["OK Fest Bosnia artist application", "Sarajevo Jazz Festival music", "Mostar cultural center music"],
    "Bulgaria": ["Sofia Live Festival artist application", "A to JazZ Festival Sofia", "National Culture Fund Bulgaria music"],
    "Chipre": ["Rialto Theatre Cyprus music", "Fengaros Festival Cyprus artist application", "Cyprus Deputy Ministry of Culture music"],
    "Croacia": ["INmusic Festival Croatia artist application", "Zagreb Music Export", "Culture Hub Croatia music"],
    "Dinamarca": ["SPOT Festival Denmark artist application", "Roskilde Festival band application", "Danish Arts Foundation music", "Music Export Denmark"],
    "Eslovaquia": ["Pohoda Festival artist application", "Sharpe Festival Bratislava showcase", "Slovak Arts Council music"],
    "Eslovenia": ["MENT Ljubljana artist application", "Kino Siska Ljubljana music", "Slovenian Music Information Centre"],
    "Espana": ["Mad Cool Festival bandas emergentes", "Primavera Pro showcase", "Monkey Week artist application", "INAEM ayudas musica"],
    "Estonia": ["Tallinn Music Week artist application", "Music Estonia showcase", "Estonian Culture Endowment music"],
    "Finlandia": ["Music Finland export", "Flow Festival Helsinki artist application", "Tuska Festival bands", "Taike Finland music grants"],
    "Francia": ["Babel Music XP showcase", "Trans Musicales Rennes candidature", "Centre National de la Musique aides", "Printemps de Bourges iNOUiS"],
    "Georgia": ["Tbilisi Open Air band application", "Tbilisi Music Week showcase", "Creative Georgia music"],
    "Gales": ["Focus Wales artist application", "Arts Council of Wales music", "Wales Millennium Centre music"],
    "Grecia": ["Athens Music Week showcase", "Release Athens artist application", "Onassis Stegi music open call"],
    "Holanda": ["Eurosonic Noorderslag artist application", "Dutch Music Export", "Melkweg Amsterdam bands", "Paradiso Amsterdam open call"],
    "Hungria": ["Sziget Festival artist application", "Budapest Music Center", "Hangveto Hungary music"],
    "Inglaterra": ["The Great Escape artist application", "PRS Foundation open fund music", "SXSW London artist application", "Roundhouse London music"],
    "Irlanda": ["First Music Contact Ireland", "Culture Ireland music funding", "Ireland Music Week artist application", "Whelans Dublin bands"],
    "Islandia": ["Iceland Airwaves artist application", "Iceland Music Export", "Reykjavik Arts Festival music"],
    "Italia": ["Linecheck Milan Music Meeting", "MI AMI Festival artist application", "Italia Music Export", "MEI Faenza artist application"],
    "Kosovo": ["Prishtina Music Conference", "Sunny Hill Festival artist application", "Termokiss Prishtina music"],
    "Letonia": ["Music Latvia export", "Positivus Festival artist application", "Riga cultural center music"],
    "Liechtenstein": ["Vaduz culture music", "FL1 Life Festival artist application", "Kulturstiftung Liechtenstein music"],
    "Lituania": ["Vilnius Music Week showcase", "Loftas Vilnius music", "Lithuanian Culture Council music"],
    "Luxemburgo": ["Kultur lx music export", "Rockhal Luxembourg open call", "Sonic Visions Luxembourg"],
    "Macedonia del Norte": ["Skopje Jazz Festival music", "PIN Music Conference Skopje", "MKC Skopje music"],
    "Malta": ["Malta Arts Council music", "Earth Garden Malta artist application", "Valletta Cultural Agency music"],
    "Moldavia": ["Moldova National Youth Orchestra music", "Chisinau cultural center music", "Moldova music festival open call"],
    "Monaco": ["Monte Carlo Jazz Festival artist application", "Monaco cultural affairs music", "Grimaldi Forum music"],
    "Montenegro": ["Lake Fest Niksic artist application", "Sea Dance Festival Montenegro", "Podgorica cultural center music"],
    "Noruega": ["by:Larm Oslo artist application", "Music Norway export", "Norwegian Arts Council music"],
    "Paises Bajos": ["Eurosonic Noorderslag artist application", "Buma Cultuur music export", "Le Guess Who artist application", "Roadburn Festival bands"],
    "Polonia": ["OFF Festival Katowice artist application", "Great September Lodz showcase", "Music Export Poland", "Adam Mickiewicz Institute music"],
    "Portugal": ["Westway LAB Portugal showcase", "MIL Lisbon artist application", "GDA Foundation music", "Serralves em Festa music"],
    "Reino Unido": ["PRS Foundation international music", "British Council music", "Liverpool Sound City artist application", "Wide Days Edinburgh showcase"],
    "Republica Checa": ["Nouvelle Prague showcase", "Czech Music Crossroads", "SoundCzech music export", "Colours of Ostrava artist application"],
    "Rumania": ["Mastering the Music Business Bucharest", "Control Club Bucharest bands", "Electric Castle artist application"],
    "Rusia": ["Moscow Music Week showcase", "Ural Music Night artist application", "St Petersburg cultural center music"],
    "San Marino": ["San Marino cultural institutes music", "San Marino music festival", "Titano Theatre music"],
    "Serbia": ["Exit Festival artist application", "Kontakt Conference Belgrade", "Belgrade Youth Center music"],
    "Suecia": ["Future Echoes artist application", "Export Music Sweden showcase", "Way Out West artist application", "Kulturraadet music grants Sweden"],
    "Suiza": ["m4music Festival artist application", "Pro Helvetia music", "Swiss Music Export", "Palp Festival artists"],
    "Turquia": ["Istanbul Jazz Festival artist application", "Zorlu PSM music open call", "Istanbul Music Week showcase"],
    "Ucrania": ["Atlas Weekend artist application", "Music Export Ukraine", "Ukrainian Institute music", "Respublica Fest bands"],
    "Vaticano": ["Vatican concerts music culture", "Auditorium Conciliazione Rome music", "Cortile dei Gentili music dialogue"],
}

ASIA_DEEP_REVIEW_TARGETS = {
    "Afganistan": ["Afghanistan National Institute of Music", "Kabul cultural center music", "Aga Khan Music Programme Afghanistan"],
    "Arabia Saudita": ["MDLBEAST XP Music Futures", "Saudi Music Commission opportunities", "Jeddah Season music artists"],
    "Azerbaiyan": ["Baku Jazz Festival artist application", "Baku International Music Festival", "Azerbaijan cultural center music"],
    "Bangladesh": ["Dhaka Lit Fest music", "Bengal Foundation music Bangladesh", "Chirkutt Dhaka music scene"],
    "Barein": ["Bahrain Authority for Culture music", "Spring of Culture Bahrain music", "Bahrain Jazz Fest artists"],
    "Brunei": ["Brunei Arts and Culture Festival music", "Bandar Seri Begawan music events", "Brunei youth music showcase"],
    "Butan": ["Royal Textile Academy Bhutan cultural music", "Thimphu Tshechu music culture", "Bhutan Echoes music"],
    "Camboya": ["Cambodia Living Arts music", "Phnom Penh cultural center music", "Bonn Phum Festival music"],
    "China": ["China Shanghai International Arts Festival", "Modern Sky Festival China artists", "MTA Festival China bands", "Beijing Music Festival"],
    "Corea del Sur": ["Seoul Music Week artist application", "Zandari Festa artist application", "Busan Rock Festival bands", "KOCCA music export"],
    "Emiratos Arabes Unidos": ["Dubai Culture music open call", "Alserkal Avenue music", "Abu Dhabi Festival music artists", "Sharjah Art Foundation music"],
    "Filipinas": ["Fete de la Musique Philippines bands", "Wanderland Music Festival artists", "B-Side Manila bands", "Cultural Center of the Philippines music"],
    "India": ["NH7 Weekender artist application", "Serendipity Arts Festival music", "Indiearth XChange showcase", "Ziro Festival artist application"],
    "Indonesia": ["Java Jazz Festival artists", "Synchronize Fest artist application", "Maho Rasop Indonesia", "Jakarta Arts Council music"],
    "Irak": ["Baghdad cultural center music", "Iraq music festival open call", "Beit Tarkib Baghdad music"],
    "Iran": ["Tehran music festival artists", "Fajr Music Festival Iran", "Iran cultural center music"],
    "Israel": ["Tune In Tel Aviv showcase", "Jerusalem Season of Culture music", "Tel Aviv municipality music"],
    "Japon": ["Tokyo Music Market artist application", "Fuji Rock Rookie A Go-Go", "Summer Sonic artist application", "Kansai Music Conference"],
    "Jordania": ["Amman Jazz Festival artists", "Al Balad Music Festival Jordan", "King Hussein Cultural Center music"],
    "Kazajistan": ["Almaty music festival artists", "Astana cultural center music", "Qazaqstan music showcase"],
    "Kirguistan": ["Bishkek Jazz Spring music", "Kyrgyzstan cultural center music", "Central Asia music showcase"],
    "Kuwait": ["Sheikh Jaber Al Ahmad Cultural Centre music", "Kuwait music festival artists", "Dar al Athar al Islamiyyah music"],
    "Laos": ["Vientiane music festival artists", "Lao cultural center music", "Luang Prabang cultural festival music"],
    "Libano": ["Beirut and Beyond artist application", "Metro Al Madina Beirut music", "Beirut Music and Art Festival"],
    "Malasia": ["Good Vibes Festival Malaysia artists", "Urbanscapes Kuala Lumpur music", "Malaysia Music Week showcase"],
    "Maldivas": ["Maldives music festival artists", "Male cultural center music", "Maldives arts council music"],
    "Mongolia": ["Playtime Festival Mongolia artist application", "Ulaanbaatar cultural center music", "Mongolian music showcase"],
    "Myanmar": ["Yangon music festival artists", "Myanmar cultural center music", "Gitameit Music Center Myanmar"],
    "Nepal": ["Jazzmandu Nepal artist application", "Kathmandu Triennale music", "Nepal Music Festival bands"],
    "Oman": ["Royal Opera House Muscat music", "Muscat Festival music", "Oman cultural center music"],
    "Pakistan": ["Lahore Music Meet artist application", "Coke Studio Pakistan artists", "Karachi Arts Council music"],
    "Palestina": ["Palestine Music Expo artist application", "Sakakini Cultural Center music", "Yabous Cultural Centre music"],
    "Qatar": ["Qatar Creates music", "Katara Cultural Village music", "Doha music festival artists"],
    "Singapur": ["Music Matters Singapore showcase", "Esplanade Singapore music open call", "Baybeats Festival artist application"],
    "Siria": ["Syrian cultural center music", "Damascus music festival", "Action for Hope music Syria"],
    "Sri Lanka": ["Colombo Music Week showcase", "Galle Music Festival artists", "Sri Lanka cultural center music"],
    "Tailandia": ["Maho Rasop Festival artist application", "Wonderfruit Festival artists", "Bangkok Music City showcase", "Big Mountain Music Festival bands"],
    "Taiwan": ["LUCfest Tainan artist application", "Taiwan Beats showcase", "Taipei Music Center open call", "Megaport Festival bands"],
    "Tayikistan": ["Dushanbe cultural center music", "Tajikistan music festival artists", "Aga Khan Music Programme Tajikistan"],
    "Timor Oriental": ["Dili cultural center music", "Timor Leste music festival artists", "Arte Moris Dili music"],
    "Turkmenistan": ["Ashgabat cultural center music", "Turkmenistan music festival", "Central Asia culture music Turkmenistan"],
    "Uzbekistan": ["Sharq Taronalari Samarkand music festival", "Tashkent cultural center music", "Uzbekistan art and culture foundation music"],
    "Vietnam": ["Monsoon Music Festival Vietnam", "Hozo Music Festival Ho Chi Minh", "Hanoi Rock City bands", "Vietnam Music Week showcase"],
    "Yemen": ["Yemen cultural music diaspora", "Sanaa cultural center music", "Aga Khan Music Programme Yemen"],
}

for target in GREENLAND_DEEP_REVIEW_TARGETS:
    for collection in (
        GLOBAL_TERRITORIAL_AREA_SEEDS.setdefault("Groenlandia", []),
        COUNTRY_PUBLIC_SPACE_TARGETS.setdefault("Groenlandia", []),
        GLOBAL_PRIORITY_TARGETS.setdefault("Groenlandia", []),
    ):
        if target not in collection:
            collection.append(target)

for country, targets in EUROPE_DEEP_REVIEW_TARGETS.items():
    for target in targets:
        for collection in (
            GLOBAL_TERRITORIAL_AREA_SEEDS.setdefault(country, []),
            COUNTRY_PUBLIC_SPACE_TARGETS.setdefault(country, []),
            GLOBAL_PRIORITY_TARGETS.setdefault(country, []),
        ):
            if target not in collection:
                collection.append(target)

for country, targets in ASIA_DEEP_REVIEW_TARGETS.items():
    for target in targets:
        for collection in (
            GLOBAL_TERRITORIAL_AREA_SEEDS.setdefault(country, []),
            COUNTRY_PUBLIC_SPACE_TARGETS.setdefault(country, []),
            GLOBAL_PRIORITY_TARGETS.setdefault(country, []),
        ):
            if target not in collection:
                collection.append(target)

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
