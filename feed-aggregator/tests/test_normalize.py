import json
import subprocess
from pathlib import Path
import pytest

pytestmark = pytest.mark.env("local")

if not subprocess.run(['which', 'node'], capture_output=True).stdout.strip():
    pytest.skip('node not installed', allow_module_level=True)

def test_normalize_function():
    repo_root = Path(__file__).resolve().parents[1]
    script = (
        "const normalize=require('./lib/normalize');"\
        "const out=normalize({bids:[['1','2']],asks:[['3','4']]});"\
        "console.log(JSON.stringify(out));"
    )
    result = subprocess.run(['node', '-e', script], cwd=repo_root, capture_output=True, text=True)
    assert result.returncode == 0
    data = json.loads(result.stdout.strip())
    assert data == {'bids': [[1,2]], 'asks': [[3,4]]}

