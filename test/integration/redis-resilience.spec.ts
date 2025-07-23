import { spawn } from 'child_process';
import Redis from 'ioredis';
import { setTimeout as delay } from 'timers/promises';

jest.setTimeout(60000);

const CONTROL_CHANNEL = 'control-feed-test';

class FakeExecutor {
  private sub: Redis;
  public count = 0;
  constructor(port: number) {
    this.sub = new Redis(port, {
      retryStrategy: () => 1000,
    });
    this.sub.subscribe(CONTROL_CHANNEL);
    this.sub.on('message', (_, msg) => {
      if (msg) this.count++;
    });
  }
  stop() {
    this.sub.disconnect();
  }
}

function startRedis(port: number) {
  const proc = spawn('redis-server', ['--port', String(port)]);
  const ready = new Promise<void>((resolve) => {
    const client = new Redis(port);
    const check = async () => {
      try {
        await client.ping();
        client.disconnect();
        resolve();
      } catch {
        setTimeout(check, 200);
      }
    };
    check();
  });
  return { proc, ready };
}

test('executor recovers after Redis restart', async () => {
  const port = 6380;
  const { proc: redis1, ready } = startRedis(port);
  await ready;

  const exec = new FakeExecutor(port);
  const pub = new Redis(port);

  await pub.publish(CONTROL_CHANNEL, 'resume');
  await delay(500);
  expect(exec.count).toBe(1);

  redis1.kill('SIGTERM');
  await delay(10000);

  const { proc: redis2, ready: ready2 } = startRedis(port);
  await ready2;

  await pub.publish(CONTROL_CHANNEL, 'resume');
  await delay(500);

  exec.stop();
  redis2.kill('SIGTERM');
  pub.disconnect();

  expect(exec.count).toBe(2);
  console.log('[TEST PASS] Executor reconnected and handled Redis pub/sub after downtime');
});
