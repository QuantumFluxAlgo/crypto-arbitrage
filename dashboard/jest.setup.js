global.TextEncoder = require('util').TextEncoder;
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        equityCurve: [],
        openTrades: [],
        panicActive: false,
        alertsEnabled: false,
        latency: [],
        winRate: [],
        pods: [],
        gpu: 0,
        db: true,
        redis: true,
      }),
  })
);

if (typeof global.ResizeObserver === 'undefined') {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
