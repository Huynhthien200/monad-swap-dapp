// pages/settings.js

export default function SettingsPage() {
  const [network, setNetwork] = useState('Ethereum');

  const handleNetworkChange = (e) => {
    setNetwork(e.target.value);
  };

  return (
    <div>
      <h1>Settings</h1>
      <div>
        <label>Network:</label>
        <select value={network} onChange={handleNetworkChange}>
          <option value="Ethereum">Ethereum</option>
          <option value="BSC">Binance Smart Chain</option>
          <option value="Polygon">Polygon</option>
          {/* Thêm các mạng blockchain khác */}
        </select>
      </div>
    </div>
  );
}
