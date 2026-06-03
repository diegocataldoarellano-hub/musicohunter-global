from dataclasses import dataclass
from datetime import datetime, timezone
import httpx
from sqlalchemy.orm import Session

from .models import LinkCheck, Opportunity, Source
from .settings import get_settings


@dataclass
class LinkCheckResult:
    url: str
    status: str
    http_status: int | None = None
    final_url: str | None = None
    error: str | None = None


def classify_response(response: httpx.Response) -> str:
    if 200 <= response.status_code < 300:
        return "redirected" if str(response.url) != str(response.request.url) else "ok"
    if response.status_code in {401, 403, 405, 429}:
        return "blocked"
    if 300 <= response.status_code < 400:
        return "redirected"
    if 400 <= response.status_code < 500:
        return "broken"
    return "soft_fail"


async def check_url(url: str) -> LinkCheckResult:
    settings = get_settings()
    headers = {
        "User-Agent": "MusicHunterBot/1.0 (+public curated music opportunities checker)"
    }
    timeout = httpx.Timeout(settings.request_timeout_seconds)
    try:
      async with httpx.AsyncClient(timeout=timeout, follow_redirects=True, headers=headers) as client:
          try:
              response = await client.head(url)
          except httpx.HTTPStatusError:
              raise
          except Exception:
              response = await client.get(url)

      return LinkCheckResult(
          url=url,
          status=classify_response(response),
          http_status=response.status_code,
          final_url=str(response.url),
      )
    except httpx.TimeoutException as exc:
        return LinkCheckResult(url=url, status="timeout", error=str(exc))
    except httpx.HTTPError as exc:
        return LinkCheckResult(url=url, status="soft_fail", error=str(exc))
    except Exception as exc:
        return LinkCheckResult(url=url, status="soft_fail", error=str(exc))


def save_link_check(db: Session, result: LinkCheckResult) -> None:
    db.add(
        LinkCheck(
            url=result.url,
            status=result.status,
            http_status=result.http_status,
            final_url=result.final_url,
            error=result.error,
        )
    )
    db.commit()


async def refresh_link_statuses(db: Session, limit: int = 100) -> dict[str, int]:
    counts: dict[str, int] = {}
    now = datetime.now(timezone.utc)

    sources = db.query(Source).order_by(Source.priority.desc()).limit(limit).all()
    for source in sources:
        result = await check_url(source.url)
        source.link_status = result.status
        source.last_checked = now
        save_link_check(db, result)
        counts[result.status] = counts.get(result.status, 0) + 1

    opportunities = db.query(Opportunity).limit(limit).all()
    for opportunity in opportunities:
        result = await check_url(opportunity.url)
        opportunity.link_status = result.status
        opportunity.last_checked = now
        opportunity.published = result.status in {"ok", "redirected", "requires_review"}
        save_link_check(db, result)
        counts[result.status] = counts.get(result.status, 0) + 1

    db.commit()
    return counts
