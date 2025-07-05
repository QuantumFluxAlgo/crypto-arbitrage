
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Alerts() {
  const [form, setForm] = useState({
    smtp_user: '',
    smtp_pass: '',
    telegram_token: '',
    webhook_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await axios.get('/api/alerts');
        setForm({
          smtp_user: data.smtp_user || '',
          smtp_pass: data.smtp_pass || '',
          telegram_token: data.telegram_token || '',
          webhook_url: data.webhook_url || ''
        });
      } catch {
        setToast({ type: 'error', msg: 'Failed to load alert config' });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSave() {
    try {
      await axios.post('/api/alerts', form);
      setToast({ type: 'success', msg: 'Saved alert settings' });
    } catch {
      setToast({ type: 'error', msg: 'Save failed' });
    }
  }

  async function test(type) {
    try {
      await axios.post(`/api/alerts/test/${type}`);
      setToast({ type: 'success', msg: `${type} test sent` });
    } catch {
      setToast({ type: 'error', msg: `${type} test failed` });
    }
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="relative p-6 max-w-xl m-auto space-y-4">
      {toast && (
        <div
          className={`absolute right-4 top-4 px-4 py-2 text-white rounded ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.msg}
        </div>
      )}
      <label className="flex flex-col">
        <span className="text-gray-700">SMTP User</span>
        <input
          className="mt-1 p-2 border rounded"
          type="text"
          name="smtp_user"
          value={form.smtp_user}
          onChange={handleChange}
        />
      </label>
      <label className="flex flex-col">
        <span className="text-gray-700">SMTP Pass</span>
        <input
          className="mt-1 p-2 border rounded"
          type="password"
          name="smtp_pass"
          value={form.smtp_pass}
          onChange={handleChange}
        />
      </label>
      <label className="flex flex-col">
        <span className="text-gray-700">Telegram Token</span>
        <input
          className="mt-1 p-2 border rounded"
          type="text"
          name="telegram_token"
          value={form.telegram_token}
          onChange={handleChange}
        />
      </label>
      <label className="flex flex-col">
        <span className="text-gray-700">Webhook URL</span>
        <input
          className="mt-1 p-2 border rounded"
          type="text"
          name="webhook_url"
          value={form.webhook_url}
          onChange={handleChange}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button className="p-2 bg-blue-600 text-white rounded" onClick={handleSave}>
          Save
        </button>
        <button className="p-2 bg-green-600 text-white rounded" onClick={() => test('email')}>
          Test Email
        </button>
        <button className="p-2 bg-green-600 text-white rounded" onClick={() => test('telegram')}>
          Test Telegram
        </button>
        <button className="p-2 bg-green-600 text-white rounded" onClick={() => test('webhook')}>
          Test Webhook
        </button>
      </div>
    </div>
  );
}
