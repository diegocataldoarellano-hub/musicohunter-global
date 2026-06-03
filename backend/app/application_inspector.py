import re


EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)

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
    emails = []
    for email in EMAIL_RE.findall(text):
        if email.lower() not in [item.lower() for item in emails]:
            emails.append(email)
        if len(emails) == 2:
            break
    if emails:
        return ", ".join(emails)

    lower = text.lower()
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
    return {
        "cost": infer_application_cost(text),
        "contact": extract_contact(text, url),
        "checklist": checklist,
        "summary": f"Costo: {infer_application_cost(text)}. Requiere: {', '.join(checklist)}. Contacto: {extract_contact(text, url)}.",
    }
