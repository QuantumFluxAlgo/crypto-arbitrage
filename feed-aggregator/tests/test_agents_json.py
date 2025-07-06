import json
from pathlib import Path

def test_agents_json_valid():
    data_path = Path(__file__).resolve().parents[1] / 'docs/agents.json'
    data = json.loads(data_path.read_text())
    assert isinstance(data, list)
    assert len(data) > 0
    for agent in data:
        assert 'name' in agent
        assert 'language' in agent
        assert 'purpose' in agent
