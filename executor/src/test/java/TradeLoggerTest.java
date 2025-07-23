package executor;

import static org.junit.jupiter.api.Assertions.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("local")
public class TradeLoggerTest {
  @BeforeEach
  void setup() throws Exception {
    Files.createDirectories(Path.of("logs"));
    Files.deleteIfExists(Path.of("logs", "trade_audit.log"));
  }

  @Test
  void logsSuccessOutcome() throws Exception {
    TradeLogger.logAudit("BTC/USDT", TradeLogger.STATUS_SUCCESS, "", 0.1, 50);
    List<String> lines = Files.readAllLines(Path.of("logs", "trade_audit.log"));
    assertEquals(1, lines.size());
    assertTrue(lines.get(0).contains("\"status\":\"success\""));
  }

  @Test
  void logsFailedOutcome() throws Exception {
    TradeLogger.logAudit("ETH/USDT", TradeLogger.STATUS_FAILED, "order failure", 0.2, 60);
    List<String> lines = Files.readAllLines(Path.of("logs", "trade_audit.log"));
    assertEquals(1, lines.size());
    assertTrue(lines.get(0).contains("\"status\":\"failed\""));
    assertTrue(lines.get(0).contains("order failure"));
  }

  @Test
  void logsRejectedOutcome() throws Exception {
    TradeLogger.logAudit("BTC/USDT", TradeLogger.STATUS_REJECTED, "slippage", 0.9, 0);
    List<String> lines = Files.readAllLines(Path.of("logs", "trade_audit.log"));
    assertEquals(1, lines.size());
    assertTrue(lines.get(0).contains("\"status\":\"rejected\""));
  }

  @Test
  void logsSkippedOutcome() throws Exception {
    TradeLogger.logAudit("ETH/BTC", TradeLogger.STATUS_SKIPPED, "net edge too low", 0.0, 0);
    List<String> lines = Files.readAllLines(Path.of("logs", "trade_audit.log"));
    assertEquals(1, lines.size());
    assertTrue(lines.get(0).contains("\"status\":\"skipped\""));
  }
}
