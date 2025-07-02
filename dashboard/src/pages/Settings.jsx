// dashboard/src/pages/Settings.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Settings() {
  const [form, setForm] = useState({
    personality_mode: '',
    loss_cap_pct: '',
    coin_exposure_cap_pct: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch existing settings
  useEffect(() => {
    async function load() {
      try {
        const { data } = await axios.get('/api/settings');
        setForm({
          personality_mode: data.personality_mode || '',
          loss_cap_pct: data.loss_cap_pct || '',
          coin_exposure_cap_pct: data.coin_exposure_cap_pct || '',
        });
      } catch (err) {
        setError('Unable to load settings');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSave() {
    try {
      await axios.post('/api/settings', form);
      alert('Settings saved');
    } catch (err) {
      alert('Save failed');
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="grid grid-cols-1 gap-6 p-6 max-w-xl m-auto">
      <label className="flex flex-col">
        <span className="text-gray-700">Personality Mode</span>
        <input
          className="mt-1 p-2 border rounded"
          type="text"
          name="personality_mode"
          value={form.personality_mode}
          onChange={handleChange}
        />
      </label>
      <label className="flex flex-col">
        <span className="text-gray-700">Loss Cap %</span>
        <input
          className="mt-1 p-2 border rounded"
          type="number"
          name="loss_cap_pct"
          value={form.loss_cap_pct}
          onChange={handleChange}
        />
      </label>
      <label className="flex flex-col">
        <span className="text-gray-700">Coin Exposure Cap %</span>
        <input
          className="mt-1 p-2 border rounded"
          type="number"
          name="coin_exposure_cap_pct"
          value={form.coin_exposure_cap_pct}
          onChange={handleChange}
        />
      </label>
      <button
        className="p-2 bg-blue-600 text-white rounded"
        onClick={handleSave}
      >
        Save
      </button>
    </div>
  );
}

