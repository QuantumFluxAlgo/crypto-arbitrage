# Environment Configuration

The `.env.sandbox` file enables sandbox mode for local deployments.

```env
EXECUTION_MODE=sandbox
REDIS_URL=redis://default:testpassword@redis:6379
POSTGRES_URL=mocked
EXTERNAL_API_KEY=dummy
INTERNAL_TOKEN=test-token
```

Use `cp .env.sandbox.example .env.sandbox` to start and then modify values as needed.

## Sandbox Environment (.env.sandbox)

Use this to run Prism Arbitrage in local dry-run mode:

EXECUTION_MODE=sandbox
REDIS_URL=redis://default:testpassword@redis:6379
POSTGRES_URL=mocked
EXTERNAL_API_KEY=dummy
INTERNAL_TOKEN=test-token
