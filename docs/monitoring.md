# StatusCake Monitoring Setup

Use StatusCake to monitor the Dashboard, API, and Analytics services on your server.

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

Follow these steps to keep your services monitored and receive alerts if any endpoint becomes unavailable.
