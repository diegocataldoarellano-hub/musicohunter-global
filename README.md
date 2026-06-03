# Music Hunter Global

Buscador publico y curado de oportunidades musicales para rock, rock fusion, progresivo, folk, experimental e indie afin. Prioriza Chile por regiones y luego expande a Latinoamerica y Europa.

## Arquitectura

- `frontend/`: sitio estatico para GitHub Pages.
- `backend/`: API FastAPI para Render.
- `render.yaml`: Render Blueprint con API, Postgres y cron diario.
- `.github/workflows/pages.yml`: publicacion del frontend en GitHub Pages.

## Desarrollo local

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Abre `frontend/index.html` con Live Server o cualquier servidor estatico. Si el backend corre localmente, la URL por defecto ya apunta a `http://127.0.0.1:8000`.

## Despliegue

1. Sube este proyecto a GitHub.
2. Activa GitHub Pages con GitHub Actions.
3. Crea el Blueprint en Render usando `render.yaml`.
4. Cuando Render entregue la URL publica de `music-hunter-api`, actualiza `frontend/assets/config.js`:

```js
window.MUSIC_HUNTER_CONFIG = {
  API_BASE_URL: "https://tu-api.onrender.com"
};
```

## Agente curador

El cron de Render ejecuta:

```bash
python -m app.curator_agent
```

El agente:

- Recorre fuentes publicas curadas.
- Detecta posibles convocatorias, festivales, fondos, concursos, conciertos, teloneros, giras, intercambios, showcases, booking, prensa, radios, sellos, productoras, municipios, ONG, centros culturales y perfiles publicos.
- Genera misiones de busqueda por pais para Google Programmable Search, incluyendo consultas sobre Instagram, TikTok, revistas de musica, booking, productoras, sellos y espacios pagados.
- Verifica links antes de publicar.
- Deduplica por URL.
- Clasifica por categoria, pais, region y generos.
- Usa un modelo open source externo si configuras `OPEN_MODEL_BASE_URL` y `OPEN_MODEL_API_KEY`.

### Busqueda externa opcional

Para que el agente encuentre publicaciones publicas tipo Google, configura:

```env
GOOGLE_SEARCH_API_KEY=...
GOOGLE_SEARCH_ENGINE_ID=...
DISCOVERY_COUNTRY_LIMIT=67
DISCOVERY_QUERIES_PER_COUNTRY=4
DISCOVERY_RESULTS_PER_QUERY=5
```

No se raspa Google directamente. Se usa una API de busqueda configurable para encontrar fuentes publicas y luego el checker valida cada link antes de publicarlo.

## Endpoints

- `GET /api/health`
- `GET /api/opportunities`
- `GET /api/opportunities/{id}`
- `GET /api/sources`
- `GET /api/search?q=rock`
- `POST /api/admin/check-links` con header `X-Admin-Token`
- `POST /api/admin/refresh` con header `X-Admin-Token`

## Criterio de publicacion

El frontend muestra por defecto solo links publicables. El backend oculta links caidos cuando el agente o el checker los clasifican como `broken` o `timeout`.
