import subprocess
import json
import os
import pytest

pytestmark = pytest.mark.env("local")


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
