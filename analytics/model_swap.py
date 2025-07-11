import argparse
import json
import os
import shutil
import socket
import subprocess
import time
from .logger import logger

from .model_tracker import insert_metadata, send_event


MODEL_FILE = os.path.join(os.path.dirname(__file__), "model.h5")
ARCHIVE_DIR = os.path.join(os.path.dirname(__file__), "models", "archive")
METADATA_FILE = os.path.join(os.path.dirname(__file__), "model_metadata.json")


def load_metadata():
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, "r") as f:
            return json.load(f)
    return {"current_version": None, "notes": []}


def save_metadata(meta):
    with open(METADATA_FILE, "w") as f:
        json.dump(meta, f, indent=2)


def get_latest_hash():
    files = [f for f in os.listdir(ARCHIVE_DIR) if f.endswith(".h5")]
    if not files:
        return None
    files.sort(key=lambda f: os.path.getmtime(os.path.join(ARCHIVE_DIR, f)))
    return files[-1].split(".")[0]


def swap_model(version_hash: str):
    src = os.path.join(ARCHIVE_DIR, f"{version_hash}.h5")
    if not os.path.exists(src):
        raise FileNotFoundError(src)
    shutil.copy2(src, MODEL_FILE)


def log_note(meta, version_hash):
    note = {"version": version_hash, "timestamp": int(time.time())}
    meta.setdefault("notes", []).append(note)
    meta["current_version"] = version_hash


def main():
    parser = argparse.ArgumentParser(description="Swap active ML model")
    parser.add_argument("--version", "--rollback", dest="version")
    parser.add_argument(
        "--latest", action="store_true", help="Activate most recent archived model"
    )
    args = parser.parse_args()

    meta = load_metadata()

    if args.latest:
        version = get_latest_hash()
        if not version:
            raise SystemExit("No archived models found")
    elif args.version:
        version = args.version
    else:
        parser.error("Provide --version=<hash> or --latest")

    swap_model(version)
    log_note(meta, version)
    save_metadata(meta)
    print(f"Activated model {version}")
    try:
        subprocess.run(["git", "add", METADATA_FILE], check=True, capture_output=True)
        subprocess.run([
            "git",
            "commit",
            "-m",
            f"swap model {version}",
        ], check=True, capture_output=True)
    except (FileNotFoundError, subprocess.CalledProcessError) as exc:
        logger.warning("Git commit failed: %s", exc)
    user = os.getenv("USER", "unknown")
    try:
        ip = socket.gethostbyname(socket.gethostname())
    except Exception:
        ip = None
    change = "rollback" if args.version else "swap"
    insert_metadata(version, changed_by=user, change_type=change, source_ip=ip)
    send_event(version, change, user, ip)


if __name__ == "__main__":
    main()
