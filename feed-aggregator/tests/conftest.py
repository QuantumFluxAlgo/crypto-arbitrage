import os
import shutil
import subprocess
import pytest

@pytest.fixture(autouse=True, scope="session")
def ensure_node():
    if shutil.which("node"):
        return
    nvm_dir = os.environ.get("NVM_DIR", os.path.expanduser("~/.nvm"))
    nvm_sh = os.path.join(nvm_dir, "nvm.sh")
    if os.path.exists(nvm_sh):
        cmd = f"bash -c 'source {nvm_sh} && nvm install 20 >/dev/null && nvm which 20'"
        try:
            node_path = subprocess.check_output(cmd, shell=True, text=True).strip()
            os.environ["PATH"] = os.path.dirname(node_path) + os.pathsep + os.environ.get("PATH", "")
            if shutil.which("node"):
                return
        except Exception:
            pass
    pytest.skip("Node.js not installed - install via nvm or system package", allow_module_level=True)
