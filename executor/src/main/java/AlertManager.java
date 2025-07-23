package executor;

/**
 * Simple utility used to dispatch alerts to operators.
 * Alerts are published to Redis and optionally sent via SMTP.
 */
public class AlertManager {

    /** Convenience wrapper matching new API naming. */
    public static void send(String type, String message) {
        sendAlert(type, message);
    }

    /**
     * Publish an alert to Redis and send via SMTP if configured.
     *
     * @param type    alert type/category
     * @param message alert text
     */
    public static void sendAlert(String type, String message) {
        String ts = java.time.Instant.now().toString();
        String payload = String.format("[%s][executor][%s] %s", ts, type, message);

        // Redis publish
        String redisUrl = System.getenv().getOrDefault("REDIS_URL", "redis://localhost:6379");
        String redisHost = "localhost";
        int redisPort = 6379;
        try {
            java.net.URI uri = new java.net.URI(redisUrl);
            if (uri.getHost() != null) redisHost = uri.getHost();
            if (uri.getPort() != -1) redisPort = uri.getPort();
            System.out.println("[REDIS] Connected to " + redisHost + ":" + redisPort + " via REDIS_URL");
        } catch (Exception e) {
            System.err.println("[REDIS] Invalid REDIS_URL: " + e.getMessage());
        }
        try (redis.clients.jedis.Jedis jedis = new redis.clients.jedis.Jedis(redisHost, redisPort)) {
            jedis.publish("alerts", payload);
        } catch (Exception e) {
            System.err.println("Redis alert publish failed: " + e.getMessage());
        }

        // Email send
        String user = System.getenv("SMTP_USER");
        String pass = System.getenv("SMTP_PASS");
        String recipient = System.getenv("ALERT_RECIPIENT");
        String host = System.getenv().getOrDefault("SMTP_HOST", "smtp.gmail.com");
        if (user != null && pass != null && recipient != null) {
            java.util.Properties props = new java.util.Properties();
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.host", host);
            props.put("mail.smtp.port", "587");
            jakarta.mail.Session session = jakarta.mail.Session.getInstance(props,
                    new jakarta.mail.Authenticator() {
                        @Override
                        protected jakarta.mail.PasswordAuthentication getPasswordAuthentication() {
                            return new jakarta.mail.PasswordAuthentication(user, pass);
                        }
                    });
            try {
                jakarta.mail.Message msg = new jakarta.mail.internet.MimeMessage(session);
                msg.setFrom(new jakarta.mail.internet.InternetAddress(user));
                msg.setRecipients(jakarta.mail.Message.RecipientType.TO,
                        jakarta.mail.internet.InternetAddress.parse(recipient));
                msg.setSubject("Crypto Alert - " + type);
                msg.setText(payload);
                jakarta.mail.Transport.send(msg);
            } catch (Exception e) {
                System.err.println("Email alert failed: " + e.getMessage());
            }
        }

        System.out.println("ALERT: " + payload);
    }
}
