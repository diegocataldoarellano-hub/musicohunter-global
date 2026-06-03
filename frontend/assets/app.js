const API_BASE_URL = (window.MUSIC_HUNTER_CONFIG?.API_BASE_URL || "").replace(/\/$/, "");

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

function continentForCountry(country) {
  const latinAmerica = new Set(["Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Ecuador", "Mexico", "Paraguay", "Peru", "Uruguay", "Venezuela"]);
  if (!country || country === "Global") return "Global";
  if (latinAmerica.has(country)) return "Latinoamerica";
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

function fillSelect(select, values, label) {
  select.innerHTML = `<option value="all">${label}</option>` + values.map((value) => (
    `<option value="${escapeHtml(value)}">${escapeHtml(displayLabel(value))}</option>`
  )).join("");
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
  fillSelect(els.continentFilter, unique(opportunities.map(itemContinent)), "Todos");
  fillSelect(els.countryFilter, unique(opportunities.map((o) => o.country)), "Todos");
  fillSelect(els.regionFilter, unique(opportunities.map((o) => o.region)), "Todas");
  fillSelect(els.categoryFilter, unique(opportunities.map((o) => o.category)), "Todas");
  fillSelect(els.genreFilter, unique(opportunities.flatMap((o) => o.genres || [])), "Todos");

  const quick = ["Chile", "instagram", "tiktok", "sello", "booking", "productora", "municipio", "centro cultural", "rock", "festival"];
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
  document.getElementById("heroCountries").textContent = unique(opportunities.map((o) => o.country)).length;
  els.resultCount.textContent = filtered.length;
}

function renderList() {
  if (!filtered.length) {
    els.opportunityList.innerHTML = `<div class="empty-state">No hay oportunidades con esos filtros. Prueba limpiar busqueda o mostrar todos los estados de link.</div>`;
    return;
  }

  els.opportunityList.innerHTML = filtered.map((opp) => {
    const status = deadlineStatus(opp.deadline);
    const dateText = opp.deadline ? new Date(opp.deadline + "T00:00:00").toLocaleDateString("es-CL") : "sin fecha";
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
  }).join("");
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
  const visibleSources = sources.slice(0, 12);
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
      reRenderAfterFilter();
    });
  });
  els.quickFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-quick]");
    if (!button) return;
    filters.quick = filters.quick === button.dataset.quick ? null : button.dataset.quick;
    els.quickFilters.querySelectorAll(".chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.quick === filters.quick);
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
