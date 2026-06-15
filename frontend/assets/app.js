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
  Norteamerica: ["Canada", "Estados Unidos", "Groenlandia"],
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

const GLOBAL_SUPPORT_FUNDING_TERMS = [
  "music grant foreign musicians",
  "funding for international musicians",
  "travel grant foreign artists music",
  "touring grant international musicians",
  "artist residency grant music",
  "music mobility fund international artists",
  "NGO music fund artists",
  "private foundation music grant",
  "cultural centre artist residency music",
  "embassy cultural fund music",
  "foreign ministry cultural fund musicians",
  "international cultural exchange music funding",
  "artist stipend music residency",
  "ayuda monetaria musicos extranjeros",
  "fondo para musicos internacionales",
  "beca movilidad musicos extranjeros",
  "residencia musical artistas internacionales",
  "fundacion privada musica artistas",
  "ong fondo musica artistas",
  "centro cultural residencia musica"
];

const GLOBAL_SUPPORT_INSTITUTION_TARGETS = [
  "On the Move mobility funding guide",
  "Res Artis artist residencies music",
  "TransArtists residency funding music",
  "Culture360 ASEF mobility grants music",
  "Goethe Institut music residency",
  "Institut Francais culture fund music",
  "British Council music international collaboration",
  "Pro Helvetia music residencies",
  "Nordic Culture Point mobility funding",
  "Creative Europe Culture cooperation music",
  "UNESCO International Fund for Cultural Diversity music",
  "Prince Claus Fund cultural grants",
  "Roberto Cimetta Fund mobility artists",
  "Art Moves Africa mobility fund music",
  "Music In Africa opportunities grants",
  "EUNIC cultural institutes music open call",
  "Japan Foundation performing arts grants",
  "Korea Foundation cultural exchange music",
  "Ibermusicas movilidad musicos"
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
  "local support",
  "special guest band",
  "guest artist",
  "premiere partie",
  "vorband",
  "supportband",
  "bandas extranjeras",
  "international artists",
  "foreign artists",
  "artists from abroad",
  "open to international artists",
  "international applicants",
  "music market",
  "mercado musical",
  "rueda de negocios",
  "music export",
  "mobility grant",
  "touring grant",
  "travel support",
  "international mobility",
  "artist residency",
  "circulacion internacional",
  "new sounds",
  "fresh sounds",
  "emerging artists",
  "emerging bands",
  "new talent",
  "up-and-coming bands",
  "sonidos emergentes",
  "nuevos sonidos",
  "programming submissions",
  "call for proposals",
  "artist proposals",
  "curatoria musical",
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
  teloneros: ["telonero", "teloneros", "banda soporte", "banda invitada", "abrir concierto", "abrir show", "support act", "opening act", "opening band", "support slot", "warm up band", "local support", "special guest band", "guest artist", "premiere partie", "vorband", "supportband", "buscamos bandas", "se buscan bandas"],
  internacional: ["bandas internacionales", "artistas internacionales", "bandas extranjeras", "artistas de otros paises", "foreign artists", "international artists", "artists from abroad", "overseas artists", "latam artists", "iberoamerica", "open to international", "international applicants", "international touring artists"],
  showcase: ["showcase", "music market", "mercado musical", "rueda de negocios", "artist application", "band submissions", "apply to play", "festival submissions", "music export", "delegate application", "artist pitch"],
  movilidad: ["gira", "tour", "touring", "residencia", "intercambio", "movilidad", "mobility grant", "touring grant", "artist residency", "circulacion", "travel support", "international mobility", "cultural exchange"],
  nuevos_sonidos: ["nuevos sonidos", "sonidos emergentes", "bandas emergentes", "artistas emergentes", "new sounds", "fresh sounds", "emerging artists", "emerging bands", "new talent", "new music discovery", "undiscovered artists", "next wave", "up-and-coming bands", "new voices", "independent artists"],
  programacion: ["programacion artistica", "curatoria musical", "recepcion de propuestas", "presentar artistas", "artist proposals", "programming submissions", "booking inquiry", "programme proposals", "live music programming", "call for proposals", "artist call", "music programming"]
};

const GLOBAL_SEMANTIC_SEARCH_TERMS = [
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
  "artist submissions",
  "apply to play",
  "open to international artists",
  "mercado musical",
  "rueda de negocios",
  "music export",
  "movilidad musical",
  "touring grant",
  "artist residency",
  "new sounds",
  "fresh sounds",
  "emerging bands",
  "new talent",
  "programming submissions",
  "call for proposals",
  "artist proposals"
];

const LATAM_SEMANTIC_SEARCH_TERMS = GLOBAL_SEMANTIC_SEARCH_TERMS;

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

const SOUTH_AMERICA_PUBLIC_SPACE_EXPANSION = {
  Argentina: ["Ministerio de Cultura Argentina convocatorias musica", "Instituto Nacional de la Musica INAMU", "MICA Argentina musica", "Usina del Arte Buenos Aires", "Centro Cultural San Martin", "Centro Cultural Borges", "Tecnopolis musica", "Centro Cultural Kirchner musica", "Teatro Vorterix", "C Complejo Art Media", "La Tangente Buenos Aires", "Camping Buenos Aires musica", "Club Paraguay Cordoba", "Festival Bandera Rosario", "Mar del Plata Cultura", "Salta Cultura musica", "Tucuman Cultura musica", "Neuquen Cultura musica", "Bariloche Cultura musica", "Tierra del Fuego Cultura musica"],
  Uruguay: ["Intendencia de Montevideo Cultura", "INMUS Uruguay", "Usinas Culturales Uruguay", "Montevideo Music Box", "La Trastienda Montevideo", "Sala del Museo", "Bluzz Live Montevideo", "Centro Cultural Florencio Sanchez", "Canelones Cultura", "Maldonado Cultura", "Rocha Cultura", "Colonia Cultura", "Paysandu Cultura", "Salto Cultura", "Tacuarembo Cultura", "Rivera Cultura", "Durazno Rock"],
  Paraguay: ["Secretaria Nacional de Cultura Paraguay", "Municipalidad de Asuncion Cultura", "Centro Cultural Juan de Salazar", "Manzana de la Rivera", "Teatro Municipal Ignacio A Pane", "Asuncionico", "ReciclArte Paraguay", "Kilkenny Asuncion musica", "La Chispa Asuncion", "San Lorenzo Cultura", "Aregua Cultura", "Ciudad del Este Cultura", "Encarnacion Cultura", "Villarrica Paraguay Cultura", "Concepcion Paraguay Cultura"],
  Bolivia: ["Ministerio de Culturas Bolivia", "La Paz Culturas", "Teatro Municipal Alberto Saavedra Perez", "Centro Cultural de Espana La Paz", "Centro Simon I Patino", "Teatro Nuna La Paz", "Alive Music Bar La Paz", "Casa Grito La Paz", "El Alto Cultura musica", "Santa Cruz Cultura", "Cochabamba Cultura", "mARTadero Cochabamba", "Sucre Cultura", "Tarija Cultura", "Oruro Cultura", "Potosi Cultura"],
  Peru: ["Ministerio de Cultura Peru", "Estimulos Economicos Cultura Peru musica", "Gran Teatro Nacional Peru", "Centro Cultural de Espana en Lima", "ICPNA Cultural musica", "Asociacion Cultural Peruano Britanica musica", "Municipalidad de Lima Cultura", "Barranco Cultura", "La Noche de Barranco", "Sargento Pimienta Barranco", "Yield Rock Lima", "Festival Selvamomos", "Cusco Cultura", "Arequipa Cultura", "Trujillo Cultura", "Chiclayo Cultura", "Piura Cultura", "Iquitos Cultura", "Puno Cultura", "Huancayo Cultura"],
  Brasil: ["FUNARTE musica edital", "SESC Sao Paulo", "SESC Pompeia", "Centro Cultural Sao Paulo", "Casa Natura Musical", "SIM Sao Paulo", "Rio de Janeiro Cultura", "Circo Voador", "Fundicao Progresso", "Audio Rebel Rio", "Belo Horizonte Cultura", "A Autentica Belo Horizonte", "Salvador Cultura", "Recife Cultura", "Porto Musical", "No Ar Coquetel Molotov", "Fortaleza Cultura", "Curitiba Cultura", "Porto Alegre Cultura", "Florianopolis Cultura", "Brasilia Cultura", "Belem Cultura", "Festival Bananada", "DoSol Natal", "MADA Natal"]
};

Object.entries(SOUTH_AMERICA_PUBLIC_SPACE_EXPANSION).forEach(([country, targets]) => {
  COUNTRY_PUBLIC_SPACE_TARGETS[country] = [...new Set([...(COUNTRY_PUBLIC_SPACE_TARGETS[country] || []), ...targets])];
});

const GLOBAL_PUBLIC_SPACE_EXPANSION = {
  Colombia: ["Idartes convocatorias musica", "Rock al Parque convocatoria bandas", "BOmm Bogota Music Market", "Circulart Medellin", "Altavoz Fest", "Teatro Pablo Tobon Uribe", "Radionica Colombia", "Shock Musica", "Llorona Records", "Suenan Las Guitarras Colombia"],
  Brasil: ["Natura Musical edital", "Festival Se Rasgum", "Festival DoSol", "Festival Bananada", "MADA Natal", "No Ar Coquetel Molotov", "Centro Cultural Banco do Brasil musica", "Itau Cultural musica", "Oi Futuro musica", "Opiniao Porto Alegre"],
  Canada: ["FACTOR Canada music", "Ontario Creates music fund", "Pop Montreal artist application", "North by Northeast artist application", "Halifax Pop Explosion artist application", "Calgary Arts Development music", "Edmonton Arts Council music", "Winnipeg Arts Council music"],
  Francia: ["FGO Barbara", "Babel Music XP", "Trans Musicales Rennes", "Stereolux Nantes", "Ninkasi Lyon", "Centre National de la Musique aides"],
  Alemania: ["Initiative Musik Germany", "Pop-Kultur Berlin", "RockCity Hamburg", "c/o pop Cologne", "Kulturreferat Munchen Musik"],
  Inglaterra: ["PRS Foundation international music", "Band on the Wall Manchester", "Liverpool Sound City", "2000trees band application", "The Great Escape Festival"],
  Espana: ["Monkey Week showcase", "Mercat de Musica Viva de Vic", "La Rambleta musica", "Primavera Pro", "BIME Bilbao"],
  Marruecos: ["L'Uzine Casablanca", "Jazzablanca artists", "Festival Timitar Agadir", "Visa For Music", "Gnaoua Festival Essaouira"],
  Sudafrica: ["Concerts SA mobility fund", "National Arts Council South Africa music", "Moshito Music Conference", "Bassline Johannesburg", "Music In Africa opportunities"],
  Nigeria: ["Felabration Lagos", "Lagos Music Week", "Alliance Francaise Lagos music", "British Council Nigeria music"],
  Ghana: ["Chale Wote Accra", "Alliance Francaise Accra music", "Ghana Music Week", "Accra Cultural Arts music"],
  Kenia: ["Blankets and Wine Kenya", "GoDown Arts Centre", "Alliance Francaise Nairobi music", "Nairobi Festival music"],
  Senegal: ["Saint-Louis Jazz Senegal", "Institut Francais Dakar musique", "Dakar Music Expo"],
  Egipto: ["Cairo Jazz Club", "El Sawy Culturewheel", "Bibliotheca Alexandrina music", "Downtown Contemporary Arts Festival Cairo"],
  Japon: ["Kansai Music Conference", "Fukuoka Music Month", "Tokyo Music Lane artist application", "Fuji Rock Rookie A Go Go"],
  "Corea del Sur": ["KOCCA music", "Busan Rock Festival", "Zandari Festa", "MUCON Korea"],
  China: ["Modern Sky Festival China", "Beijing Music Festival", "China Shanghai International Arts Festival"],
  India: ["NH7 Weekender artist application", "Serendipity Arts Festival music", "Magnetic Fields Festival artists"],
  Indonesia: ["Java Jazz Festival", "Synchronize Fest", "We The Fest Indonesia", "BaliSpirit Festival music"],
  Tailandia: ["Wonderfruit Festival artists", "Maho Rasop Festival", "Bangkok Art and Culture Centre music"]
};

Object.entries(GLOBAL_PUBLIC_SPACE_EXPANSION).forEach(([country, targets]) => {
  COUNTRY_PUBLIC_SPACE_TARGETS[country] = [...new Set([...(COUNTRY_PUBLIC_SPACE_TARGETS[country] || []), ...targets])];
});

const ARG_CAN_US_PUBLIC_SPACE_EXPANSION = {
  Argentina: ["Fondo Nacional de las Artes musica Argentina", "Ibermusicas Argentina convocatorias", "Fondo Metropolitano Cultura Buenos Aires musica", "Ciudad Emergente Buenos Aires", "Casa del Bicentenario musica Argentina", "Centro Cultural Nueva Uriarte", "El Emergente Almagro", "CC Richards Buenos Aires", "Strummer Bar Buenos Aires", "The Roxy Live Buenos Aires", "Uniclub Buenos Aires", "Teatro Flores Buenos Aires", "Distrito Siete Rosario", "Nave Cultural Mendoza", "Harlem Festival Santa Fe"],
  Canada: ["Canadian Music Week artist submission", "North by Northeast artist application", "Pop Montreal artist application", "BreakOut West showcase", "Sled Island artist application", "Calgary Folk Music Festival artist submission", "Winnipeg Folk Festival artist submission", "East Coast Music Association showcase", "Music Nova Scotia showcase", "Manitoba Music showcase", "SaskMusic showcase", "Musicaction Canada", "SODEC musique", "Creative BC music fund", "Ontario Music Investment Fund", "National Arts Centre Ottawa music", "Music Yukon funding"],
  "Estados Unidos": ["New Music USA project grants", "Mid Atlantic Arts USArtists International music", "South Arts jazz road tours", "WESTAF music", "National Endowment for the Arts music grants", "California Arts Council music grants", "Los Angeles Department of Cultural Affairs music", "New York Foundation for the Arts music", "Mondo NYC artist application", "New Colossus Festival artist application", "SXSW Music Festival artist application", "Levitation Austin bands", "Treefort Music Fest artist submission", "Folk Alliance International showcase application", "AmericanaFest artist application", "Big Ears Festival Knoxville artists", "Hopscotch Music Festival Raleigh artists", "NPR Tiny Desk Contest", "Kennedy Center Millennium Stage artists"]
};

Object.entries(ARG_CAN_US_PUBLIC_SPACE_EXPANSION).forEach(([country, targets]) => {
  COUNTRY_PUBLIC_SPACE_TARGETS[country] = [...new Set([...(COUNTRY_PUBLIC_SPACE_TARGETS[country] || []), ...targets])];
});

const GREENLAND_EUROPE_ASIA_PUBLIC_SPACE_REVIEW = {
  Groenlandia: ["Katuaq Cultural Centre Nuuk music", "NAPA Nordic Institute in Greenland music grants", "Arctic Sounds Festival Sisimiut artist application", "Nuuk Nordic Culture Festival music", "Taseralik Culture House Sisimiut music"],
  Albania: ["Tirana International Guitar Festival artist application", "Reja Tirana cultural center music", "Balkan Trafik Albania music"],
  Alemania: ["Reeperbahn Festival artist application", "Musicboard Berlin funding", "Initiative Musik Germany export", "c/o pop Cologne showcase"],
  Andorra: ["Andorra la Vella cultura musica", "Escena Nacional Andorra musica", "Andorra Sax Fest artist application"],
  Armenia: ["Yerevan Music Week showcase", "TUMO Center Yerevan music", "Golden Apricot Yerevan music events"],
  Austria: ["Waves Vienna artist application", "Austrian Music Export showcase", "Music Austria mica funding"],
  Belgica: ["Botanique Brussels music", "Ancienne Belgique artist application", "Flanders Arts Institute music", "Wallonie Bruxelles Musiques"],
  Bielorrusia: ["Minsk cultural center music", "Belarus music festival open call", "Eastern Partnership culture Belarus music"],
  "Bosnia y Herzegovina": ["OK Fest Bosnia artist application", "Sarajevo Jazz Festival music", "Mostar cultural center music"],
  Bulgaria: ["Sofia Live Festival artist application", "A to JazZ Festival Sofia", "National Culture Fund Bulgaria music"],
  Chipre: ["Rialto Theatre Cyprus music", "Fengaros Festival Cyprus artist application", "Cyprus Deputy Ministry of Culture music"],
  Croacia: ["INmusic Festival Croatia artist application", "Zagreb Music Export", "Culture Hub Croatia music"],
  Dinamarca: ["SPOT Festival Denmark artist application", "Roskilde Festival band application", "Danish Arts Foundation music", "Music Export Denmark"],
  Eslovaquia: ["Pohoda Festival artist application", "Sharpe Festival Bratislava showcase", "Slovak Arts Council music"],
  Eslovenia: ["MENT Ljubljana artist application", "Kino Siska Ljubljana music", "Slovenian Music Information Centre"],
  Espana: ["Mad Cool Festival bandas emergentes", "Primavera Pro showcase", "Monkey Week artist application", "INAEM ayudas musica"],
  Estonia: ["Tallinn Music Week artist application", "Music Estonia showcase", "Estonian Culture Endowment music"],
  Finlandia: ["Music Finland export", "Flow Festival Helsinki artist application", "Tuska Festival bands", "Taike Finland music grants"],
  Francia: ["Babel Music XP showcase", "Trans Musicales Rennes candidature", "Centre National de la Musique aides", "Printemps de Bourges iNOUiS"],
  Georgia: ["Tbilisi Open Air band application", "Tbilisi Music Week showcase", "Creative Georgia music"],
  Gales: ["Focus Wales artist application", "Arts Council of Wales music", "Wales Millennium Centre music"],
  Grecia: ["Athens Music Week showcase", "Release Athens artist application", "Onassis Stegi music open call"],
  Holanda: ["Eurosonic Noorderslag artist application", "Dutch Music Export", "Melkweg Amsterdam bands", "Paradiso Amsterdam open call"],
  Hungria: ["Sziget Festival artist application", "Budapest Music Center", "Hangveto Hungary music"],
  Inglaterra: ["The Great Escape artist application", "PRS Foundation open fund music", "SXSW London artist application", "Roundhouse London music"],
  Irlanda: ["First Music Contact Ireland", "Culture Ireland music funding", "Ireland Music Week artist application", "Whelans Dublin bands"],
  Islandia: ["Iceland Airwaves artist application", "Iceland Music Export", "Reykjavik Arts Festival music"],
  Italia: ["Linecheck Milan Music Meeting", "MI AMI Festival artist application", "Italia Music Export", "MEI Faenza artist application"],
  Kosovo: ["Prishtina Music Conference", "Sunny Hill Festival artist application", "Termokiss Prishtina music"],
  Letonia: ["Music Latvia export", "Positivus Festival artist application", "Riga cultural center music"],
  Liechtenstein: ["Vaduz culture music", "FL1 Life Festival artist application", "Kulturstiftung Liechtenstein music"],
  Lituania: ["Vilnius Music Week showcase", "Loftas Vilnius music", "Lithuanian Culture Council music"],
  Luxemburgo: ["Kultur lx music export", "Rockhal Luxembourg open call", "Sonic Visions Luxembourg"],
  "Macedonia del Norte": ["Skopje Jazz Festival music", "PIN Music Conference Skopje", "MKC Skopje music"],
  Malta: ["Malta Arts Council music", "Earth Garden Malta artist application", "Valletta Cultural Agency music"],
  Moldavia: ["Moldova National Youth Orchestra music", "Chisinau cultural center music", "Moldova music festival open call"],
  Monaco: ["Monte Carlo Jazz Festival artist application", "Monaco cultural affairs music", "Grimaldi Forum music"],
  Montenegro: ["Lake Fest Niksic artist application", "Sea Dance Festival Montenegro", "Podgorica cultural center music"],
  Noruega: ["by:Larm Oslo artist application", "Music Norway export", "Norwegian Arts Council music"],
  "Paises Bajos": ["Eurosonic Noorderslag artist application", "Buma Cultuur music export", "Le Guess Who artist application", "Roadburn Festival bands"],
  Polonia: ["OFF Festival Katowice artist application", "Great September Lodz showcase", "Music Export Poland"],
  Portugal: ["Westway LAB Portugal showcase", "MIL Lisbon artist application", "GDA Foundation music", "Serralves em Festa music"],
  "Reino Unido": ["PRS Foundation international music", "British Council music", "Liverpool Sound City artist application", "Wide Days Edinburgh showcase"],
  "Republica Checa": ["Nouvelle Prague showcase", "Czech Music Crossroads", "SoundCzech music export", "Colours of Ostrava artist application"],
  Rumania: ["Mastering the Music Business Bucharest", "Control Club Bucharest bands", "Electric Castle artist application"],
  Rusia: ["Moscow Music Week showcase", "Ural Music Night artist application", "St Petersburg cultural center music"],
  "San Marino": ["San Marino cultural institutes music", "San Marino music festival", "Titano Theatre music"],
  Serbia: ["Exit Festival artist application", "Kontakt Conference Belgrade", "Belgrade Youth Center music"],
  Suecia: ["Future Echoes artist application", "Export Music Sweden showcase", "Way Out West artist application", "Kulturraadet music grants Sweden"],
  Suiza: ["m4music Festival artist application", "Pro Helvetia music", "Swiss Music Export", "Palp Festival artists"],
  Turquia: ["Istanbul Jazz Festival artist application", "Zorlu PSM music open call", "Istanbul Music Week showcase"],
  Ucrania: ["Atlas Weekend artist application", "Music Export Ukraine", "Ukrainian Institute music", "Respublica Fest bands"],
  Vaticano: ["Vatican concerts music culture", "Auditorium Conciliazione Rome music", "Cortile dei Gentili music dialogue"],
  Afganistan: ["Afghanistan National Institute of Music", "Kabul cultural center music", "Aga Khan Music Programme Afghanistan"],
  "Arabia Saudita": ["MDLBEAST XP Music Futures", "Saudi Music Commission opportunities", "Jeddah Season music artists"],
  Azerbaiyan: ["Baku Jazz Festival artist application", "Baku International Music Festival", "Azerbaijan cultural center music"],
  Bangladesh: ["Dhaka Lit Fest music", "Bengal Foundation music Bangladesh", "Chirkutt Dhaka music scene"],
  Barein: ["Bahrain Authority for Culture music", "Spring of Culture Bahrain music", "Bahrain Jazz Fest artists"],
  Brunei: ["Brunei Arts and Culture Festival music", "Bandar Seri Begawan music events", "Brunei youth music showcase"],
  Butan: ["Royal Textile Academy Bhutan cultural music", "Thimphu Tshechu music culture", "Bhutan Echoes music"],
  Camboya: ["Cambodia Living Arts music", "Phnom Penh cultural center music", "Bonn Phum Festival music"],
  China: ["China Shanghai International Arts Festival", "Modern Sky Festival China artists", "MTA Festival China bands", "Beijing Music Festival"],
  "Corea del Sur": ["Seoul Music Week artist application", "Zandari Festa artist application", "Busan Rock Festival bands", "KOCCA music export"],
  "Emiratos Arabes Unidos": ["Dubai Culture music open call", "Alserkal Avenue music", "Abu Dhabi Festival music artists", "Sharjah Art Foundation music"],
  Filipinas: ["Fete de la Musique Philippines bands", "Wanderland Music Festival artists", "Cultural Center of the Philippines music"],
  India: ["NH7 Weekender artist application", "Serendipity Arts Festival music", "Indiearth XChange showcase", "Ziro Festival artist application"],
  Indonesia: ["Java Jazz Festival artists", "Synchronize Fest artist application", "Maho Rasop Indonesia", "Jakarta Arts Council music"],
  Irak: ["Baghdad cultural center music", "Iraq music festival open call", "Beit Tarkib Baghdad music"],
  Iran: ["Tehran music festival artists", "Fajr Music Festival Iran", "Iran cultural center music"],
  Israel: ["Tune In Tel Aviv showcase", "Jerusalem Season of Culture music", "Tel Aviv municipality music"],
  Japon: ["Tokyo Music Market artist application", "Fuji Rock Rookie A Go-Go", "Summer Sonic artist application", "Kansai Music Conference"],
  Jordania: ["Amman Jazz Festival artists", "Al Balad Music Festival Jordan", "King Hussein Cultural Center music"],
  Kazajistan: ["Almaty music festival artists", "Astana cultural center music", "Qazaqstan music showcase"],
  Kirguistan: ["Bishkek Jazz Spring music", "Kyrgyzstan cultural center music", "Central Asia music showcase"],
  Kuwait: ["Sheikh Jaber Al Ahmad Cultural Centre music", "Kuwait music festival artists", "Dar al Athar al Islamiyyah music"],
  Laos: ["Vientiane music festival artists", "Lao cultural center music", "Luang Prabang cultural festival music"],
  Libano: ["Beirut and Beyond artist application", "Metro Al Madina Beirut music", "Beirut Music and Art Festival"],
  Malasia: ["Good Vibes Festival Malaysia artists", "Urbanscapes Kuala Lumpur music", "Malaysia Music Week showcase"],
  Maldivas: ["Maldives music festival artists", "Male cultural center music", "Maldives arts council music"],
  Mongolia: ["Playtime Festival Mongolia artist application", "Ulaanbaatar cultural center music", "Mongolian music showcase"],
  Myanmar: ["Yangon music festival artists", "Myanmar cultural center music", "Gitameit Music Center Myanmar"],
  Nepal: ["Jazzmandu Nepal artist application", "Kathmandu Triennale music", "Nepal Music Festival bands"],
  Oman: ["Royal Opera House Muscat music", "Muscat Festival music", "Oman cultural center music"],
  Pakistan: ["Lahore Music Meet artist application", "Coke Studio Pakistan artists", "Karachi Arts Council music"],
  Palestina: ["Palestine Music Expo artist application", "Sakakini Cultural Center music", "Yabous Cultural Centre music"],
  Qatar: ["Qatar Creates music", "Katara Cultural Village music", "Doha music festival artists"],
  Singapur: ["Music Matters Singapore showcase", "Esplanade Singapore music open call", "Baybeats Festival artist application"],
  Siria: ["Syrian cultural center music", "Damascus music festival", "Action for Hope music Syria"],
  "Sri Lanka": ["Colombo Music Week showcase", "Galle Music Festival artists", "Sri Lanka cultural center music"],
  Tailandia: ["Maho Rasop Festival artist application", "Wonderfruit Festival artists", "Bangkok Music City showcase", "Big Mountain Music Festival bands"],
  Taiwan: ["LUCfest Tainan artist application", "Taiwan Beats showcase", "Taipei Music Center open call", "Megaport Festival bands"],
  Tayikistan: ["Dushanbe cultural center music", "Tajikistan music festival artists", "Aga Khan Music Programme Tajikistan"],
  "Timor Oriental": ["Dili cultural center music", "Timor Leste music festival artists", "Arte Moris Dili music"],
  Turkmenistan: ["Ashgabat cultural center music", "Turkmenistan music festival", "Central Asia culture music Turkmenistan"],
  Uzbekistan: ["Sharq Taronalari Samarkand music festival", "Tashkent cultural center music", "Uzbekistan art and culture foundation music"],
  Vietnam: ["Monsoon Music Festival Vietnam", "Hozo Music Festival Ho Chi Minh", "Hanoi Rock City bands", "Vietnam Music Week showcase"],
  Yemen: ["Yemen cultural music diaspora", "Sanaa cultural center music", "Aga Khan Music Programme Yemen"]
};

Object.entries(GREENLAND_EUROPE_ASIA_PUBLIC_SPACE_REVIEW).forEach(([country, targets]) => {
  COUNTRY_PUBLIC_SPACE_TARGETS[country] = [...new Set([...(COUNTRY_PUBLIC_SPACE_TARGETS[country] || []), ...targets])];
});

const ASIA_FUNDS_PRODUCERS_FOREIGN_CALLS = {
  Afganistan: ["Aga Khan Music Programme Afghanistan grants", "Afghanistan National Institute of Music international collaboration", "Afghan music diaspora artist support"],
  "Arabia Saudita": ["MDLBEAST XP artist application foreign artists", "Saudi Music Commission grants musicians", "Jeddah Season international bands"],
  Azerbaiyan: ["Baku Jazz Festival international artists", "Azerbaijan Cultural Ministry music grants", "Baku music producers foreign bands"],
  Bangladesh: ["Bengal Foundation music grants", "Dhaka music producers foreign artists", "Chirkutt Dhaka international collaboration"],
  Barein: ["Spring of Culture Bahrain international artists", "Bahrain Authority for Culture music grants", "Bahrain Jazz Fest foreign artists"],
  Brunei: ["Brunei cultural grants music artists", "Brunei youth music showcase foreign artists", "Bandar Seri Begawan cultural centre music"],
  Butan: ["Bhutan Echoes international artists", "Bhutan cultural foundation music grants", "Thimphu music cultural exchange"],
  Camboya: ["Cambodia Living Arts grants music", "Bonn Phum Festival foreign artists", "Phnom Penh music producers booking"],
  China: ["Modern Sky foreign bands booking China", "Split Works China international artists", "MTA Festival foreign bands", "China Shanghai International Arts Festival international artists"],
  "Corea del Sur": ["KOCCA music export funding", "Zandari Festa foreign bands application", "Seoul Music Week international showcase", "MPMG Korea booking bands"],
  "Emiratos Arabes Unidos": ["Alserkal Avenue music open call", "Dubai Culture grants artists", "Abu Dhabi Festival international musicians", "Sole DXB music booking foreign artists"],
  Filipinas: ["Karpos Multimedia international artists", "Wanderland Festival foreign bands", "Cultural Center of the Philippines music grants", "Offshore Music Philippines bands"],
  India: ["Only Much Louder artist booking", "Indiearth XChange international artists", "Serendipity Arts Festival grants music", "SkillBox India band submissions"],
  Indonesia: ["Ismaya Live international artists", "Studiorama Indonesia foreign bands", "Synchronize Fest band submissions", "Jakarta Arts Council music grants"],
  Irak: ["Beit Tarkib Baghdad music grants", "Iraq cultural fund music artists", "Baghdad music producers foreign artists"],
  Iran: ["Fajr Music Festival international artists", "Tehran music producers foreign artists", "Iran cultural centre music grants"],
  Israel: ["Tune In Tel Aviv international showcase", "Ozen Tel Aviv booking bands", "Jerusalem Season of Culture music grants", "Yellow Submarine Jerusalem international artists"],
  Japon: ["Japan Foundation performing arts grants music", "Smash Corporation Japan booking foreign bands", "Creativeman Productions artist submissions", "Fuji Rock Rookie A-Go-Go band submissions"],
  Jordania: ["Al Balad Music Festival international artists", "Amman Jazz Festival foreign artists", "Jordan cultural fund music"],
  Kazajistan: ["Qazaqstan music showcase international artists", "Almaty music producers booking", "Astana cultural grants music"],
  Kirguistan: ["Aga Khan Music Programme Kyrgyzstan", "Bishkek Jazz Spring international artists", "Central Asia music showcase foreign bands"],
  Kuwait: ["Sheikh Jaber Cultural Centre music booking", "Kuwait music grants artists", "Kuwait international music festival artists"],
  Laos: ["Luang Prabang cultural festival foreign artists", "Vientiane music producers booking", "Lao cultural grants music"],
  Libano: ["Beirut and Beyond international artists", "Metro Al Madina booking bands", "Turntables Beirut music producers", "AFAC Arab Fund for Arts and Culture music grants"],
  Malasia: ["Livescape Malaysia international artists", "Urbanscapes band submissions", "Good Vibes Festival foreign bands", "CENDANA Malaysia music grants"],
  Maldivas: ["Maldives music festival foreign artists", "Male cultural grants music", "Maldives arts council musicians"],
  Mongolia: ["Playtime Festival Mongolia international artists", "Ulaanbaatar music producers booking", "Mongolian cultural grants music"],
  Myanmar: ["Gitameit Music Center international collaboration", "Yangon music producers foreign artists", "Myanmar cultural grants music"],
  Nepal: ["Jazzmandu international artists", "Nepal Music Festival foreign bands", "Kathmandu music producers booking"],
  Oman: ["Royal Opera House Muscat international artists", "Muscat Festival foreign artists", "Oman cultural grants music"],
  Pakistan: ["Lahore Music Meet artist application", "Salt Arts Pakistan booking", "Karachi Arts Council music grants", "Coke Studio Pakistan artist collaboration"],
  Palestina: ["Palestine Music Expo international artists", "Yabous Cultural Centre music grants", "Sakakini Cultural Center music residency"],
  Qatar: ["Katara Cultural Village music open call", "Qatar Creates music grants", "Doha music producers foreign artists"],
  Singapur: ["National Arts Council Singapore music grants", "Esplanade Singapore music open call", "Baybeats Festival foreign bands", "LAMC Productions Singapore booking"],
  Siria: ["Action for Hope music Syria grants", "Syrian music diaspora artist support", "Damascus cultural grants music"],
  "Sri Lanka": ["Colombo Music Week international artists", "Galle Music Festival foreign artists", "Sri Lanka cultural grants music"],
  Tailandia: ["Fungjai Thailand band submissions", "Have You Heard Bangkok booking foreign bands", "Maho Rasop Festival foreign artists", "Bangkok Music City international showcase"],
  Taiwan: ["Taiwan Beats music export funding", "LUCfest international artists", "The Wall Taiwan booking bands", "StreetVoice Taiwan band submissions"],
  Tayikistan: ["Aga Khan Music Programme Tajikistan", "Dushanbe music grants artists", "Tajikistan cultural exchange music"],
  "Timor Oriental": ["Arte Moris Dili international artists", "Timor Leste cultural grants music", "Dili music producers foreign artists"],
  Turkmenistan: ["Central Asia culture music Turkmenistan", "Ashgabat cultural grants music", "Turkmenistan music festival foreign artists"],
  Uzbekistan: ["Sharq Taronalari international artists", "Uzbekistan Art and Culture Foundation music grants", "Tashkent music producers booking"],
  Vietnam: ["Monsoon Music Festival foreign bands", "Hozo Music Festival international artists", "Hanoi Rock City booking bands", "Vietnam Music Week showcase"],
  Yemen: ["Aga Khan Music Programme Yemen", "Yemen music diaspora artist support", "Sanaa cultural grants music"]
};

Object.entries(ASIA_FUNDS_PRODUCERS_FOREIGN_CALLS).forEach(([country, targets]) => {
  COUNTRY_PUBLIC_SPACE_TARGETS[country] = [...new Set([...(COUNTRY_PUBLIC_SPACE_TARGETS[country] || []), ...targets])];
});

const FOCUS_COUNTRY_FUNDS_PRODUCERS_FOREIGN_CALLS = {
  Irlanda: [
    "Culture Ireland music funding international performance",
    "Music From Ireland export support",
    "First Music Contact Ireland artist supports",
    "Ireland Music Week international showcase application",
    "Whelans Dublin booking bands",
    "Levis Corner House Ballydehob music booking",
    "IMRO Ireland music funding opportunities",
    "Arts Council Ireland music bursary international artists",
    "Dublin City Council arts office music grants",
    "Galway International Arts Festival music open call"
  ],
  China: [
    "Modern Sky Lab booking foreign bands China",
    "Split Works China international artists booking",
    "MTA Festival foreign bands China",
    "China Shanghai International Arts Festival international artists open call",
    "Beijing Music Festival international musicians",
    "Strawberry Music Festival China band booking",
    "Midi Festival China foreign bands",
    "Shanghai Symphony Hall international artists",
    "Power Station of Art Shanghai music performance open call",
    "Yuyintang Shanghai booking bands"
  ],
  Japon: [
    "Japan Foundation performing arts grants music international",
    "Japan Arts Council artist grants music",
    "Smash Corporation Japan booking foreign bands",
    "Creativeman Productions artist submissions",
    "Fuji Rock Rookie A-Go-Go band submissions",
    "Summer Sonic artist application Japan",
    "Music Lane Okinawa international showcase",
    "Kansai Music Conference foreign artists",
    "Shibuya WWW Tokyo booking bands",
    "Live Nation Japan international artists"
  ],
  Canada: [
    "Canada Council for the Arts music grants international collaboration",
    "FACTOR Canada artist development funding",
    "Musicaction Canada francophone music funding",
    "SODEC musique aide artistes internationaux",
    "Music BC export funding international showcase",
    "BreakOut West international showcase application",
    "M for Montreal artist submission international",
    "Canadian Music Week artist submission foreign bands",
    "North by Northeast artist application international bands",
    "Pop Montreal artist application international artists",
    "Harbourfront Centre Toronto music open call",
    "National Arts Centre Ottawa music international artists"
  ]
};

Object.entries(FOCUS_COUNTRY_FUNDS_PRODUCERS_FOREIGN_CALLS).forEach(([country, targets]) => {
  COUNTRY_PUBLIC_SPACE_TARGETS[country] = [...new Set([...(COUNTRY_PUBLIC_SPACE_TARGETS[country] || []), ...targets])];
});

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
  Afganistan: { center: [33.9391, 67.71], zoom: 6 },
  Albania: { center: [41.1533, 20.1683], zoom: 7 },
  Alemania: { center: [51.1657, 10.4515], zoom: 6 },
  Andorra: { center: [42.5063, 1.5218], zoom: 9 },
  Argentina: { center: [-38.4161, -63.6167], zoom: 4 },
  "Arabia Saudita": { center: [23.8859, 45.0792], zoom: 5 },
  Armenia: { center: [40.0691, 45.0382], zoom: 7 },
  Austria: { center: [47.5162, 14.5501], zoom: 7 },
  Azerbaiyan: { center: [40.1431, 47.5769], zoom: 7 },
  Bangladesh: { center: [23.685, 90.3563], zoom: 7 },
  Barein: { center: [26.0667, 50.5577], zoom: 10 },
  Belgica: { center: [50.5039, 4.4699], zoom: 7 },
  Bielorrusia: { center: [53.7098, 27.9534], zoom: 6 },
  Bolivia: { center: [-16.2902, -63.5887], zoom: 5 },
  "Bosnia y Herzegovina": { center: [43.9159, 17.6791], zoom: 7 },
  Brasil: { center: [-14.235, -51.9253], zoom: 4 },
  Brunei: { center: [4.5353, 114.7277], zoom: 9 },
  Bulgaria: { center: [42.7339, 25.4858], zoom: 7 },
  Butan: { center: [27.5142, 90.4336], zoom: 8 },
  Camboya: { center: [12.5657, 104.991], zoom: 7 },
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
  Egipto: { center: [26.8206, 30.8025], zoom: 5 },
  "El Salvador": { center: [13.7942, -88.8965], zoom: 8 },
  "Emiratos Arabes Unidos": { center: [23.4241, 53.8478], zoom: 7 },
  Eslovaquia: { center: [48.669, 19.699], zoom: 7 },
  Eslovenia: { center: [46.1512, 14.9955], zoom: 8 },
  Espana: { center: [40.4637, -3.7492], zoom: 6 },
  Estonia: { center: [58.5953, 25.0136], zoom: 7 },
  Finlandia: { center: [61.9241, 25.7482], zoom: 5 },
  Francia: { center: [46.2276, 2.2137], zoom: 6 },
  Filipinas: { center: [12.8797, 121.774], zoom: 5 },
  Gales: { center: [52.1307, -3.7837], zoom: 7 },
  Georgia: { center: [42.3154, 43.3569], zoom: 7 },
  Ghana: { center: [7.9465, -1.0232], zoom: 6 },
  Grecia: { center: [39.0742, 21.8243], zoom: 6 },
  Groenlandia: { center: [71.7069, -42.6043], zoom: 4 },
  Holanda: { center: [52.1326, 5.2913], zoom: 7 },
  Guatemala: { center: [15.7835, -90.2308], zoom: 7 },
  Honduras: { center: [15.2, -86.2419], zoom: 7 },
  Hungria: { center: [47.1625, 19.5033], zoom: 7 },
  India: { center: [20.5937, 78.9629], zoom: 4 },
  Indonesia: { center: [-0.7893, 113.9213], zoom: 4 },
  Inglaterra: { center: [52.3555, -1.1743], zoom: 6 },
  Irlanda: { center: [53.4129, -8.2439], zoom: 7 },
  Irak: { center: [33.2232, 43.6793], zoom: 6 },
  Iran: { center: [32.4279, 53.688], zoom: 5 },
  Islandia: { center: [64.9631, -19.0208], zoom: 6 },
  Israel: { center: [31.0461, 34.8516], zoom: 8 },
  Italia: { center: [41.8719, 12.5674], zoom: 6 },
  Japon: { center: [36.2048, 138.2529], zoom: 5 },
  Jordania: { center: [30.5852, 36.2384], zoom: 7 },
  Kazajistan: { center: [48.0196, 66.9237], zoom: 4 },
  Kenia: { center: [-0.0236, 37.9062], zoom: 6 },
  Kirguistan: { center: [41.2044, 74.7661], zoom: 7 },
  Kosovo: { center: [42.6026, 20.903], zoom: 8 },
  Kuwait: { center: [29.3117, 47.4818], zoom: 8 },
  Laos: { center: [19.8563, 102.4955], zoom: 7 },
  Letonia: { center: [56.8796, 24.6032], zoom: 7 },
  Libano: { center: [33.8547, 35.8623], zoom: 8 },
  Liechtenstein: { center: [47.166, 9.5554], zoom: 10 },
  Lituania: { center: [55.1694, 23.8813], zoom: 7 },
  Luxemburgo: { center: [49.8153, 6.1296], zoom: 9 },
  "Macedonia del Norte": { center: [41.6086, 21.7453], zoom: 8 },
  Malasia: { center: [4.2105, 101.9758], zoom: 6 },
  Maldivas: { center: [3.2028, 73.2207], zoom: 7 },
  Malta: { center: [35.9375, 14.3754], zoom: 10 },
  Marruecos: { center: [31.7917, -7.0926], zoom: 5 },
  Mexico: { center: [23.6345, -102.5528], zoom: 5 },
  Moldavia: { center: [47.4116, 28.3699], zoom: 7 },
  Monaco: { center: [43.7384, 7.4246], zoom: 11 },
  Mongolia: { center: [46.8625, 103.8467], zoom: 5 },
  Montenegro: { center: [42.7087, 19.3744], zoom: 8 },
  Myanmar: { center: [21.9162, 95.956], zoom: 6 },
  Nepal: { center: [28.3949, 84.124], zoom: 7 },
  Nicaragua: { center: [12.8654, -85.2072], zoom: 7 },
  Nigeria: { center: [9.082, 8.6753], zoom: 6 },
  Noruega: { center: [60.472, 8.4689], zoom: 5 },
  Oman: { center: [21.4735, 55.9754], zoom: 6 },
  "Paises Bajos": { center: [52.1326, 5.2913], zoom: 7 },
  Pakistan: { center: [30.3753, 69.3451], zoom: 5 },
  Palestina: { center: [31.9522, 35.2332], zoom: 8 },
  Panama: { center: [8.538, -80.7821], zoom: 7 },
  Paraguay: { center: [-23.4425, -58.4438], zoom: 6 },
  Peru: { center: [-9.19, -75.0152], zoom: 5 },
  Polonia: { center: [51.9194, 19.1451], zoom: 6 },
  Portugal: { center: [39.3999, -8.2245], zoom: 7 },
  Qatar: { center: [25.3548, 51.1839], zoom: 8 },
  "Reino Unido": { center: [55.3781, -3.436], zoom: 6 },
  "Republica Checa": { center: [49.8175, 15.473], zoom: 7 },
  "Republica Dominicana": { center: [18.7357, -70.1627], zoom: 7 },
  Rumania: { center: [45.9432, 24.9668], zoom: 6 },
  Rusia: { center: [61.524, 105.3188], zoom: 3 },
  "San Marino": { center: [43.9424, 12.4578], zoom: 11 },
  Senegal: { center: [14.4974, -14.4524], zoom: 6 },
  Serbia: { center: [44.0165, 21.0059], zoom: 7 },
  Singapur: { center: [1.3521, 103.8198], zoom: 11 },
  Siria: { center: [34.8021, 38.9968], zoom: 6 },
  "Sri Lanka": { center: [7.8731, 80.7718], zoom: 7 },
  Sudafrica: { center: [-30.5595, 22.9375], zoom: 5 },
  Suecia: { center: [60.1282, 18.6435], zoom: 5 },
  Suiza: { center: [46.8182, 8.2275], zoom: 7 },
  Taiwan: { center: [23.6978, 120.9605], zoom: 7 },
  Tailandia: { center: [15.87, 100.9925], zoom: 5 },
  Tayikistan: { center: [38.861, 71.2761], zoom: 7 },
  "Timor Oriental": { center: [-8.8742, 125.7275], zoom: 8 },
  Turquia: { center: [38.9637, 35.2433], zoom: 5 },
  Turkmenistan: { center: [38.9697, 59.5563], zoom: 6 },
  Ucrania: { center: [48.3794, 31.1656], zoom: 6 },
  Uruguay: { center: [-32.5228, -55.7658], zoom: 6 },
  Uzbekistan: { center: [41.3775, 64.5853], zoom: 6 },
  Vaticano: { center: [41.9029, 12.4534], zoom: 12 },
  Venezuela: { center: [6.4238, -66.5897], zoom: 5 },
  Vietnam: { center: [14.0583, 108.2772], zoom: 5 },
  Yemen: { center: [15.5527, 48.5164], zoom: 6 },
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
  { tag: "puertomontt", label: "Puerto Montt", region: "Los Lagos" },
  { tag: "teatrodellago", label: "Teatro del Lago / Frutillar", region: "Los Lagos" },
  { tag: "frutillar", label: "Frutillar", region: "Los Lagos" },
  { tag: "semanasmusicalesdefrutillar", label: "Semanas Musicales de Frutillar", region: "Los Lagos" },
  { tag: "culturaaysen", label: "Cultura Aysen", region: "Aysen" },
  { tag: "coyhaique", label: "Coyhaique", region: "Aysen" },
  { tag: "puertoaysen", label: "Puerto Aysen", region: "Aysen" },
  { tag: "patagoniacultural", label: "Patagonia cultural", region: "Aysen" },
  { tag: "puntaarenas", label: "Punta Arenas", region: "Magallanes" },
  { tag: "puertonatales", label: "Puerto Natales", region: "Magallanes" }
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
  ["Los Lagos", "Frutillar", "Teatro del Lago Frutillar Programacion"],
  ["Los Lagos", "Frutillar", "Semanas Musicales de Frutillar"],
  ["Los Lagos", "Frutillar", "Frutillar Cultura"],
  ["Los Lagos", "Castro", "Castro Cultura Chiloe"],
  ["Los Lagos", "Ancud", "Ancud Cultura"],
  ["Los Lagos", "Quellon", "Quellon Cultura"],
  ["Los Lagos", "Chaiten", "Chaiten Cultura"],
  ["Los Lagos", "Hualaihue", "Hualaihue Cultura"],
  ["Aysen", "Coyhaique", "Gobierno Regional de Aysen Cultura"],
  ["Aysen", "Coyhaique", "Coyhaique Cultura"],
  ["Aysen", "Coyhaique", "Centro Cultural Coyhaique"],
  ["Aysen", "Coyhaique", "Casa de la Cultura Coyhaique"],
  ["Aysen", "Puerto Aysen", "Puerto Aysen Cultura"],
  ["Aysen", "Puerto Cisnes", "Puerto Cisnes Cultura"],
  ["Aysen", "Chile Chico", "Chile Chico Cultura"],
  ["Aysen", "Cochrane", "Cochrane Cultura"],
  ["Aysen", "Rio Ibanez", "Rio Ibanez Cultura"],
  ["Aysen", "Guaitecas", "Guaitecas Cultura"],
  ["Magallanes", "Punta Arenas", "Punta Arenas Cultura"],
  ["Magallanes", "Puerto Natales", "Puerto Natales Cultura"],
  ["Magallanes", "Punta Arenas", "Centro Cultural Claudio Paredes Chamorro Punta Arenas"],
  ["Magallanes", "Punta Arenas", "Teatro Municipal Jose Bohr Punta Arenas"],
  ["Magallanes", "Porvenir", "Porvenir Cultura"],
  ["Magallanes", "Puerto Williams", "Puerto Williams Cultura"],
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
  Groenlandia: ["kommune", "municipality", "cultural centre", "Nordic culture"],
  Inglaterra: ["county", "borough", "city council", "arts council"],
  "Reino Unido": ["county", "borough", "city council", "arts council"],
  Irlanda: ["county", "city council", "arts office"],
  Gales: ["county", "council", "arts council"],
  Francia: ["region", "departement", "commune", "mairie"],
  Espana: ["comunidad autonoma", "provincia", "ayuntamiento"],
  Alemania: ["bundesland", "stadt", "kulturamt"],
  Australia: ["state", "territory", "local council"],
  "Nueva Zelanda": ["region", "city council", "creative communities", "local board"],
  Sudafrica: ["province", "municipality", "arts council", "cultural affairs"],
  Marruecos: ["region", "commune", "province", "festival"],
  Japon: ["prefecture", "city cultural foundation", "music festival"],
  "Corea del Sur": ["province", "metropolitan city", "arts council", "music showcase"],
  China: ["province", "municipality", "arts festival", "cultural center"],
  Taiwan: ["county", "city", "cultural bureau", "music festival"],
  Vietnam: ["province", "city", "department of culture", "music festival"],
  Libano: ["municipality", "festival", "cultural center", "music programme"],
  Italia: ["regione", "comune", "assessorato cultura", "festival musica"],
  Portugal: ["regiao", "municipio", "camara municipal", "festival musica"],
  "Paises Bajos": ["province", "gemeente", "music venue", "cultural fund"],
  Holanda: ["province", "gemeente", "music venue", "cultural fund"],
  Dinamarca: ["region", "kommune", "music venue", "cultural fund"],
  Suecia: ["region", "kommun", "music venue", "cultural grant"],
  Suiza: ["canton", "gemeinde", "commune", "music festival"],
  Noruega: ["county", "kommune", "music festival", "cultural grant"]
};

const DEFAULT_ADMIN_DIVISION_TERMS = ["region", "province", "state", "department", "county", "municipality", "city council", "cultural center", "arts council", "music festival"];

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
  ["Chile", "Los Lagos", "Frutillar", "Teatro del Lago Frutillar Programacion", -41.1264, -73.0437],
  ["Chile", "Los Lagos", "Frutillar", "Semanas Musicales de Frutillar", -41.1264, -73.0437],
  ["Chile", "Los Lagos", "Puerto Varas", "Corporacion Cultural Puerto Varas", -41.3195, -72.9854],
  ["Chile", "Los Lagos", "Castro", "Castro Cultura Chiloe", -42.4801, -73.7624],
  ["Chile", "Los Lagos", "Chaiten", "Chaiten Cultura", -42.9159, -72.7063],
  ["Chile", "Aysen", "Coyhaique", "Gobierno Regional de Aysen Cultura", -45.5712, -72.0685],
  ["Chile", "Aysen", "Coyhaique", "Centro Cultural Coyhaique", -45.5712, -72.0685],
  ["Chile", "Aysen", "Coyhaique", "Casa de la Cultura Coyhaique", -45.5712, -72.0685],
  ["Chile", "Aysen", "Puerto Aysen", "Municipalidad de Puerto Aysen Cultura", -45.403, -72.6918],
  ["Chile", "Aysen", "Puerto Cisnes", "Municipalidad de Puerto Cisnes Cultura", -44.7477, -72.6966],
  ["Chile", "Aysen", "Chile Chico", "Municipalidad de Chile Chico Cultura", -46.5406, -71.725],
  ["Chile", "Aysen", "Cochrane", "Municipalidad de Cochrane Cultura", -47.2538, -72.5736],
  ["Chile", "Aysen", "Rio Ibanez", "Municipalidad de Rio Ibanez Cultura", -46.293, -71.932],
  ["Chile", "Aysen", "Guaitecas", "Municipalidad de Guaitecas Cultura", -43.883, -73.75],
  ["Chile", "Magallanes", "Punta Arenas", "Centro Cultural Claudio Paredes Chamorro Punta Arenas", -53.1638, -70.9171],
  ["Chile", "Magallanes", "Punta Arenas", "Teatro Municipal Jose Bohr Punta Arenas", -53.1638, -70.9171],
  ["Chile", "Magallanes", "Puerto Natales", "Municipalidad de Puerto Natales Cultura", -51.7309, -72.506],
  ["Chile", "Magallanes", "Porvenir", "Municipalidad de Porvenir Cultura", -53.2969, -70.3669],
  ["Chile", "Magallanes", "Puerto Williams", "Municipalidad de Puerto Williams Cultura", -54.9333, -67.6167],
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
  ["Colombia", "Antioquia", "Medellin", "Antioquia Medellin cultura musica", 6.2442, -75.5812],
  ["Argentina", "Mendoza", "Mendoza", "Mendoza Cultura municipios", -32.8895, -68.8458],
  ["Argentina", "Rio Negro", "Bariloche", "Patagonia Argentina cultura musica", -41.1335, -71.3103],
  ["Uruguay", "Durazno", "Durazno", "Durazno Rock cultura", -33.3816, -56.5236],
  ["Uruguay", "Rocha", "Rocha", "Rocha Cultura musica", -34.4833, -54.3333],
  ["Paraguay", "Itapua", "Encarnacion", "Encarnacion Cultura", -27.3306, -55.8667],
  ["Paraguay", "Alto Parana", "Ciudad del Este", "Ciudad del Este Cultura", -25.5167, -54.6167],
  ["Bolivia", "La Paz", "El Alto", "El Alto Cultura musica", -16.5, -68.15],
  ["Bolivia", "Tarija", "Tarija", "Tarija Cultura", -21.5355, -64.7296],
  ["Peru", "Loreto", "Iquitos", "Iquitos Cultura", -3.7437, -73.2516],
  ["Peru", "Puno", "Puno", "Puno Cultura", -15.8402, -70.0219],
  ["Brasil", "Pernambuco", "Recife", "Porto Musical Recife", -8.0476, -34.877],
  ["Brasil", "Ceara", "Fortaleza", "Fortaleza Cultura musica", -3.7319, -38.5267],
  ["Mexico", "Oaxaca", "Oaxaca", "Oaxaca Cultura musica", 17.0732, -96.7266],
  ["Mexico", "Queretaro", "Queretaro", "Queretaro Cultura musica", 20.5888, -100.3899],
  ["Ecuador", "Pichincha", "Quito", "Quito Cultura", -0.1807, -78.4678],
  ["Ecuador", "Guayas", "Guayaquil", "Guayaquil Cultura", -2.1894, -79.8891],
  ["Ecuador", "Azuay", "Cuenca", "Cuenca Cultura", -2.9006, -79.0045],
  ["Costa Rica", "San Jose", "San Jose", "Ministerio de Cultura Costa Rica", 9.9281, -84.0907],
  ["Costa Rica", "Alajuela", "Alajuela", "Alajuela Cultura", 10.0162, -84.2116],
  ["Panama", "Panama", "Panama", "MiCultura Panama", 8.9824, -79.5199],
  ["Panama", "Chiriqui", "David", "David Cultura", 8.4273, -82.4308],
  ["Cuba", "La Habana", "La Habana", "Fabrica de Arte Cubano", 23.1136, -82.3666],
  ["Cuba", "Santiago de Cuba", "Santiago de Cuba", "Santiago de Cuba Cultura", 20.0169, -75.8302],
  ["Republica Dominicana", "Santo Domingo", "Santo Domingo", "Centro Cultural de Espana Santo Domingo", 18.4861, -69.9312],
  ["Republica Dominicana", "Santiago", "Santiago de los Caballeros", "Santiago de los Caballeros Cultura", 19.4792, -70.6931],
  ["Guatemala", "Guatemala", "Ciudad de Guatemala", "Ciudad de Guatemala Cultura", 14.6349, -90.5069],
  ["Guatemala", "Sacatepequez", "Antigua Guatemala", "Antigua Guatemala Cultura", 14.5586, -90.7295],
  ["Honduras", "Francisco Morazan", "Tegucigalpa", "Tegucigalpa Cultura", 14.0723, -87.1921],
  ["Honduras", "Cortes", "San Pedro Sula", "San Pedro Sula Cultura", 15.5042, -88.025],
  ["Nicaragua", "Managua", "Managua", "Managua Cultura", 12.114, -86.2362],
  ["Nicaragua", "Leon", "Leon", "Leon Cultura", 12.4379, -86.878],
  ["El Salvador", "San Salvador", "San Salvador", "San Salvador Cultura", 13.6929, -89.2182],
  ["El Salvador", "Santa Ana", "Santa Ana", "Santa Ana Cultura", 13.9942, -89.5597],
  ["Venezuela", "Distrito Capital", "Caracas", "Caracas Cultura", 10.4806, -66.9036],
  ["Venezuela", "Zulia", "Maracaibo", "Maracaibo Cultura", 10.6545, -71.65],
  ["Belice", "Belize", "Belize City", "Belize International Music and Food Festival", 17.5046, -88.1962],
  ["Belice", "Cayo", "San Ignacio", "San Ignacio music", 17.1588, -89.0696],
  ["Guyana", "Demerara-Mahaica", "Georgetown", "National Cultural Centre Guyana", 6.8013, -58.1551],
  ["Surinam", "Paramaribo", "Paramaribo", "Suriname Jazz Festival", 5.852, -55.2038],
  ["Jamaica", "Kingston", "Kingston", "Reggae Month Jamaica", 17.9712, -76.7936],
  ["Haiti", "Ouest", "Port-au-Prince", "FOKAL Haiti culture", 18.5944, -72.3074],
  ["Trinidad y Tobago", "Port of Spain", "Port of Spain", "Queen's Hall Trinidad music", 10.6603, -61.5086],
  ["Bahamas", "New Providence", "Nassau", "Bahamas National Festival Commission music", 25.0443, -77.3504],
  ["Barbados", "Saint Michael", "Bridgetown", "NIFCA Barbados music", 13.0975, -59.6167],
  ["Santa Lucia", "Castries", "Castries", "Saint Lucia Jazz", 14.0101, -60.9875],
  ["Granada", "Saint George", "St George's", "SpiceMas music", 12.0561, -61.7488],
  ["Dominica", "Saint George", "Roseau", "World Creole Music Festival Dominica", 15.301, -61.3881],
  ["Antigua y Barbuda", "Saint John", "St John's", "Antigua Carnival music", 17.1274, -61.8468],
  ["San Vicente y las Granadinas", "Saint George", "Kingstown", "Vincy Mas music", 13.1600, -61.2248],
  ["San Cristobal y Nieves", "Saint George Basseterre", "Basseterre", "St Kitts Music Festival", 17.3026, -62.7177],
  ["Inglaterra", "England", "London", "London borough arts music", 51.5074, -0.1278],
  ["Inglaterra", "England", "London", "SXSW London artist application", 51.5074, -0.1278],
  ["Inglaterra", "England", "Manchester", "Manchester music venues", 53.4808, -2.2426],
  ["Inglaterra", "England", "Brighton", "Brighton music showcase", 50.8225, -0.1372],
  ["Inglaterra", "Gloucestershire", "Cheltenham", "2000trees band application Cheltenham", 51.8994, -2.0783],
  ["Reino Unido", "Scotland", "Edinburgh", "Wide Days artist application Edinburgh", 55.9533, -3.1883],
  ["Reino Unido", "United Kingdom", "London", "UK Music Export Growth Scheme", 51.5074, -0.1278],
  ["Irlanda", "Dublin", "Dublin", "Dublin arts office music", 53.3498, -6.2603],
  ["Irlanda", "Cork", "Cork", "Cork city arts music", 51.8985, -8.4756],
  ["Gales", "Cardiff", "Cardiff", "Cardiff music board", 51.4816, -3.1791],
  ["Islandia", "Reykjavik", "Reykjavik", "Iceland Airwaves artist application", 64.1466, -21.9426],
  ["Islandia", "Reykjavik", "Reykjavik", "Iceland Music export office", 64.1466, -21.9426],
  ["Espana", "Madrid", "Madrid", "Madrid cultura musica", 40.4168, -3.7038],
  ["Espana", "Cataluna", "Barcelona", "Barcelona cultura musica", 41.3851, 2.1734],
  ["Francia", "Ile-de-France", "Paris", "Paris musique open call", 48.8566, 2.3522],
  ["Francia", "Ile-de-France", "Paris", "Institut francais PAIR music residency", 48.8566, 2.3522],
  ["Francia", "Provence-Alpes-Cote d'Azur", "Marseille", "Marseille culture musique", 43.2965, 5.3698],
  ["Alemania", "Berlin", "Berlin", "Berlin musicboard", 52.52, 13.405],
  ["Alemania", "Berlin", "Berlin", "Goethe Institut music residency", 52.52, 13.405],
  ["Alemania", "Hamburg", "Hamburg", "Reeperbahn artist application", 53.5511, 9.9937],
  ["Alemania", "Hamburg", "Hamburg", "Hamburg music city", 53.5511, 9.9937],
  ["Paises Bajos", "Noord-Holland", "Amsterdam", "Amsterdam music fund", 52.3676, 4.9041],
  ["Paises Bajos", "Zuid-Holland", "Rotterdam", "Rotterdam music city", 51.9244, 4.4777],
  ["Dinamarca", "Hovedstaden", "Copenhagen", "Copenhagen music city", 55.6761, 12.5683],
  ["Suecia", "Stockholm", "Stockholm", "Stockholm music city", 59.3293, 18.0686],
  ["Suecia", "Stockholm", "Stockholm", "Export Music Sweden showcase", 59.3293, 18.0686],
  ["Suiza", "Zurich", "Zurich", "Zurich music festival", 47.3769, 8.5417],
  ["Marruecos", "Rabat-Sale-Kenitra", "Rabat", "Visa For Music Rabat", 34.0209, -6.8416],
  ["Marruecos", "Casablanca-Settat", "Casablanca", "Casablanca music festival", 33.5731, -7.5898],
  ["Sudafrica", "Western Cape", "Cape Town", "Cape Town music office", -33.9249, 18.4241],
  ["Sudafrica", "Gauteng", "Johannesburg", "Johannesburg arts council music", -26.2041, 28.0473],
  ["Australia", "New South Wales", "Sydney", "New South Wales music grants", -33.8688, 151.2093],
  ["Australia", "National", "Sydney", "Music Australia Export Fund international touring", -33.8688, 151.2093],
  ["Australia", "Victoria", "Melbourne", "Melbourne music city", -37.8136, 144.9631],
  ["Nueva Zelanda", "Auckland", "Auckland", "Auckland music city", -36.8509, 174.7645],
  ["Japon", "Tokyo", "Tokyo", "Tokyo music market", 35.6762, 139.6503],
  ["Japon", "Osaka", "Osaka", "Osaka music festival", 34.6937, 135.5023],
  ["Corea del Sur", "Seoul", "Seoul", "Seoul music week", 37.5665, 126.978],
  ["China", "Shanghai", "Shanghai", "Shanghai international arts festival", 31.2304, 121.4737],
  ["Taiwan", "Taipei", "Taipei", "Taipei music center", 25.033, 121.5654],
  ["Vietnam", "Ho Chi Minh City", "Ho Chi Minh City", "Ho Chi Minh City music festival", 10.8231, 106.6297],
  ["Libano", "Beirut", "Beirut", "Beirut and Beyond", 33.8938, 35.5018],
  ["Estados Unidos", "California", "San Jose", "San Jose Arts and Cultural Exchange Grants", 37.3382, -121.8863],
  ["Estados Unidos", "Washington DC", "Washington", "Arts Envoy music international", 38.9072, -77.0369]
].map(([country, region, city, label, lat, lng]) => ({
  country,
  region,
  city,
  label,
  lat,
  lng,
  type: "radar_territorial",
  query: `${label} ${city} ${region} musica conciertos bandas convocatoria centro cultural municipio festival international artists support act opening band new sounds`
}));

const SOUTH_AMERICA_TERRITORIAL_EXPANSION = [
  ["Argentina", "Buenos Aires", "Buenos Aires", "Usina del Arte convocatorias musica", -34.6286, -58.3626],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Centro Cultural Recoleta musica convocatoria bandas", -34.5842, -58.3932],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Centro Cultural San Martin programacion musica", -34.6044, -58.3854],
  ["Argentina", "Buenos Aires", "Buenos Aires", "MICA Mercado de Industrias Culturales Argentinas", -34.6037, -58.3816],
  ["Argentina", "Buenos Aires", "La Plata", "Instituto Cultural Provincia de Buenos Aires musica", -34.9214, -57.9544],
  ["Argentina", "Buenos Aires", "Mar del Plata", "Mar del Plata cultura musica convocatoria bandas", -38.0055, -57.5426],
  ["Argentina", "Cordoba", "Cordoba", "Club Paraguay Cordoba bandas", -31.4201, -64.1888],
  ["Argentina", "Santa Fe", "Rosario", "Festival Bandera Rosario bandas", -32.9442, -60.6505],
  ["Argentina", "Mendoza", "Mendoza", "Mendoza Cultura musica municipios", -32.8895, -68.8458],
  ["Argentina", "Salta", "Salta", "Salta Cultura musica municipios", -24.7821, -65.4232],
  ["Argentina", "Tucuman", "San Miguel de Tucuman", "Tucuman Cultura musica municipios", -26.8083, -65.2176],
  ["Argentina", "Neuquen", "Neuquen", "Neuquen Cultura musica Patagonia", -38.9516, -68.0591],
  ["Argentina", "Rio Negro", "Bariloche", "Bariloche Cultura musica Patagonia", -41.1335, -71.3103],
  ["Argentina", "Tierra del Fuego", "Ushuaia", "Tierra del Fuego Cultura musica Ushuaia", -54.8019, -68.303],
  ["Uruguay", "Montevideo", "Montevideo", "INMUS Uruguay musica convocatorias", -34.9011, -56.1645],
  ["Uruguay", "Montevideo", "Montevideo", "Sala Zitarrosa programacion musica", -34.9063, -56.1957],
  ["Uruguay", "Montevideo", "Montevideo", "Usinas Culturales Uruguay musica", -34.9011, -56.1645],
  ["Uruguay", "Montevideo", "Montevideo", "Montevideo Music Box bandas", -34.8865, -56.1438],
  ["Uruguay", "Canelones", "Canelones", "Canelones Cultura musica", -34.5228, -56.2778],
  ["Uruguay", "Maldonado", "Maldonado", "Maldonado Cultura musica Punta del Este", -34.9, -54.95],
  ["Uruguay", "Rocha", "Rocha", "Rocha Cultura musica La Paloma", -34.4833, -54.3333],
  ["Uruguay", "Colonia", "Colonia del Sacramento", "Colonia Cultura musica", -34.4714, -57.8442],
  ["Uruguay", "Paysandu", "Paysandu", "Paysandu Cultura musica", -32.3214, -58.0756],
  ["Uruguay", "Salto", "Salto", "Salto Cultura musica", -31.3833, -57.9667],
  ["Paraguay", "Asuncion", "Asuncion", "Secretaria Nacional de Cultura Paraguay convocatorias musica", -25.2637, -57.5759],
  ["Paraguay", "Asuncion", "Asuncion", "Centro Cultural Juan de Salazar musica", -25.2867, -57.6359],
  ["Paraguay", "Asuncion", "Asuncion", "Manzana de la Rivera musica Asuncion", -25.2802, -57.6371],
  ["Paraguay", "Asuncion", "Asuncion", "Teatro Municipal Ignacio A Pane musica", -25.2822, -57.6361],
  ["Paraguay", "Central", "San Lorenzo", "San Lorenzo Cultura musica", -25.3397, -57.5088],
  ["Paraguay", "Central", "Aregua", "Aregua Cultura musica", -25.3125, -57.3847],
  ["Paraguay", "Alto Parana", "Ciudad del Este", "Ciudad del Este Cultura musica", -25.5167, -54.6167],
  ["Paraguay", "Itapua", "Encarnacion", "Encarnacion Cultura musica", -27.3306, -55.8667],
  ["Paraguay", "Guaira", "Villarrica", "Villarrica Paraguay Cultura musica", -25.7500, -56.4333],
  ["Paraguay", "Concepcion", "Concepcion", "Concepcion Paraguay Cultura musica", -23.4064, -57.4344],
  ["Bolivia", "La Paz", "La Paz", "La Paz Culturas musica convocatorias", -16.4897, -68.1193],
  ["Bolivia", "La Paz", "La Paz", "Centro Cultural de Espana La Paz musica", -16.4897, -68.1193],
  ["Bolivia", "La Paz", "La Paz", "Teatro Nuna La Paz bandas", -16.5247, -68.1076],
  ["Bolivia", "La Paz", "El Alto", "El Alto Cultura musica", -16.5, -68.15],
  ["Bolivia", "Santa Cruz", "Santa Cruz", "Santa Cruz Cultura musica", -17.7833, -63.1821],
  ["Bolivia", "Cochabamba", "Cochabamba", "mARTadero Cochabamba musica", -17.3895, -66.1568],
  ["Bolivia", "Chuquisaca", "Sucre", "Sucre Cultura musica", -19.0196, -65.2619],
  ["Bolivia", "Tarija", "Tarija", "Tarija Cultura musica", -21.5355, -64.7296],
  ["Bolivia", "Oruro", "Oruro", "Oruro Cultura musica", -17.9647, -67.106],
  ["Bolivia", "Potosi", "Potosi", "Potosi Cultura musica", -19.5836, -65.7531],
  ["Peru", "Lima", "Lima", "Ministerio de Cultura Peru Estimulos Economicos musica", -12.0464, -77.0428],
  ["Peru", "Lima", "Lima", "Gran Teatro Nacional Peru musica", -12.0875, -77.003],
  ["Peru", "Lima", "Lima", "Centro Cultural de Espana en Lima musica", -12.0464, -77.0428],
  ["Peru", "Lima", "Barranco", "La Noche de Barranco bandas", -12.1494, -77.0219],
  ["Peru", "Lima", "Barranco", "Sargento Pimienta Barranco bandas", -12.1494, -77.0219],
  ["Peru", "Cusco", "Cusco", "Cusco Cultura musica", -13.532, -71.9675],
  ["Peru", "Arequipa", "Arequipa", "Arequipa Cultura musica", -16.409, -71.5375],
  ["Peru", "La Libertad", "Trujillo", "Trujillo Cultura musica", -8.1116, -79.0287],
  ["Peru", "Lambayeque", "Chiclayo", "Chiclayo Cultura musica", -6.7714, -79.8409],
  ["Peru", "Piura", "Piura", "Piura Cultura musica", -5.1945, -80.6328],
  ["Peru", "Loreto", "Iquitos", "Iquitos Cultura musica", -3.7437, -73.2516],
  ["Peru", "Junin", "Huancayo", "Huancayo Cultura musica", -12.0651, -75.2049],
  ["Brasil", "Sao Paulo", "Sao Paulo", "SESC Sao Paulo chamada musica", -23.5505, -46.6333],
  ["Brasil", "Sao Paulo", "Sao Paulo", "Casa Natura Musical chamadas artistas", -23.5505, -46.6333],
  ["Brasil", "Sao Paulo", "Sao Paulo", "SIM Sao Paulo showcase", -23.5505, -46.6333],
  ["Brasil", "Rio de Janeiro", "Rio de Janeiro", "Circo Voador bandas Rio de Janeiro", -22.9068, -43.1729],
  ["Brasil", "Rio de Janeiro", "Rio de Janeiro", "Fundicao Progresso programacao musica", -22.9068, -43.1729],
  ["Brasil", "Minas Gerais", "Belo Horizonte", "A Autentica Belo Horizonte bandas", -19.9167, -43.9345],
  ["Brasil", "Bahia", "Salvador", "Bahia Cultura edital musica Salvador", -12.9777, -38.5016],
  ["Brasil", "Pernambuco", "Recife", "No Ar Coquetel Molotov Recife", -8.0476, -34.877],
  ["Brasil", "Ceara", "Fortaleza", "Fortaleza Cultura musica", -3.7319, -38.5267],
  ["Brasil", "Rio Grande do Sul", "Porto Alegre", "Porto Alegre cultura musica", -30.0346, -51.2177],
  ["Brasil", "Parana", "Curitiba", "Curitiba cultura musica", -25.4284, -49.2733],
  ["Brasil", "Santa Catarina", "Florianopolis", "Florianopolis Cultura musica", -27.5949, -48.5482],
  ["Brasil", "Distrito Federal", "Brasilia", "Brasilia cultura musica", -15.7939, -47.8828],
  ["Brasil", "Rio Grande do Norte", "Natal", "DoSol Natal festival bandas", -5.7793, -35.2009],
  ["Brasil", "Goias", "Goiania", "Festival Bananada Goiania", -16.6869, -49.2648]
].map(([country, region, city, label, lat, lng]) => ({
  country,
  region,
  city,
  label,
  lat,
  lng,
  type: "radar_territorial",
  query: `${label} ${city} ${region} musica conciertos bandas convocatoria centro cultural municipio festival international artists support act opening band new sounds`
}));

TERRITORIAL_AREA_TARGETS.push(...SOUTH_AMERICA_TERRITORIAL_EXPANSION);

const GLOBAL_TERRITORIAL_EXPANSION = [
  ["Colombia", "Bogota", "Bogota", "Idartes convocatorias musica", 4.711, -74.0721],
  ["Colombia", "Bogota", "Bogota", "Rock al Parque convocatoria bandas", 4.711, -74.0721],
  ["Colombia", "Bogota", "Bogota", "BOmm Bogota Music Market showcase", 4.711, -74.0721],
  ["Colombia", "Antioquia", "Medellin", "Altavoz Fest convocatoria bandas", 6.2442, -75.5812],
  ["Colombia", "Valle del Cauca", "Cali", "Cali Festival Ajazzgo musica", 3.4516, -76.532],
  ["Colombia", "Atlantico", "Barranquilla", "Barranquilla Secretaria de Cultura musica", 10.9685, -74.7813],
  ["Colombia", "Bolivar", "Cartagena", "Cartagena Instituto de Patrimonio y Cultura musica", 10.391, -75.4794],
  ["Colombia", "Santander", "Bucaramanga", "Bucaramanga Instituto Municipal de Cultura musica", 7.1193, -73.1227],
  ["Brasil", "Para", "Belem", "Festival Se Rasgum Belem", -1.4558, -48.4902],
  ["Brasil", "Amazonas", "Manaus", "Manaus cultura musica", -3.119, -60.0217],
  ["Brasil", "Rio Grande do Sul", "Porto Alegre", "Opiniao Porto Alegre bandas", -30.0346, -51.2177],
  ["Brasil", "Parana", "Curitiba", "Oficina de Musica de Curitiba", -25.4284, -49.2733],
  ["Brasil", "Bahia", "Salvador", "Salvador Secult edital musica", -12.9777, -38.5016],
  ["Canada", "Ontario", "Toronto", "Toronto Arts Council music grants", 43.6532, -79.3832],
  ["Canada", "Ontario", "Toronto", "Ontario Creates music fund", 43.6532, -79.3832],
  ["Canada", "Quebec", "Montreal", "M for Montreal artist application", 45.5017, -73.5673],
  ["Canada", "British Columbia", "Vancouver", "Music BC showcase", 49.2827, -123.1207],
  ["Canada", "Alberta", "Calgary", "Calgary Arts Development music", 51.0447, -114.0719],
  ["Canada", "Nova Scotia", "Halifax", "Halifax Pop Explosion artist application", 44.6488, -63.5752],
  ["Francia", "Ile-de-France", "Paris", "FGO Barbara Paris musique", 48.8566, 2.3522],
  ["Francia", "Bretagne", "Rennes", "Trans Musicales Rennes candidature", 48.1173, -1.6778],
  ["Francia", "Provence-Alpes-Cote d'Azur", "Marseille", "Babel Music XP showcase", 43.2965, 5.3698],
  ["Alemania", "Berlin", "Berlin", "Pop-Kultur Nachwuchs", 52.52, 13.405],
  ["Alemania", "Hamburg", "Hamburg", "RockCity Hamburg artists", 53.5511, 9.9937],
  ["Alemania", "Nordrhein-Westfalen", "Cologne", "c/o pop artist application", 50.9375, 6.9603],
  ["Inglaterra", "Greater London", "London", "Roundhouse emerging artists", 51.5074, -0.1278],
  ["Inglaterra", "Greater Manchester", "Manchester", "Band on the Wall artists", 53.4808, -2.2426],
  ["Inglaterra", "Merseyside", "Liverpool", "Liverpool Sound City artist application", 53.4084, -2.9916],
  ["Espana", "Madrid", "Madrid", "Matadero Madrid musica convocatoria", 40.4168, -3.7038],
  ["Espana", "Cataluna", "Vic", "Mercat de Musica Viva de Vic", 41.9301, 2.2549],
  ["Espana", "Andalucia", "Sevilla", "Monkey Week showcase", 37.3891, -5.9845],
  ["Marruecos", "Rabat-Sale-Kenitra", "Rabat", "Visa For Music artist application", 34.0209, -6.8416],
  ["Marruecos", "Casablanca-Settat", "Casablanca", "L'Uzine Casablanca musique", 33.5731, -7.5898],
  ["Sudafrica", "Western Cape", "Cape Town", "Concerts SA mobility fund", -33.9249, 18.4241],
  ["Sudafrica", "Gauteng", "Johannesburg", "Bassline Johannesburg artists", -26.2041, 28.0473],
  ["Nigeria", "Lagos", "Lagos", "Felabration Lagos artists", 6.5244, 3.3792],
  ["Ghana", "Greater Accra", "Accra", "Chale Wote Accra music", 5.6037, -0.187],
  ["Kenia", "Nairobi", "Nairobi", "Blankets and Wine Kenya artists", -1.2921, 36.8219],
  ["Senegal", "Dakar", "Dakar", "Saint-Louis Jazz Senegal", 14.7167, -17.4677],
  ["Egipto", "Cairo", "Cairo", "El Sawy Culturewheel music", 30.0444, 31.2357],
  ["Japon", "Tokyo", "Tokyo", "Tokyo Music Lane artist application", 35.6762, 139.6503],
  ["Japon", "Fukuoka", "Fukuoka", "Fukuoka Music Month", 33.5902, 130.4017],
  ["Corea del Sur", "Seoul", "Seoul", "KOCCA music showcase", 37.5665, 126.978],
  ["Corea del Sur", "Busan", "Busan", "Busan Rock Festival artists", 35.1796, 129.0756],
  ["China", "Shanghai", "Shanghai", "Modern Sky Festival China", 31.2304, 121.4737],
  ["China", "Beijing", "Beijing", "Beijing Music Festival", 39.9042, 116.4074],
  ["India", "Maharashtra", "Mumbai", "NH7 Weekender artist application", 19.076, 72.8777],
  ["India", "Goa", "Goa", "Serendipity Arts Festival music", 15.2993, 74.124],
  ["Indonesia", "Jakarta", "Jakarta", "Java Jazz Festival", -6.2088, 106.8456],
  ["Indonesia", "Jakarta", "Jakarta", "Synchronize Fest artists", -6.2088, 106.8456],
  ["Tailandia", "Bangkok", "Bangkok", "Maho Rasop Festival artists", 13.7563, 100.5018],
  ["Tailandia", "Chonburi", "Pattaya", "Wonderfruit Festival artists", 12.9236, 100.8825]
].map(([country, region, city, label, lat, lng]) => ({
  country,
  region,
  city,
  label,
  lat,
  lng,
  type: "radar_territorial",
  query: `${label} ${city} ${region} musica conciertos bandas convocatoria open call showcase international artists support act opening band new sounds`
}));

TERRITORIAL_AREA_TARGETS.push(...GLOBAL_TERRITORIAL_EXPANSION);

const ARG_CAN_US_TERRITORIAL_EXPANSION = [
  ["Argentina", "Buenos Aires", "Buenos Aires", "Lollapalooza Argentina bandas emergentes", -34.6037, -58.3816],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Quilmes Rock Argentina bandas", -34.6037, -58.3816],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Ciudad Emergente Buenos Aires convocatoria bandas", -34.6037, -58.3816],
  ["Argentina", "Buenos Aires", "Buenos Aires", "El Emergente Almagro bandas", -34.6037, -58.4216],
  ["Argentina", "Buenos Aires", "Buenos Aires", "CC Richards Buenos Aires bandas", -34.5895, -58.425],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Strummer Bar Buenos Aires bandas", -34.598, -58.439],
  ["Argentina", "Buenos Aires", "Buenos Aires", "The Roxy Live Buenos Aires bandas", -34.579, -58.435],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Fondo Nacional de las Artes musica Argentina", -34.6037, -58.3816],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Ibermusicas Argentina convocatorias", -34.6037, -58.3816],
  ["Argentina", "Santa Fe", "Rosario", "Distrito Siete Rosario bandas", -32.9442, -60.6505],
  ["Argentina", "Santa Fe", "Santa Fe", "Harlem Festival Santa Fe bandas", -31.6333, -60.7],
  ["Argentina", "Mendoza", "Mendoza", "Nave Cultural Mendoza musica", -32.8895, -68.8458],
  ["Argentina", "Jujuy", "San Salvador de Jujuy", "Jujuy Cultura musica", -24.1858, -65.2995],
  ["Argentina", "Misiones", "Posadas", "Misiones Posadas cultura musica", -27.3621, -55.9009],
  ["Canada", "Ontario", "Toronto", "Canadian Music Week artist submission", 43.6532, -79.3832],
  ["Canada", "Ontario", "Toronto", "North by Northeast artist application", 43.6532, -79.3832],
  ["Canada", "Ontario", "Toronto", "Ontario Music Investment Fund", 43.6532, -79.3832],
  ["Canada", "Quebec", "Montreal", "Pop Montreal artist application", 45.5017, -73.5673],
  ["Canada", "Quebec", "Montreal", "Musicaction Canada francophone music funding", 45.5017, -73.5673],
  ["Canada", "British Columbia", "Vancouver", "BreakOut West showcase", 49.2827, -123.1207],
  ["Canada", "British Columbia", "Vancouver", "Creative BC music fund", 49.2827, -123.1207],
  ["Canada", "Alberta", "Calgary", "Sled Island artist application", 51.0447, -114.0719],
  ["Canada", "Manitoba", "Winnipeg", "Manitoba Music showcase", 49.8951, -97.1384],
  ["Canada", "Nova Scotia", "Halifax", "East Coast Music Association showcase", 44.6488, -63.5752],
  ["Canada", "Yukon", "Whitehorse", "Music Yukon funding", 60.7212, -135.0568],
  ["Estados Unidos", "National", "New York", "New Music USA project grants", 40.7128, -74.006],
  ["Estados Unidos", "National", "Washington", "National Endowment for the Arts music grants", 38.9072, -77.0369],
  ["Estados Unidos", "National", "Baltimore", "Mid Atlantic Arts USArtists International music", 39.2904, -76.6122],
  ["Estados Unidos", "South", "Atlanta", "South Arts jazz road tours", 33.749, -84.388],
  ["Estados Unidos", "California", "Los Angeles", "Los Angeles Department of Cultural Affairs music", 34.0522, -118.2437],
  ["Estados Unidos", "California", "San Francisco", "San Francisco Grants for the Arts music", 37.7749, -122.4194],
  ["Estados Unidos", "Washington", "Seattle", "The Crocodile Seattle bands", 47.6062, -122.3321],
  ["Estados Unidos", "Oregon", "Portland", "Doug Fir Lounge Portland bands", 45.5152, -122.6784],
  ["Estados Unidos", "Texas", "Austin", "SXSW Music Festival artist application", 30.2672, -97.7431],
  ["Estados Unidos", "Texas", "Austin", "Levitation Austin bands", 30.2672, -97.7431],
  ["Estados Unidos", "New York", "New York", "Mondo NYC artist application", 40.7128, -74.006],
  ["Estados Unidos", "New York", "New York", "New Colossus Festival artist application", 40.7128, -74.006],
  ["Estados Unidos", "Illinois", "Chicago", "Empty Bottle Chicago bands", 41.8781, -87.6298],
  ["Estados Unidos", "Minnesota", "Minneapolis", "First Avenue Minneapolis bands", 44.9778, -93.265],
  ["Estados Unidos", "Tennessee", "Nashville", "AmericanaFest artist application", 36.1627, -86.7816],
  ["Estados Unidos", "Tennessee", "Knoxville", "Big Ears Festival Knoxville artists", 35.9606, -83.9207],
  ["Estados Unidos", "North Carolina", "Raleigh", "Hopscotch Music Festival Raleigh artists", 35.7796, -78.6382],
  ["Estados Unidos", "Idaho", "Boise", "Treefort Music Fest artist submission", 43.615, -116.2023],
  ["Estados Unidos", "Missouri", "Kansas City", "Folk Alliance International showcase application", 39.0997, -94.5786],
  ["Estados Unidos", "National", "Washington", "NPR Tiny Desk Contest", 38.9072, -77.0369],
  ["Estados Unidos", "National", "Washington", "Kennedy Center Millennium Stage artists", 38.9072, -77.0369]
].map(([country, region, city, label, lat, lng]) => ({
  country,
  region,
  city,
  label,
  lat,
  lng,
  type: "radar_territorial",
  query: `${label} ${city} ${region} music musica open call artist application band submissions showcase support act opening band international artists grants`
}));

TERRITORIAL_AREA_TARGETS.push(...ARG_CAN_US_TERRITORIAL_EXPANSION);

const GREENLAND_EUROPE_ASIA_TERRITORIAL_REVIEW = Object.entries(GREENLAND_EUROPE_ASIA_PUBLIC_SPACE_REVIEW)
  .flatMap(([country, targets]) => {
    const view = COUNTRY_VIEWS[country] || CONTINENT_VIEWS[continentForCountry(country)] || CONTINENT_VIEWS.Global;
    const [lat, lng] = view.center;
    return targets.slice(0, 3).map((label) => ({
      country,
      region: "Radar profundo",
      city: country,
      label,
      lat,
      lng,
      type: "radar_territorial",
      query: `${label} ${country} music open call artist application band submissions showcase support act international artists grants cultural centre`
    }));
  });

TERRITORIAL_AREA_TARGETS.push(...GREENLAND_EUROPE_ASIA_TERRITORIAL_REVIEW);

const ASIA_FUNDS_PRODUCERS_TERRITORIAL_REVIEW = Object.entries(ASIA_FUNDS_PRODUCERS_FOREIGN_CALLS)
  .flatMap(([country, targets]) => {
    const view = COUNTRY_VIEWS[country] || CONTINENT_VIEWS.Asia;
    const [lat, lng] = view.center;
    return targets.slice(0, 4).map((label, index) => ({
      country,
      region: "Asia fondos/productoras",
      city: country,
      label,
      lat: lat + (index - 1.5) * 0.18,
      lng: lng + (index - 1.5) * 0.18,
      type: "radar_asia_support",
      query: `${label} ${country} music grant producer booking foreign bands international artists artist application`
    }));
  });

TERRITORIAL_AREA_TARGETS.push(...ASIA_FUNDS_PRODUCERS_TERRITORIAL_REVIEW);

const FOCUS_COUNTRY_FUNDS_PRODUCERS_TERRITORIAL_REVIEW = Object.entries(FOCUS_COUNTRY_FUNDS_PRODUCERS_FOREIGN_CALLS)
  .flatMap(([country, targets]) => {
    const view = COUNTRY_VIEWS[country] || CONTINENT_VIEWS[continentForCountry(country)] || CONTINENT_VIEWS.Global;
    const [lat, lng] = view.center;
    return targets.slice(0, 5).map((label, index) => ({
      country,
      region: "Fondos/productoras foco",
      city: country,
      label,
      lat: lat + (index - 2) * 0.16,
      lng: lng + (index - 2) * 0.16,
      type: "radar_focus_support",
      query: `${label} ${country} music grant funding producer booking foreign bands international artists band submissions open call`
    }));
  });

TERRITORIAL_AREA_TARGETS.push(...FOCUS_COUNTRY_FUNDS_PRODUCERS_TERRITORIAL_REVIEW);

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
  ["Venezuela", "Caracas", "Caracas", "Caracas Cultura"],
  ["Belice", "Belize", "Belize City", "Belize International Music and Food Festival"],
  ["Belice", "Cayo", "San Ignacio", "San Ignacio music"],
  ["Guyana", "Demerara-Mahaica", "Georgetown", "National Cultural Centre Guyana"],
  ["Surinam", "Paramaribo", "Paramaribo", "Suriname Jazz Festival"],
  ["Jamaica", "Kingston", "Kingston", "Reggae Month Jamaica"],
  ["Haiti", "Ouest", "Port-au-Prince", "FOKAL Haiti culture"],
  ["Trinidad y Tobago", "Port of Spain", "Port of Spain", "Queen's Hall Trinidad music"],
  ["Bahamas", "New Providence", "Nassau", "Bahamas National Festival Commission music"],
  ["Barbados", "Saint Michael", "Bridgetown", "NIFCA Barbados music"],
  ["Santa Lucia", "Castries", "Castries", "Saint Lucia Jazz"],
  ["Granada", "Saint George", "St George's", "SpiceMas music"],
  ["Dominica", "Saint George", "Roseau", "World Creole Music Festival Dominica"],
  ["Antigua y Barbuda", "Saint John", "St John's", "Antigua Carnival music"],
  ["San Vicente y las Granadinas", "Saint George", "Kingstown", "Vincy Mas music"],
  ["San Cristobal y Nieves", "Saint George Basseterre", "Basseterre", "St Kitts Music Festival"]
].map(([country, region, city, label]) => ({
  country,
  region,
  city,
  label,
  type: "radar_latam",
  query: `${label} ${city} musica festival convocatoria showcase bandas rock indie booking centro cultural`
}));

const SOUTH_AMERICA_RECOGNIZED_EXPANSION = [
  ["Argentina", "Buenos Aires", "Buenos Aires", "Ministerio de Cultura Argentina convocatorias musica"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Usina del Arte programacion musica"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Centro Cultural San Martin musica"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Centro Cultural Borges musica"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Teatro Vorterix convocatoria bandas"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "C Complejo Art Media bandas"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "La Tangente convocatoria bandas"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Camping Buenos Aires musica"],
  ["Argentina", "Cordoba", "Cordoba", "Club Paraguay Cordoba bandas"],
  ["Argentina", "Santa Fe", "Rosario", "Festival Bandera Rosario bandas"],
  ["Uruguay", "Montevideo", "Montevideo", "Usinas Culturales Uruguay"],
  ["Uruguay", "Montevideo", "Montevideo", "Montevideo Music Box"],
  ["Uruguay", "Montevideo", "Montevideo", "La Trastienda Montevideo"],
  ["Uruguay", "Montevideo", "Montevideo", "Sala del Museo"],
  ["Uruguay", "Montevideo", "Montevideo", "Bluzz Live Montevideo"],
  ["Uruguay", "Montevideo", "Montevideo", "Centro Cultural Florencio Sanchez"],
  ["Paraguay", "Asuncion", "Asuncion", "Teatro Municipal Ignacio A Pane"],
  ["Paraguay", "Asuncion", "Asuncion", "ReciclArte Paraguay"],
  ["Paraguay", "Asuncion", "Asuncion", "Kilkenny Asuncion musica"],
  ["Paraguay", "Asuncion", "Asuncion", "La Chispa Asuncion"],
  ["Paraguay", "Asuncion", "Asuncion", "FestiRock Paraguay"],
  ["Bolivia", "La Paz", "La Paz", "Centro Cultural de Espana La Paz"],
  ["Bolivia", "La Paz", "La Paz", "Centro Simon I Patino"],
  ["Bolivia", "La Paz", "La Paz", "Teatro Nuna La Paz"],
  ["Bolivia", "La Paz", "La Paz", "Alive Music Bar La Paz"],
  ["Bolivia", "Cochabamba", "Cochabamba", "mARTadero Cochabamba"],
  ["Bolivia", "La Paz", "La Paz", "Sonidos de la Tierra Bolivia"],
  ["Peru", "Lima", "Lima", "Estimulos Economicos Cultura Peru musica"],
  ["Peru", "Lima", "Lima", "ICPNA Cultural musica"],
  ["Peru", "Lima", "Lima", "Asociacion Cultural Peruano Britanica musica"],
  ["Peru", "Lima", "Barranco", "La Noche de Barranco"],
  ["Peru", "Lima", "Barranco", "Sargento Pimienta Barranco"],
  ["Peru", "Lima", "Lima", "Yield Rock Lima"],
  ["Peru", "Lima", "Lima", "Festival Selvamomos convocatoria"],
  ["Brasil", "Brasil", "Brasil", "FUNARTE musica edital"],
  ["Brasil", "Brasil", "Brasil", "SESC edital musica Brasil"],
  ["Brasil", "Sao Paulo", "Sao Paulo", "Casa Natura Musical"],
  ["Brasil", "Sao Paulo", "Sao Paulo", "SIM Sao Paulo chamada artistas"],
  ["Brasil", "Goias", "Goiania", "Festival Bananada"],
  ["Brasil", "Rio Grande do Norte", "Natal", "DoSol Natal"],
  ["Brasil", "Rio Grande do Norte", "Natal", "MADA Natal"],
  ["Brasil", "Pernambuco", "Recife", "No Ar Coquetel Molotov"],
  ["Brasil", "Rio de Janeiro", "Rio de Janeiro", "Audio Rebel Rio"],
  ["Brasil", "Minas Gerais", "Belo Horizonte", "A Autentica Belo Horizonte"]
].map(([country, region, city, label]) => ({
  country,
  region,
  city,
  label,
  type: "radar_latam",
  query: `${label} ${city} musica festival convocatoria showcase bandas rock indie booking centro cultural`
}));

LATAM_RECOGNIZED_TARGETS.push(...SOUTH_AMERICA_RECOGNIZED_EXPANSION);

const SOUTH_AMERICA_PRODUCER_BENCHMARKS = [
  ["Argentina", "Buenos Aires", "Buenos Aires", "PopArt Music Argentina"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "300 Producciones Argentina"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "DF Entertainment Argentina"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Crack Producciones Argentina"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Estamos Felices sello Argentina"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Geiser Discos Argentina"],
  ["Uruguay", "Montevideo", "Montevideo", "Bizarro Records Uruguay"],
  ["Uruguay", "Montevideo", "Montevideo", "Little Butterfly Records Uruguay"],
  ["Uruguay", "Montevideo", "Montevideo", "Magnolio Sala Montevideo"],
  ["Uruguay", "Montevideo", "Montevideo", "Espacio Guambia Montevideo"],
  ["Paraguay", "Asuncion", "Asuncion", "Planeador Producciones Paraguay"],
  ["Paraguay", "Asuncion", "Asuncion", "G5Pro Paraguay musica"],
  ["Paraguay", "Asuncion", "Asuncion", "Rock en Py"],
  ["Paraguay", "Asuncion", "Asuncion", "4Kcho Records Paraguay"],
  ["Bolivia", "La Paz", "La Paz", "Wayna Tambo musica Bolivia"],
  ["Bolivia", "La Paz", "La Paz", "Equinoccio Records Bolivia"],
  ["Bolivia", "La Paz", "La Paz", "RockandBol Bolivia"],
  ["Bolivia", "La Paz", "La Paz", "Cultura Viva Comunitaria Bolivia musica"],
  ["Peru", "Lima", "Lima", "Veltrac Music Peru"],
  ["Peru", "Lima", "Lima", "A Tutiplen Records Peru"],
  ["Peru", "Lima", "Lima", "Necio Records Peru"],
  ["Peru", "Lima", "Lima", "Buh Records Peru"],
  ["Brasil", "Sao Paulo", "Sao Paulo", "Natura Musical edital"],
  ["Brasil", "Sao Paulo", "Sao Paulo", "Tratore Brasil"],
  ["Brasil", "Sao Paulo", "Sao Paulo", "Monstro Discos Brasil"],
  ["Brasil", "Sao Paulo", "Sao Paulo", "Sesc Brasil programacao musical"],
  ["Brasil", "Rio de Janeiro", "Rio de Janeiro", "Centro Cultural Banco do Brasil musica"],
  ["Brasil", "Sao Paulo", "Sao Paulo", "Itau Cultural musica"]
].map(([country, region, city, label]) => ({
  country,
  region,
  city,
  label,
  type: "radar_latam",
  query: `${label} ${city} musica festival convocatoria showcase bandas rock indie booking centro cultural sello productora`
}));

LATAM_RECOGNIZED_TARGETS.push(...SOUTH_AMERICA_PRODUCER_BENCHMARKS);

const COLOMBIA_BRASIL_REVIEW_EXPANSION = [
  ["Colombia", "Bogota", "Bogota", "Idartes musica convocatorias"],
  ["Colombia", "Bogota", "Bogota", "Rock al Parque convocatoria bandas"],
  ["Colombia", "Bogota", "Bogota", "Radionica Colombia bandas"],
  ["Colombia", "Bogota", "Bogota", "Shock Musica convocatorias"],
  ["Colombia", "Antioquia", "Medellin", "Altavoz Fest convocatoria bandas"],
  ["Colombia", "Antioquia", "Medellin", "Circulart Medellin"],
  ["Colombia", "Bogota", "Bogota", "Llorona Records Colombia"],
  ["Colombia", "Bogota", "Bogota", "Paramo Presenta bandas"],
  ["Brasil", "Para", "Belem", "Festival Se Rasgum Belem"],
  ["Brasil", "Minas Gerais", "Belo Horizonte", "Festival Sarara Belo Horizonte"],
  ["Brasil", "Sao Paulo", "Sao Paulo", "Popload Festival artistas"],
  ["Brasil", "Sao Paulo", "Sao Paulo", "Natura Musical edital"],
  ["Brasil", "Rio Grande do Sul", "Porto Alegre", "Opiniao Porto Alegre"],
  ["Brasil", "Parana", "Curitiba", "Oficina de Musica de Curitiba"]
].map(([country, region, city, label]) => ({
  country,
  region,
  city,
  label,
  type: "radar_latam",
  query: `${label} ${city} musica festival convocatoria showcase bandas rock indie booking centro cultural sello productora`
}));

LATAM_RECOGNIZED_TARGETS.push(...COLOMBIA_BRASIL_REVIEW_EXPANSION);

const ARGENTINA_REVIEW_RECOGNIZED = [
  ["Argentina", "Buenos Aires", "Buenos Aires", "Lollapalooza Argentina bandas emergentes"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Quilmes Rock Argentina bandas"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Ciudad Emergente Buenos Aires convocatoria bandas"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Fondo Nacional de las Artes musica Argentina"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "Ibermusicas Argentina convocatorias"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "El Emergente Almagro bandas"],
  ["Argentina", "Buenos Aires", "Buenos Aires", "CC Richards Buenos Aires"],
  ["Argentina", "Santa Fe", "Santa Fe", "Harlem Festival Santa Fe"]
].map(([country, region, city, label]) => ({
  country,
  region,
  city,
  label,
  type: "radar_latam",
  query: `${label} ${city} musica festival convocatoria showcase bandas rock indie booking centro cultural sello productora`
}));

LATAM_RECOGNIZED_TARGETS.push(...ARGENTINA_REVIEW_RECOGNIZED);

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

const GLOBAL_PRIORITY_EXPANSION = [
  ["Canada", "Ontario", "Toronto", "FACTOR Canada music"],
  ["Canada", "Ontario", "Toronto", "North by Northeast artist application"],
  ["Canada", "Quebec", "Montreal", "Pop Montreal artist application"],
  ["Canada", "Nova Scotia", "Halifax", "Halifax Pop Explosion artist application"],
  ["Francia", "Bretagne", "Rennes", "Trans Musicales Rennes candidature"],
  ["Francia", "Provence-Alpes-Cote d'Azur", "Marseille", "Babel Music XP showcase"],
  ["Alemania", "Berlin", "Berlin", "Pop-Kultur Nachwuchs"],
  ["Alemania", "Nordrhein-Westfalen", "Cologne", "c/o pop artist application"],
  ["Inglaterra", "Merseyside", "Liverpool", "Liverpool Sound City artist application"],
  ["Inglaterra", "Greater Manchester", "Manchester", "Band on the Wall Manchester"],
  ["Espana", "Andalucia", "Sevilla", "Monkey Week showcase"],
  ["Espana", "Cataluna", "Vic", "Mercat de Musica Viva de Vic"],
  ["Marruecos", "Casablanca", "Casablanca", "L'Uzine Casablanca"],
  ["Marruecos", "Agadir", "Agadir", "Festival Timitar Agadir"],
  ["Sudafrica", "Western Cape", "Cape Town", "Concerts SA mobility fund"],
  ["Sudafrica", "Gauteng", "Johannesburg", "Moshito Music Conference"],
  ["Nigeria", "Lagos", "Lagos", "Felabration Lagos"],
  ["Ghana", "Greater Accra", "Accra", "Chale Wote Accra"],
  ["Kenia", "Nairobi", "Nairobi", "Blankets and Wine Kenya"],
  ["Senegal", "Dakar", "Dakar", "Saint-Louis Jazz Senegal"],
  ["Egipto", "Cairo", "Cairo", "El Sawy Culturewheel"],
  ["Japon", "Fukuoka", "Fukuoka", "Fukuoka Music Month"],
  ["Corea del Sur", "Busan", "Busan", "Busan Rock Festival"],
  ["China", "Shanghai", "Shanghai", "Modern Sky Festival China"],
  ["India", "Goa", "Goa", "Serendipity Arts Festival music"],
  ["Indonesia", "Jakarta", "Jakarta", "Synchronize Fest"],
  ["Tailandia", "Bangkok", "Bangkok", "Maho Rasop Festival"]
].map(([country, region, city, label]) => ({
  country,
  region,
  city,
  label,
  type: "radar_global",
  query: `${label} ${city} music open call band submissions showcase festival arts council booking`
}));

GLOBAL_PRIORITY_TARGETS.push(...GLOBAL_PRIORITY_EXPANSION);

const CANADA_US_PRIORITY_REVIEW = [
  ["Canada", "Ontario", "Toronto", "Canadian Music Week artist submission"],
  ["Canada", "Ontario", "Toronto", "North by Northeast artist application"],
  ["Canada", "Quebec", "Montreal", "Pop Montreal artist application"],
  ["Canada", "British Columbia", "Vancouver", "BreakOut West showcase"],
  ["Canada", "Alberta", "Calgary", "Sled Island artist application"],
  ["Canada", "Nova Scotia", "Halifax", "East Coast Music Association showcase"],
  ["Estados Unidos", "National", "New York", "New Music USA project grants"],
  ["Estados Unidos", "National", "Baltimore", "Mid Atlantic Arts USArtists International music"],
  ["Estados Unidos", "South", "Atlanta", "South Arts jazz road tours"],
  ["Estados Unidos", "New York", "New York", "Mondo NYC artist application"],
  ["Estados Unidos", "New York", "New York", "New Colossus Festival artist application"],
  ["Estados Unidos", "Idaho", "Boise", "Treefort Music Fest artist submission"],
  ["Estados Unidos", "Missouri", "Kansas City", "Folk Alliance International showcase application"],
  ["Estados Unidos", "National", "Washington", "NPR Tiny Desk Contest"]
].map(([country, region, city, label]) => ({
  country,
  region,
  city,
  label,
  type: "radar_global",
  query: `${label} ${city} music open call band submissions showcase festival arts council booking grants`
}));

GLOBAL_PRIORITY_TARGETS.push(...CANADA_US_PRIORITY_REVIEW);

const GREENLAND_EUROPE_ASIA_PRIORITY_REVIEW = Object.entries(GREENLAND_EUROPE_ASIA_PUBLIC_SPACE_REVIEW)
  .flatMap(([country, targets]) => targets.slice(0, 3).map((label) => ({
    country,
    region: "Radar profundo",
    city: country,
    label,
    type: "radar_global",
    query: `${label} ${country} music open call artists showcase festival arts council booking grants international bands`
  })));

GLOBAL_PRIORITY_TARGETS.push(...GREENLAND_EUROPE_ASIA_PRIORITY_REVIEW);

const ASIA_FUNDS_PRODUCERS_PRIORITY_REVIEW = Object.entries(ASIA_FUNDS_PRODUCERS_FOREIGN_CALLS)
  .flatMap(([country, targets]) => targets.slice(0, 4).map((label) => ({
    country,
    region: "Asia fondos/productoras",
    city: country,
    label,
    type: "radar_asia_support",
    query: `${label} ${country} music grant funding producer booking foreign bands international artists band submissions`
  })));

GLOBAL_PRIORITY_TARGETS.push(...ASIA_FUNDS_PRODUCERS_PRIORITY_REVIEW);

const FOCUS_COUNTRY_FUNDS_PRODUCERS_PRIORITY_REVIEW = Object.entries(FOCUS_COUNTRY_FUNDS_PRODUCERS_FOREIGN_CALLS)
  .flatMap(([country, targets]) => targets.slice(0, 6).map((label) => ({
    country,
    region: "Fondos/productoras foco",
    city: country,
    label,
    type: "radar_focus_support",
    query: `${label} ${country} music grant funding producer booking foreign bands international artists band submissions open call`
  })));

GLOBAL_PRIORITY_TARGETS.push(...FOCUS_COUNTRY_FUNDS_PRODUCERS_PRIORITY_REVIEW);

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
    url: generalTargetSearchUrl(target),
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
  url: generalTargetSearchUrl(target),
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

function targetSearchText(target) {
  return [...new Set([
    target.label,
    target.city,
    target.region,
    target.country
  ].filter(Boolean))].join(" ");
}

function generalTargetSearchUrl(target) {
  return googleSearchUrl(`${targetSearchText(target)} musica conciertos programacion convocatoria artistas bandas centro cultural open call`);
}

function instagramTargetSearchUrl(target) {
  return googleSearchUrl(`site:instagram.com ${targetSearchText(target)} musica conciertos agenda cultura bandas`);
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
  const semanticTail = GLOBAL_SEMANTIC_SEARCH_TERMS.slice(0, 8).join(" ");
  return (ADMIN_DIVISION_TERMS[country] || DEFAULT_ADMIN_DIVISION_TERMS).map((term, index) => ({
    country,
    region: "Territorial",
    city: displayLabel(term),
    label: `${displayLabel(country)} - ${term}`,
    lat: view.center[0] + (index - 2) * 0.35,
    lng: view.center[1] + (index - 2) * 0.35,
    type: "radar_territorial",
    query: `${country} ${term} cultura musica bandas convocatoria centro cultural festival ${semanticTail}`
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
    },
    {
      title: `Fondos monetarios, ONG y fundaciones - ${country}`,
      category: "fondos_monetarios_ong",
      url: googleSearchUrl(`"${queryCountry}" "music grant" OR "funding for musicians" OR "NGO music fund" OR "private foundation" OR "ayuda monetaria musicos extranjeros"`),
      summary: "Busca apoyo economico para musicos extranjeros: grants, becas, ONG, fundaciones privadas, institutos culturales, embajadas y travel support."
    },
    {
      title: `Residencias y movilidad internacional - ${country}`,
      category: "residencias_movilidad",
      url: googleSearchUrl(`"${queryCountry}" "artist residency" "music" OR "mobility grant" OR "travel grant" OR "international cultural exchange"`),
      summary: "Rastrea residencias, movilidad internacional, apoyo de viaje, intercambio cultural y programas abiertos a artistas de otros paises."
    }
  ];
  territoryTargetsForSelection(country).forEach((target) => {
    searches.push(
      {
        title: `Mapa territorial - ${target.label}`,
        category: "radar_territorial",
        url: generalTargetSearchUrl(target),
        summary: `Busqueda por unidad territorial (${target.region}/${target.city}). Cruza comuna/municipio/departamento/provincia/estado/condado con señales de bandas internacionales, teloneros, nuevos sonidos y programacion.`,
        lat: target.lat,
        lng: target.lng,
        region: target.region,
        city: target.city
      },
      {
        title: `Instagram territorial - ${target.label}`,
        category: "instagram_territorial",
        url: instagramTargetSearchUrl(target),
        summary: "Rastrea publicaciones recientes de cultura local, municipalidades, centros culturales, festivales, llamados a bandas, teloneros y nuevos sonidos.",
        lat: target.lat,
        lng: target.lng,
        region: target.region,
        city: target.city
      }
    );
  });
  GLOBAL_SEMANTIC_SEARCH_TERMS.forEach((term) => {
    searches.push(
      {
        title: `Radar semantico global - ${term}`,
        category: "radar_semantico",
        url: googleSearchUrl(`"${queryCountry}" "${term}" rock OR folk OR fusion OR experimental OR progresivo`),
        summary: "Busqueda sensible a sinonimos de oportunidad: teloneros, bandas extranjeras, showcases, movilidad, nuevos sonidos, programacion y llamados internacionales."
      },
      {
        title: `Instagram semantico global - ${term}`,
        category: "instagram_semantico",
        url: googleSearchUrl(`site:instagram.com "${queryCountry}" "${term}" bandas musica convocatoria concierto`),
        summary: "Rastrea posts/reels recientes donde la oportunidad puede aparecer como publicidad, caption, busqueda de teloneros o llamado rapido a nuevos sonidos."
      }
    );
  });
  const globalTerms = GLOBAL_PUBLIC_SEARCH_TERMS.slice(0, filters.continent === "Global" ? 14 : 8);
  globalTerms.forEach((term) => {
    searches.push({
      title: `Global multiidioma - ${term}`,
      category: "global_open_call",
      url: googleSearchUrl(`"${queryCountry}" "${term}" rock OR folk OR experimental OR fusion`),
      summary: "Busqueda global en ingles o idioma local para detectar convocatorias, festivales, residencias y showcases que acepten artistas de otros paises."
    });
  });
  GLOBAL_SUPPORT_FUNDING_TERMS.slice(0, 12).forEach((term) => {
    searches.push({
      title: `Apoyo monetario global - ${term}`,
      category: "fondos_monetarios_global",
      url: googleSearchUrl(`"${queryCountry}" "${term}" rock OR folk OR fusion OR experimental OR progressive`),
      summary: "Busqueda enfocada en dinero real: fondos, becas, honorarios, residencias pagadas, travel grants, ONG y fundaciones privadas para musicos extranjeros."
    });
  });
  [
    ["Instagram internacional", `site:instagram.com/p "${queryCountry}" "international artists" "open call" music`],
    ["Instagram bandas extranjeras", `site:instagram.com/reel "${queryCountry}" "foreign artists" "festival" music`],
    ["On the Move movilidad", `site:on-the-move.org "${queryCountry}" music mobility artists`],
    ["Culture360 Asia Europa", `site:culture360.asef.org "${queryCountry}" music open call artists`],
    ["Res Artis residencias", `site:resartis.org "${queryCountry}" music residency grant`],
    ["TransArtists residencias", `site:transartists.org "${queryCountry}" music residency funding`],
    ["Goethe fondos culturales", `site:goethe.de "${queryCountry}" music residency funding artists`],
    ["Institut Francais fondos", `site:institutfrancais.com "${queryCountry}" music grant artists`],
    ["British Council music", `site:britishcouncil.org "${queryCountry}" music grant international artists`],
    ["Pro Helvetia residencias", `site:prohelvetia.ch "${queryCountry}" music residency grant`],
    ["UNESCO IFCD", `site:unesco.org "${queryCountry}" International Fund for Cultural Diversity music`],
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
  GLOBAL_SUPPORT_INSTITUTION_TARGETS.slice(0, 14).forEach((target) => {
    searches.push({
      title: `Organismo apoyo externo - ${target}`,
      category: "organismo_apoyo_externo",
      url: googleSearchUrl(`"${target}" "${queryCountry}" music grant residency mobility foreign artists international musicians`),
      summary: "Busca organismos de otros paises, ONG, institutos culturales o fundaciones que puedan financiar movilidad, residencias, circulacion o colaboracion musical internacional."
    });
  });
  const publicTargets = (COUNTRY_PUBLIC_SPACE_TARGETS[country] || []).slice(0, country === "Chile" ? 18 : 10);
  publicTargets.forEach((target) => {
    searches.push(
      {
        title: `Instagram publico en Google - ${target}`,
        category: "instagram_espacio_publico",
        url: googleSearchUrl(`site:instagram.com "${target}" convocatoria presentar artistas postula proyecto programacion artistica music musica`),
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
          url: googleSearchUrl(`site:instagram.com ${target.city} ${target.region} ${target.label} tocata buscamos bandas se buscan bandas conciertos musica`),
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
  document.body.classList.add("is-loading");
  els.opportunityList.classList.add("is-busy");
  els.backendStatus.textContent = "Conectando";
  els.backendStatus.className = "status-pill is-loading";
  try {
    if (!API_BASE_URL) {
      opportunities = fallbackPayload.opportunities;
      sources = fallbackPayload.sources;
      els.backendStatus.textContent = "Respaldo local";
      els.backendStatus.className = "status-pill offline";
      return;
    }
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
  } finally {
    document.body.classList.remove("is-loading");
    els.opportunityList.classList.remove("is-busy");
    renderAll();
  }
}

function showStateToast(message, tone = "success") {
  let toast = document.getElementById("stateToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "stateToast";
    toast.className = "state-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `state-toast is-visible is-${tone}`;
  window.clearTimeout(showStateToast._timer);
  showStateToast._timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3200);
}

async function handleManualRefresh() {
  const previousLabel = els.refreshButton.innerHTML;
  els.refreshButton.disabled = true;
  els.refreshButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Recargando';
  await loadData();
  if (API_BASE_URL) {
    els.backendStatus.textContent = "Datos recargados - motor automatico en GitHub";
    els.backendStatus.className = "status-pill online";
    showStateToast("Radar actualizado correctamente.", "success");
  } else {
    showStateToast("Modo respaldo local activo.", "error");
  }
  els.refreshButton.disabled = false;
  els.refreshButton.innerHTML = previousLabel;
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

function simpleApplicationSnapshot(opp) {
  const checklist = (opp.applicationChecklist && opp.applicationChecklist.length)
    ? opp.applicationChecklist
    : (opp.requirements || ["revisar bases/formulario"]).slice(0, 3);
  return {
    cost: opp.applicationCost || "Por confirmar",
    contact: opp.applicationContact || "No visible; abrir link oficial",
    checklist: checklist.slice(0, 4).join(", ")
  };
}

function contactMarkup(contact) {
  const value = String(contact || "No visible; abrir link oficial");
  const email = value.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0];
  if (email) {
    return escapeHtml(value).replace(
      escapeHtml(email),
      `<a href="mailto:${encodeURIComponent(email)}" onclick="event.stopPropagation()">${escapeHtml(email)}</a>`
    );
  }
  const url = value.match(/https?:\/\/[^\s]+/i)?.[0];
  if (url) {
    return escapeHtml(value).replace(
      escapeHtml(url),
      `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${escapeHtml(url)}</a>`
    );
  }
  return escapeHtml(value);
}

function renderOpportunityCard(opp) {
  const snapshot = simpleApplicationSnapshot(opp);
  return `
    <article class="opportunity-card" data-id="${opp.id}" tabindex="0">
      <div class="card-top">
        <span class="country-badge">${escapeHtml(opp.country)} - ${escapeHtml(opp.region || "sin region")}</span>
        <span class="link-status ${escapeHtml(opp.linkStatus)}">${statusLabel(opp.linkStatus)}</span>
      </div>
      <h3>${escapeHtml(opp.title)}</h3>
      <div class="application-mini">
        <div><strong>Costo</strong><span>${escapeHtml(snapshot.cost)}</span></div>
        <div><strong>Requiere</strong><span>${escapeHtml(snapshot.checklist)}</span></div>
        <div><strong>Contacto</strong><span>${contactMarkup(snapshot.contact)}</span></div>
      </div>
      <a class="official-link" href="${escapeHtml(opp.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
        Abrir y confirmar <i class="fa-solid fa-up-right-from-square"></i>
      </a>
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
      <div class="application-mini">
        <div><strong>Costo</strong><span>Por confirmar</span></div>
        <div><strong>Requiere</strong><span>abrir resultado oficial, bases/formulario, EPK</span></div>
        <div><strong>Contacto</strong><span>buscar correo o formulario en la fuente</span></div>
      </div>
      <a class="official-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">
        Abrir busqueda y confirmar <i class="fa-solid fa-up-right-from-square"></i>
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
  if (signals.includes("nuevos_sonidos")) {
    steps.push("Si buscan nuevos sonidos, arma un pitch curatorial: identidad sonora, influencias, diferencia frente a otras bandas, registro en vivo y por que encaja.");
  }
  if (signals.includes("programacion")) {
    steps.push("Si aparece programacion artistica, busca correo/formulario de propuestas, calendario curatorial, requisitos tecnicos y politica de honorarios.");
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
  els.refreshButton.addEventListener("click", handleManualRefresh);
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
