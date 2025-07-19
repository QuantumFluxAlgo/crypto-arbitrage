function normalize(data) {
  const convert = ([p, s]) => {
    const price = Number(p);
    const size = Number(s);
    if (!Number.isFinite(price) || !Number.isFinite(size) || price <= 0 || size <= 0) {
      return null;
    }
    return [price, size];
  };

  const bids = (data.bids || data.b || [])
    .map(convert)
    .filter(Boolean);
  const asks = (data.asks || data.a || [])
    .map(convert)
    .filter(Boolean);
  return { bids, asks };
}
module.exports = normalize;
