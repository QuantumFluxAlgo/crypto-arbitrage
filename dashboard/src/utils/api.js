export async function fetchSystemStatus(mode = 'live') {
  const res = await fetch(`/status?mode=${mode}`);
  if (!res.ok) {
    throw new Error('Failed to fetch system status');
  }
  return res.json();
}
