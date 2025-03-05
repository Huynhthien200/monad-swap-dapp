// pages/index.js

import { useState } from 'react';
import { useRouter } from 'next/router';

export default function HomePage() {
  const [amount, setAmount] = useState('');
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDT');
  const router = useRouter();

  const handleSwap = () => {
    // Chuyển hướng đến trang swap với tham số token và số lượng
    router.push(`/swap?from=${fromToken}&to=${toToken}&amount=${amount}`);
  };

  return (
    <div>
      <h1>Welcome to DApp Swap</h1>
      <div>
        <label>From Token:</label>
        <select onChange={(e) => setFromToken(e.target.value)} value={fromToken}>
          <option value="ETH">ETH</option>
          <option value="USDT">USDT</option>
          {/* Add more tokens here */}
        </select>
      </div>

      <div>
        <label>To Token:</label>
        <select onChange={(e) => setToToken(e.target.value)} value={toToken}>
          <option value="ETH">ETH</option>
          <option value="USDT">USDT</option>
          {/* Add more tokens here */}
        </select>
      </div>

      <div>
        <label>Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <button onClick={handleSwap}>Swap</button>
    </div>
  );
}
