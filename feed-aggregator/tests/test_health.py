import subprocess
import time
import urllib.request
import json
import os


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
