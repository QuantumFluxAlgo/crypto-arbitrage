import subprocess
import json
import os
import shutil
import pytest

pytestmark = pytest.mark.env("local")

if not shutil.which("node"):
    pytest.skip("node not installed", allow_module_level=True)

if not os.path.exists(os.path.join(os.path.dirname(__file__), "..", "node_modules")):
    pytest.skip("feed-aggregator dependencies not installed", allow_module_level=True)


def test_sendAlert_throttles_and_cleanup():
    repo = os.path.dirname(__file__) + '/..'
    script = """
const mod = require('./index');
(async () => {
  await mod.sendAlert('email', 'msg');
  const first = mod._lastAlertTimes['msg'];
  await mod.sendAlert('email', 'msg');
  const second = mod._lastAlertTimes['msg'];
  mod._lastAlertTimes['old'] = Date.now() - 1000;
  mod.cleanupAlertCache();
  console.log(JSON.stringify({same:first===second, keys:Object.keys(mod._lastAlertTimes).sort()}));
})();
"""
    env = dict(os.environ, THROTTLE_MS='50', MOCK_REDIS='1')
    result = subprocess.run(['node', '-e', script], cwd=repo, capture_output=True, text=True, env=env)
    assert result.returncode == 0
    out = json.loads(result.stdout.strip())
    assert out['same'] is True
    assert out['keys'] == ['msg']
