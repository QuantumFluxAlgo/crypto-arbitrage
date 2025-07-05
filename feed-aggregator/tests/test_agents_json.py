import json
from pathlib import Path

def test_agents_json_valid():
    data = json.loads(Path('docs/agents.json').read_text())
    assert isinstance(data, list)
    assert len(data) > 0
    for agent in data:
        assert 'name' in agent
        assert 'language' in agent
        assert 'purpose' in agent
