package adapters;

import executor.ExchangeAdapter;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class StubAdapterTest {
    @Test
    void stubMethodsReturnDefaults() {
        ExchangeAdapter binance = new BinanceAdapter();
        ExchangeAdapter kraken = new KrakenAdapter();
        ExchangeAdapter uni = new UniswapV3Adapter();

        ((BinanceAdapter) binance).connect();
        ((KrakenAdapter) kraken).connect();
        ((UniswapV3Adapter) uni).connect();

        assertEquals(0.0, binance.getFeeRate("BTC/USDT"), 1e-9);
        assertEquals(0.0, kraken.getBalance("BTC"), 1e-9);
        assertDoesNotThrow(() -> uni.transfer("ETH", 1.0, "wallet"));
        assertFalse(binance.placeOrder("BTC/USDT", "BUY", 1.0, 1.0));
    }
}
