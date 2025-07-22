export async function fetchSystemStatus() {
  const res = await fetch('/api/system/status');
  if (!res.ok) {
    throw new Error('Failed to fetch system status');
  }
  return res.json();
}

export async function fetchWalletBalance() {
  const res = await fetch('/api/wallet/balance');
  if (!res.ok) {
    throw new Error('Failed to fetch wallet balance');
  }
  return res.json();
}
