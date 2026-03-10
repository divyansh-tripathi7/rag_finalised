from fastapi import APIRouter
from pydantic import BaseModel

from .pusher_client import get_pusher, expert_channel


router = APIRouter(prefix="/realtime", tags=["realtime"])


class MessagePayload(BaseModel):
    expert_name: str
    from_user: str
    text: str


@router.post("/message")
def send_message(payload: MessagePayload):
    """
    Triggers a Pusher event for a given expert chat channel.

    When TESTING is enabled or Pusher is not configured, this
    simply echoes the payload for debugging.
    """
    client = get_pusher()
    channel = expert_channel(payload.expert_name)

    event_name = "new-message"
    data = {
        "channel": channel,
        "from_user": payload.from_user,
        "text": payload.text,
    }

    if client is None:
        return {"mode": "testing", "data": data}

    client.trigger(channel, event_name, data)

    return {"mode": "live", "data": data}

