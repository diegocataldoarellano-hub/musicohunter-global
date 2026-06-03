const API_BASE_URL = (window.MUSIC_HUNTER_CONFIG?.API_BASE_URL || "").replace(/\/$/, "");

const TARGET_COUNTRIES = [
  ...["Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Costa Rica", "Cuba", "Ecuador", "El Salvador", "Guatemala", "Honduras", "Mexico", "Nicaragua", "Panama", "Paraguay", "Peru", "Republica Dominicana", "Uruguay", "Venezuela"].map((country) => ({ continent: "Latinoamerica", country })),
  ...["Albania", "Alemania", "Andorra", "Armenia", "Austria", "Belgica", "Bielorrusia", "Bosnia y Herzegovina", "Bulgaria", "Chipre", "Croacia", "Dinamarca", "Eslovaquia", "Eslovenia", "Espana", "Estonia", "Finlandia", "Francia", "Georgia", "Grecia", "Hungria", "Irlanda", "Islandia", "Italia", "Kosovo", "Letonia", "Liechtenstein", "Lituania", "Luxemburgo", "Macedonia del Norte", "Malta", "Moldavia", "Monaco", "Montenegro", "Noruega", "Paises Bajos", "Polonia", "Portugal", "Reino Unido", "Republica Checa", "Rumania", "San Marino", "Serbia", "Suecia", "Suiza", "Turquia", "Ucrania", "Vaticano"].map((country) => ({ continent: "Europa", country }))
];

const SEARCH_MISSION_TEMPLATES = [
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
  '"{country}" intercambio musical bandas latinoamerica europa'
];

const CONTINENT_VIEWS = {
  Latinoamerica: { center: [-17.0, -64.0], zoom: 3 },
  Europa: { center: [54.0, 15.0], zoom: 4 },
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
  Dinamarca: { center: [56.2639, 9.5018], zoom: 7 },
  Ecuador: { center: [-1.8312, -78.1834], zoom: 6 },
  "El Salvador": { center: [13.7942, -88.8965], zoom: 8 },
  Eslovaquia: { center: [48.669, 19.699], zoom: 7 },
  Eslovenia: { center: [46.1512, 14.9955], zoom: 8 },
  Espana: { center: [40.4637, -3.7492], zoom: 6 },
  Estonia: { center: [58.5953, 25.0136], zoom: 7 },
  Finlandia: { center: [61.9241, 25.7482], zoom: 5 },
  Francia: { center: [46.2276, 2.2137], zoom: 6 },
  Georgia: { center: [42.3154, 43.3569], zoom: 7 },
  Grecia: { center: [39.0742, 21.8243], zoom: 6 },
  Guatemala: { center: [15.7835, -90.2308], zoom: 7 },
  Honduras: { center: [15.2, -86.2419], zoom: 7 },
  Hungria: { center: [47.1625, 19.5033], zoom: 7 },
  Irlanda: { center: [53.4129, -8.2439], zoom: 7 },
  Islandia: { center: [64.9631, -19.0208], zoom: 6 },
  Italia: { center: [41.8719, 12.5674], zoom: 6 },
  Kosovo: { center: [42.6026, 20.903], zoom: 8 },
  Letonia: { center: [56.8796, 24.6032], zoom: 7 },
  Liechtenstein: { center: [47.166, 9.5554], zoom: 10 },
  Lituania: { center: [55.1694, 23.8813], zoom: 7 },
  Luxemburgo: { center: [49.8153, 6.1296], zoom: 9 },
  "Macedonia del Norte": { center: [41.6086, 21.7453], zoom: 8 },
  Malta: { center: [35.9375, 14.3754], zoom: 10 },
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
  "San Marino": { center: [43.9424, 12.4578], zoom: 11 },
  Serbia: { center: [44.0165, 21.0059], zoom: 7 },
  Suecia: { center: [60.1282, 18.6435], zoom: 5 },
  Suiza: { center: [46.8182, 8.2275], zoom: 7 },
  Turquia: { center: [38.9637, 35.2433], zoom: 5 },
  Ucrania: { center: [48.3794, 31.1656], zoom: 6 },
  Uruguay: { center: [-32.5228, -55.7658], zoom: 6 },
  Vaticano: { center: [41.9029, 12.4534], zoom: 12 },
  Venezuela: { center: [6.4238, -66.5897], zoom: 5 }
};

const CHILE_REGIONAL_TARGETS = [
  { region: "Metropolitana", city: "Santiago", query: "Santiago agenda cultural conciertos bandas rock centro cultural" },
  { region: "Valparaiso", city: "Valparaiso", query: "Valparaiso agenda cultural conciertos convocatoria bandas centro cultural" },
  { region: "Valparaiso", city: "Limache", query: "Limache musica conciertos centro cultural municipio agenda" },
  { region: "Nuble", city: "Chillan", query: "Chillan centro cultural conciertos musica entrada liberada" },
  { region: "Biobio", city: "Los Angeles", query: "Los Angeles Bio Bio centro cultural musica conciertos festival" },
  { region: "Biobio", city: "Concepcion", query: "Concepcion Festival REC Teatro Biobio bandas rock convocatoria" },
  { region: "Coquimbo", city: "Valle de Elqui", query: "Valle de Elqui Vicuña Paihuano musica conciertos cultura" },
  { region: "Coquimbo", city: "La Serena", query: "La Serena Coquimbo teatro centenario conciertos musica agenda" },
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
  { tag: "valledelelqui", label: "Valle de Elqui", region: "Coquimbo" }
];

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
    { id: 11, name: "Quemasucabeza", continent: "Latinoamerica", country: "Chile", region: "Metropolitana", type: "sello", url: "https://www.quemasucabeza.com/", linkStatus: "requires_review" },
    { id: 12, name: "Lotus Producciones", continent: "Latinoamerica", country: "Chile", region: "Metropolitana", type: "productora", url: "https://www.lotuspro.cl/", linkStatus: "requires_review" },
    { id: 13, name: "Instagram - hashtag rockchileno", continent: "Latinoamerica", country: "Chile", region: "Digital", type: "red_social", url: "https://www.instagram.com/explore/tags/rockchileno/", linkStatus: "requires_review" },
    { id: 14, name: "TikTok - hashtag rockchileno", continent: "Latinoamerica", country: "Chile", region: "Digital", type: "red_social", url: "https://www.tiktok.com/tag/rockchileno", linkStatus: "requires_review" },
    { id: 15, name: "BAFIM", continent: "Latinoamerica", country: "Argentina", region: "Buenos Aires", type: "mercado", url: "https://bafim.buenosaires.gob.ar/", linkStatus: "requires_review" },
    { id: 16, name: "Rock al Parque", continent: "Latinoamerica", country: "Colombia", region: "Bogota", type: "festival", url: "https://www.rockalparque.gov.co/", linkStatus: "requires_review" }
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
  { name: "Corporacion Cultural Municipal de Los Angeles", region: "Biobio", type: "centro_cultural", url: "https://www.facebook.com/ccmlalosangeles/" }
].map((source, index) => ({
  id: 100 + index,
  continent: "Latinoamerica",
  country: "Chile",
  linkStatus: "requires_review",
  ...source
}));

fallbackPayload.opportunities.push(...chileRegionalFallbackOpportunities);
fallbackPayload.sources.push(...chileRegionalFallbackSources);

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
  const latinAmerica = new Set(["Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Ecuador", "Mexico", "Paraguay", "Peru", "Uruguay", "Venezuela"]);
  const europe = new Set(TARGET_COUNTRIES.filter((item) => item.continent === "Europa").map((item) => item.country));
  if (!country || country === "Global") return "Global";
  if (latinAmerica.has(country)) return "Latinoamerica";
  if (europe.has(country)) return "Europa";
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
  return SEARCH_MISSION_TEMPLATES.map((template) => template.replaceAll("{country}", country));
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

function googleSearchUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function instagramHashtagUrl(tag) {
  return `https://www.instagram.com/explore/tags/${encodeURIComponent(normalizeToken(tag))}/`;
}

function tiktokSearchUrl(query) {
  return `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;
}

function buildExternalSearchCards() {
  const country = selectedSearchCountry();
  const scope = selectedScopeLabel();
  const phrase = searchPhrase();
  const compactCountry = normalizeToken(country);
  const searches = [
    {
      title: `Instagram posts publicos - ${country}`,
      category: "instagram_posts",
      url: googleSearchUrl(`site:instagram.com/p "${country}" ${phrase} teloneros showcase convocatoria`),
      summary: "Busqueda directa en Google sobre posts publicos de Instagram. Prioriza convocatorias, teloneros, showcases, festivales y concursos."
    },
    {
      title: `Instagram reels publicos - ${country}`,
      category: "instagram_reels",
      url: googleSearchUrl(`site:instagram.com/reel "${country}" bandas rock festival convocatoria productora`),
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
      url: tiktokSearchUrl(`${country} bandas rock festival convocatoria teloneros`),
      summary: "Busqueda publica en TikTok para detectar publicaciones rapidas de conciertos, festivales, salas y escenas emergentes."
    },
    {
      title: `Productoras, booking y sellos - ${scope}`,
      category: "booking_productoras",
      url: googleSearchUrl(`"${country}" productora booking sello independiente bandas rock fusion experimental instagram`),
      summary: "Busqueda ampliada de perfiles publicos de productoras, sellos, agencias de booking y medios musicales."
    },
    {
      title: `Fondos, municipios y centros culturales - ${country}`,
      category: "fondos_espacios",
      url: googleSearchUrl(`"${country}" municipio centro cultural fondos musica bandas convocatoria pago honorarios`),
      summary: "Busqueda de espacios publicos con pago, fondos, municipios, centros culturales y convocatorias institucionales."
    }
  ];
  if (country === "Chile") {
    const promotionTags = CHILE_INSTAGRAM_PROMOTION_TAGS
      .filter((item) => filters.region === "all" || item.region === "Nacional" || item.region === filters.region)
      .slice(0, filters.region === "all" ? 12 : 8);
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
          url: googleSearchUrl(`site:instagram.com/p "#${item.tag}" "concierto" OR "convocatoria" OR "postula hasta" after:2025-01-01`),
          summary: `Busqueda reciente por publicaciones con #${item.tag}. Prioriza avisos culturales, tocatas, convocatorias, bases y cierres.`
        }
      );
    });
    const regionalTargets = CHILE_REGIONAL_TARGETS
      .filter((target) => filters.region === "all" || target.region === filters.region || target.city === filters.region)
      .slice(0, filters.region === "all" ? 10 : 4);
    regionalTargets.forEach((target) => {
      searches.push(
        {
          title: `Instagram reciente - ${target.city}`,
          category: "instagram_regional",
          url: googleSearchUrl(`site:instagram.com/p OR site:instagram.com/reel "${target.city}" ${target.query} after:2025-01-01`),
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
    region: "Busqueda publica",
    city: scope,
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
    return COUNTRY_VIEWS[filters.country] || CONTINENT_VIEWS[continentForCountry(filters.country)] || CONTINENT_VIEWS.Global;
  }
  if (filters.continent !== "all") return CONTINENT_VIEWS[filters.continent] || CONTINENT_VIEWS.Global;
  return CONTINENT_VIEWS.Latinoamerica;
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
    els.backendStatus.textContent = "Demo publico";
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
    els.backendStatus.textContent = "Modo demo";
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
    : (filters.continent !== "all" ? filters.continent : "Chile, Latinoamerica y Europa");
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
  const visibleSources = sources.slice(0, 30);
  els.sourcesList.innerHTML = visibleSources.map((source) => `
    <article class="source-card">
      <div class="card-top">
        <span class="category-badge">${escapeHtml(displayLabel(source.type || "fuente"))}</span>
        <span class="link-status ${escapeHtml(source.linkStatus)}">${statusLabel(source.linkStatus)}</span>
      </div>
      <h3>${escapeHtml(source.name)}</h3>
      <p>${escapeHtml(itemContinent(source))} - ${escapeHtml(source.country || "")}${source.region ? ` - ${escapeHtml(source.region)}` : ""}</p>
      <a class="official-link" href="${escapeHtml(source.url)}" target="_blank" rel="noopener">
        Abrir fuente <i class="fa-solid fa-up-right-from-square"></i>
      </a>
    </article>
  `).join("");
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
        <h3>Requisitos detectados</h3>
        <ul>${(opp.requirements || ["Revisar bases oficiales en la fuente."]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
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
    const card = event.target.closest(".opportunity-card");
    if (card) openDetail(card.dataset.id);
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
