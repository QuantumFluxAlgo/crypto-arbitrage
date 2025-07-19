# manual-wallet-sweep.md

## What It Does
Explains how to manually initiate a cold wallet sweep when automated transfers are disabled.

## How to Use It

1. Toggle **Panic** in the dashboard to halt trading.
2. Send a sweep command to the API:
   ```bash
   curl -X POST http://localhost:8080/api/test/sweep
   ```
   This endpoint performs a dry-run sweep and logs the action.
3. Check the executor logs for `Cold wallet sweep` messages.
4. Verify on a blockchain explorer once funds settle.
5. Resume trading from the dashboard when complete.

## Troubleshooting

- If no log entry appears, ensure the API service is reachable and `TEST_COLD_WALLET_ADDRESS` is set.
- Use `kubectl logs deploy/executor` to inspect the scheduler output.

