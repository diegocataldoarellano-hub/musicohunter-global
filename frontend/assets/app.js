const API_BASE_URL = (window.MUSIC_HUNTER_CONFIG?.API_BASE_URL || "").replace(/\/$/, "");

const fallbackPayload = {
  opportunities: [
    {
      id: 1,
      title: "Feria Pulsar / industria musical chilena",
      category: "showcase",
      country: "Chile",
      region: "Los Rios",
      city: "Valdivia",
      lat: -39.8142,
      lng: -73.2459,
      deadline: null,
      eventDate: null,
      genres: ["rock", "folk", "fusion", "experimental"],
      requirements: ["Revisar convocatorias y programacion vigente en la fuente oficial.", "Preparar EPK, enlaces en vivo y datos de contacto."],
      url: "https://www.feriapulsar.cl/",
      sourceName: "Feria Pulsar",
      sourceType: "festival",
      lastChecked: null,
      linkStatus: "requires_review",
      confidence: 0.78,
      summary: "Fuente chilena relevante para showcases, industria musical y oportunidades de circulacion."
    },
    {
      id: 2,
      title: "Fondos de Cultura - musica y circulacion",
      category: "fondo",
      country: "Chile",
      region: "Metropolitana",
      city: "Santiago",
      lat: -33.4489,
      lng: -70.6693,
      deadline: null,
      eventDate: null,
      genres: ["rock", "folk", "fusion", "experimental", "progresivo"],
      requirements: ["Revisar bases vigentes.", "Validar lineas de financiamiento para musica, circulacion o internacionalizacion."],
      url: "https://www.fondosdecultura.cl/",
      sourceName: "Ministerio de las Culturas",
      sourceType: "institucion",
      lastChecked: null,
      linkStatus: "requires_review",
      confidence: 0.82,
      summary: "Portal oficial para convocatorias publicas de financiamiento cultural en Chile."
    },
    {
      id: 3,
      title: "BAFIM - mercado musical",
      category: "mercado",
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
    }
  ],
  sources: [
    { id: 1, name: "Feria Pulsar", country: "Chile", region: "Los Rios", type: "festival", url: "https://www.feriapulsar.cl/", linkStatus: "requires_review" },
    { id: 2, name: "Fondos de Cultura", country: "Chile", region: "Metropolitana", type: "institucion", url: "https://www.fondosdecultura.cl/", linkStatus: "requires_review" },
    { id: 3, name: "BAFIM", country: "Argentina", region: "Buenos Aires", type: "mercado", url: "https://bafim.buenosaires.gob.ar/", linkStatus: "requires_review" }
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

function fillSelect(select, values, label) {
  select.innerHTML = `<option value="all">${label}</option>` + values.map((value) => (
    `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`
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
  fillSelect(els.countryFilter, unique(opportunities.map((o) => o.country)), "Todos");
  fillSelect(els.regionFilter, unique(opportunities.map((o) => o.region)), "Todas");
  fillSelect(els.categoryFilter, unique(opportunities.map((o) => o.category)), "Todas");
  fillSelect(els.genreFilter, unique(opportunities.flatMap((o) => o.genres || [])), "Todos");

  const quick = ["Chile", "rock", "folk", "fusion", "experimental", "booking", "prensa", "festival"];
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
    ...(opp.genres || [])
  ].join(" ").toLowerCase();
  const query = filters.q.toLowerCase();
  const quick = filters.quick?.toLowerCase();
  if (query && !text.includes(query)) return false;
  if (quick && !text.includes(quick)) return false;
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
          <span class="category-badge">${escapeHtml(opp.category)}</span>
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
        <span class="category-badge">${escapeHtml(source.type || "fuente")}</span>
        <span class="link-status ${escapeHtml(source.linkStatus)}">${statusLabel(source.linkStatus)}</span>
      </div>
      <h3>${escapeHtml(source.name)}</h3>
      <p>${escapeHtml(source.country || "")}${source.region ? ` - ${escapeHtml(source.region)}` : ""}</p>
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
      <p class="eyebrow">${escapeHtml(opp.category)} - ${escapeHtml(opp.country)}</p>
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
