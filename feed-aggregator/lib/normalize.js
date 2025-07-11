function normalize(data) {
  const bids = (data.bids || data.b || []).map(p => [Number(p[0]), Number(p[1])]);
  const asks = (data.asks || data.a || []).map(p => [Number(p[0]), Number(p[1])]);
  return { bids, asks };
}
module.exports = normalize;
