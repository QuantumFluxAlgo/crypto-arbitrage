package executor;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

/** Simple HTTP server exposing Prometheus metrics. */
public class MetricsServer {
    private final Executor executor;
    private HttpServer server;

    public MetricsServer(Executor executor) {
        this.executor = executor;
    }

    public void start(int port) throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/metrics", exchange -> {
            String resp = "spread_evaluation_latency_ms " + executor.getCurrentLatencyMs() + "\n";
            byte[] data = resp.getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, data.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(data);
            }
        });
        server.start();
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
        }
    }
}
