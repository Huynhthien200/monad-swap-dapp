import { useState } from 'react';
import { motion } from 'framer-motion';
import Web3 from 'web3';

export default function Swap() {
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState(null);
  const [tokenA, setTokenA] = useState('ETH');
  const [tokenB, setTokenB] = useState('Select a token');

  const handleInput = (e) => {
    setAmount(e.target.value);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("User denied account access");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-white p-10">
      <div className="w-full max-w-6xl flex justify-between items-center mb-10">
        <div className="text-2xl font-bold">Trade</div>
        <motion.button 
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-400"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={connectWallet}
        >
          {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect wallet'}
        </motion.button>
      </div>

      <motion.div 
        className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full relative"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="text-xl font-bold text-center mb-5">Swap</div>
        <div className="bg-gray-100 p-4 rounded-lg mb-3">
          <label className="block text-sm text-gray-600 mb-1">You pay</label>
          <div className="flex justify-between items-center">
            <span className="font-bold">{tokenA}</span>
            <input 
              type="number" 
              className="bg-transparent text-right w-24 outline-none" 
              placeholder="Amount" 
              value={amount} 
              onChange={handleInput} 
            />
          </div>
        </div>

        <div className="text-center mb-3">
          ⬇️
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-5">
          <label className="block text-sm text-gray-600 mb-1">Select a token</label>
          <select 
            className="w-full p-2 rounded-lg outline-none" 
            onChange={(e) => setTokenB(e.target.value)}
          >
            <option>Select a token</option>
            <option>BTC</option>
            <option>BNB</option>
            <option>USDT</option>
          </select>
        </div>

        <motion.button 
          className="bg-blue-500 text-white w-full p-3 rounded-lg hover:bg-blue-400"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={connectWallet}
        >
          {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect wallet'}
        </motion.button>
      </motion.div>

      <motion.div 
        className="mt-10 bg-black text-white p-4 rounded-lg shadow-lg max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Cross-chain swaps are here! <button className="bg-white text-black rounded-lg px-3 py-1 ml-2">Learn more</button>
      </motion.div>

      <p className="mt-5 text-gray-500">Made by Huynhthien200 ❤️</p>
    </div>
  );
}
