package executor;

import static org.junit.jupiter.api.Assertions.*;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.Random;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("local")
public class SpreadOpportunityTest {
  static class FixedRandom extends Random {
    private final double[] values;
    private int idx = 0;

    FixedRandom(double... v) {
      this.values = v;
    }

    @Override
    public double nextDouble() {
      return values[idx < values.length ? idx++ : values.length - 1];
    }
  }

  static class TestOpportunity extends SpreadOpportunity {
    private final MockExchangeAdapter buy;
    private final MockExchangeAdapter sell;

    TestOpportunity(MockExchangeAdapter buy, MockExchangeAdapter sell) {
      super("BTC/USDT", "A", "B", 2.0, 2.0, 0L);
      this.buy = buy;
      this.sell = sell;
    }

    @Override
    protected MockExchangeAdapter createAdapter(String name) {
      return name.equals("A") ? buy : sell;
    }
  }

  @Test
  void subtractsFeesFromBothSides() {
    MockExchangeAdapter.setFeeRate("A", 0.001);
    MockExchangeAdapter.setFeeRate("B", 0.001);
    SpreadOpportunity opp = new SpreadOpportunity("BTC/USDT", "A", "B", 2.0, 2.0, 0L);
    TradeResult result = opp.execute(1.0, 100.0);
    double expected = 2.0 - (1.0 * 100.0 * 0.001) - (1.0 * 100.0 * 0.001);
    assertTrue(result.success);
    assertEquals(expected, result.pnl, 1e-9);
  }

  @Test
  void partialFillTriggersCancel() {
    MockExchangeAdapter buy = new MockExchangeAdapter("A", 0.0002, new FixedRandom(0.85));
    MockExchangeAdapter sell = new MockExchangeAdapter("B", 0.0002, new FixedRandom(0.5));
    TestOpportunity opp = new TestOpportunity(buy, sell);

    ByteArrayOutputStream err = new ByteArrayOutputStream();
    PrintStream origErr = System.err;
    System.setErr(new PrintStream(err));
    try {
      opp.execute(1.0, 100.0);
    } finally {
      System.setErr(origErr);
    }

    assertEquals(1, buy.getCanceledOrders().size());
    assertEquals(1, sell.getCanceledOrders().size());
    String logs = err.toString();
    assertTrue(logs.contains("[CANCEL] Partial fill detected. Canceling all legs:"));
  }

  @Test
  void partialFillReturnsAbortedStatus() {
    MockExchangeAdapter buy = new MockExchangeAdapter("A", 0.0002, new FixedRandom(0.85));
    MockExchangeAdapter sell = new MockExchangeAdapter("B", 0.0002, new FixedRandom(0.5));
    TestOpportunity opp = new TestOpportunity(buy, sell);

    TradeResult result = opp.execute(1.0, 100.0);
    assertFalse(result.success);
    assertEquals("PARTIAL_ABORTED", result.status);
  }

  @Test
  void bothLegsPartialFillCancelBoth() {
    MockExchangeAdapter buy = new MockExchangeAdapter("A", 0.0002, new FixedRandom(0.85));
    MockExchangeAdapter sell = new MockExchangeAdapter("B", 0.0002, new FixedRandom(0.85));
    TestOpportunity opp = new TestOpportunity(buy, sell);

    ByteArrayOutputStream err = new ByteArrayOutputStream();
    PrintStream origErr = System.err;
    System.setErr(new PrintStream(err));
    try {
      opp.execute(1.0, 100.0);
    } finally {
      System.setErr(origErr);
    }

    assertEquals(1, buy.getCanceledOrders().size());
    assertEquals(1, sell.getCanceledOrders().size());
    String logs = err.toString();
    assertTrue(logs.contains("[CANCEL] Partial fill detected. Canceling all legs:"));
  }

  @Test
  void noCancelWhenAllFilled() {
    MockExchangeAdapter buy = new MockExchangeAdapter("A", 0.0002, new FixedRandom(0.5));
    MockExchangeAdapter sell = new MockExchangeAdapter("B", 0.0002, new FixedRandom(0.5));
    TestOpportunity opp = new TestOpportunity(buy, sell);

    ByteArrayOutputStream err = new ByteArrayOutputStream();
    PrintStream origErr = System.err;
    System.setErr(new PrintStream(err));
    try {
      opp.execute(1.0, 100.0);
    } finally {
      System.setErr(origErr);
    }

    assertTrue(buy.getCanceledOrders().isEmpty());
    assertTrue(sell.getCanceledOrders().isEmpty());
    String logs = err.toString();
    assertFalse(logs.contains("[CANCEL]"));
  }
}
