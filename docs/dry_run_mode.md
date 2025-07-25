# Dry Run Mode

To enable local testing without real secrets, create a `.env` file with the following defaults:

```
DRY_RUN=true
JWT_SECRET=localtestsecret
SMTP_USER=dummy@example.com
SMTP_PASS=dummypass
BINANCE_KEY=dummy
BINANCE_SECRET=dummy
```

## Login

Send a POST request to `/api/login` with:

```json
{ "email": "admin@prism.one", "password": "test123" }
```

The response includes a JWT for subsequent requests. The same credentials work in sandbox mode.

## Reset Test State

Use `POST /api/test/reset` to restore in-memory settings to their defaults. On success the server logs:

```
✅ Test state reset
```
