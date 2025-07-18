# StatusCake Monitoring Setup

Use StatusCake to monitor the Dashboard, API, and Analytics services on your server.
These checks ensure you are alerted when any endpoint goes offline.

---

## Step 1 – Log in to StatusCake

1. Visit [https://statuscake.com](https://statuscake.com) and sign up or log in.
2. From the dashboard click **Add New Test**.

---

## Step 2 – Create uptime tests

Create one HTTP test for each service using your server IP address:

1. **Dashboard**
   - **URL**: `http://YOUR_IP:3000`
   - Pick your desired check rate and location.
   - Save the test.
2. **API**
   - **URL**: `http://YOUR_IP:8080`
   - Use similar settings.
   - Save the test.
3. **Analytics**
   - **URL**: `http://YOUR_IP:5000`
   - Repeat the options as above.
   - Save the test.

---

## Step 3 – Enable a public status page

1. In the sidebar choose **Status Pages**.
2. Click **Create Status Page** and select your three tests.
3. Set the page visibility to **Public**.
4. Copy the status page URL for sharing.

---

## Step 4 – Set up alerts

1. Go to **User Settings → Contact Groups**.
2. Add your email address or webhook URL (e.g. Slack) as a contact.
3. Attach this contact group to each test so you are notified of downtime.

---

## Step 5 – Verify alerts

1. Temporarily disable a test to trigger an alert.
2. Confirm you receive the notification via email or webhook.

---

## Environment variables

Add these keys to `.env.example` so automation can create or update tests:

```bash
STATUSCAKE_API_TOKEN=
STATUSCAKE_CONTACT_GROUP=
```

The API token authenticates Terraform or scripts. `STATUSCAKE_CONTACT_GROUP` is the name or ID
of the contact group to receive alerts.

---

Follow these steps to keep your services monitored and receive alerts if any endpoint becomes unavailable.
