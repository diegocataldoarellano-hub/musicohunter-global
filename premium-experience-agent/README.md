# Premium Experience Agent

Agente autonomo para mejorar arquitectura visual, funcional y logica de este repo sin depender de que Cursor este abierto.

El flujo seguro:

1. Escanea el repo en busca de layouts rigidos, estados UX incompletos, animaciones sin fallback y medios sin carga progresiva.
2. Elige una referencia premium compatible: Linear, Vercel, Apple Vision Pro o Notion.
3. En `dry-run`, guarda un reporte local.
4. En `pr`, invoca Cursor SDK/Cloud para implementar mejoras en una rama/PR revisable.

## Auditoria local

```bash
cd premium-experience-agent
npm install
npm run run:dry -- --target ..
```

## Modo 24/7

El workflow `.github/workflows/premium-experience-agent.yml` corre cada 30 minutos y tambien manualmente desde GitHub Actions.

Secrets necesarios:

- `CURSOR_API_KEY`: API key de Cursor o service account.

Secrets opcionales:

- `DISCORD_WEBHOOK_URL`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Guardrails

- No hardcodea secretos.
- No copia marcas ni recursos de referencias externas.
- Prioriza PRs revisables sobre commits directos.
- Evita dependencias pesadas salvo que el proyecto ya las use o el beneficio sea claro.
- El primer objetivo es mejorar el frontend estatico sin romper el backend ni los workflows existentes.
