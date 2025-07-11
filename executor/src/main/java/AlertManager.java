package executor;

/**
 * Simple utility used to dispatch alerts to operators.
 * Currently this just writes to stdout but can be
 * extended to integrate with email or chat services.
 */
public class AlertManager {

    /**
     * Send an alert message to the configured channel.
     *
     * @param message alert text
     */
    public static void sendAlert(String message) {
        System.out.println("ALERT: " + message);
    }
}
