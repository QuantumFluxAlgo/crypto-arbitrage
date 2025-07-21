# Dashboard Operations Guide

The Prism dashboard is a mobile-friendly React application served from the API service. Operators use it to view metrics and control trading.

## Key Features

- **Mode Toggle** – switch between `live` and `sandbox` execution.
- **Loss Cap Control** – adjust the daily loss percentage cap.
- **Resume Trading Button** – clears any panic state and restarts trading once risks are resolved.

The banner at the top of the UI shows the current mode and whether the panic brake is active.

## Usage Steps

1. Open the dashboard at `http://<server-ip>:3000` and log in with your account.
2. Confirm the banner color:
   - Green = trading live
   - Orange = sandbox (dry-run)
   - Red = panic brake engaged
3. Use the **Settings** panel to change personality mode or update the loss cap. Saving pushes settings to the API.
4. If a panic event occurs, a **Resume Trading** button appears. Investigate logs, then click the button to send `POST /api/resume`.
5. The banner returns to green or orange once the API acknowledges the resume signal.

## Recovery Notes

If the dashboard becomes unresponsive:

1. Check pod status with `kubectl get pods` and ensure `api` and `dashboard` are healthy.
2. You can trigger a resume manually:
   ```bash
   curl -X POST http://<server-ip>:8080/api/test/resume
   ```
   ⚠️ **Test endpoints only work in dry-run mode.**
3. Reload the page. If the banner stays red, verify the executor logs for `[RESUME-BLOCKED]` messages.
