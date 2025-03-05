import { useState } from 'react';
import { motion } from 'framer-motion';
import Web3 from 'web3';

export default function Swap() {
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('');
  const [tokenA, setTokenA] = useState('ETH');
  const [tokenB, setTokenB] = useState('Select a token');

  const handleInput = (e) => {
    setAmount(e.target.value);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        // Thêm Chain Monad Testnet nếu chưa có
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x505',
            chainName: 'Monad Testnet',
            nativeCurrency: { name: 'tMON', symbol: 'tMON', decimals: 18 },
            rpcUrls: ['https://rpc.testnet.monad.xyz'],
            blockExplorerUrls: ['https://explorer.testnet.monad.xyz']
          }]
        });
        // Yêu cầu kết nối ví
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        // Đọc số dư của ví
        const balanceInWei = await web3.eth.getBalance(accounts[0]);
        const balanceEther = web3.utils.fromWei(balanceInWei, 'ether');
        setBalance(balanceEther);
      } catch (error) {
        console.error("User denied account access or error occurred", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const swapTokens = () => {
    setTokenA(tokenB);
    setTokenB(tokenA);
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

      {account && (
        <div className="mb-5 text-lg font-bold">
          Balance: {balance} tMON
        </div>
      )}

      <motion.div 
        className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full relative"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="text-xl font-bold text-center mb-5">Swap</div>
        <div className="bg-gray-100 p-4 rounded-lg mb-3">
          <label className="block text-sm text-gray-600 mb-1">You pay</label>
          <div className="flex justify-between items-center">
            <select 
              className="bg-transparent outline-none font-bold" 
              onChange={(e) => setTokenA(e.target.value)}
              value={tokenA}
            >
              <option>ETH</option>
              <option>BTC</option>
              <option>BNB</option>
              <option>USDT</option>
            </select>
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
          <button onClick={swapTokens} className="bg-blue-500 text-white p-2 rounded-full">⬇️</button>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-5">
          <label className="block text-sm text-gray-600 mb-1">Select a token</label>
          <select 
            className="w-full p-2 rounded-lg outline-none" 
            onChange={(e) => setTokenB(e.target.value)}
            value={tokenB}
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

      {/* Inline CSS global using styled-jsx */}
      <style jsx global>{`
        /* Container & Layout */
        .min-h-screen { min-height: 100vh; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .w-full { width: 100%; }
        .max-w-6xl { max-width: 72rem; }
        .max-w-md { max-width: 28rem; }
        .p-10 { padding: 2.5rem; }
        .p-8 { padding: 2rem; }
        .p-4 { padding: 1rem; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .p-3 { padding: 0.75rem; }
        .mb-10 { margin-bottom: 2.5rem; }
        .mb-5 { margin-bottom: 1.25rem; }
        .mt-5 { margin-top: 1.25rem; }
        .mt-10 { margin-top: 2.5rem; }

        /* Typography */
        .text-2xl { font-size: 1.5rem; }
        .text-xl { font-size: 1.25rem; }
        .text-sm { font-size: 0.875rem; }
        .font-bold { font-weight: 700; }
        .text-white { color: #ffffff; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-600 { color: #4b5563; }

        /* Backgrounds */
        .bg-gradient-to-b { background-image: linear-gradient(to bottom, #eff6ff, #ffffff); }
        .from-blue-50 { /* part of gradient */ }
        .to-white { /* part of gradient */ }
        .bg-white { background-color: #ffffff; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .bg-blue-500 { background-color: #3b82f6; }
        .bg-blue-400 { background-color: #60a5fa; }
        .bg-black { background-color: #000000; }

        /* Borders & Shadows */
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-2xl { border-radius: 1rem; }
        .rounded-full { border-radius: 9999px; }
        .shadow-xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }

        /* Misc */
        .outline-none { outline: none; }
        .hover\\:bg-blue-400:hover { background-color: #60a5fa; }
      `}</style>
    </div>
  );
}
