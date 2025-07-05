import subprocess
import time
import urllib.request
import json
import os
import shutil
import pytest

if not shutil.which("node"):
    pytest.skip("node not installed", allow_module_level=True)

if not os.path.exists(os.path.join(os.path.dirname(__file__), "..", "node_modules")):
    pytest.skip("feed-aggregator dependencies not installed", allow_module_level=True)


def test_health_endpoint():
    proc = subprocess.Popen(['node', 'index.js'], cwd=os.path.dirname(__file__) + '/..', stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        # wait for server to start
        for _ in range(10):
            try:
                with urllib.request.urlopen('http://localhost:8090/health') as resp:
                    data = json.load(resp)
                    assert data == {'ok': True}
                    return
            except Exception:
                time.sleep(0.5)
        raise AssertionError('health endpoint not reachable')
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
