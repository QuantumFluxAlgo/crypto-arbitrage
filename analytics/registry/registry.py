import csv
import shutil
import subprocess
from pathlib import Path

MODELS_DIR = Path("models")
METADATA_CSV = Path("analytics") / "model_metadata.csv"


def _get_git_hash() -> str:
    """Return the current Git commit hash."""
    result = subprocess.run([
        "git",
        "rev-parse",
        "HEAD",
    ], capture_output=True, text=True, check=True)
    return result.stdout.strip()


def _update_metadata(version: str, path: Path, notes: str = "") -> None:
    """Append a row to the metadata CSV."""
    file_exists = METADATA_CSV.exists()
    with METADATA_CSV.open("a", newline="") as fh:
        writer = csv.writer(fh)
        if not file_exists:
            writer.writerow(["version_hash", "file_path", "notes"])
        writer.writerow([version, path.as_posix(), notes])


def register_model(model_path: str = "model.h5", notes: str = "") -> Path:
    """Save a model file and append metadata.

    Parameters
    ----------
    model_path: str
        Path to the model file to save.
    notes: str
        Optional notes describing the model.

    Returns
    -------
    pathlib.Path
        Path to the saved model file.
    """
    version = _get_git_hash()
    MODELS_DIR.mkdir(exist_ok=True)
    dest = MODELS_DIR / f"{version}.h5"
    shutil.copy2(model_path, dest)
    _update_metadata(version, dest, notes)

    return dest


def restore_model(version: str, out_path: str = "model.h5") -> str:
    """Restore a saved model to the given location."""
    src = MODELS_DIR / f"{version}.h5"
    if not src.exists():
        raise FileNotFoundError(src)
    shutil.copy2(src, out_path)
    return out_path


def verify_model(version: str) -> bool:
    """Check if a model version exists in the registry."""
    return (MODELS_DIR / f"{version}.h5").exists()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Lightweight Git model registry"
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    reg = sub.add_parser("register", help="Register a new model")
    reg.add_argument("path", help="Path to model.h5")
    reg.add_argument("--notes", default="", help="Optional notes")

    res = sub.add_parser("restore", help="Restore a model by version")
    res.add_argument("version", help="Model version hash")
    res.add_argument("--out", default="model.h5", help="Output path")

    ver = sub.add_parser("verify", help="Verify a model exists")
    ver.add_argument("version", help="Model version hash")

    args = parser.parse_args()

    if args.cmd == "register":
        saved_path = register_model(args.path, notes=args.notes)
        version = saved_path.stem
        subprocess.run(
            ["git", "add", str(saved_path), str(METADATA_CSV)], check=True
        )
        subprocess.run([
            "git",
            "commit",
            "-m",
            f"feat: register model {version}",
        ], check=True)
        print(saved_path)
    elif args.cmd == "restore":
        restore_model(args.version, args.out)
    elif args.cmd == "verify":
        exists = verify_model(args.version)
        print("found" if exists else "missing")
