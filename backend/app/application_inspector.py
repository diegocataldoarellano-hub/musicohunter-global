import re
from urllib.parse import unquote


EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
MAILTO_RE = re.compile(r"mailto:([^?\s\"'<>]+)", re.IGNORECASE)
URL_RE = re.compile(r"https?://[^\s\"'<>]+", re.IGNORECASE)
HANDLE_RE = re.compile(r"(?<![\w.])@[A-Z0-9._-]{3,40}\b", re.IGNORECASE)

FREE_TERMS = [
    "gratis",
    "gratuito",
    "gratuita",
    "sin costo",
    "no cost",
    "free",
    "free application",
    "no application fee",
]

PAID_TERMS = [
    "pago",
    "pagado",
    "arancel",
    "fee",
    "application fee",
    "entry fee",
    "registration fee",
    "ticket",
    "tickets",
    "entrada",
    "entradas",
    "inscripcion pagada",
]

FUNDING_TERMS = [
    "grant",
    "grants",
    "fund",
    "funding",
    "fondo",
    "fondos",
    "beca",
    "subvencion",
    "support",
    "apoyo",
    "mobility",
    "movilidad",
]

CONTACT_TERMS = [
    "contacto",
    "contact",
    "booking",
    "programacion",
    "submissions",
    "application form",
    "formulario",
    "apply",
    "postula",
    "contact link:",
    "application link:",
    "submission link:",
    "booking link:",
]

CONTACT_URL_TERMS = [
    "contact",
    "contacto",
    "booking",
    "programacion",
    "programming",
    "apply",
    "application",
    "submission",
    "submit",
    "form",
    "postula",
    "convocatoria",
    "typeform",
    "forms.gle",
    "google.com/forms",
    "airtable",
    "jotform",
]

REQUIREMENT_RULES = [
    (["epk", "press kit", "dossier"], "EPK/dossier"),
    (["bio", "biografia", "biography"], "bio breve"),
    (["video", "live video", "registro en vivo"], "video o registro en vivo"),
    (["link", "links", "streaming", "bandcamp", "soundcloud", "spotify"], "links de musica"),
    (["foto", "photo", "press photo"], "fotos de prensa"),
    (["formulario", "form", "application"], "formulario oficial"),
    (["bases", "guidelines", "terms"], "bases/condiciones"),
    (["deadline", "plazo", "cierre", "hasta"], "fecha de cierre"),
    (["passport", "visa", "visado"], "visa/pasaporte si aplica"),
    (["technical rider", "rider", "ficha tecnica"], "ficha tecnica"),
]


def compact_text(*parts: object) -> str:
    return " ".join(str(part or "") for part in parts).strip()


def normalize_obfuscated_emails(text: str) -> str:
    normalized = text
    replacements = [
        (r"\s*(?:\[|\(|\{)\s*at\s*(?:\]|\)|\})\s*", "@"),
        (r"\s+(?:at|arroba)\s+", "@"),
        (r"\s*(?:\[|\(|\{)\s*arroba\s*(?:\]|\)|\})\s*", "@"),
        (r"\s*(?:\[|\(|\{)\s*dot\s*(?:\]|\)|\})\s*", "."),
        (r"\s+(?:dot|punto)\s+", "."),
        (r"\s*(?:\[|\(|\{)\s*punto\s*(?:\]|\)|\})\s*", "."),
    ]
    # Only run the broad "at/dot" replacements on strings that look like an
    # obfuscated address, so regular prose is not accidentally rewritten.
    if re.search(r"[\w.%+-]\s*(?:\[|\(|\{)?\s*(?:at|arroba)\s*(?:\]|\)|\})?\s*[\w.-]", text, re.IGNORECASE):
        for pattern, value in replacements:
            normalized = re.sub(pattern, value, normalized, flags=re.IGNORECASE)
    return normalized.replace("＠", "@")


def unique_items(items: list[str], limit: int = 2) -> list[str]:
    unique = []
    for item in items:
        cleaned = item.strip().strip(".,;)")
        if not cleaned:
            continue
        if cleaned.lower() not in [entry.lower() for entry in unique]:
            unique.append(cleaned)
        if len(unique) == limit:
            break
    return unique


def short_url(url: str, max_length: int = 96) -> str:
    cleaned = url.strip().strip(".,;)")
    return cleaned if len(cleaned) <= max_length else f"{cleaned[: max_length - 1]}…"


def infer_application_cost(text: str) -> str:
    lower = text.lower()
    has_free = any(term in lower for term in FREE_TERMS)
    has_paid = any(term in lower for term in PAID_TERMS)
    has_funding = any(term in lower for term in FUNDING_TERMS)
    if has_free and not has_paid:
        return "Gratuito"
    if has_paid and not has_free:
        return "Puede requerir pago"
    if has_funding and not has_paid:
        return "Apoyo/fondo disponible"
    if has_free and has_paid:
        return "Revisar bases: mezcla gratis/pago"
    return "Por confirmar"


def extract_contact(text: str, fallback_url: str | None = None) -> str:
    normalized_text = normalize_obfuscated_emails(text)
    mailto_emails = [unquote(match).split("?", 1)[0] for match in MAILTO_RE.findall(normalized_text)]
    visible_emails = EMAIL_RE.findall(normalized_text)
    emails = unique_items(mailto_emails + visible_emails)
    if emails:
        return ", ".join(emails)

    lower = text.lower()
    contact_urls = [
        short_url(url)
        for url in URL_RE.findall(text)
        if any(term in url.lower() for term in CONTACT_URL_TERMS)
    ]
    contact_urls = unique_items(contact_urls, limit=1)
    if contact_urls:
        return f"Formulario/contacto: {contact_urls[0]}"

    social_urls = [
        short_url(url)
        for url in URL_RE.findall(text)
        if any(domain in url.lower() for domain in ("instagram.com", "tiktok.com", "facebook.com", "linktr.ee"))
    ]
    social_urls = unique_items(social_urls, limit=1)
    if social_urls:
        return f"Perfil/contacto social: {social_urls[0]}"

    handles = unique_items(HANDLE_RE.findall(text), limit=1)
    if handles and any(term in lower for term in ("instagram", "tiktok", "dm", "mensaje", "direct")):
        return f"Contacto por redes: {handles[0]}"

    if any(term in lower for term in CONTACT_TERMS):
        return "Formulario/contacto en la pagina oficial"
    if fallback_url:
        return "No visible; abrir link oficial"
    return "No visible"


def extract_simple_requirements(text: str) -> list[str]:
    lower = text.lower()
    requirements = []
    for terms, label in REQUIREMENT_RULES:
        if any(term in lower for term in terms) and label not in requirements:
            requirements.append(label)
        if len(requirements) >= 4:
            break
    if not requirements:
        requirements.append("revisar bases/formulario")
    return requirements


def build_application_snapshot(
    title: str,
    summary: str,
    requirements: str | list[str] | None = None,
    url: str | None = None,
) -> dict[str, object]:
    requirement_text = ", ".join(requirements) if isinstance(requirements, list) else requirements or ""
    text = compact_text(title, summary, requirement_text, url)
    checklist = extract_simple_requirements(text)
    cost = infer_application_cost(text)
    contact = extract_contact(text, url)
    return {
        "cost": cost,
        "contact": contact,
        "checklist": checklist,
        "summary": f"Costo: {cost}. Requiere: {', '.join(checklist)}. Contacto: {contact}.",
    }
