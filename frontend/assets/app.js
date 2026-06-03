const API_BASE_URL = resolveApiBaseUrl();

function resolveApiBaseUrl() {
  const fromQuery = new URLSearchParams(window.location.search).get("api");
  if (fromQuery) {
    window.localStorage.setItem("radarComeGuagaApiBaseUrl", fromQuery);
    return fromQuery.replace(/\/$/, "");
  }
  const fromStorage = window.localStorage.getItem("radarComeGuagaApiBaseUrl")
    || window.localStorage.getItem("musicHunterApiBaseUrl");
  if (fromStorage) return fromStorage.replace(/\/$/, "");
  const configured = window.MUSIC_HUNTER_CONFIG?.API_BASE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host === "") {
    return "http://127.0.0.1:8000";
  }
  return "";
}

const WORLD_EXTRA_COUNTRIES = {
  Africa: ["Argelia", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Camerun", "Chad", "Comoras", "Congo", "Costa de Marfil", "Djibouti", "Egipto", "Eritrea", "Eswatini", "Etiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bisau", "Guinea Ecuatorial", "Kenia", "Lesoto", "Liberia", "Libia", "Madagascar", "Malawi", "Mali", "Mauricio", "Mauritania", "Marruecos", "Mozambique", "Namibia", "Niger", "Nigeria", "Republica Centroafricana", "Republica Democratica del Congo", "Ruanda", "Santo Tome y Principe", "Senegal", "Seychelles", "Sierra Leona", "Somalia", "Sudafrica", "Sudan", "Sudan del Sur", "Tanzania", "Togo", "Tunez", "Uganda", "Zambia", "Zimbabue"],
  Asia: ["Afganistan", "Arabia Saudita", "Azerbaiyan", "Bangladesh", "Barein", "Brunei", "Butan", "Camboya", "China", "Corea del Sur", "Emiratos Arabes Unidos", "Filipinas", "India", "Indonesia", "Irak", "Iran", "Israel", "Japon", "Jordania", "Kazajistan", "Kirguistan", "Kuwait", "Laos", "Libano", "Malasia", "Maldivas", "Mongolia", "Myanmar", "Nepal", "Oman", "Pakistan", "Palestina", "Qatar", "Singapur", "Siria", "Sri Lanka", "Tailandia", "Taiwan", "Tayikistan", "Timor Oriental", "Turkmenistan", "Uzbekistan", "Vietnam", "Yemen"],
  Europa: ["Albania", "Alemania", "Andorra", "Armenia", "Austria", "Belgica", "Bielorrusia", "Bosnia y Herzegovina", "Bulgaria", "Chipre", "Croacia", "Dinamarca", "Eslovaquia", "Eslovenia", "Espana", "Estonia", "Finlandia", "Francia", "Gales", "Georgia", "Grecia", "Holanda", "Hungria", "Inglaterra", "Irlanda", "Islandia", "Italia", "Kosovo", "Letonia", "Liechtenstein", "Lituania", "Luxemburgo", "Macedonia del Norte", "Malta", "Moldavia", "Monaco", "Montenegro", "Noruega", "Paises Bajos", "Polonia", "Portugal", "Reino Unido", "Republica Checa", "Rumania", "Rusia", "San Marino", "Serbia", "Suecia", "Suiza", "Turquia", "Ucrania", "Vaticano"],
  Norteamerica: ["Canada", "Estados Unidos"],
  Latinoamerica: ["Antigua y Barbuda", "Argentina", "Bahamas", "Barbados", "Belice", "Bolivia", "Brasil", "Chile", "Colombia", "Costa Rica", "Cuba", "Dominica", "Ecuador", "El Salvador", "Granada", "Guatemala", "Guyana", "Haiti", "Honduras", "Jamaica", "Mexico", "Nicaragua", "Panama", "Paraguay", "Peru", "Republica Dominicana", "San Cristobal y Nieves", "San Vicente y las Granadinas", "Santa Lucia", "Surinam", "Trinidad y Tobago", "Uruguay", "Venezuela"],
  Oceania: ["Australia", "Fiji", "Islas Marshall", "Islas Salomon", "Kiribati", "Micronesia", "Nauru", "Nueva Zelanda", "Palaos", "Papua Nueva Guinea", "Samoa", "Tonga", "Tuvalu", "Vanuatu"]
};

const TARGET_COUNTRIES = Object.entries(WORLD_EXTRA_COUNTRIES).flatMap(([continent, countries]) => (
  countries.map((country) => ({ continent, country }))
));

const SEARCH_MISSION_TEMPLATES = [
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
  '"{country}" "booking agency" "independent bands"'
];

const GLOBAL_PUBLIC_SEARCH_TERMS = [
  "open call musicians international",
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
  "foreign artists live music open call",
  "buscamos bandas festival",
  "residencia artistica musica",
  "appel artistes internationaux musique",
  "musiker gesucht festival",
  "band aanmelding festival",
  "bando artisti musica",
  "chamada publica artistas musica",
  "音楽 フェス 出演者 募集",
  "뮤직 쇼케이스 지원",
  "徵件 音樂 節"
];

const INDUSTRY_LANGUAGE_TERMS = [
  "demo submission",
  "submit your music",
  "artist submissions",
  "band submissions",
  "opening act",
  "support act",
  "opening band",
  "support slot",
  "bandas extranjeras",
  "international artists",
  "foreign artists",
  "artists from abroad",
  "music market",
  "mercado musical",
  "rueda de negocios",
  "mobility grant",
  "touring grant",
  "artist residency",
  "circulacion internacional",
  "A&R",
  "artist roster",
  "booking inquiry",
  "press kit",
  "EPK",
  "presentar artistas",
  "recepcion de propuestas",
  "postula tu proyecto",
  "formulario de postulacion",
  "buscamos bandas",
  "se buscan bandas",
  "llamado a bandas"
];

const SEMANTIC_SIGNAL_GROUPS = {
  teloneros: ["telonero", "teloneros", "banda soporte", "banda invitada", "abrir concierto", "abrir show", "support act", "opening act", "opening band", "support slot", "warm up band", "buscamos bandas", "se buscan bandas"],
  internacional: ["bandas internacionales", "artistas internacionales", "bandas extranjeras", "artistas de otros paises", "foreign artists", "international artists", "artists from abroad", "overseas artists", "latam artists", "iberoamerica"],
  showcase: ["showcase", "music market", "mercado musical", "rueda de negocios", "artist application", "band submissions", "apply to play", "festival submissions"],
  movilidad: ["gira", "tour", "touring", "residencia", "intercambio", "movilidad", "mobility grant", "touring grant", "artist residency", "circulacion"]
};

const LATAM_SEMANTIC_SEARCH_TERMS = [
  "buscamos bandas",
  "se buscan bandas",
  "teloneros",
  "banda soporte",
  "support act",
  "opening act",
  "bandas extranjeras",
  "artistas internacionales",
  "foreign artists",
  "international artists",
  "showcase application",
  "band submissions",
  "mercado musical",
  "rueda de negocios",
  "movilidad musical",
  "touring grant",
  "artist residency"
];

const CHILE_MEDIA_PROFILE_TARGETS = [
  "GAM media partners La Tercera Radio 13C",
  "GAM prensa musica popular media partner",
  "Rockaxis revista rock Chile",
  "Rockaxis Instagram oficial",
  "Radio Futuro rock Chile programas",
  "Radio Futuro Instagram Futuro FM",
  "Radio 13C musica cultura GAM",
  "La Tercera Culto musica chilena",
  "SCD Chile prensa musica salas",
  "Sonar FM rock Chile",
  "Radio Rock and Pop Chile musica",
  "Radio Concierto Chile rock",
  "Subela Radio musica independiente",
  "Portal Disc musica chilena",
  "Pousta musica entrevistas bandas",
  "medios musicales Chile bandas emergentes",
  "programas de radio rock chileno bandas",
  "prensa musical Chile enviar single EPK"
];

const COUNTRY_PUBLIC_SPACE_TARGETS = {
  Chile: ["Culturas Musica Instagram Convocatoria 2026", "Fondos Cultura Musica 2026", "Mercados FOCO 2026 musica bandas", "Linea Apoyo Circulacion Musica Chilena 2026", "Red Rockodromo 2026 bandas solistas", "GAM Convocatoria Nacional Programacion 2026 2027", "CONARTE Valdivia 2026 musica", "Concurso Luis Advis 2026 musica", "Concurso Roberto Parra Sandoval 2026 musica", "Municipalidad de Arica Cultura", "Teatro Municipal de Iquique", "Teatro Municipal de Antofagasta", "Municipalidad de Calama Cultura", "Centro Cultural Atacama Copiapo", "Teatro Centenario La Serena", "Parque Cultural de Valparaiso", "CENTEX Valparaiso", "Teatro Municipal de Santiago", "GAM Centro Cultural Gabriela Mistral", "Centro Cultural La Moneda", "Museo de la Memoria Santiago", "Museo Violeta Parra", "Teatro Municipal Las Condes", "Teatro Oriente Providencia", "Corporacion Cultural Nunoa", "Teatro Regional Lucho Gatica", "Teatro Regional del Maule", "Teatro Municipal de Chillan", "Teatro Biobio", "Corporacion Cultural Municipal Los Angeles", "Teatro Municipal de Temuco", "Teatro Regional Cervantes Valdivia", "Teatro Diego Rivera Puerto Montt", "Teatro del Lago Frutillar", "Municipalidad de Punta Arenas Cultura"],
  Argentina: ["Buenos Aires Cultura", "Usina del Arte", "Centro Cultural Recoleta", "Tecnopolis", "Centro Cultural Kirchner", "Rosario Cultura", "Cordoba Cultura", "Mendoza Cultura"],
  Brasil: ["Sao Paulo Cultura", "Centro Cultural Sao Paulo", "SESC Sao Paulo", "Rio de Janeiro Cultura", "Circo Voador", "Belo Horizonte Cultura", "Curitiba Cultura", "Porto Alegre Cultura"],
  Paraguay: ["Asuncion Cultura", "Centro Cultural Juan de Salazar", "Manzana de la Rivera", "San Lorenzo Cultura", "Ciudad del Este Cultura"],
  Uruguay: ["Montevideo Cultura", "Sala Zitarrosa", "Teatro Solis", "Centro Cultural de Espana Montevideo", "Canelones Cultura"],
  Colombia: ["Bogota Cultura", "Idartes", "Teatro Jorge Eliecer Gaitan", "Medellin Cultura", "Cali Cultura", "Rock al Parque"],
  Peru: ["Lima Cultura", "Gran Teatro Nacional Peru", "Centro Cultural de Espana en Lima", "Barranco Cultura", "Cusco Cultura", "Arequipa Cultura"],
  Bolivia: ["La Paz Culturas", "Teatro Municipal Alberto Saavedra Perez", "Santa Cruz Cultura", "Cochabamba Cultura", "Sucre Cultura"],
  Mexico: ["Ciudad de Mexico Cultura", "Secretaria de Cultura Mexico", "Centro Cultural de Espana en Mexico", "Cenart Mexico", "Monterrey Cultura", "Guadalajara Cultura"],
  Canada: ["Toronto Arts Council music", "Harbourfront Centre music", "M for Montreal", "Music BC", "Canada Council for the Arts music"],
  Irlanda: ["First Music Contact Ireland", "Culture Ireland music", "Dublin music open call", "Whelan's Dublin", "Galway arts music"],
  Gales: ["Wales Arts Council music", "Cardiff music open call", "Wales Millennium Centre music", "Focus Wales showcase", "Cymru music showcase"],
  Islandia: ["Iceland Airwaves showcase", "Reykjavik music open call", "Iceland Music Export", "Harpa Reykjavik music"],
  Inglaterra: ["Roundhouse London", "Southbank Centre music", "Barbican music open call", "Arts Council England music", "The Great Escape Festival"],
  Francia: ["Centre National de la Musique", "Institut Francais musique", "La Gaite Lyrique", "MaMA Music Convention"],
  Alemania: ["Musicboard Berlin", "Reeperbahn Festival", "Goethe Institut Musik", "Hamburg music showcase"],
  Espana: ["Matadero Madrid musica", "Barcelona Cultura musica", "Primavera Pro", "BIME Bilbao"],
  Japon: ["Tokyo music open call", "Music Lane Okinawa", "Fuji Rock rookie a go go", "Japan Foundation music"],
  "Corea del Sur": ["Seoul music showcase", "Zandari Festa", "MUCON Korea", "Korea Creative Content Agency music"],
  China: ["Shanghai music festival open call", "Beijing music open call", "Music China Shanghai", "China Shanghai International Arts Festival"],
  Taiwan: ["Taipei music open call", "LUCfest Taiwan", "Taiwan Beats music"],
  Vietnam: ["Ho Chi Minh City music open call", "HOZO Music Festival", "Hanoi music open call"]
};

const CONTINENT_VIEWS = {
  Latinoamerica: { center: [-17.0, -64.0], zoom: 3 },
  Norteamerica: { center: [48.0, -100.0], zoom: 3 },
  Europa: { center: [54.0, 15.0], zoom: 4 },
  Asia: { center: [34.0, 95.0], zoom: 3 },
  Africa: { center: [2.0, 20.0], zoom: 3 },
  Oceania: { center: [-25.0, 134.0], zoom: 4 },
  Global: { center: [20.0, 0.0], zoom: 2 }
};

const COUNTRY_VIEWS = {
  Albania: { center: [41.1533, 20.1683], zoom: 7 },
  Alemania: { center: [51.1657, 10.4515], zoom: 6 },
  Andorra: { center: [42.5063, 1.5218], zoom: 9 },
  Argentina: { center: [-38.4161, -63.6167], zoom: 4 },
  Armenia: { center: [40.0691, 45.0382], zoom: 7 },
  Austria: { center: [47.5162, 14.5501], zoom: 7 },
  Belgica: { center: [50.5039, 4.4699], zoom: 7 },
  Bielorrusia: { center: [53.7098, 27.9534], zoom: 6 },
  Bolivia: { center: [-16.2902, -63.5887], zoom: 5 },
  "Bosnia y Herzegovina": { center: [43.9159, 17.6791], zoom: 7 },
  Brasil: { center: [-14.235, -51.9253], zoom: 4 },
  Bulgaria: { center: [42.7339, 25.4858], zoom: 7 },
  Chile: { center: [-35.6751, -71.543], zoom: 4 },
  Chipre: { center: [35.1264, 33.4299], zoom: 8 },
  Colombia: { center: [4.5709, -74.2973], zoom: 5 },
  "Costa Rica": { center: [9.7489, -83.7534], zoom: 7 },
  Croacia: { center: [45.1, 15.2], zoom: 7 },
  Cuba: { center: [21.5218, -77.7812], zoom: 6 },
  Canada: { center: [56.1304, -106.3468], zoom: 4 },
  China: { center: [35.8617, 104.1954], zoom: 4 },
  "Corea del Sur": { center: [35.9078, 127.7669], zoom: 6 },
  Dinamarca: { center: [56.2639, 9.5018], zoom: 7 },
  Ecuador: { center: [-1.8312, -78.1834], zoom: 6 },
  "El Salvador": { center: [13.7942, -88.8965], zoom: 8 },
  Eslovaquia: { center: [48.669, 19.699], zoom: 7 },
  Eslovenia: { center: [46.1512, 14.9955], zoom: 8 },
  Espana: { center: [40.4637, -3.7492], zoom: 6 },
  Estonia: { center: [58.5953, 25.0136], zoom: 7 },
  Finlandia: { center: [61.9241, 25.7482], zoom: 5 },
  Francia: { center: [46.2276, 2.2137], zoom: 6 },
  Gales: { center: [52.1307, -3.7837], zoom: 7 },
  Georgia: { center: [42.3154, 43.3569], zoom: 7 },
  Grecia: { center: [39.0742, 21.8243], zoom: 6 },
  Holanda: { center: [52.1326, 5.2913], zoom: 7 },
  Guatemala: { center: [15.7835, -90.2308], zoom: 7 },
  Honduras: { center: [15.2, -86.2419], zoom: 7 },
  Hungria: { center: [47.1625, 19.5033], zoom: 7 },
  Inglaterra: { center: [52.3555, -1.1743], zoom: 6 },
  Irlanda: { center: [53.4129, -8.2439], zoom: 7 },
  Islandia: { center: [64.9631, -19.0208], zoom: 6 },
  Italia: { center: [41.8719, 12.5674], zoom: 6 },
  Japon: { center: [36.2048, 138.2529], zoom: 5 },
  Kosovo: { center: [42.6026, 20.903], zoom: 8 },
  Letonia: { center: [56.8796, 24.6032], zoom: 7 },
  Libano: { center: [33.8547, 35.8623], zoom: 8 },
  Liechtenstein: { center: [47.166, 9.5554], zoom: 10 },
  Lituania: { center: [55.1694, 23.8813], zoom: 7 },
  Luxemburgo: { center: [49.8153, 6.1296], zoom: 9 },
  "Macedonia del Norte": { center: [41.6086, 21.7453], zoom: 8 },
  Malta: { center: [35.9375, 14.3754], zoom: 10 },
  Marruecos: { center: [31.7917, -7.0926], zoom: 5 },
  Mexico: { center: [23.6345, -102.5528], zoom: 5 },
  Moldavia: { center: [47.4116, 28.3699], zoom: 7 },
  Monaco: { center: [43.7384, 7.4246], zoom: 11 },
  Montenegro: { center: [42.7087, 19.3744], zoom: 8 },
  Nicaragua: { center: [12.8654, -85.2072], zoom: 7 },
  Noruega: { center: [60.472, 8.4689], zoom: 5 },
  "Paises Bajos": { center: [52.1326, 5.2913], zoom: 7 },
  Panama: { center: [8.538, -80.7821], zoom: 7 },
  Paraguay: { center: [-23.4425, -58.4438], zoom: 6 },
  Peru: { center: [-9.19, -75.0152], zoom: 5 },
  Polonia: { center: [51.9194, 19.1451], zoom: 6 },
  Portugal: { center: [39.3999, -8.2245], zoom: 7 },
  "Reino Unido": { center: [55.3781, -3.436], zoom: 6 },
  "Republica Checa": { center: [49.8175, 15.473], zoom: 7 },
  "Republica Dominicana": { center: [18.7357, -70.1627], zoom: 7 },
  Rumania: { center: [45.9432, 24.9668], zoom: 6 },
  Rusia: { center: [61.524, 105.3188], zoom: 3 },
  "San Marino": { center: [43.9424, 12.4578], zoom: 11 },
  Serbia: { center: [44.0165, 21.0059], zoom: 7 },
  Sudafrica: { center: [-30.5595, 22.9375], zoom: 5 },
  Suecia: { center: [60.1282, 18.6435], zoom: 5 },
  Suiza: { center: [46.8182, 8.2275], zoom: 7 },
  Taiwan: { center: [23.6978, 120.9605], zoom: 7 },
  Turquia: { center: [38.9637, 35.2433], zoom: 5 },
  Ucrania: { center: [48.3794, 31.1656], zoom: 6 },
  Uruguay: { center: [-32.5228, -55.7658], zoom: 6 },
  Vaticano: { center: [41.9029, 12.4534], zoom: 12 },
  Venezuela: { center: [6.4238, -66.5897], zoom: 5 },
  Vietnam: { center: [14.0583, 108.2772], zoom: 5 },
  Australia: { center: [-25.2744, 133.7751], zoom: 4 },
  "Estados Unidos": { center: [39.8283, -98.5795], zoom: 4 }
};

const REGION_VIEWS = {
  "Chile:Atacama": { center: [-27.3668, -70.3323], zoom: 7 },
  "Chile:Antofagasta": { center: [-23.6509, -70.3975], zoom: 6 },
  "Chile:Coquimbo": { center: [-29.959, -71.3389], zoom: 7 },
  "Chile:Metropolitana": { center: [-33.4489, -70.6693], zoom: 9 },
  "Chile:Valparaiso": { center: [-33.0472, -71.6127], zoom: 8 },
  "Argentina:Buenos Aires": { center: [-34.6037, -58.3816], zoom: 7 },
  "Argentina:Cordoba": { center: [-31.4201, -64.1888], zoom: 7 },
  "Uruguay:Montevideo": { center: [-34.9011, -56.1645], zoom: 9 },
  "Uruguay:Canelones": { center: [-34.5228, -56.2778], zoom: 8 },
  "Estados Unidos:Texas": { center: [31.0, -99.0], zoom: 5 },
  "Estados Unidos:California": { center: [36.7783, -119.4179], zoom: 5 },
  "Canada:Ontario": { center: [50.0, -85.0], zoom: 5 },
  "Brasil:Sao Paulo": { center: [-23.5505, -46.6333], zoom: 7 },
  "Mexico:Ciudad de Mexico": { center: [19.4326, -99.1332], zoom: 9 },
  "Colombia:Bogota": { center: [4.711, -74.0721], zoom: 8 }
};

const CHILE_REGIONAL_TARGETS = [
  { region: "Metropolitana", city: "Santiago", query: "Santiago agenda cultural conciertos bandas rock centro cultural" },
  { region: "Metropolitana", city: "GAM", query: "GAM Centro Cultural Gabriela Mistral musica conciertos convocatoria bandas" },
  { region: "Metropolitana", city: "Las Condes", query: "Las Condes Teatro Municipal Corporacion Cultural musica conciertos artistas" },
  { region: "Metropolitana", city: "Providencia", query: "Providencia Teatro Oriente centro cultural musica conciertos bandas" },
  { region: "Metropolitana", city: "Nunoa", query: "Nunoa corporacion cultural musica conciertos bandas tocatas" },
  { region: "Metropolitana", city: "La Reina", query: "La Reina centro cultural musica conciertos bandas artistas" },
  { region: "Metropolitana", city: "San Joaquin", query: "San Joaquin centro cultural musica bandas conciertos" },
  { region: "Metropolitana", city: "Maipu", query: "Maipu teatro municipal musica conciertos bandas artistas" },
  { region: "Valparaiso", city: "Valparaiso", query: "Valparaiso agenda cultural conciertos convocatoria bandas centro cultural" },
  { region: "Valparaiso", city: "V Region", query: "V Region Valparaiso Vina del Mar Quilpue Villa Alemana musica conciertos bandas" },
  { region: "Valparaiso", city: "Limache", query: "Limache musica conciertos centro cultural municipio agenda" },
  { region: "O'Higgins", city: "VI Region", query: "Region de O'Higgins Rancagua VI Region musica conciertos centro cultural bandas" },
  { region: "Maule", city: "VII Region", query: "Region del Maule Talca Curico VII Region musica conciertos centro cultural bandas" },
  { region: "Nuble", city: "Chillan", query: "Chillan centro cultural conciertos musica entrada liberada" },
  { region: "Biobio", city: "Los Angeles", query: "Los Angeles Bio Bio centro cultural musica conciertos festival" },
  { region: "Biobio", city: "Concepcion", query: "Concepcion Festival REC Teatro Biobio bandas rock convocatoria" },
  { region: "Coquimbo", city: "Valle de Elqui", query: "Valle de Elqui Vicuña Paihuano musica conciertos cultura" },
  { region: "Coquimbo", city: "La Serena", query: "La Serena Coquimbo teatro centenario conciertos musica agenda" },
  { region: "Antofagasta", city: "Antofagasta", query: "Antofagasta teatro municipal corporacion cultural musica conciertos bandas" },
  { region: "Antofagasta", city: "Calama", query: "Calama corporacion cultural teatro musica conciertos bandas" },
  { region: "Atacama", city: "Copiapo", query: "Copiapo Atacama cultura municipal musica conciertos bandas centro cultural" },
  { region: "Atacama", city: "Caldera", query: "Caldera Atacama cultura musica festival conciertos bandas" },
  { region: "Atacama", city: "Chanaral", query: "Chanaral Atacama cultura musica conciertos bandas municipalidad" },
  { region: "Atacama", city: "Diego de Almagro", query: "Diego de Almagro Atacama cultura musica conciertos bandas" },
  { region: "Atacama", city: "Tierra Amarilla", query: "Tierra Amarilla Atacama cultura musica conciertos bandas" },
  { region: "Atacama", city: "Vallenar", query: "Vallenar Atacama centro cultural musica conciertos bandas" },
  { region: "Atacama", city: "Huasco", query: "Huasco Atacama cultura musica festival bandas" },
  { region: "Atacama", city: "Freirina", query: "Freirina Atacama cultura musica conciertos bandas" },
  { region: "Atacama", city: "Alto del Carmen", query: "Alto del Carmen Atacama cultura musica valle conciertos bandas" },
  { region: "Los Rios", city: "Valdivia", query: "Valdivia Teatro Cervantes Fluvial musica conciertos bandas convocatoria" },
  { region: "Los Lagos", city: "Puerto Montt", query: "Puerto Montt Teatro Diego Rivera cultura musica conciertos bandas" },
  { region: "Norte", city: "Norte de Chile", query: "norte de Chile musica conciertos festival bandas centro cultural" },
  { region: "Sur", city: "Sur de Chile", query: "sur de Chile musica conciertos festival bandas centro cultural" }
];

const CHILE_INSTAGRAM_PROMOTION_TAGS = [
  { tag: "agendacultural", label: "Agenda cultural Chile", region: "Nacional" },
  { tag: "panoramaschile", label: "Panoramas Chile", region: "Nacional" },
  { tag: "panoramassantiago", label: "Panoramas Santiago", region: "Metropolitana" },
  { tag: "tocatasantiago", label: "Tocatas Santiago", region: "Metropolitana" },
  { tag: "tocatasvalparaiso", label: "Tocatas Valparaiso", region: "Valparaiso" },
  { tag: "conciertoschile", label: "Conciertos Chile", region: "Nacional" },
  { tag: "conciertossantiago", label: "Conciertos Santiago", region: "Metropolitana" },
  { tag: "conciertosconcepcion", label: "Conciertos Concepcion", region: "Biobio" },
  { tag: "rockchileno", label: "Rock chileno", region: "Nacional" },
  { tag: "bandaschilenas", label: "Bandas chilenas", region: "Nacional" },
  { tag: "musicachilena", label: "Musica chilena", region: "Nacional" },
  { tag: "festivalrec", label: "Festival REC / Biobio", region: "Biobio" },
  { tag: "culturavalparaiso", label: "Cultura Valparaiso", region: "Valparaiso" },
  { tag: "culturabiobio", label: "Cultura Biobio", region: "Biobio" },
  { tag: "culturanuble", label: "Cultura Nuble", region: "Nuble" },
  { tag: "culturacoquimbo", label: "Cultura Coquimbo", region: "Coquimbo" },
  { tag: "valledelelqui", label: "Valle de Elqui", region: "Coquimbo" },
  { tag: "culturaatacama", label: "Cultura Atacama", region: "Atacama" },
  { tag: "atacama", label: "Atacama", region: "Atacama" },
  { tag: "copiapo", label: "Copiapo", region: "Atacama" },
  { tag: "vallenar", label: "Vallenar", region: "Atacama" },
  { tag: "caldera", label: "Caldera", region: "Atacama" },
  { tag: "gamcl", label: "GAM / Centro Gabriela Mistral", region: "Metropolitana" },
  { tag: "lascondes", label: "Las Condes", region: "Metropolitana" },
  { tag: "providencia", label: "Providencia", region: "Metropolitana" },
  { tag: "nunoa", label: "Nunoa", region: "Metropolitana" },
  { tag: "antofagasta", label: "Antofagasta", region: "Antofagasta" },
  { tag: "calama", label: "Calama", region: "Antofagasta" },
  { tag: "valdivia", label: "Valdivia", region: "Los Rios" },
  { tag: "puertomontt", label: "Puerto Montt", region: "Los Lagos" }
];

const CHILE_DEEP_SEARCH_TARGETS = [
  ["Metropolitana", "Santiago", "GAM Centro Cultural Gabriela Mistral"],
  ["Metropolitana", "Santiago", "Matucana 100"],
  ["Metropolitana", "Santiago", "Centro Cultural La Moneda"],
  ["Metropolitana", "Santiago", "Balmaceda Arte Joven Santiago"],
  ["Metropolitana", "Santiago", "Teatro Nescafe de las Artes"],
  ["Metropolitana", "Providencia", "Teatro Oriente Providencia"],
  ["Metropolitana", "Providencia", "Corporacion Cultural Providencia"],
  ["Metropolitana", "Las Condes", "Centro Cultural Las Condes"],
  ["Metropolitana", "Las Condes", "Teatro Municipal Las Condes"],
  ["Metropolitana", "Nunoa", "Corporacion Cultural Nunoa"],
  ["Metropolitana", "Nunoa", "Sala SCD Nunoa"],
  ["Metropolitana", "La Reina", "Corporacion Cultural La Reina"],
  ["Metropolitana", "San Joaquin", "Centro Cultural San Joaquin"],
  ["Metropolitana", "Maipu", "Teatro Municipal de Maipu"],
  ["Metropolitana", "Puente Alto", "Centro Cultural Puente Alto"],
  ["Metropolitana", "La Florida", "Corporacion Cultural La Florida"],
  ["Metropolitana", "Penalolen", "Centro Cultural Chimkowe Penalolen"],
  ["Metropolitana", "Lo Barnechea", "Centro Cultural Lo Barnechea"],
  ["Metropolitana", "Vitacura", "Vitacura Cultura"],
  ["Metropolitana", "Recoleta", "Corporacion Cultural Recoleta"],
  ["Metropolitana", "Quinta Normal", "Centro Cultural Casona Dubois"],
  ["Metropolitana", "Independencia", "Independencia Cultura"],
  ["Metropolitana", "Huechuraba", "Huechuraba Cultura"],
  ["Metropolitana", "Quilicura", "Quilicura Cultura"],
  ["Metropolitana", "Renca", "Renca Cultura"],
  ["Metropolitana", "Estacion Central", "Estacion Central Cultura"],
  ["Metropolitana", "San Miguel", "San Miguel Cultura"],
  ["Metropolitana", "La Pintana", "La Pintana Cultura"],
  ["Metropolitana", "Pudahuel", "Pudahuel Cultura"],
  ["Metropolitana", "Cerrillos", "Cerrillos Cultura"],
  ["Arica y Parinacota", "Arica", "Arica Cultura"],
  ["Tarapaca", "Iquique", "Iquique Cultura"],
  ["Tarapaca", "Alto Hospicio", "Alto Hospicio Cultura"],
  ["Antofagasta", "Antofagasta", "Teatro Municipal de Antofagasta"],
  ["Antofagasta", "Calama", "Corporacion Cultural Calama"],
  ["Antofagasta", "Mejillones", "Mejillones Cultura"],
  ["Antofagasta", "Tocopilla", "Tocopilla Cultura"],
  ["Atacama", "Copiapo", "Copiapo Cultura"],
  ["Atacama", "Copiapo", "Gobierno Regional de Atacama Cultura"],
  ["Atacama", "Copiapo", "Casa de la Cultura de Copiapo"],
  ["Atacama", "Caldera", "Caldera Cultura"],
  ["Atacama", "Caldera", "Centro Cultural Estacion Caldera"],
  ["Atacama", "Chanaral", "Chanaral Cultura"],
  ["Atacama", "Diego de Almagro", "Diego de Almagro Cultura"],
  ["Atacama", "Tierra Amarilla", "Tierra Amarilla Cultura"],
  ["Atacama", "Vallenar", "Vallenar Cultura"],
  ["Atacama", "Vallenar", "Centro Cultural Vallenar"],
  ["Atacama", "Huasco", "Huasco Cultura"],
  ["Atacama", "Freirina", "Freirina Cultura"],
  ["Atacama", "Alto del Carmen", "Alto del Carmen Cultura"],
  ["Coquimbo", "La Serena", "Centro Cultural Teatro Centenario"],
  ["Coquimbo", "Coquimbo", "Coquimbo Cultura"],
  ["Coquimbo", "Ovalle", "Centro Cultural Municipal Ovalle"],
  ["Coquimbo", "Vicuna", "Valle de Elqui cultura Vicuna"],
  ["Valparaiso", "Valparaiso", "Parque Cultural de Valparaiso"],
  ["Valparaiso", "Valparaiso", "CENTEX Valparaiso"],
  ["Valparaiso", "Vina del Mar", "Vina del Mar Cultura"],
  ["Valparaiso", "Quilpue", "Quilpue Cultura"],
  ["Valparaiso", "Villa Alemana", "Villa Alemana Cultura"],
  ["Valparaiso", "Limache", "Limache Cultura"],
  ["Valparaiso", "San Antonio", "San Antonio Cultura"],
  ["Valparaiso", "Los Andes", "Los Andes Cultura"],
  ["Valparaiso", "San Felipe", "San Felipe Cultura"],
  ["O'Higgins", "Rancagua", "Teatro Regional Lucho Gatica"],
  ["O'Higgins", "Machali", "Machali Cultura"],
  ["O'Higgins", "San Fernando", "San Fernando Cultura"],
  ["O'Higgins", "Santa Cruz", "Santa Cruz Cultura"],
  ["O'Higgins", "Pichilemu", "Pichilemu Cultura"],
  ["Maule", "Talca", "Teatro Regional del Maule"],
  ["Maule", "Curico", "Curico Cultura"],
  ["Maule", "Linares", "Linares Cultura"],
  ["Maule", "Cauquenes", "Cauquenes Cultura"],
  ["Maule", "Constitucion", "Constitucion Cultura"],
  ["Nuble", "Chillan", "Teatro Municipal de Chillan"],
  ["Nuble", "Chillan", "Centro Cultural Municipal de Chillan"],
  ["Nuble", "San Carlos", "San Carlos Cultura"],
  ["Biobio", "Concepcion", "Teatro Biobio"],
  ["Biobio", "Concepcion", "Festival REC Concepcion"],
  ["Biobio", "Talcahuano", "Talcahuano Cultura"],
  ["Biobio", "Chiguayante", "Chiguayante Cultura"],
  ["Biobio", "Coronel", "Coronel Cultura"],
  ["Biobio", "Lota", "Lota Cultura"],
  ["Biobio", "Los Angeles", "Corporacion Cultural Municipal Los Angeles"],
  ["Biobio", "Arauco", "Arauco Cultura"],
  ["La Araucania", "Temuco", "Teatro Municipal de Temuco"],
  ["La Araucania", "Padre Las Casas", "Padre Las Casas Cultura"],
  ["La Araucania", "Villarrica", "Villarrica Cultura"],
  ["La Araucania", "Pucon", "Pucon Cultura"],
  ["La Araucania", "Angol", "Angol Cultura"],
  ["Los Rios", "Valdivia", "Fluvial Valdivia"],
  ["Los Rios", "Valdivia", "Teatro Regional Cervantes Valdivia"],
  ["Los Rios", "La Union", "La Union Cultura"],
  ["Los Lagos", "Osorno", "Osorno Cultura"],
  ["Los Lagos", "Puerto Montt", "Teatro Diego Rivera Puerto Montt"],
  ["Los Lagos", "Puerto Varas", "Puerto Varas Cultura"],
  ["Los Lagos", "Frutillar", "Teatro del Lago Frutillar"],
  ["Los Lagos", "Castro", "Castro Cultura Chiloe"],
  ["Los Lagos", "Ancud", "Ancud Cultura"],
  ["Aysen", "Coyhaique", "Coyhaique Cultura"],
  ["Aysen", "Puerto Aysen", "Puerto Aysen Cultura"],
  ["Magallanes", "Punta Arenas", "Punta Arenas Cultura"],
  ["Magallanes", "Puerto Natales", "Puerto Natales Cultura"],
  ["Metropolitana", "Melipilla", "Melipilla Cultura"],
  ["Metropolitana", "Talagante", "Talagante Cultura"],
  ["Metropolitana", "Buin", "Buin Cultura"],
  ["Metropolitana", "Colina", "Colina Cultura"],
  ["Metropolitana", "San Bernardo", "San Bernardo Cultura"],
  ["Metropolitana", "Penaflor", "Penaflor Cultura"],
  ["Metropolitana", "Lampa", "Lampa Cultura"],
  ["Metropolitana", "Curacavi", "Curacavi Cultura"],
  ["Metropolitana", "Paine", "Paine Cultura"],
  ["Coquimbo", "Los Vilos", "Los Vilos Cultura"],
  ["Valparaiso", "Quillota", "Quillota Cultura"],
  ["O'Higgins", "Rengo", "Rengo Cultura"]
].map(([region, city, label]) => ({
  country: "Chile",
  region,
  city,
  label,
  type: "radar_local",
  query: `${label} ${city} musica conciertos bandas convocatoria tocata programacion centro cultural municipio`
}));

const ADMIN_DIVISION_TERMS = {
  Chile: ["region", "comuna", "municipalidad", "gobierno regional", "corporacion cultural"],
  Argentina: ["provincia", "municipio", "departamento", "secretaria de cultura"],
  Uruguay: ["departamento", "municipio", "intendencia", "direccion de cultura"],
  Paraguay: ["departamento", "municipalidad", "gobernacion"],
  Bolivia: ["departamento", "municipio", "gobierno autonomo municipal"],
  Peru: ["region", "municipalidad", "provincia", "distrito"],
  Colombia: ["departamento", "municipio", "alcaldia", "secretaria de cultura"],
  Brasil: ["estado", "municipio", "prefeitura", "secretaria de cultura"],
  Mexico: ["estado", "municipio", "alcaldia", "secretaria de cultura"],
  "Estados Unidos": ["state", "county", "city arts council", "cultural affairs"],
  Canada: ["province", "territory", "city arts council", "municipality"],
  Inglaterra: ["county", "borough", "city council", "arts council"],
  "Reino Unido": ["county", "borough", "city council", "arts council"],
  Irlanda: ["county", "city council", "arts office"],
  Gales: ["county", "council", "arts council"],
  Francia: ["region", "departement", "commune", "mairie"],
  Espana: ["comunidad autonoma", "provincia", "ayuntamiento"],
  Alemania: ["bundesland", "stadt", "kulturamt"],
  Australia: ["state", "territory", "local council"]
};

const DEFAULT_ADMIN_DIVISION_TERMS = ["region", "province", "state", "municipality", "city council"];

const TERRITORIAL_AREA_TARGETS = [
  ["Chile", "Atacama", "Copiapo", "Municipalidad de Copiapo Cultura", -27.3668, -70.3323],
  ["Chile", "Atacama", "Copiapo", "Gobierno Regional de Atacama Cultura", -27.3668, -70.3323],
  ["Chile", "Atacama", "Copiapo", "Casa de la Cultura de Copiapo", -27.3668, -70.3323],
  ["Chile", "Atacama", "Caldera", "Municipalidad de Caldera Cultura", -27.0667, -70.817],
  ["Chile", "Atacama", "Caldera", "Centro Cultural Estacion Caldera", -27.0667, -70.817],
  ["Chile", "Atacama", "Chanaral", "Municipalidad de Chanaral Cultura", -26.347, -70.624],
  ["Chile", "Atacama", "Diego de Almagro", "Municipalidad de Diego de Almagro Cultura", -26.39, -70.05],
  ["Chile", "Atacama", "Tierra Amarilla", "Municipalidad de Tierra Amarilla Cultura", -27.467, -70.264],
  ["Chile", "Atacama", "Vallenar", "Municipalidad de Vallenar Cultura", -28.576, -70.759],
  ["Chile", "Atacama", "Vallenar", "Centro Cultural Vallenar", -28.576, -70.759],
  ["Chile", "Atacama", "Huasco", "Municipalidad de Huasco Cultura", -28.466, -71.219],
  ["Chile", "Atacama", "Freirina", "Municipalidad de Freirina Cultura", -28.506, -71.077],
  ["Chile", "Atacama", "Alto del Carmen", "Municipalidad de Alto del Carmen Cultura", -28.756, -70.486],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Provincia de Buenos Aires cultura musica", -34.6037, -58.3816],
  ["Argentina", "Cordoba", "Cordoba", "Cordoba provincia cultura musica", -31.4201, -64.1888],
  ["Argentina", "Santa Fe", "Rosario", "Santa Fe Rosario cultura musica", -32.9442, -60.6505],
  ["Uruguay", "Montevideo", "Montevideo", "Montevideo departamento cultura musica", -34.9011, -56.1645],
  ["Uruguay", "Canelones", "Canelones", "Canelones departamento cultura musica", -34.5228, -56.2778],
  ["Uruguay", "Maldonado", "Maldonado", "Maldonado departamento cultura musica", -34.9, -54.95],
  ["Estados Unidos", "Texas", "Austin", "Texas state arts council music", 30.2672, -97.7431],
  ["Estados Unidos", "California", "Los Angeles", "Los Angeles county arts music", 34.0522, -118.2437],
  ["Estados Unidos", "New York", "New York", "New York state arts music", 40.7128, -74.006],
  ["Canada", "Ontario", "Toronto", "Ontario arts council music", 43.6532, -79.3832],
  ["Canada", "Quebec", "Montreal", "Quebec culture music", 45.5017, -73.5673],
  ["Brasil", "Sao Paulo", "Sao Paulo", "Sao Paulo estado cultura musica", -23.5505, -46.6333],
  ["Brasil", "Rio de Janeiro", "Rio de Janeiro", "Rio de Janeiro estado cultura musica", -22.9068, -43.1729],
  ["Mexico", "Ciudad de Mexico", "Ciudad de Mexico", "Ciudad de Mexico alcaldia cultura musica", 19.4326, -99.1332],
  ["Mexico", "Jalisco", "Guadalajara", "Jalisco cultura musica Guadalajara", 20.6597, -103.3496],
  ["Colombia", "Bogota", "Bogota", "Bogota secretaria de cultura musica", 4.711, -74.0721],
  ["Colombia", "Antioquia", "Medellin", "Antioquia Medellin cultura musica", 6.2442, -75.5812]
].map(([country, region, city, label, lat, lng]) => ({
  country,
  region,
  city,
  label,
  lat,
  lng,
  type: "radar_territorial",
  query: `${label} ${city} ${region} musica conciertos bandas convocatoria centro cultural municipio festival`
}));

const LATAM_RECOGNIZED_TARGETS = [
  ["Argentina", "Buenos Aires", "Buenos Aires", "INAMU"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "BAFIM"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Centro Cultural Recoleta"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Ciudad Cultural Konex"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "La Trastienda"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Niceto Club"],
  ["Argentina", "Cordoba", "Cordoba", "Cosquin Rock"],
  ["Argentina", "Santa Fe", "Rosario", "Rosario Cultura"],
  ["Argentina", "Mendoza", "Mendoza", "Mendoza Cultura"],
  ["Argentina", "Buenos Aires", "La Plata", "La Plata Cultura"],
  ["Colombia", "Bogota", "Bogota", "Rock al Parque"],
  ["Colombia", "Bogota", "Bogota", "Idartes"],
  ["Colombia", "Bogota", "Bogota", "BOmm Bogota Music Market"],
  ["Colombia", "Bogota", "Bogota", "Teatro Mayor Julio Mario Santo Domingo"],
  ["Colombia", "Antioquia", "Medellin", "Circulart"],
  ["Colombia", "Antioquia", "Medellin", "Medellin Cultura"],
  ["Colombia", "Valle del Cauca", "Cali", "Cali Cultura"],
  ["Colombia", "Atlantico", "Barranquilla", "Barranquilla Cultura"],
  ["Colombia", "Bolivar", "Cartagena", "Cartagena Cultura"],
  ["Colombia", "Santander", "Bucaramanga", "Bucaramanga Cultura"],
  ["Peru", "Lima", "Lima", "Ministerio de Cultura Peru"],
  ["Peru", "Lima", "Lima", "Gran Teatro Nacional Peru"],
  ["Peru", "Lima", "Lima", "Centro Cultural de Espana en Lima"],
  ["Peru", "Lima", "Lima", "Festival Selvamomos"],
  ["Peru", "Lima", "Lima", "Vivo x el Rock"],
  ["Peru", "Cusco", "Cusco", "Cusco Cultura"],
  ["Peru", "Arequipa", "Arequipa", "Arequipa Cultura"],
  ["Peru", "La Libertad", "Trujillo", "Trujillo Cultura"],
  ["Peru", "Lambayeque", "Chiclayo", "Chiclayo Cultura"],
  ["Peru", "Piura", "Piura", "Piura Cultura"],
  ["Uruguay", "Montevideo", "Montevideo", "INMUS Uruguay"],
  ["Uruguay", "Montevideo", "Montevideo", "Montevideo Cultura"],
  ["Uruguay", "Montevideo", "Montevideo", "Sala Zitarrosa"],
  ["Uruguay", "Montevideo", "Montevideo", "Teatro Solis"],
  ["Uruguay", "Montevideo", "Montevideo", "Montevideo Rock"],
  ["Uruguay", "Durazno", "Durazno", "Durazno Rock"],
  ["Uruguay", "Canelones", "Canelones", "Canelones Cultura"],
  ["Uruguay", "Maldonado", "Maldonado", "Maldonado Cultura"],
  ["Paraguay", "Asuncion", "Asuncion", "Secretaria Nacional de Cultura Paraguay"],
  ["Paraguay", "Asuncion", "Asuncion", "Centro Cultural Juan de Salazar"],
  ["Paraguay", "Asuncion", "Asuncion", "Asuncionico"],
  ["Paraguay", "Asuncion", "Asuncion", "Municipalidad de Asuncion Cultura"],
  ["Paraguay", "Central", "San Lorenzo", "San Lorenzo Cultura"],
  ["Paraguay", "Alto Parana", "Ciudad del Este", "Ciudad del Este Cultura"],
  ["Paraguay", "Itapua", "Encarnacion", "Encarnacion Cultura"],
  ["Paraguay", "Guaira", "Villarrica", "Villarrica Paraguay Cultura"],
  ["Bolivia", "La Paz", "La Paz", "Ministerio de Culturas Bolivia"],
  ["Bolivia", "La Paz", "La Paz", "Teatro Municipal Alberto Saavedra Perez"],
  ["Bolivia", "La Paz", "La Paz", "La Paz Culturas"],
  ["Bolivia", "Santa Cruz", "Santa Cruz", "Santa Cruz Cultura"],
  ["Bolivia", "Cochabamba", "Cochabamba", "Cochabamba Cultura"],
  ["Bolivia", "Sucre", "Sucre", "Sucre Cultura"],
  ["Bolivia", "Tarija", "Tarija", "Tarija Cultura"],
  ["Bolivia", "Oruro", "Oruro", "Oruro Cultura"],
  ["Brasil", "Sao Paulo", "Sao Paulo", "SIM Sao Paulo"],
  ["Brasil", "Sao Paulo", "Sao Paulo", "Centro Cultural Sao Paulo"],
  ["Brasil", "Sao Paulo", "Sao Paulo", "SESC Sao Paulo"],
  ["Brasil", "Pernambuco", "Recife", "Porto Musical"],
  ["Brasil", "Rio de Janeiro", "Rio de Janeiro", "Circo Voador"],
  ["Brasil", "Rio de Janeiro", "Rio de Janeiro", "Rock in Rio"],
  ["Brasil", "Bahia", "Salvador", "Salvador Cultura"],
  ["Brasil", "Minas Gerais", "Belo Horizonte", "Belo Horizonte Cultura"],
  ["Brasil", "Parana", "Curitiba", "Curitiba Cultura"],
  ["Brasil", "Rio Grande do Sul", "Porto Alegre", "Porto Alegre Cultura"],
  ["Mexico", "Jalisco", "Guadalajara", "FIMPRO"],
  ["Mexico", "Ciudad de Mexico", "Ciudad de Mexico", "Vive Latino"],
  ["Mexico", "Ciudad de Mexico", "Ciudad de Mexico", "Indie Rocks"],
  ["Mexico", "Ciudad de Mexico", "Ciudad de Mexico", "Centro Cultural de Espana en Mexico"],
  ["Mexico", "Ciudad de Mexico", "Ciudad de Mexico", "Secretaria de Cultura Mexico"],
  ["Mexico", "Nuevo Leon", "Monterrey", "Monterrey Cultura"],
  ["Mexico", "Jalisco", "Guadalajara", "Guadalajara Cultura"],
  ["Mexico", "Puebla", "Puebla", "Puebla Cultura"],
  ["Mexico", "Baja California", "Tijuana", "Tijuana Cultura"],
  ["Mexico", "Yucatan", "Merida", "Merida Cultura"],
  ["Ecuador", "Pichincha", "Quito", "Quito Cultura"],
  ["Ecuador", "Pichincha", "Quito", "Teatro Nacional Sucre"],
  ["Ecuador", "Pichincha", "Quito", "Quitofest"],
  ["Ecuador", "Guayas", "Guayaquil", "Guayaquil Cultura"],
  ["Ecuador", "Azuay", "Cuenca", "Cuenca Cultura"],
  ["Ecuador", "Manabi", "Manta", "Manta Cultura"],
  ["Ecuador", "Loja", "Loja", "Loja Cultura"],
  ["Ecuador", "Imbabura", "Ibarra", "Ibarra Cultura"],
  ["Costa Rica", "San Jose", "San Jose", "Ministerio de Cultura Costa Rica"],
  ["Costa Rica", "San Jose", "San Jose", "FIA Costa Rica"],
  ["Costa Rica", "San Jose", "San Jose", "Jazz Cafe Costa Rica"],
  ["Costa Rica", "San Jose", "San Jose", "Teatro Nacional Costa Rica"],
  ["Costa Rica", "Alajuela", "Alajuela", "Alajuela Cultura"],
  ["Panama", "Panama", "Panama", "MiCultura Panama"],
  ["Panama", "Panama", "Panama", "Panama Jazz Festival"],
  ["Panama", "Panama", "Panama", "Teatro Nacional Panama"],
  ["Panama", "Panama", "Panama", "Ciudad de Panama Cultura"],
  ["Panama", "Chiriqui", "David", "David Cultura"],
  ["Cuba", "La Habana", "La Habana", "Instituto Cubano de la Musica"],
  ["Cuba", "La Habana", "La Habana", "Fabrica de Arte Cubano"],
  ["Cuba", "La Habana", "La Habana", "La Habana Cultura"],
  ["Republica Dominicana", "Santo Domingo", "Santo Domingo", "Ministerio de Cultura Republica Dominicana"],
  ["Republica Dominicana", "Santo Domingo", "Santo Domingo", "Santo Domingo Cultura"],
  ["Republica Dominicana", "Santo Domingo", "Santo Domingo", "Centro Cultural de Espana Santo Domingo"],
  ["Guatemala", "Guatemala", "Ciudad de Guatemala", "Ministerio de Cultura Guatemala"],
  ["Guatemala", "Guatemala", "Ciudad de Guatemala", "Ciudad de Guatemala Cultura"],
  ["Honduras", "Francisco Morazan", "Tegucigalpa", "Secretaria de Cultura Honduras"],
  ["Honduras", "Francisco Morazan", "Tegucigalpa", "Tegucigalpa Cultura"],
  ["Nicaragua", "Managua", "Managua", "Instituto Nicaraguense de Cultura"],
  ["Nicaragua", "Managua", "Managua", "Managua Cultura"],
  ["El Salvador", "San Salvador", "San Salvador", "Ministerio de Cultura El Salvador"],
  ["El Salvador", "San Salvador", "San Salvador", "San Salvador Cultura"],
  ["Venezuela", "Caracas", "Caracas", "Centro Cultural BOD"],
  ["Venezuela", "Caracas", "Caracas", "Caracas Cultura"]
].map(([country, region, city, label]) => ({
  country,
  region,
  city,
  label,
  type: "radar_latam",
  query: `${label} ${city} musica festival convocatoria showcase bandas rock indie booking centro cultural`
}));

const GLOBAL_PRIORITY_TARGETS = [
  ["Estados Unidos", "Texas", "Austin", "SXSW Music Festival"],
  ["Estados Unidos", "New York", "New York", "Lincoln Center Open Calls"],
  ["Estados Unidos", "New York", "New York", "Brooklyn Academy of Music"],
  ["Estados Unidos", "California", "Los Angeles", "The Echo Los Angeles"],
  ["Estados Unidos", "Illinois", "Chicago", "Chicago Cultural Center"],
  ["Canada", "Ontario", "Toronto", "Canadian Music Week"],
  ["Canada", "Quebec", "Montreal", "M for Montreal"],
  ["Canada", "British Columbia", "Vancouver", "Music BC"],
  ["Irlanda", "Dublin", "Dublin", "First Music Contact Ireland"],
  ["Irlanda", "Dublin", "Dublin", "Whelan's Dublin"],
  ["Inglaterra", "England", "Brighton", "The Great Escape Festival"],
  ["Inglaterra", "England", "London", "Arts Council England Music"],
  ["Inglaterra", "England", "London", "Roundhouse London"],
  ["Espana", "Cataluna", "Barcelona", "Primavera Pro"],
  ["Espana", "Pais Vasco", "Bilbao", "BIME"],
  ["Espana", "Madrid", "Madrid", "INJUVE Musica"],
  ["Marruecos", "Casablanca", "Casablanca", "Visa For Music"],
  ["Marruecos", "Rabat", "Rabat", "Hiba Foundation"],
  ["Francia", "Ile-de-France", "Paris", "Centre National de la Musique"],
  ["Francia", "Ile-de-France", "Paris", "MaMA Music & Convention"],
  ["Francia", "Ile-de-France", "Paris", "La Gaite Lyrique"],
  ["Alemania", "Hamburg", "Hamburg", "Reeperbahn Festival"],
  ["Alemania", "Berlin", "Berlin", "Musicboard Berlin"],
  ["Paises Bajos", "Groningen", "Groningen", "Eurosonic Noorderslag"],
  ["Dinamarca", "Copenhagen", "Copenhagen", "Music Export Denmark"],
  ["Suecia", "Stockholm", "Stockholm", "Export Music Sweden"],
  ["Suiza", "Zurich", "Zurich", "Pro Helvetia Music"],
  ["Australia", "Queensland", "Brisbane", "BIGSOUND"],
  ["Japon", "Tokyo", "Tokyo", "Music Lane Festival Okinawa Tokyo Japan"],
  ["Corea del Sur", "Seoul", "Seoul", "Zandari Festa"],
  ["Taiwan", "Taipei", "Taipei", "LUCfest"],
  ["Vietnam", "Ho Chi Minh City", "Ho Chi Minh City", "Hozo Music Festival"],
  ["China", "Beijing", "Beijing", "Music China"],
  ["Sudafrica", "Western Cape", "Cape Town", "Music In Africa"],
  ["Libano", "Beirut", "Beirut", "Beirut and Beyond"],
  ["Rusia", "Moscow", "Moscow", "Moscow Music Week"]
].map(([country, region, city, label]) => ({
  country,
  region,
  city,
  label,
  type: "radar_global",
  query: `${label} ${city} music open call band submissions showcase festival arts council booking`
}));

const fallbackPayload = {
  opportunities: [
    {
      id: 1,
      title: "Fondos de Cultura - musica, circulacion e internacionalizacion",
      category: "fondo",
      continent: "Latinoamerica",
      country: "Chile",
      region: "Metropolitana",
      city: "Santiago",
      lat: -33.4489,
      lng: -70.6693,
      deadline: null,
      eventDate: null,
      genres: ["rock", "folk", "fusion", "experimental", "progresivo", "indie"],
      requirements: ["Revisar bases vigentes.", "Preparar dossier, presupuesto, EPK, material en vivo y antecedentes."],
      url: "https://www.fondosdecultura.cl/",
      sourceName: "Fondos de Cultura",
      sourceType: "institucion",
      lastChecked: null,
      linkStatus: "requires_review",
      confidence: 0.86,
      summary: "Portal oficial chileno para financiamiento, circulacion, grabacion e internacionalizacion musical."
    },
    {
      id: 2,
      title: "Feria Pulsar - showcases e industria musical chilena",
      category: "showcase",
      continent: "Latinoamerica",
      country: "Chile",
      region: "Los Rios",
      city: "Valdivia",
      lat: -39.8142,
      lng: -73.2459,
      deadline: null,
      eventDate: null,
      genres: ["rock", "folk", "fusion", "experimental", "indie"],
      requirements: ["Monitorear convocatoria vigente.", "Tener EPK, redes publicas, press kit y contacto de booking."],
      url: "https://www.feriapulsar.cl/",
      sourceName: "Feria Pulsar",
      sourceType: "showcase",
      lastChecked: null,
      linkStatus: "requires_review",
      confidence: 0.82,
      summary: "Fuente relevante para vitrinas, ruedas de industria y circulacion nacional."
    },
    {
      id: 3,
      title: "Fluvial - mercado y encuentro musical en Valdivia",
      category: "mercado",
      continent: "Latinoamerica",
      country: "Chile",
      region: "Los Rios",
      city: "Valdivia",
      lat: -39.8142,
      lng: -73.2459,
      deadline: null,
      eventDate: null,
      genres: ["rock", "folk", "fusion", "experimental", "world"],
      requirements: ["Revisar llamados anuales.", "Preparar bio, links de audio/video, material promocional y objetivos de mercado."],
      url: "https://fluvial.cl/",
      sourceName: "Fluvial",
      sourceType: "mercado",
      lastChecked: null,
      linkStatus: "requires_review",
      confidence: 0.8,
      summary: "Mercado chileno clave para artistas, sellos, programadores, festivales y exportacion musical."
    },
    {
      id: 4,
      title: "IMESUR - industria musical independiente",
      category: "conferencia",
      continent: "Latinoamerica",
      country: "Chile",
      region: "Metropolitana",
      city: "Santiago",
      lat: -33.4489,
      lng: -70.6693,
      deadline: null,
      eventDate: null,
      genres: ["rock", "folk", "fusion", "experimental", "indie"],
      requirements: ["Monitorear inscripciones, ruedas y showcases.", "Preparar perfil publico y objetivos de circulacion."],
      url: "https://imesur.cl/",
      sourceName: "IMESUR",
      sourceType: "mercado",
      lastChecked: null,
      linkStatus: "requires_review",
      confidence: 0.76,
      summary: "Espacio de industria musical con foco independiente y redes latinoamericanas."
    },
    {
      id: 5,
      title: "Escuelas de Rock - programas publicos y redes regionales",
      category: "programa_publico",
      continent: "Latinoamerica",
      country: "Chile",
      region: "Nacional",
      city: "Chile",
      lat: -33.4489,
      lng: -70.6693,
      deadline: null,
      eventDate: null,
      genres: ["rock", "folk", "fusion", "experimental", "progresivo"],
      requirements: ["Revisar convocatorias regionales.", "Mantener perfil publico, registro en vivo y datos de contacto actualizados."],
      url: "https://www.cultura.gob.cl/escuelasderock/",
      sourceName: "Escuelas de Rock",
      sourceType: "institucion",
      lastChecked: null,
      linkStatus: "requires_review",
      confidence: 0.75,
      summary: "Programa publico chileno para escenas musicales, formacion, redes y posibles espacios de circulacion."
    },
    {
      id: 6,
      title: "Balmaceda Arte Joven - espacios y convocatorias artisticas",
      category: "centro_cultural",
      continent: "Latinoamerica",
      country: "Chile",
      region: "Nacional",
      city: "Chile",
      lat: -33.4489,
      lng: -70.6693,
      deadline: null,
      eventDate: null,
      genres: ["rock", "folk", "fusion", "experimental", "indie"],
      requirements: ["Monitorear sedes y convocatorias.", "Preparar propuesta de concierto, taller o residencia."],
      url: "https://www.balmacedartejoven.cl/",
      sourceName: "Balmaceda Arte Joven",
      sourceType: "centro_cultural",
      lastChecked: null,
      linkStatus: "requires_review",
      confidence: 0.7,
      summary: "Red cultural chilena con sedes, actividades y posibles convocatorias para artistas jovenes."
    },
    {
      id: 7,
      title: "GAM - programacion y espacios culturales",
      category: "centro_cultural",
      continent: "Latinoamerica",
      country: "Chile",
      region: "Metropolitana",
      city: "Santiago",
      lat: -33.44,
      lng: -70.639,
      deadline: null,
      eventDate: null,
      genres: ["rock", "folk", "fusion", "experimental"],
      requirements: ["Revisar lineas curatoriales y programacion.", "Preparar propuesta tecnica, EPK y dossier artistico."],
      url: "https://gam.cl/",
      sourceName: "GAM",
      sourceType: "centro_cultural",
      lastChecked: null,
      linkStatus: "requires_review",
      confidence: 0.68,
      summary: "Centro cultural chileno con programacion publica y oportunidades de vinculacion artistica."
    },
    {
      id: 8,
      title: "Matucana 100 - musica, salas y programacion",
      category: "centro_cultural",
      continent: "Latinoamerica",
      country: "Chile",
      region: "Metropolitana",
      city: "Santiago",
      lat: -33.444,
      lng: -70.682,
      deadline: null,
      eventDate: null,
      genres: ["rock", "folk", "fusion", "experimental", "indie"],
      requirements: ["Monitorear programacion y llamados.", "Enviar propuesta clara con ficha tecnica, enlaces y antecedentes."],
      url: "https://www.m100.cl/",
      sourceName: "Matucana 100",
      sourceType: "centro_cultural",
      lastChecked: null,
      linkStatus: "requires_review",
      confidence: 0.68,
      summary: "Espacio cultural chileno para programacion y potencial circulacion escenica."
    },
    {
      id: 9,
      title: "Rockaxis - revista y medio musical",
      category: "prensa",
      continent: "Latinoamerica",
      country: "Chile",
      region: "Metropolitana",
      city: "Santiago",
      lat: -33.4489,
      lng: -70.6693,
      deadline: null,
      eventDate: null,
      genres: ["rock", "metal", "progresivo", "experimental", "alternativo"],
      requirements: ["Preparar press kit, single, video o noticia verificable.", "Contactar solo por canales publicos del medio."],
      url: "https://www.rockaxis.com/",
      sourceName: "Rockaxis",
      sourceType: "prensa",
      lastChecked: null,
      linkStatus: "requires_review",
      confidence: 0.7,
      summary: "Medio musical relevante para prensa, agenda, difusion y perfiles publicos de rock."
    },
    {
      id: 10,
      title: "Radio Futuro - agenda y difusion rock",
      category: "radio",
      continent: "Latinoamerica",
      country: "Chile",
      region: "Metropolitana",
      city: "Santiago",
      lat: -33.4489,
      lng: -70.6693,
      deadline: null,
      eventDate: null,
      genres: ["rock", "progresivo", "clasico", "alternativo"],
      requirements: ["Mantener lanzamiento verificable y contacto publico.", "Revisar programas, agenda y canales oficiales."],
      url: "https://www.futuro.cl/",
      sourceName: "Radio Futuro",
      sourceType: "radio",
      lastChecked: null,
      linkStatus: "requires_review",
      confidence: 0.66,
      summary: "Radio chilena especializada en rock, util para agenda, prensa y seguimiento de escena."
  },
  {
    id: 17,
    title: "GAM media partners - La Tercera, Radio 13C y prensa cultural",
    category: "prensa",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Metropolitana",
    city: "Santiago",
    lat: -33.4489,
    lng: -70.6693,
    deadline: null,
    eventDate: null,
    genres: ["rock", "folk", "fusion", "experimental", "indie"],
    requirements: ["Rastrear media partners de GAM, notas de musica y entrevistas.", "Preparar press kit, single/video, bajada de prensa y contacto publico.", "Buscar secciones Culto, Radio 13C, agenda cultural e Instagram."],
    url: "https://www.google.com/search?q=GAM+media+partner+La+Tercera+Radio+13C+musica+bandas+entrevista+site%3Ainstagram.com+OR+site%3Alatercera.com+OR+site%3A13c.cl",
    sourceName: "Motor perfiles GAM media partners",
    sourceType: "prensa",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.72,
    summary: "Radar para encontrar perfiles y canales de difusion conectados a GAM: media partners, prensa cultural, radios y publicaciones de musica."
  },
  {
    id: 18,
    title: "Rockaxis perfiles - web, Instagram y entrevistas de bandas",
    category: "prensa",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Metropolitana",
    city: "Santiago",
    lat: -33.4489,
    lng: -70.6693,
    deadline: null,
    eventDate: null,
    genres: ["rock", "metal", "progresivo", "experimental", "alternativo"],
    requirements: ["Buscar perfil oficial, Instagram, noticias, entrevistas y agenda.", "Enviar solo material verificable con press kit, single/video, fecha de lanzamiento y contacto de prensa."],
    url: "https://www.google.com/search?q=Rockaxis+Instagram+oficial+entrevista+bandas+rock+Chile+agenda+single+EPK",
    sourceName: "Rockaxis",
    sourceType: "prensa",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.72,
    summary: "Busqueda dedicada para ubicar perfiles publicos de Rockaxis y rutas de difusion para bandas de rock, metal, progresivo y experimental."
  },
  {
    id: 19,
    title: "Radio Futuro perfiles - programas, agenda e Instagram",
    category: "radio",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Metropolitana",
    city: "Santiago",
    lat: -33.4489,
    lng: -70.6693,
    deadline: null,
    eventDate: null,
    genres: ["rock", "progresivo", "clasico", "alternativo"],
    requirements: ["Rastrear programas, agenda, Instagram y notas de Radio Futuro.", "Preparar comunicado breve, links, foto, fecha de lanzamiento/concierto y contacto de prensa."],
    url: "https://www.google.com/search?q=Radio+Futuro+Instagram+programas+rock+Chile+bandas+agenda+entrevista+conciertos",
    sourceName: "Radio Futuro",
    sourceType: "radio",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.7,
    summary: "Motor para encontrar perfiles publicos y programas de Radio Futuro relacionados con rock chileno, conciertos y difusion."
  },
  {
    id: 20,
    title: "Radios y medios rock Chile - Sonar, Rock & Pop, Concierto, Subela",
    category: "prensa",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Metropolitana",
    city: "Santiago",
    lat: -33.4489,
    lng: -70.6693,
    deadline: null,
    eventDate: null,
    genres: ["rock", "folk", "fusion", "experimental", "indie", "alternativo"],
    requirements: ["Buscar perfiles y programas activos.", "Revisar si publican entrevistas, estrenos, agenda o sesiones.", "Preparar press kit, propuesta de nota y links publicos."],
    url: "https://www.google.com/search?q=Sonar+FM+Rock+and+Pop+Radio+Concierto+Subela+Radio+bandas+chilenas+entrevistas+Instagram",
    sourceName: "Motor radios y medios Chile",
    sourceType: "radio",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.68,
    summary: "Radar de radios y medios que pueden servir para difusion, entrevistas, agenda y deteccion de escenas nuevas."
    },
    {
      id: 11,
      title: "Quemasucabeza - sello independiente chileno",
      category: "sello",
      continent: "Latinoamerica",
      country: "Chile",
      region: "Metropolitana",
      city: "Santiago",
      lat: -33.4489,
      lng: -70.6693,
      deadline: null,
      eventDate: null,
      genres: ["rock", "indie", "experimental", "folk", "fusion"],
      requirements: ["Revisar catalogo y contacto publico.", "Enviar solo material alineado con linea editorial del sello."],
      url: "https://www.quemasucabeza.com/",
      sourceName: "Quemasucabeza",
      sourceType: "sello",
      lastChecked: null,
      linkStatus: "requires_review",
      confidence: 0.64,
      summary: "Sello chileno independiente para investigacion de perfiles, catalogo y redes de difusion."
    },
    {
      id: 12,
      title: "Lotus Producciones - productora y cartelera",
      category: "productora",
      continent: "Latinoamerica",
      country: "Chile",
      region: "Metropolitana",
      city: "Santiago",
      lat: -33.4489,
      lng: -70.6693,
      deadline: null,
      eventDate: null,
      genres: ["rock", "fusion", "experimental", "alternativo"],
      requirements: ["Investigar cartelera y contactos publicos.", "Preparar dossier profesional antes de contacto de booking."],
      url: "https://www.lotuspro.cl/",
      sourceName: "Lotus Producciones",
      sourceType: "productora",
      lastChecked: null,
      linkStatus: "requires_review",
      confidence: 0.62,
      summary: "Productora chilena relevante para investigacion de circuitos, conciertos y posibles contactos profesionales."
    },
    {
      id: 13,
      title: "BAFIM - mercado musical",
      category: "mercado",
      continent: "Latinoamerica",
      country: "Argentina",
      region: "Buenos Aires",
      city: "Buenos Aires",
      lat: -34.6037,
      lng: -58.3816,
      deadline: null,
      eventDate: null,
      genres: ["rock", "indie", "folk", "fusion"],
      requirements: ["Monitorear convocatorias de showcases, ruedas de negocio y acreditacion profesional."],
      url: "https://bafim.buenosaires.gob.ar/",
      sourceName: "BAFIM",
      sourceType: "mercado",
      lastChecked: null,
      linkStatus: "requires_review",
      confidence: 0.74,
      summary: "Mercado musical argentino para circulacion regional, networking y programadores."
    },
    {
      id: 14,
      title: "Rock al Parque - festival publico de rock",
      category: "festival",
      continent: "Latinoamerica",
      country: "Colombia",
      region: "Bogota",
      city: "Bogota",
      lat: 4.711,
      lng: -74.0721,
      deadline: null,
      eventDate: null,
      genres: ["rock", "metal", "progresivo", "experimental", "alternativo"],
      requirements: ["Monitorear convocatorias oficiales.", "Preparar EPK, material en vivo e historial de presentaciones."],
      url: "https://www.rockalparque.gov.co/",
      sourceName: "Rock al Parque",
      sourceType: "festival",
      lastChecked: null,
      linkStatus: "requires_review",
      confidence: 0.74,
      summary: "Festival publico latinoamericano de alto valor para bandas de rock y sonidos alternativos."
    }
  ],
  sources: [
    { id: 1, name: "Fondos de Cultura", continent: "Latinoamerica", country: "Chile", region: "Metropolitana", type: "institucion", url: "https://www.fondosdecultura.cl/", linkStatus: "requires_review" },
    { id: 2, name: "Feria Pulsar", continent: "Latinoamerica", country: "Chile", region: "Los Rios", type: "showcase", url: "https://www.feriapulsar.cl/", linkStatus: "requires_review" },
    { id: 3, name: "Fluvial", continent: "Latinoamerica", country: "Chile", region: "Los Rios", type: "mercado", url: "https://fluvial.cl/", linkStatus: "requires_review" },
    { id: 4, name: "IMESUR", continent: "Latinoamerica", country: "Chile", region: "Metropolitana", type: "mercado", url: "https://imesur.cl/", linkStatus: "requires_review" },
    { id: 5, name: "Escuelas de Rock", continent: "Latinoamerica", country: "Chile", region: "Nacional", type: "institucion", url: "https://www.cultura.gob.cl/escuelasderock/", linkStatus: "requires_review" },
    { id: 6, name: "Balmaceda Arte Joven", continent: "Latinoamerica", country: "Chile", region: "Nacional", type: "centro_cultural", url: "https://www.balmacedartejoven.cl/", linkStatus: "requires_review" },
    { id: 7, name: "GAM", continent: "Latinoamerica", country: "Chile", region: "Metropolitana", type: "centro_cultural", url: "https://gam.cl/", linkStatus: "requires_review" },
    { id: 8, name: "Matucana 100", continent: "Latinoamerica", country: "Chile", region: "Metropolitana", type: "centro_cultural", url: "https://www.m100.cl/", linkStatus: "requires_review" },
    { id: 9, name: "Rockaxis", continent: "Latinoamerica", country: "Chile", region: "Metropolitana", type: "prensa", url: "https://www.rockaxis.com/", linkStatus: "requires_review" },
    { id: 10, name: "Radio Futuro", continent: "Latinoamerica", country: "Chile", region: "Metropolitana", type: "radio", url: "https://www.futuro.cl/", linkStatus: "requires_review" },
    { id: 11, name: "La Tercera Culto", continent: "Latinoamerica", country: "Chile", region: "Metropolitana", type: "prensa", url: "https://www.latercera.com/culto/", linkStatus: "requires_review" },
    { id: 12, name: "Radio 13C", continent: "Latinoamerica", country: "Chile", region: "Metropolitana", type: "radio", url: "https://www.13c.cl/", linkStatus: "requires_review" },
    { id: 13, name: "Sonar FM", continent: "Latinoamerica", country: "Chile", region: "Metropolitana", type: "radio", url: "https://www.sonarfm.cl/", linkStatus: "requires_review" },
    { id: 14, name: "Rock and Pop Chile", continent: "Latinoamerica", country: "Chile", region: "Metropolitana", type: "radio", url: "https://www.rockandpop.cl/", linkStatus: "requires_review" },
    { id: 15, name: "Radio Concierto", continent: "Latinoamerica", country: "Chile", region: "Metropolitana", type: "radio", url: "https://www.concierto.cl/", linkStatus: "requires_review" },
    { id: 16, name: "Quemasucabeza", continent: "Latinoamerica", country: "Chile", region: "Metropolitana", type: "sello", url: "https://www.quemasucabeza.com/", linkStatus: "requires_review" },
    { id: 17, name: "Lotus Producciones", continent: "Latinoamerica", country: "Chile", region: "Metropolitana", type: "productora", url: "https://www.lotuspro.cl/", linkStatus: "requires_review" },
    { id: 18, name: "Instagram - hashtag rockchileno", continent: "Latinoamerica", country: "Chile", region: "Digital", type: "red_social", url: "https://www.instagram.com/explore/tags/rockchileno/", linkStatus: "requires_review" },
    { id: 19, name: "TikTok - hashtag rockchileno", continent: "Latinoamerica", country: "Chile", region: "Digital", type: "red_social", url: "https://www.tiktok.com/tag/rockchileno", linkStatus: "requires_review" },
    { id: 20, name: "BAFIM", continent: "Latinoamerica", country: "Argentina", region: "Buenos Aires", type: "mercado", url: "https://bafim.buenosaires.gob.ar/", linkStatus: "requires_review" },
    { id: 21, name: "Rock al Parque", continent: "Latinoamerica", country: "Colombia", region: "Bogota", type: "festival", url: "https://www.rockalparque.gov.co/", linkStatus: "requires_review" }
  ]
};

const chileRegionalFallbackOpportunities = [
  {
    id: 101,
    title: "Teatro Biobio - programacion y musica en Concepcion",
    category: "centro_cultural",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Biobio",
    city: "Concepcion",
    lat: -36.82699,
    lng: -73.04977,
    deadline: null,
    eventDate: null,
    genres: ["rock", "fusion", "folk", "experimental", "indie"],
    requirements: ["Revisar cartelera oficial e Instagram.", "Validar fecha de publicacion, fecha del evento y ticketera.", "Preparar ficha tecnica, EPK y propuesta."],
    url: "https://teatrobiobio.cl/teatro/",
    sourceName: "Teatro Biobio",
    sourceType: "centro_cultural",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.74,
    summary: "Centro de artes escenicas y musica en Concepcion, prioritario para conciertos y agenda cultural regional."
  },
  {
    id: 102,
    title: "Instagram Teatro Biobio - posts con fechas y cartelera",
    category: "instagram_agenda",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Biobio",
    city: "Concepcion",
    lat: -36.82699,
    lng: -73.04977,
    deadline: null,
    eventDate: null,
    genres: ["rock", "fusion", "folk", "experimental", "indie"],
    requirements: ["Abrir post/reel.", "Leer fecha de publicacion, fecha del evento, hora y entrada.", "Confirmar vigencia antes de contactar."],
    url: "https://www.instagram.com/teatrobiobio/",
    sourceName: "Instagram Teatro Biobio",
    sourceType: "red_social",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.7,
    summary: "Perfil publico regional con cartelera, conciertos y eventos culturales en Concepcion."
  },
  {
    id: 103,
    title: "Teatro Municipal de Chillan - musica y programacion regional",
    category: "centro_cultural",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Nuble",
    city: "Chillan",
    lat: -36.60664,
    lng: -72.10344,
    deadline: null,
    eventDate: null,
    genres: ["rock", "folk", "fusion", "experimental", "indie"],
    requirements: ["Revisar programacion artistica.", "Confirmar fechas y condiciones.", "Preparar dossier, links publicos y ficha tecnica."],
    url: "https://teatrochillan.cl/",
    sourceName: "Teatro Municipal de Chillan",
    sourceType: "centro_cultural",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.72,
    summary: "Espacio regional con programacion artistica permanente para musica y actividades culturales."
  },
  {
    id: 104,
    title: "Centro Cultural Municipal de Chillan - agenda e Instagram",
    category: "centro_cultural",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Nuble",
    city: "Chillan",
    lat: -36.60664,
    lng: -72.10344,
    deadline: null,
    eventDate: null,
    genres: ["rock", "folk", "fusion", "experimental", "indie"],
    requirements: ["Revisar noticias e Instagram @ccmch_.", "Leer fecha de publicacion.", "Validar entrada, hora y contacto."],
    url: "https://ccmch.cl/",
    sourceName: "Centro Cultural Municipal de Chillan",
    sourceType: "centro_cultural",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.7,
    summary: "Fuente municipal para conciertos, entrada liberada y programacion cultural en Chillan."
  },
  {
    id: 105,
    title: "Centro Cultural Teatro Centenario - La Serena y Coquimbo",
    category: "centro_cultural",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Coquimbo",
    city: "La Serena",
    lat: -29.90267,
    lng: -71.25194,
    deadline: null,
    eventDate: null,
    genres: ["rock", "folk", "fusion", "experimental", "indie"],
    requirements: ["Revisar eventos activos.", "Confirmar fecha y ticketera.", "Preparar propuesta y press kit regional."],
    url: "https://teatrocentenario.cl/",
    sourceName: "Centro Cultural Teatro Centenario",
    sourceType: "centro_cultural",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.7,
    summary: "Espacio cultural de La Serena/Coquimbo para conciertos, festivales y actividades musicales."
  },
  {
    id: 106,
    title: "Festival REC - Concepcion y concurso de bandas emergentes",
    category: "festival",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Biobio",
    city: "Concepcion",
    lat: -36.82699,
    lng: -73.04977,
    deadline: null,
    eventDate: null,
    genres: ["rock", "folk", "fusion", "experimental", "progresivo", "indie"],
    requirements: ["Revisar reels/posts oficiales y bases.", "Leer fecha de publicacion.", "Preparar postulacion, material en vivo y EPK."],
    url: "https://www.instagram.com/reel/DV_gtwKDjrJ/",
    sourceName: "Instagram Festival REC",
    sourceType: "red_social",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.7,
    summary: "Señal publica de Instagram sobre REC, programacion y concurso de bandas emergentes en Biobio."
  },
  {
    id: 107,
    title: "Fondo de Iniciativas Culturales Valparaiso - convocatoria municipal",
    category: "fondo",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Valparaiso",
    city: "Valparaiso",
    lat: -33.04724,
    lng: -71.61269,
    deadline: null,
    eventDate: null,
    genres: ["rock", "folk", "fusion", "experimental", "indie"],
    requirements: ["Abrir publicacion.", "Revisar bases, fecha de publicacion, plazo y presupuesto.", "Preparar proyecto y antecedentes."],
    url: "https://www.instagram.com/p/DRdYS0aDzOm/",
    sourceName: "Instagram Fondo Cultural Valparaiso",
    sourceType: "red_social",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.68,
    summary: "Post publico detectado sobre convocatoria cultural municipal en Valparaiso."
  },
  {
    id: 108,
    title: "PortalTickets PortalDisc - eventos musicales en regiones",
    category: "agenda",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Nacional",
    city: "Chile",
    lat: -35.67515,
    lng: -71.54297,
    deadline: null,
    eventDate: null,
    genres: ["rock", "folk", "fusion", "experimental", "indie"],
    requirements: ["Buscar por ciudad.", "Confirmar fecha de publicacion del evento, venta de entradas y contacto.", "Rastrear salas y productoras."],
    url: "https://portaldisc.com/tickets/",
    sourceName: "PortalTickets PortalDisc",
    sourceType: "ticketera_agenda",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.66,
    summary: "Ticketera y agenda de musica chilena con eventos en distintas regiones."
  },
  {
    id: 109,
    title: "Corporacion Cultural Municipal de Los Angeles - agenda cultural",
    category: "centro_cultural",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Biobio",
    city: "Los Angeles",
    lat: -37.46973,
    lng: -72.35366,
    deadline: null,
    eventDate: null,
    genres: ["rock", "folk", "fusion", "experimental", "indie"],
    requirements: ["Revisar publicaciones publicas.", "Leer fecha, hora, entrada y contacto.", "Validar si hay convocatoria o espacio de programacion."],
    url: "https://www.facebook.com/ccmlalosangeles/",
    sourceName: "Corporacion Cultural Municipal de Los Angeles",
    sourceType: "centro_cultural",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.62,
    summary: "Fuente publica regional para agenda cultural y conciertos en Los Angeles, Biobio."
  },
  {
    id: 110,
    title: "GAM - musica, cartelera y espacios para artistas",
    category: "centro_cultural",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Metropolitana",
    city: "Santiago",
    lat: -33.4372,
    lng: -70.6352,
    deadline: null,
    eventDate: null,
    genres: ["rock", "folk", "fusion", "experimental", "indie"],
    requirements: ["Revisar agenda, convocatorias y redes publicas.", "Leer fecha de publicacion, evento y contacto.", "Preparar EPK, ficha tecnica y propuesta concreta."],
    url: "https://gam.cl/",
    sourceName: "GAM",
    sourceType: "centro_cultural",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.76,
    summary: "Centro cultural clave en Santiago. Debe rastrearse por cartelera, ciclos, convocatorias y publicaciones recientes."
  },
  {
    id: 111,
    title: "Teatro Municipal Las Condes - conciertos y programacion",
    category: "centro_cultural",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Metropolitana",
    city: "Las Condes",
    lat: -33.4088,
    lng: -70.5671,
    deadline: null,
    eventDate: null,
    genres: ["rock", "folk", "fusion", "experimental", "indie"],
    requirements: ["Revisar programacion y redes.", "Buscar llamados a artistas, ciclos y formatos acusticos.", "Validar fecha, hora, contacto y condiciones."],
    url: "https://www.tmlascondes.cl/",
    sourceName: "Teatro Municipal Las Condes",
    sourceType: "centro_cultural",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.72,
    summary: "Espacio comunal de Las Condes para conciertos, temporadas y posibles ciclos de musica."
  },
  {
    id: 112,
    title: "Santiago comunas - busqueda de centros y municipalidades",
    category: "busqueda_comunal",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Metropolitana",
    city: "Santiago comunas",
    lat: -33.4489,
    lng: -70.6693,
    deadline: null,
    eventDate: null,
    genres: ["rock", "folk", "fusion", "experimental", "indie"],
    requirements: ["Abrir la busqueda.", "Revisar GAM, Las Condes, Providencia, Nunoa, La Reina, San Joaquin y Maipu.", "Leer fecha del post, evento, plazo y contacto."],
    url: "https://www.google.com/search?q=site%3Ainstagram.com%2Fp+OR+site%3Ainstagram.com%2Freel+%22GAM%22+%22Las+Condes%22+%22Providencia%22+%22Nunoa%22+musica+conciertos+bandas+convocatoria",
    sourceName: "Motor publico Santiago comunas",
    sourceType: "busqueda_externa",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.7,
    summary: "Busqueda dirigida a comunas y centros de Santiago donde suelen aparecer ciclos, tocatas, agenda cultural y llamados a artistas."
  },
  {
    id: 113,
    title: "V Region - Valparaiso, Vina, Quilpue y Villa Alemana",
    category: "busqueda_regional",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Valparaiso",
    city: "V Region",
    lat: -33.0472,
    lng: -71.6127,
    deadline: null,
    eventDate: null,
    genres: ["rock", "folk", "fusion", "experimental", "indie"],
    requirements: ["Revisar posts publicos por ciudad.", "Buscar centros culturales, municipios, salas y festivales.", "Confirmar fecha de publicacion y plazo."],
    url: "https://www.google.com/search?q=site%3Ainstagram.com%2Fp+OR+site%3Ainstagram.com%2Freel+%22V+Region%22+Valparaiso+Vina+Quilpue+Villa+Alemana+musica+bandas+convocatoria",
    sourceName: "Motor publico V Region",
    sourceType: "busqueda_externa",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.7,
    summary: "Radar ampliado para comunas de la V Region, no solo Valparaiso centro."
  },
  {
    id: 114,
    title: "VI Region - O'Higgins y Rancagua",
    category: "busqueda_regional",
    continent: "Latinoamerica",
    country: "Chile",
    region: "O'Higgins",
    city: "Rancagua",
    lat: -34.1701,
    lng: -70.7406,
    deadline: null,
    eventDate: null,
    genres: ["rock", "folk", "fusion", "experimental", "indie"],
    requirements: ["Buscar Teatro Regional, municipios y centros culturales.", "Revisar publicaciones recientes.", "Confirmar fecha, plazo y contacto."],
    url: "https://www.google.com/search?q=site%3Ainstagram.com%2Fp+OR+site%3Ainstagram.com%2Freel+%22Rancagua%22+%22O%27Higgins%22+musica+conciertos+bandas+convocatoria",
    sourceName: "Motor publico VI Region",
    sourceType: "busqueda_externa",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.68,
    summary: "Busqueda para detectar espacios y llamados musicales en Rancagua y Region de O'Higgins."
  },
  {
    id: 115,
    title: "VII Region - Maule, Talca y Curico",
    category: "busqueda_regional",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Maule",
    city: "Talca",
    lat: -35.4264,
    lng: -71.6554,
    deadline: null,
    eventDate: null,
    genres: ["rock", "folk", "fusion", "experimental", "indie"],
    requirements: ["Revisar Teatro Regional del Maule, municipios y centros culturales.", "Leer fecha y plazo.", "Confirmar condiciones de participacion."],
    url: "https://www.google.com/search?q=site%3Ainstagram.com%2Fp+OR+site%3Ainstagram.com%2Freel+%22Maule%22+Talca+Curico+musica+conciertos+bandas+convocatoria",
    sourceName: "Motor publico VII Region",
    sourceType: "busqueda_externa",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.68,
    summary: "Radar para Maule/Talca/Curico y circuitos regionales fuera de Santiago."
  },
  {
    id: 116,
    title: "Antofagasta y Calama - agenda cultural norte",
    category: "busqueda_regional",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Antofagasta",
    city: "Antofagasta / Calama",
    lat: -23.6509,
    lng: -70.3975,
    deadline: null,
    eventDate: null,
    genres: ["rock", "folk", "fusion", "experimental", "indie"],
    requirements: ["Buscar teatro municipal, corporaciones culturales y municipios.", "Abrir posts/reels recientes.", "Confirmar fecha, plazo, pago y contacto."],
    url: "https://www.google.com/search?q=site%3Ainstagram.com%2Fp+OR+site%3Ainstagram.com%2Freel+Antofagasta+Calama+musica+conciertos+bandas+convocatoria",
    sourceName: "Motor publico Antofagasta/Calama",
    sourceType: "busqueda_externa",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.68,
    summary: "Busqueda dedicada al norte grande para no depender de resultados generales de Chile."
  },
  {
    id: 117,
    title: "Valdivia - Fluvial, Teatro Cervantes y agenda local",
    category: "busqueda_regional",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Los Rios",
    city: "Valdivia",
    lat: -39.8142,
    lng: -73.2459,
    deadline: null,
    eventDate: null,
    genres: ["rock", "folk", "fusion", "experimental", "indie"],
    requirements: ["Revisar Fluvial, Teatro Cervantes, municipalidad y perfiles de agenda.", "Leer fechas y plazos.", "Confirmar contacto de programacion."],
    url: "https://www.google.com/search?q=site%3Ainstagram.com%2Fp+OR+site%3Ainstagram.com%2Freel+Valdivia+Fluvial+Teatro+Cervantes+musica+conciertos+bandas",
    sourceName: "Motor publico Valdivia",
    sourceType: "busqueda_externa",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.7,
    summary: "Valdivia debe rastrearse por mercado musical, teatro regional y agenda cultural local."
  },
  {
    id: 118,
    title: "Puerto Montt - Teatro Diego Rivera y cultura local",
    category: "busqueda_regional",
    continent: "Latinoamerica",
    country: "Chile",
    region: "Los Lagos",
    city: "Puerto Montt",
    lat: -41.4689,
    lng: -72.9411,
    deadline: null,
    eventDate: null,
    genres: ["rock", "folk", "fusion", "experimental", "indie"],
    requirements: ["Revisar Teatro Diego Rivera, corporacion cultural y agenda municipal.", "Confirmar fecha del evento y plazo.", "Validar pago, entrada y contacto."],
    url: "https://www.google.com/search?q=site%3Ainstagram.com%2Fp+OR+site%3Ainstagram.com%2Freel+%22Puerto+Montt%22+%22Teatro+Diego+Rivera%22+musica+conciertos+bandas",
    sourceName: "Motor publico Puerto Montt",
    sourceType: "busqueda_externa",
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: 0.68,
    summary: "Radar sur para Puerto Montt y espacios culturales locales con programacion musical."
  }
];

const chileRegionalFallbackSources = [
  { name: "Teatro Biobio", region: "Biobio", type: "centro_cultural", url: "https://teatrobiobio.cl/teatro/" },
  { name: "Instagram Teatro Biobio", region: "Biobio", type: "red_social", url: "https://www.instagram.com/teatrobiobio/" },
  { name: "Teatro Municipal de Chillan", region: "Nuble", type: "centro_cultural", url: "https://teatrochillan.cl/" },
  { name: "Centro Cultural Municipal de Chillan", region: "Nuble", type: "centro_cultural", url: "https://ccmch.cl/" },
  { name: "Instagram Centro Cultural Municipal de Chillan", region: "Nuble", type: "red_social", url: "https://www.instagram.com/ccmch_/" },
  { name: "Centro Cultural Teatro Centenario", region: "Coquimbo", type: "centro_cultural", url: "https://teatrocentenario.cl/" },
  { name: "PortalTickets PortalDisc", region: "Nacional", type: "ticketera_agenda", url: "https://portaldisc.com/tickets/" },
  { name: "Banco Ley de Donaciones Culturales", region: "Nacional", type: "institucion", url: "https://donaciones.cultura.gob.cl/proyectos/" },
  { name: "Centro Cultural de Espana Santiago", region: "Metropolitana", type: "centro_cultural", url: "https://www.aecid.es/documents/d/cc-santiago/bases-de-convocatoria-suchai-2027" },
  { name: "Instagram Festival REC", region: "Biobio", type: "red_social", url: "https://www.instagram.com/reel/DV_gtwKDjrJ/" },
  { name: "Instagram Fondo Cultural Valparaiso", region: "Valparaiso", type: "red_social", url: "https://www.instagram.com/p/DRdYS0aDzOm/" },
  { name: "Corporacion Cultural Municipal de Los Angeles", region: "Biobio", type: "centro_cultural", url: "https://www.facebook.com/ccmlalosangeles/" },
  { name: "Instagram GAM", region: "Metropolitana", type: "red_social", url: "https://www.instagram.com/gam.cl/" },
  { name: "Teatro Municipal Las Condes", region: "Metropolitana", type: "centro_cultural", url: "https://www.tmlascondes.cl/" },
  { name: "Corporacion Cultural Las Condes", region: "Metropolitana", type: "centro_cultural", url: "https://www.culturallascondes.cl/" },
  { name: "Centro Cultural La Moneda", region: "Metropolitana", type: "centro_cultural", url: "https://www.cclm.cl/" },
  { name: "Teatro Oriente Providencia", region: "Metropolitana", type: "centro_cultural", url: "https://teatrooriente.cl/" },
  { name: "CENTEX Valparaiso", region: "Valparaiso", type: "centro_cultural", url: "https://centex.cultura.gob.cl/" },
  { name: "Teatro Regional del Maule", region: "Maule", type: "centro_cultural", url: "https://www.teatroregional.cl/" },
  { name: "Cultura Antofagasta", region: "Antofagasta", type: "centro_cultural", url: "https://www.culturaantofagasta.cl/" },
  { name: "Teatro Regional Cervantes Valdivia", region: "Los Rios", type: "centro_cultural", url: "https://teatroregionalcervantes.cl/" },
  { name: "Corporacion Cultural Puerto Montt", region: "Los Lagos", type: "centro_cultural", url: "https://www.culturapuertomontt.cl/" }
].map((source, index) => ({
  id: 100 + index,
  continent: "Latinoamerica",
  country: "Chile",
  linkStatus: "requires_review",
  ...source
}));

fallbackPayload.opportunities.push(...chileRegionalFallbackOpportunities);
fallbackPayload.sources.push(...chileRegionalFallbackSources);

const expandedPublicTargets = [
  ...CHILE_DEEP_SEARCH_TARGETS,
  ...TERRITORIAL_AREA_TARGETS,
  ...LATAM_RECOGNIZED_TARGETS,
  ...GLOBAL_PRIORITY_TARGETS
];

const expandedTargetOpportunities = expandedPublicTargets.map((target, index) => {
  const view = COUNTRY_VIEWS[target.country] || CONTINENT_VIEWS[continentForCountry(target.country)] || CONTINENT_VIEWS.Global;
  return {
    id: 1000 + index,
    title: `${target.label} - radar publico`,
    category: target.type,
    continent: continentForCountry(target.country),
    country: target.country,
    region: target.region,
    city: target.city,
    lat: target.lat ?? view.center[0],
    lng: target.lng ?? view.center[1],
    deadline: null,
    eventDate: null,
    genres: ["rock", "folk", "fusion", "experimental", "indie", "progresivo"],
    requirements: ["Abrir busqueda publica.", "Priorizar web oficial, Instagram publico y agenda cultural reciente.", "Leer fecha de publicacion, fecha del evento, plazo/cierre, pago y contacto."],
    url: googleSearchUrl(`"${target.query}" site:instagram.com/p OR site:instagram.com/reel OR convocatoria OR "open call"`),
    sourceName: target.label,
    sourceType: target.type,
    lastChecked: null,
    linkStatus: "requires_review",
    confidence: target.country === "Chile" ? 0.64 : 0.58,
    summary: `Objetivo de busqueda para detectar oportunidades publicas en ${target.city}, ${target.region}.`
  };
});

const expandedTargetSources = expandedPublicTargets.map((target, index) => ({
  id: 1000 + index,
  name: target.label,
  continent: continentForCountry(target.country),
  country: target.country,
  region: target.region,
  type: target.type,
  url: googleSearchUrl(`"${target.query}" convocatoria musica bandas agenda cultural`),
  linkStatus: "requires_review"
}));

fallbackPayload.opportunities.push(...expandedTargetOpportunities);
fallbackPayload.sources.push(...expandedTargetSources);

let opportunities = [];
let sources = [];
let filtered = [];
let map = null;
let markers = [];
let activeMonth = new Date();
const filters = {
  q: "",
  continent: "all",
  country: "all",
  region: "all",
  category: "all",
  genre: "all",
  link: "public",
  quick: null
};

const els = {
  apiLink: document.getElementById("apiLink"),
  backendStatus: document.getElementById("backendStatus"),
  refreshButton: document.getElementById("refreshButton"),
  searchInput: document.getElementById("searchInput"),
  continentFilter: document.getElementById("continentFilter"),
  countryFilter: document.getElementById("countryFilter"),
  regionFilter: document.getElementById("regionFilter"),
  categoryFilter: document.getElementById("categoryFilter"),
  genreFilter: document.getElementById("genreFilter"),
  linkFilter: document.getElementById("linkFilter"),
  quickFilters: document.getElementById("quickFilters"),
  opportunityList: document.getElementById("opportunityList"),
  resultCount: document.getElementById("resultCount"),
  mapTitle: document.getElementById("mapTitle"),
  sourcesList: document.getElementById("sourcesList"),
  clearFilters: document.getElementById("clearFilters"),
  detailDialog: document.getElementById("detailDialog"),
  detailContent: document.getElementById("detailContent"),
  closeDialog: document.getElementById("closeDialog"),
  calendarTitle: document.getElementById("calendarTitle"),
  calendarDays: document.getElementById("calendarDays"),
  prevMonth: document.getElementById("prevMonth"),
  nextMonth: document.getElementById("nextMonth")
};

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
}

function targetCountries() {
  const seen = new Set();
  return [
    ...TARGET_COUNTRIES,
    ...opportunities.map((item) => ({ continent: itemContinent(item), country: item.country }))
  ].filter((item) => {
    const key = `${item.continent}:${item.country}`;
    if (!item.country || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function continentForCountry(country) {
  if (!country || country === "Global") return "Global";
  const target = TARGET_COUNTRIES.find((item) => item.country === country);
  if (target) return target.continent;
  return "Internacional";
}

function itemContinent(item) {
  return item.continent || continentForCountry(item.country);
}

function asDate(value) {
  if (!value) return null;
  const date = new Date(value + "T00:00:00");
  return Number.isNaN(date.getTime()) ? null : date;
}

function deadlineStatus(deadline) {
  const date = asDate(deadline);
  if (!date) return "sin fecha";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((date - today) / 86400000);
  if (diff < 0) return "vencida";
  if (diff <= 10) return "cierra pronto";
  return "abierta";
}

function publicLink(status) {
  return ["ok", "redirected", "requires_review"].includes(status);
}

function statusLabel(status) {
  const labels = {
    ok: "verificado",
    redirected: "redirige",
    requires_review: "requiere revision",
    soft_fail: "revision",
    blocked: "bloqueado",
    timeout: "timeout",
    broken: "caido"
  };
  return labels[status] || status || "sin revisar";
}

function displayLabel(value) {
  return String(value || "").replaceAll("_", " ");
}

function buildSearchMissions(country) {
  return SEARCH_MISSION_TEMPLATES.map((template) => template.replaceAll("{country}", countrySearchName(country)));
}

function normalizeToken(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function searchPhrase() {
  const parts = [
    filters.q,
    filters.quick,
    filters.category !== "all" ? displayLabel(filters.category) : "",
    filters.genre !== "all" ? filters.genre : ""
  ].filter(Boolean);
  return parts.length ? parts.join(" ") : "festival bandas rock convocatoria";
}

function countrySearchName(country) {
  const aliases = {
    "Estados Unidos": "Estados Unidos EEUU USA United States",
    Inglaterra: "Inglaterra England Reino Unido UK",
    Holanda: "Holanda Paises Bajos Netherlands",
    "Paises Bajos": "Paises Bajos Holanda Netherlands Nederland",
    Libano: "Libano Lebanon",
    Japon: "Japon Japan",
    "Corea del Sur": "Corea del Sur South Korea",
    Sudafrica: "Sudafrica South Africa",
    Alemania: "Alemania Germany Deutschland",
    Francia: "Francia France",
    Espana: "Espana Spain España",
    Marruecos: "Marruecos Morocco Maroc المغرب",
    China: "China 中国",
    Taiwan: "Taiwan 臺灣 台灣",
    Vietnam: "Vietnam Việt Nam",
    Irlanda: "Irlanda Ireland Eire",
    Canada: "Canada Canadá",
    Rusia: "Rusia Russia Россия",
    Gales: "Gales Wales Cymru",
    Brasil: "Brasil Brazil",
    Mexico: "Mexico México",
    Peru: "Peru Perú",
    Islandia: "Islandia Iceland Ísland"
  };
  return aliases[country] || country;
}

function googleSearchUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function instagramHashtagUrl(tag) {
  return `https://www.instagram.com/explore/tags/${encodeURIComponent(normalizeToken(tag))}/`;
}

function tiktokSearchUrl(query) {
  return `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;
}

function territoryTargetsForSelection(country) {
  const specific = TERRITORIAL_AREA_TARGETS
    .filter((target) => target.country === country)
    .filter((target) => filters.region === "all" || target.region === filters.region || target.city === filters.region);
  if (specific.length) return specific.slice(0, filters.region === "all" ? 14 : 18);

  const view = COUNTRY_VIEWS[country] || CONTINENT_VIEWS[continentForCountry(country)] || CONTINENT_VIEWS.Global;
  return (ADMIN_DIVISION_TERMS[country] || DEFAULT_ADMIN_DIVISION_TERMS).map((term, index) => ({
    country,
    region: "Territorial",
    city: displayLabel(term),
    label: `${displayLabel(country)} - ${term}`,
    lat: view.center[0] + (index - 2) * 0.35,
    lng: view.center[1] + (index - 2) * 0.35,
    type: "radar_territorial",
    query: `${country} ${term} cultura musica bandas convocatoria centro cultural festival`
  }));
}

function buildExternalSearchCards() {
  const country = selectedSearchCountry();
  const queryCountry = countrySearchName(country);
  const scope = selectedScopeLabel();
  const phrase = searchPhrase();
  const compactCountry = normalizeToken(country);
  const searches = [
    {
      title: `Instagram posts publicos - ${country}`,
      category: "instagram_posts",
      url: googleSearchUrl(`site:instagram.com/p "${queryCountry}" ${phrase} teloneros showcase convocatoria`),
      summary: "Busqueda directa en Google sobre posts publicos de Instagram. Prioriza convocatorias, teloneros, showcases, festivales y concursos."
    },
    {
      title: `Instagram reels publicos - ${country}`,
      category: "instagram_reels",
      url: googleSearchUrl(`site:instagram.com/reel "${queryCountry}" bandas rock festival convocatoria productora`),
      summary: "Revisa reels publicos donde productoras, festivales y salas publican llamados rapidos o busquedas de bandas."
    },
    {
      title: `Hashtag Instagram #rock${compactCountry}`,
      category: "instagram_hashtag",
      url: instagramHashtagUrl(`rock${country}`),
      summary: "Hashtag publico para rastrear bandas, fechas, salas y escenas locales. Usalo como puerta de entrada a perfiles activos."
    },
    {
      title: `Hashtag Instagram #bandas${compactCountry}`,
      category: "instagram_hashtag",
      url: instagramHashtagUrl(`bandas${country}`),
      summary: "Hashtag publico orientado a bandas. Sirve para ubicar convocatorias, colaboraciones, teloneros y perfiles de escena."
    },
    {
      title: `TikTok busqueda publica - ${country}`,
      category: "tiktok",
      url: tiktokSearchUrl(`${queryCountry} bandas rock festival convocatoria teloneros`),
      summary: "Busqueda publica en TikTok para detectar publicaciones rapidas de conciertos, festivales, salas y escenas emergentes."
    },
    {
      title: `Productoras, booking y sellos - ${scope}`,
      category: "booking_productoras",
      url: googleSearchUrl(`"${queryCountry}" productora booking sello independiente "demo submission" OR "submit your music" OR "artist submissions" OR "presentar artistas" OR "buscamos bandas"`),
      summary: "Busqueda ampliada con lenguaje real de productoras, sellos y booking: demo submission, artist submissions, presentar artistas, roster, A&R y busquedas de bandas."
    },
    {
      title: `Fondos, municipios y centros culturales - ${country}`,
      category: "fondos_espacios",
      url: googleSearchUrl(`"${queryCountry}" municipio centro cultural fondos musica bandas convocatoria pago honorarios`),
      summary: "Busqueda de espacios publicos con pago, fondos, municipios, centros culturales y convocatorias institucionales."
    }
  ];
  territoryTargetsForSelection(country).forEach((target) => {
    searches.push(
      {
        title: `Mapa territorial - ${target.label}`,
        category: "radar_territorial",
        url: googleSearchUrl(`"${target.query}" "convocatoria" OR "conciertos" OR "buscamos bandas" OR "open call"`),
        summary: `Busqueda por unidad territorial (${target.region}/${target.city}). Usa el concepto local: comuna, municipio, departamento, provincia, estado o condado.`,
        lat: target.lat,
        lng: target.lng,
        region: target.region,
        city: target.city
      },
      {
        title: `Instagram territorial - ${target.label}`,
        category: "instagram_territorial",
        url: googleSearchUrl(`site:instagram.com/p OR site:instagram.com/reel "${target.query}" musica bandas after:2025-01-01`),
        summary: "Rastrea publicaciones recientes de cultura local, municipalidades, centros culturales, festivales y llamados a bandas.",
        lat: target.lat,
        lng: target.lng,
        region: target.region,
        city: target.city
      }
    );
  });
  const isLatamScope = filters.continent === "Latinoamerica" || WORLD_EXTRA_COUNTRIES.Latinoamerica.includes(country);
  if (isLatamScope) {
    LATAM_SEMANTIC_SEARCH_TERMS.forEach((term) => {
      searches.push(
        {
          title: `Radar semantico LatAm - ${term}`,
          category: "radar_semantico",
          url: googleSearchUrl(`"${queryCountry}" "${term}" rock OR folk OR fusion OR experimental OR progresivo`),
          summary: "Busqueda sensible a sinonimos de oportunidad: teloneros, bandas extranjeras, showcases, movilidad, residencias y llamados internacionales."
        },
        {
          title: `Instagram semantico LatAm - ${term}`,
          category: "instagram_semantico",
          url: googleSearchUrl(`site:instagram.com/p OR site:instagram.com/reel "${queryCountry}" "${term}" bandas musica after:2025-01-01`),
          summary: "Rastrea posts/reels recientes donde la oportunidad puede aparecer como publicidad, caption o llamado rapido."
        }
      );
    });
  }
  const globalTerms = GLOBAL_PUBLIC_SEARCH_TERMS.slice(0, filters.continent === "Global" ? 14 : 8);
  globalTerms.forEach((term) => {
    searches.push({
      title: `Global multiidioma - ${term}`,
      category: "global_open_call",
      url: googleSearchUrl(`"${queryCountry}" "${term}" rock OR folk OR experimental OR fusion`),
      summary: "Busqueda global en ingles o idioma local para detectar convocatorias, festivales, residencias y showcases que acepten artistas de otros paises."
    });
  });
  [
    ["Instagram internacional", `site:instagram.com/p "${queryCountry}" "international artists" "open call" music`],
    ["Instagram bandas extranjeras", `site:instagram.com/reel "${queryCountry}" "foreign artists" "festival" music`],
    ["On the Move movilidad", `site:on-the-move.org "${queryCountry}" music mobility artists`],
    ["Culture360 Asia Europa", `site:culture360.asef.org "${queryCountry}" music open call artists`],
    ["Submittable music", `site:submittable.com "${queryCountry}" music artist open call`],
    ["FilmFreeway music showcase", `site:filmfreeway.com "${queryCountry}" music festival submissions`],
    ["GitHub listas abiertas", `site:github.com "${queryCountry}" music opportunities open calls festivals artists`],
    ["GitHub booking/festivales", `site:github.com "${queryCountry}" booking agency festival submissions independent bands`]
  ].forEach(([title, query]) => {
    searches.push({
      title: `${title} - ${country}`,
      category: "global_source",
      url: googleSearchUrl(query),
      summary: "Fuente global revisable para oportunidades abiertas, movilidad, showcases, festivales o postulaciones internacionales."
    });
  });
  const publicTargets = (COUNTRY_PUBLIC_SPACE_TARGETS[country] || []).slice(0, country === "Chile" ? 18 : 10);
  publicTargets.forEach((target) => {
    searches.push(
      {
        title: `Instagram publico en Google - ${target}`,
        category: "instagram_espacio_publico",
        url: googleSearchUrl(`site:instagram.com/p OR site:instagram.com/reel "${target}" "convocatoria" OR "presentar artistas" OR "postula tu proyecto" OR "programacion artistica" music musica`),
        summary: "Rastrea posts/reels publicos encontrados por Google para detectar llamados a bandas, artistas invitados, programacion y fechas reales."
      },
      {
        title: `Espacio publico / teatro / museo - ${target}`,
        category: "espacio_publico",
        url: googleSearchUrl(`"${target}" "musica" "convocatoria" OR "open call" OR "presentar artistas" OR "artist submissions"`),
        summary: "Busqueda oficial y publica de municipios, teatros, museos, centros culturales y salas que puedan programar o pagar artistas."
      }
    );
  });
  if (country === "Chile") {
    CHILE_MEDIA_PROFILE_TARGETS.forEach((target) => {
      searches.push(
        {
          title: `Perfil prensa/radio - ${target}`,
          category: "perfil_medio",
          url: googleSearchUrl(`"${target}" contacto prensa musica bandas "EPK" OR "enviar single" OR "entrevista" OR "agenda"`),
          summary: "Busqueda dirigida a perfiles publicos de medios, radios, programas y media partners. Revisar contacto, fecha de publicacion, notas recientes e Instagram."
        },
        {
          title: `Instagram perfil publico - ${target}`,
          category: "instagram_perfil_medio",
          url: googleSearchUrl(`site:instagram.com "${target}" musica bandas rock entrevista agenda`),
          summary: "Encuentra perfiles y publicaciones publicas de Instagram vinculadas a prensa/radio/media partners para difusion y contacto responsable."
        }
      );
    });
    const promotionTags = CHILE_INSTAGRAM_PROMOTION_TAGS
      .filter((item) => filters.region === "all" || item.region === "Nacional" || item.region === filters.region)
      .slice(0, filters.region === "all" ? 20 : 10);
    promotionTags.forEach((item) => {
      searches.push(
        {
          title: `Etiqueta Instagram #${item.tag}`,
          category: "instagram_etiqueta",
          url: instagramHashtagUrl(item.tag),
          summary: `${item.label}. Etiqueta usada como publicidad cultural: revisar posts recientes, fecha de publicacion, fecha del evento, plazo de postulacion y contacto.`
        },
        {
          title: `Posts recientes con #${item.tag}`,
          category: "instagram_posts_recientes",
          url: googleSearchUrl(`site:instagram.com/p "#${item.tag}" "concierto" OR "convocatoria" OR "buscamos bandas" OR "postula hasta" after:2025-01-01`),
          summary: `Busqueda reciente por publicaciones con #${item.tag}. Prioriza avisos culturales, tocatas, convocatorias, bases y cierres.`
        }
      );
    });
    const regionalTargets = CHILE_REGIONAL_TARGETS
      .filter((target) => filters.region === "all" || target.region === filters.region || target.city === filters.region)
      .slice(0, filters.region === "all" ? 24 : 8);
    regionalTargets.forEach((target) => {
      searches.push(
        {
          title: `Instagram reciente - ${target.city}`,
          category: "instagram_regional",
          url: googleSearchUrl(`site:instagram.com/p OR site:instagram.com/reel "${target.city}" ${target.query} "tocata" OR "buscamos bandas" OR "se buscan bandas" after:2025-01-01`),
          summary: `Busqueda regional para ${target.city}. Abrir publicaciones publicas y revisar fecha del post, fecha del evento, hora, entrada y contacto.`
        },
        {
          title: `Centros culturales y municipios - ${target.city}`,
          category: "centro_cultural",
          url: googleSearchUrl(`"${target.city}" "${target.region}" centro cultural municipio musica conciertos convocatoria agenda`),
          summary: `Rastreo de centros culturales, municipios, salas y convocatorias en ${target.city}/${target.region}.`
        }
      );
    });
  }
  return searches.map((item, index) => ({
    id: `external-${index}`,
    ...item,
    country,
    region: item.region || "Busqueda publica",
    city: item.city || scope,
    sourceName: "Motor publico",
    sourceType: "busqueda_externa",
    linkStatus: "requires_review",
    confidence: 0.58,
    genres: ["rock", "fusion", "folk", "experimental", "progresivo"],
    requirements: ["Abrir el enlace.", "Leer fecha de publicacion, fecha del evento y plazo/cierre.", "Validar hora, contacto, requisitos y vigencia antes de contactar."]
  }));
}

function selectedScopeLabel() {
  if (filters.country !== "all") return filters.country;
  if (filters.continent !== "all") return filters.continent;
  return "Latinoamerica + Europa";
}

function selectedSearchCountry() {
  if (filters.country !== "all") return filters.country;
  if (filters.continent === "Europa") return "Espana";
  if (filters.continent === "Latinoamerica" || filters.continent === "all") return "Chile";
  const targets = targetCountries().filter((item) => filters.continent === "all" || item.continent === filters.continent);
  return targets[0]?.country || "Chile";
}

function selectedMapView() {
  if (filters.country !== "all") {
    if (filters.region !== "all") {
      const regionView = REGION_VIEWS[`${filters.country}:${filters.region}`];
      if (regionView) return regionView;
    }
    return COUNTRY_VIEWS[filters.country] || CONTINENT_VIEWS[continentForCountry(filters.country)] || CONTINENT_VIEWS.Global;
  }
  if (filters.continent !== "all") return CONTINENT_VIEWS[filters.continent] || CONTINENT_VIEWS.Global;
  return CONTINENT_VIEWS.Latinoamerica;
}

function mapPointForExternalCard(index, item = {}) {
  if (Number.isFinite(item.lat) && Number.isFinite(item.lng)) return [item.lat, item.lng];
  const view = selectedMapView();
  const angle = (index % 12) * (Math.PI / 6);
  const ring = 0.45 + Math.floor(index / 12) * 0.18;
  return [
    view.center[0] + Math.sin(angle) * ring,
    view.center[1] + Math.cos(angle) * ring
  ];
}

function fillSelect(select, values, label) {
  select.innerHTML = `<option value="all">${label}</option>` + values.map((value) => (
    `<option value="${escapeHtml(value)}">${escapeHtml(displayLabel(value))}</option>`
  )).join("");
}

function keepSelectValue(select, value) {
  select.value = [...select.options].some((option) => option.value === value) ? value : "all";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadData() {
  els.backendStatus.textContent = "Conectando";
  els.backendStatus.className = "status-pill";
  if (!API_BASE_URL) {
    opportunities = fallbackPayload.opportunities;
    sources = fallbackPayload.sources;
    els.backendStatus.textContent = "Respaldo local";
    els.backendStatus.className = "status-pill offline";
    renderAll();
    return;
  }
  try {
    const [oppsResponse, sourcesResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/opportunities?limit=500`),
      fetch(`${API_BASE_URL}/api/sources?limit=500`)
    ]);
    if (!oppsResponse.ok || !sourcesResponse.ok) {
      throw new Error("Backend no disponible");
    }
    const oppsJson = await oppsResponse.json();
    const sourcesJson = await sourcesResponse.json();
    opportunities = oppsJson.items || [];
    sources = sourcesJson.items || [];
    els.backendStatus.textContent = "Backend online";
    els.backendStatus.className = "status-pill online";
  } catch (error) {
    opportunities = fallbackPayload.opportunities;
    sources = fallbackPayload.sources;
    els.backendStatus.textContent = "API sin respuesta - respaldo local";
    els.backendStatus.className = "status-pill offline";
  }
  renderAll();
}

function setupFilters() {
  const targets = targetCountries();
  const activeContinents = unique(targets.map((item) => item.continent));
  const activeCountries = unique(targets
    .filter((item) => filters.continent === "all" || item.continent === filters.continent)
    .map((item) => item.country));
  fillSelect(els.continentFilter, activeContinents, "Todos");
  fillSelect(els.countryFilter, activeCountries, "Todos");
  fillSelect(els.regionFilter, unique(opportunities.map((o) => o.region)), "Todas");
  fillSelect(els.categoryFilter, unique(opportunities.map((o) => o.category)), "Todas");
  fillSelect(els.genreFilter, unique(opportunities.flatMap((o) => o.genres || [])), "Todos");
  keepSelectValue(els.continentFilter, filters.continent);
  keepSelectValue(els.countryFilter, filters.country);
  keepSelectValue(els.regionFilter, filters.region);
  keepSelectValue(els.categoryFilter, filters.category);
  keepSelectValue(els.genreFilter, filters.genre);
  filters.continent = els.continentFilter.value;
  filters.country = els.countryFilter.value;
  filters.region = els.regionFilter.value;
  filters.category = els.categoryFilter.value;
  filters.genre = els.genreFilter.value;

  const quick = ["Chile", "Europa", "instagram", "agenda cultural", "panoramas", "tocata", "plazo", "tiktok", "teloneros", "fondos", "concurso", "showcase", "gira", "sello", "booking", "productora", "municipio", "centro cultural", "rock", "festival"];
  els.quickFilters.innerHTML = quick.map((item) => (
    `<button class="chip" data-quick="${escapeHtml(item)}" type="button">${escapeHtml(item)}</button>`
  )).join("");
}

function matchesOpportunity(opp) {
  const text = [
    opp.title,
    opp.summary,
    opp.country,
    opp.region,
    opp.city,
    opp.category,
    opp.sourceName,
    opp.sourceType,
    itemContinent(opp),
    ...(opp.requirements || []),
    ...(opp.genres || [])
  ].join(" ").toLowerCase();
  const query = filters.q.toLowerCase();
  const quick = filters.quick?.toLowerCase();
  if (query && !text.includes(query)) return false;
  if (quick && !text.includes(quick)) return false;
  if (filters.continent !== "all" && itemContinent(opp) !== filters.continent) return false;
  if (filters.country !== "all" && opp.country !== filters.country) return false;
  if (filters.region !== "all" && opp.region !== filters.region) return false;
  if (filters.category !== "all" && opp.category !== filters.category) return false;
  if (filters.genre !== "all" && !(opp.genres || []).includes(filters.genre)) return false;
  if (filters.link === "public" && !publicLink(opp.linkStatus)) return false;
  if (!["public", "all"].includes(filters.link) && opp.linkStatus !== filters.link) return false;
  return true;
}

function matchesSource(source) {
  const text = [
    source.name,
    source.type,
    source.country,
    source.region,
    itemContinent(source)
  ].join(" ").toLowerCase();
  const query = filters.q.toLowerCase();
  const quick = filters.quick?.toLowerCase();
  if (query && !text.includes(query)) return false;
  if (quick && !text.includes(quick)) return false;
  if (filters.continent !== "all" && itemContinent(source) !== filters.continent) return false;
  if (filters.country !== "all" && source.country !== filters.country) return false;
  if (filters.region !== "all" && source.region !== filters.region) return false;
  if (filters.category !== "all" && source.type !== filters.category && !text.includes(displayLabel(filters.category))) return false;
  if (filters.link === "public" && !publicLink(source.linkStatus)) return false;
  if (!["public", "all"].includes(filters.link) && source.linkStatus !== filters.link) return false;
  return true;
}

function applyFilters() {
  filtered = opportunities.filter(matchesOpportunity).sort((a, b) => {
    const aStatus = deadlineStatus(a.deadline);
    const bStatus = deadlineStatus(b.deadline);
    if (aStatus === "abierta" && bStatus !== "abierta") return -1;
    if (bStatus === "abierta" && aStatus !== "abierta") return 1;
    return (asDate(a.deadline)?.getTime() || 9999999999999) - (asDate(b.deadline)?.getTime() || 9999999999999);
  });
}

function renderStats() {
  const publicCount = filtered.length;
  const withDeadline = filtered.filter((o) => Boolean(o.deadline)).length;
  const verified = filtered.filter((o) => ["ok", "redirected"].includes(o.linkStatus)).length;
  const regions = unique(filtered.map((o) => `${o.country}:${o.region}`)).length;
  document.getElementById("statOpen").textContent = publicCount;
  document.getElementById("statClosing").textContent = withDeadline;
  document.getElementById("statVerified").textContent = verified;
  document.getElementById("statRegions").textContent = regions;
  document.getElementById("heroOpportunities").textContent = opportunities.length;
  document.getElementById("heroSources").textContent = sources.length;
  document.getElementById("heroCountries").textContent = targetCountries().length;
}

function renderOpportunityCard(opp) {
  const status = deadlineStatus(opp.deadline);
  const dateValue = opp.deadline || opp.eventDate;
  const dateText = dateValue ? new Date(dateValue + "T00:00:00").toLocaleDateString("es-CL") : "fecha por revisar";
  return `
    <article class="opportunity-card" data-id="${opp.id}" tabindex="0">
      <div class="card-top">
        <span class="country-badge">${escapeHtml(opp.country)} - ${escapeHtml(opp.region || "sin region")}</span>
        <span class="link-status ${escapeHtml(opp.linkStatus)}">${statusLabel(opp.linkStatus)}</span>
      </div>
      <h3>${escapeHtml(opp.title)}</h3>
      <p>${escapeHtml(opp.summary || "Fuente publica curada para oportunidades musicales.")}</p>
      <div class="card-meta">
        <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(opp.city || opp.country)}</span>
        <span><i class="fa-solid fa-calendar"></i> ${escapeHtml(dateText)}</span>
        <span><i class="fa-solid fa-circle-info"></i> ${escapeHtml(status)}</span>
      </div>
      <div class="card-actions">
        <span class="category-badge">${escapeHtml(displayLabel(opp.category))}</span>
        ${(opp.genres || []).slice(0, 3).map((g) => `<span class="chip">${escapeHtml(g)}</span>`).join("")}
      </div>
      <a class="official-link" href="${escapeHtml(opp.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
        Abrir link oficial <i class="fa-solid fa-up-right-from-square"></i>
      </a>
      <button class="inline-action" type="button" data-guide-id="${escapeHtml(String(opp.id))}" onclick="event.stopPropagation()">
        Ver como postular <i class="fa-solid fa-book-open"></i>
      </button>
    </article>
  `;
}

function renderExternalCard(item) {
  return `
    <article class="opportunity-card external-card">
      <div class="card-top">
        <span class="country-badge">${escapeHtml(item.country)} - busqueda publica</span>
        <span class="link-status requires_review">revisar</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary)}</p>
      <div class="card-actions">
        <span class="category-badge">${escapeHtml(displayLabel(item.category))}</span>
        <span class="chip">instagram</span>
        <span class="chip">google</span>
        <span class="chip">publico</span>
      </div>
      <a class="official-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">
        Revisar busqueda publica <i class="fa-solid fa-up-right-from-square"></i>
      </a>
    </article>
  `;
}

function detectedIndustrySignals(opp) {
  const text = [
    opp.title,
    opp.summary,
    opp.sourceName,
    opp.sourceType,
    ...(opp.requirements || [])
  ].join(" ").toLowerCase();
  const literalSignals = INDUSTRY_LANGUAGE_TERMS.filter((term) => text.includes(term.toLowerCase()));
  const semanticSignals = Object.entries(SEMANTIC_SIGNAL_GROUPS)
    .filter(([, terms]) => terms.some((term) => text.includes(term.toLowerCase())))
    .map(([group]) => group);
  return [...new Set([...semanticSignals, ...literalSignals])].slice(0, 8);
}

function applicationGuide(opp) {
  const steps = [];
  const category = String(opp.category || "").toLowerCase();
  const sourceType = String(opp.sourceType || "").toLowerCase();
  steps.push("Abre el link oficial y busca secciones como bases, formulario, postulacion, contacto, booking o programacion.");
  if (opp.deadline) {
    steps.push(`Confirma que el plazo siga vigente: ${new Date(opp.deadline + "T00:00:00").toLocaleDateString("es-CL")}.`);
  } else {
    steps.push("Si no hay plazo visible, revisa la fecha de publicacion del post/pagina y busca bases actualizadas.");
  }
  if (category.includes("showcase") || category.includes("festival") || category.includes("booking")) {
    steps.push("Prepara EPK: bio corta, links de musica/video, registro en vivo, ciudad/base, redes publicas y contacto de booking.");
  }
  const signals = detectedIndustrySignals(opp);
  if (signals.includes("teloneros")) {
    steps.push("Si es telonero/soporte, confirma duracion del set, backline, prueba de sonido, pago, entradas y compatibilidad con el artista principal.");
  }
  if (signals.includes("internacional")) {
    steps.push("Si aceptan artistas de otros paises, confirma visa, viaje, alojamiento, idioma de postulacion y disponibilidad de gira.");
  }
  if (signals.includes("showcase")) {
    steps.push("Para showcase/mercado, prepara pitch exportable, objetivos de reuniones, links en vivo, press kit en ingles/espanol y disponibilidad para networking.");
  }
  if (signals.includes("movilidad")) {
    steps.push("Para movilidad o residencia, revisa financiamiento, carta de invitacion, ruta, fechas y requisitos de intercambio.");
  }
  if (category.includes("sello") || sourceType.includes("sello") || sourceType.includes("label")) {
    steps.push("Revisa catalogo/roster antes de enviar material; explica por que tu sonido calza con la linea del sello.");
  }
  if (category.includes("productora") || sourceType.includes("productora") || sourceType.includes("booking")) {
    steps.push("Envia un pitch breve: sonido, formato en vivo, disponibilidad, historial, publico objetivo y propuesta de valor.");
  }
  if (category.includes("municip") || category.includes("centro") || sourceType.includes("teatro")) {
    steps.push("Busca formulario municipal/teatro o correo de programacion; pregunta por honorarios, ficha tecnica, fechas y condiciones de sala.");
  }
  return [...new Set(steps)];
}

function renderList() {
  const externalCards = buildExternalSearchCards();
  els.resultCount.textContent = filtered.length + externalCards.length;
  const curatedHtml = filtered.length
    ? filtered.map(renderOpportunityCard).join("")
    : `<article class="search-empty-card">
        <div class="card-top">
          <span class="category-badge">motor conectado</span>
          <span class="link-status requires_review">en investigacion</span>
        </div>
        <h3>No hay oportunidades curadas todavia para ${escapeHtml(selectedScopeLabel())}</h3>
        <p>El mapa ya apunta al territorio seleccionado. Abajo tienes busquedas publicas revisables para encontrar posts, reels, hashtags, productoras, fondos y centros culturales.</p>
      </article>`;
  const externalHtml = `
    <div class="external-results-heading">
      <span>Busqueda publica revisable</span>
      <strong>${externalCards.length} enlaces</strong>
    </div>
    ${externalCards.map(renderExternalCard).join("")}
  `;
  els.opportunityList.innerHTML = curatedHtml + externalHtml;
}

function initMap() {
  if (map) return;
  map = L.map("map", { scrollWheelZoom: false }).setView([-25.3, -67.2], 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap",
    maxZoom: 18
  }).addTo(map);
}

function renderMap() {
  initMap();
  markers.forEach((marker) => marker.remove());
  markers = [];
  const scope = selectedScopeLabel();
  els.mapTitle.textContent = filters.country !== "all"
    ? filters.country
    : (filters.continent !== "all" ? filters.continent : "Radar global");
  const bounds = [];
  filtered.forEach((opp) => {
    if (typeof opp.lat !== "number" || typeof opp.lng !== "number") return;
    const color = opp.country === "Chile" ? "#f4c95d" : "#60a5fa";
    const marker = L.circleMarker([opp.lat, opp.lng], {
      radius: 8,
      color,
      fillColor: color,
      fillOpacity: 0.78,
      weight: 2
    }).addTo(map);
    marker.bindPopup(`
      <strong>${escapeHtml(opp.title)}</strong><br>
      ${escapeHtml(opp.city || "")}, ${escapeHtml(opp.country)}<br>
      <a href="${escapeHtml(opp.url)}" target="_blank" rel="noopener">Abrir link oficial</a>
    `);
    markers.push(marker);
    bounds.push([opp.lat, opp.lng]);
  });
  buildExternalSearchCards().slice(0, 36).forEach((item, index) => {
    const point = mapPointForExternalCard(index, item);
    const marker = L.circleMarker(point, {
      radius: 6,
      color: "#a78bfa",
      fillColor: "#a78bfa",
      fillOpacity: 0.54,
      weight: 1.5,
      dashArray: "3 3"
    }).addTo(map);
    marker.bindPopup(`
      <strong>${escapeHtml(item.title)}</strong><br>
      ${escapeHtml(item.city || scope)}<br>
      <span>Busqueda externa revisable</span><br>
      <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">Abrir motor externo</a>
    `);
    markers.push(marker);
    bounds.push(point);
  });
  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 7 });
  } else if (bounds.length === 1) {
    map.setView(bounds[0], 7);
  } else {
    const view = selectedMapView();
    map.setView(view.center, view.zoom);
    const marker = L.circleMarker(view.center, {
      radius: 10,
      color: "#60a5fa",
      fillColor: "#60a5fa",
      fillOpacity: 0.42,
      weight: 2,
      dashArray: "4 4"
    }).addTo(map);
    marker.bindPopup(`
      <strong>Radar IA: ${escapeHtml(scope)}</strong><br>
      No hay resultados curados aun. El motor ya tiene misiones de busqueda para este filtro.
    `);
    markers.push(marker);
  }
}

function renderCalendar() {
  const year = activeMonth.getFullYear();
  const month = activeMonth.getMonth();
  const label = activeMonth.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
  els.calendarTitle.textContent = `Plazos - ${label}`;
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const offset = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let html = "";
  for (let i = 0; i < offset; i++) html += "<div></div>";
  for (let day = 1; day <= last.getDate(); day++) {
    const date = new Date(year, month, day);
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const count = filtered.filter((opp) => opp.deadline === iso).length;
    html += `
      <div class="calendar-day ${count ? "has-events" : ""} ${date.getTime() === today.getTime() ? "today" : ""}">
        <strong>${day}</strong>
        ${count ? `<span class="day-count">${count}</span>` : ""}
      </div>
    `;
  }
  els.calendarDays.innerHTML = html;
}

function renderSources() {
  const matchingSources = sources.filter(matchesSource);
  const visibleSources = matchingSources.slice(0, 8);
  const guide = `
    <article class="source-card source-guide-card">
      <div class="card-top">
        <span class="category-badge">tutorial</span>
        <span class="link-status requires_review">${matchingSources.length} fuentes filtradas</span>
      </div>
      <h3>Como usar estos resultados</h3>
      <p>Primero abre una oportunidad en Resultados y pulsa <strong>Ver como postular</strong>. Este panel solo muestra fuentes relacionadas con tus filtros actuales.</p>
    </article>
  `;
  const empty = `
    <article class="source-card">
      <h3>No hay fuentes para este filtro</h3>
      <p>Prueba ampliar pais, region o categoria. El mapa y resultados siguen conectados al mismo criterio.</p>
    </article>
  `;
  els.sourcesList.innerHTML = guide + (visibleSources.length ? visibleSources.map((source) => `
    <article class="source-card">
      <div class="card-top">
        <span class="category-badge">${escapeHtml(displayLabel(source.type || "fuente"))}</span>
        <span class="link-status ${escapeHtml(source.linkStatus)}">${statusLabel(source.linkStatus)}</span>
      </div>
      <h3>${escapeHtml(source.name)}</h3>
      <p>${escapeHtml(itemContinent(source))} - ${escapeHtml(source.country || "")}${source.region ? ` - ${escapeHtml(source.region)}` : ""}</p>
      <p><strong>Como postular:</strong> revisar bases, formulario/contacto, plazo, requisitos tecnicos y si aceptan bandas o artistas externos.</p>
      <a class="official-link" href="${escapeHtml(source.url)}" target="_blank" rel="noopener">
        Abrir fuente y buscar postulacion <i class="fa-solid fa-up-right-from-square"></i>
      </a>
    </article>
  `).join("") : empty);
}

function openDetail(id) {
  const opp = opportunities.find((item) => String(item.id) === String(id));
  if (!opp) return;
  els.detailContent.innerHTML = `
    <article class="detail-content">
      <p class="eyebrow">${escapeHtml(displayLabel(opp.category))} - ${escapeHtml(itemContinent(opp))} - ${escapeHtml(opp.country)}</p>
      <h2>${escapeHtml(opp.title)}</h2>
      <div class="card-meta">
        <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(opp.city || "")}, ${escapeHtml(opp.region || "")}</span>
        <span><i class="fa-solid fa-shield-halved"></i> ${statusLabel(opp.linkStatus)}</span>
        <span><i class="fa-solid fa-brain"></i> confianza ${Math.round((opp.confidence || 0) * 100)}%</span>
      </div>
      <div class="detail-section">
        <h3>Resumen curado</h3>
        <p>${escapeHtml(opp.summary || "Sin resumen disponible.")}</p>
      </div>
      <div class="detail-section">
        <h3>Como postular en esta pagina</h3>
        <ul>${applicationGuide(opp).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>
      <div class="detail-section">
        <h3>Requisitos y senales detectadas</h3>
        <ul>${(opp.requirements || ["Revisar bases oficiales en la fuente."]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        ${detectedIndustrySignals(opp).length ? `<p><strong>Lenguaje detectado:</strong> ${detectedIndustrySignals(opp).map(escapeHtml).join(", ")}</p>` : ""}
      </div>
      <div class="detail-section">
        <h3>Fuente</h3>
        <p>${escapeHtml(opp.sourceName || "Fuente publica")} - ultima revision ${escapeHtml(opp.lastChecked || "pendiente")}</p>
      </div>
      <div class="detail-actions">
        <a class="primary-action" href="${escapeHtml(opp.url)}" target="_blank" rel="noopener">
          Abrir convocatoria/fuente <i class="fa-solid fa-up-right-from-square"></i>
        </a>
      </div>
    </article>
  `;
  els.detailDialog.showModal();
}

function renderAll() {
  setupFilters();
  applyFilters();
  renderStats();
  renderList();
  renderMap();
  renderCalendar();
  renderSources();
}

function reRenderAfterFilter() {
  applyFilters();
  renderStats();
  renderList();
  renderMap();
  renderCalendar();
  renderSources();
}

function bindEvents() {
  els.apiLink.href = `${API_BASE_URL}/docs`;
  els.refreshButton.addEventListener("click", loadData);
  els.searchInput.addEventListener("input", (event) => {
    filters.q = event.target.value.trim();
    reRenderAfterFilter();
  });
  [
    ["continent", els.continentFilter],
    ["country", els.countryFilter],
    ["region", els.regionFilter],
    ["category", els.categoryFilter],
    ["genre", els.genreFilter],
    ["link", els.linkFilter]
  ].forEach(([key, select]) => {
    select.addEventListener("change", (event) => {
      filters[key] = event.target.value;
      if (key === "continent") {
        filters.country = "all";
        setupFilters();
      }
      reRenderAfterFilter();
    });
  });
  els.quickFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-quick]");
    if (!button) return;
    const value = button.dataset.quick;
    if (value === "Europa") {
      filters.continent = filters.continent === "Europa" ? "all" : "Europa";
      filters.country = "all";
      filters.quick = null;
      setupFilters();
    } else if (value === "Chile") {
      const isActive = filters.country === "Chile";
      filters.continent = isActive ? "all" : "Latinoamerica";
      filters.country = isActive ? "all" : "Chile";
      filters.quick = null;
      setupFilters();
    } else {
      filters.quick = filters.quick === value ? null : value;
    }
    els.quickFilters.querySelectorAll(".chip").forEach((chip) => {
      const chipValue = chip.dataset.quick;
      chip.classList.toggle(
        "active",
        chipValue === filters.quick
          || (chipValue === "Europa" && filters.continent === "Europa" && filters.country === "all")
          || (chipValue === "Chile" && filters.country === "Chile")
      );
    });
    reRenderAfterFilter();
  });
  els.clearFilters.addEventListener("click", () => {
    filters.q = "";
    filters.continent = "all";
    filters.country = "all";
    filters.region = "all";
    filters.category = "all";
    filters.genre = "all";
    filters.link = "public";
    filters.quick = null;
    els.searchInput.value = "";
    els.linkFilter.value = "public";
    els.quickFilters.querySelectorAll(".chip").forEach((chip) => chip.classList.remove("active"));
    renderAll();
  });
  els.opportunityList.addEventListener("click", (event) => {
    const guideButton = event.target.closest("[data-guide-id]");
    if (guideButton) {
      openDetail(guideButton.dataset.guideId);
      return;
    }
    const card = event.target.closest(".opportunity-card");
    if (card?.dataset.id) openDetail(card.dataset.id);
  });
  els.opportunityList.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const card = event.target.closest(".opportunity-card");
    if (card) openDetail(card.dataset.id);
  });
  els.closeDialog.addEventListener("click", () => els.detailDialog.close());
  els.prevMonth.addEventListener("click", () => {
    activeMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1);
    renderCalendar();
  });
  els.nextMonth.addEventListener("click", () => {
    activeMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1);
    renderCalendar();
  });
}

bindEvents();
loadData();
