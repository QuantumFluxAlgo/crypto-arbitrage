import { spawn, spawnSync } from 'child_process';
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

function commandExists(cmd: string): boolean {
  try {
    const res = spawnSync(cmd, ['--version'], { stdio: 'ignore' });
    return res.status === 0;
  } catch {
    return false;
  }
}

function startRedis(port: number) {
  if (commandExists('redis-server')) {
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
    return { proc, ready, containerId: null };
  }
  if (commandExists('docker')) {
    const id = spawnSync('docker', [
      'run', '-d', '-p', `${port}:6379`, '--rm', 'redis:6.2-alpine'
    ], { encoding: 'utf-8' }).stdout.trim();
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
    return { proc: null, ready, containerId: id };
  }
  return null;
}

test('executor recovers after Redis restart', async () => {
  const port = 6380;
  const instance1 = startRedis(port);
  if (!instance1) {
    console.warn('redis-server and docker not available - skipping test');
    return;
  }
  const { proc: redis1, ready, containerId } = instance1;
  await ready;

  const exec = new FakeExecutor(port);
  const pub = new Redis(port);

  await pub.publish(CONTROL_CHANNEL, 'resume');
  await delay(500);
  expect(exec.count).toBe(1);

  if (redis1) redis1.kill('SIGTERM');
  await delay(10000);

  const instance2 = startRedis(port);
  if (!instance2) {
    throw new Error('Unable to restart Redis');
  }
  const { proc: redis2, ready: ready2, containerId: cid2 } = instance2;
  await ready2;

  await pub.publish(CONTROL_CHANNEL, 'resume');
  await delay(500);

  exec.stop();
  if (redis2) redis2.kill('SIGTERM');
  if (cid2) spawnSync('docker', ['rm', '-f', cid2]);
  pub.disconnect();

  expect(exec.count).toBe(2);
  console.log('[TEST PASS] Executor reconnected and handled Redis pub/sub after downtime');
  if (containerId) spawnSync('docker', ['rm', '-f', containerId]);
});
