# manual-wallet-sweep.md

## Purpose

Use this procedure to manually transfer funds from the hot wallet to the designated cold wallet.

## Steps

1. Stop new trading activity by toggling **Panic** in the dashboard.
2. Log in to the server hosting the rebalancer service.
3. Run the sweep command specifying the target address:
   ```bash
   python scripts/manual_sweep.py --dest <cold_wallet_address>
   ```
4. Confirm the transaction details printed in the console and approve when prompted.
5. Monitor the blockchain explorer to verify the transfer has settled.
6. Resume trading from the dashboard once the sweep is complete.

All sweep actions are logged in Postgres under `wallet_sweeps` for audit purposes.
