// pages/history.js

export default function HistoryPage() {
  const [transactions, setTransactions] = useState([
    { txHash: '0x123', from: 'ETH', to: 'USDT', amount: '1.0', date: '2025-03-05' },
    { txHash: '0x456', from: 'USDT', to: 'ETH', amount: '100', date: '2025-03-04' },
  ]);

  return (
    <div>
      <h1>Transaction History</h1>
      <table>
        <thead>
          <tr>
            <th>Transaction Hash</th>
            <th>From</th>
            <th>To</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr key={index}>
              <td>{tx.txHash}</td>
              <td>{tx.from}</td>
              <td>{tx.to}</td>
              <td>{tx.amount}</td>
              <td>{tx.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
