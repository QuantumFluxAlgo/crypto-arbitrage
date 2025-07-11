package executor;

/**
 * Abstraction for wallet operations such as withdrawals.
 */
public interface WalletClient {
    /**
     * Withdraw funds from the hot wallet to the given address.
     *
     * @param address destination address
     */
    void withdraw(String address);
}
