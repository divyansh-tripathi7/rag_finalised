import os
from typing import Optional

from pusher import Pusher


def _pusher_enabled() -> bool:
    """
    Controls whether Pusher is active via env var:
    PUSHER=1/true/yes/on  -> enabled
    anything else         -> disabled
    """
    value = os.getenv("PUSHER", "").strip().lower()
    return value in {"1", "true", "yes", "on"}


def get_pusher() -> Optional[Pusher]:
    """
    Returns a configured Pusher client or None when:
    - PUSHER flag is disabled, or
    - any of the required env vars are missing.
    """
    if not _pusher_enabled():
        return None

    app_id = os.getenv("PUSHER_APP_ID")
    key = os.getenv("PUSHER_KEY")
    secret = os.getenv("PUSHER_SECRET")
    cluster = os.getenv("PUSHER_CLUSTER")

    if not all([app_id, key, secret, cluster]):
        return None

    return Pusher(
        app_id=app_id,
        key=key,
        secret=secret,
        cluster=cluster,
        ssl=True,
    )


def expert_channel(name: str) -> str:
    """
    Builds a channel name for an expert, normalized to allowed characters.
    """
    base = name.lower()
    safe = []
    for ch in base:
        if ch.isalnum():
            safe.append(ch)
        elif ch in {" ", "-", "_"}:
            safe.append("-")
    slug = "".join(safe).strip("-")
    return f"expert-chat-{slug or 'unknown'}"

