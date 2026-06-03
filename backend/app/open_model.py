import httpx

from .settings import get_settings


async def summarize_with_open_model(title: str, text: str) -> str | None:
    settings = get_settings()
    if not settings.open_model_base_url or not settings.open_model_api_key:
        return None

    prompt = (
        "Resume en espanol esta posible fuente musical publica. "
        "Indica si parece convocatoria, festival, booking, prensa, radio o perfil publico. "
        "No inventes fechas ni requisitos.\n\n"
        f"Titulo: {title}\nTexto:\n{text[:3500]}"
    )
    payload = {
        "model": settings.open_model_name,
        "messages": [
            {"role": "system", "content": "Eres un curador de oportunidades musicales publicas y verificables."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.1,
        "max_tokens": 220,
    }
    headers = {"Authorization": f"Bearer {settings.open_model_api_key}"}
    async with httpx.AsyncClient(timeout=25) as client:
        response = await client.post(settings.open_model_base_url.rstrip("/") + "/chat/completions", json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
    return data["choices"][0]["message"]["content"].strip()
