import os
import json
import urllib.request


def insert_metadata(version_hash: str, sharpe: float | None = None,
                     win_rate: float | None = None,
                     val_loss: float | None = None,
                     notes: str | None = None,
                     changed_by: str | None = None,
                     change_type: str | None = None,
                     source_ip: str | None = None,
                     api_url: str | None = None) -> None:
    """Send model metadata to the tracker service.

    This function no longer writes directly to the database. Metadata is
    published to a REST endpoint where another service persists it.
    """
    if api_url is None:
        api_url = os.getenv('MODEL_TRACKER_URL', 'http://localhost:8080/api/models/metadata')

    payload = {
        'version_hash': version_hash,
        'sharpe': sharpe,
        'win_rate': win_rate,
        'val_loss': val_loss,
        'notes': notes,
        'changed_by': changed_by,
        'change_type': change_type,
        'source_ip': source_ip,
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(api_url, data=data, headers={'Content-Type': 'application/json'})
    try:
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass


def send_event(version_hash: str, change_type: str, changed_by: str | None = None,
               source_ip: str | None = None, api_url: str = 'http://localhost:8080/api/models/event') -> None:
    payload = {
        'version_hash': version_hash,
        'change_type': change_type,
        'changed_by': changed_by,
        'source_ip': source_ip,
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(api_url, data=data, headers={'Content-Type': 'application/json'})
    try:
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass
