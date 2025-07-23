package executor;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class ConfigManagerTest {

    @Test
    void unsafeConfigIsRejectedDuringReload() throws Exception {
        System.setProperty("EXECUTION_MODE", "sandbox");
        ConfigManager mgr = new ConfigManager("localhost", 6379, 3.0, 200.0, 10.0);
        String badJson = "{\"maxLossPct\":7.0,\"latencyMaxMs\":200,\"coinExposureLimit\":20}";
        mgr.applyJson(badJson);
        assertEquals(3.0, mgr.getMaxLossPct(), 1e-9);
        assertEquals(200.0, mgr.getLatencyMaxMs(), 1e-9);
        assertEquals(10.0, mgr.getCoinExposureLimit(), 1e-9);
        System.clearProperty("EXECUTION_MODE");
    }

    @Test
    void verifySecretsFailsWhenMissingInLiveMode() {
        java.util.Map<String, String> env = new java.util.HashMap<>();
        env.put("EXECUTION_MODE", "live");
        assertFalse(ConfigManager.verifyLiveSecrets(env));
    }

    @Test
    void verifySecretsPassesWithAllSecrets() {
        java.util.Map<String, String> env = new java.util.HashMap<>();
        env.put("EXECUTION_MODE", "live");
        env.put("BINANCE_KEY", "abc");
        env.put("BINANCE_SECRET", "def");
        env.put("WALLET_ADDRESS", "0x123");
        env.put("SMTP_USER", "a@b.com");
        env.put("ALERT_RECIPIENT", "ops@b.com");
        assertTrue(ConfigManager.verifyLiveSecrets(env));
    }
}
