import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { motion } from 'framer-motion';
import { FiArrowDown, FiSun, FiMoon } from 'react-icons/fi';

const MONAD_TESTNET_PARAMS = {
  chainId: '0x279F',
  chainName: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: ['https://testnet-rpc.monad.xyz/'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com/'],
};

const TOKEN_LIST = [
  {
    chainId: 10143,
    address: "0x083978Dd12842779e907472A331314190730a5Bf",
    symbol: "PDC",
    name: "PurpleDuck",
    decimals: 18,
    logoURI: "https://raw.githubusercontent.com/Huynhthien200/file/refs/heads/main/08a10a45-3c84-4b21-b202-53b952780b39.webp"
  }
];

export default function Swap() {
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [showTokenListA, setShowTokenListA] = useState(false);
  const [showTokenListB, setShowTokenListB] = useState(false);
  const [selectedTokenA, setSelectedTokenA] = useState(TOKEN_LIST[0]);
  const [selectedTokenB, setSelectedTokenB] = useState(TOKEN_LIST[0]);

  useEffect(() => {
    if (window.ethereum) {
      setWeb3(new Web3(window.ethereum));
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
      } catch (error) {
        console.error('User denied account access', error);
      }
    } else {
      alert('Vui lòng cài đặt MetaMask!');
    }
  };

  const swapTokens = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Vui lòng nhập số lượng hợp lệ!");
      return;
    }
    // Thực hiện logic swap thực tế tại đây
    alert(`Swap ${amount} ${selectedTokenA.symbol} sang ${selectedTokenB.symbol}`);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-black text-white' : 'bg-white text-black'} p-4`}>
      <div className={`w-full max-w-md ${darkMode ? 'bg-[#131313] text-white' : 'bg-gray-200 text-black'} p-6 rounded-2xl shadow-lg border ${darkMode ? 'border-gray-800' : 'border-gray-300'} relative`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Hoán đổi</h2>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full border border-gray-500">
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
        </div>
        
        {/* Phần Token A (Nguồn) */}
        <div className={`p-4 rounded-lg flex justify-between items-center mb-2 ${darkMode ? 'bg-[#1e1e1e]' : 'bg-gray-300'}`}>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="0.0" 
            className={`w-full bg-transparent text-lg outline-none ${darkMode ? 'text-white' : 'text-black'}`}
          />
          <button onClick={() => { setShowTokenListA(!showTokenListA); setShowTokenListB(false); }} className="bg-pink-500 px-3 py-1 rounded-lg text-white flex items-center">
            <img src={selectedTokenA.logoURI} alt={selectedTokenA.symbol} className="w-6 h-6 mr-2 rounded-full" />
            {selectedTokenA.symbol} <FiArrowDown className="ml-1" />
          </button>
        </div>
        
        {showTokenListA && (
          <div className="absolute top-24 left-0 bg-white text-black rounded-lg shadow-lg p-2 w-64 z-10">
            {TOKEN_LIST.map(token => (
              <div key={token.address} className="flex items-center p-2 hover:bg-gray-200 cursor-pointer" onClick={() => { setSelectedTokenA(token); setShowTokenListA(false); }}>
                <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 mr-2 rounded-full" />
                {token.name} ({token.symbol})
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-center my-2">
          <FiArrowDown size={24} className="text-gray-500" />
        </div>
        
        {/* Phần Token B (Đích) */}
        <div className={`p-4 rounded-lg flex justify-between items-center mb-4 ${darkMode ? 'bg-[#1e1e1e]' : 'bg-gray-300'}`}>
          <span className="text-gray-400">Nhận</span>
          <button onClick={() => { setShowTokenListB(!showTokenListB); setShowTokenListA(false); }} className="bg-pink-500 px-3 py-1 rounded-lg text-white flex items-center">
            <img src={selectedTokenB.logoURI} alt={selectedTokenB.symbol} className="w-6 h-6 mr-2 rounded-full" />
            {selectedTokenB.symbol} <FiArrowDown className="ml-1" />
          </button>
        </div>
        
        {showTokenListB && (
          <div className="absolute top-[calc(50%+100px)] left-0 bg-white text-black rounded-lg shadow-lg p-2 w-64 z-10">
            {TOKEN_LIST.map(token => (
              <div key={token.address} className="flex items-center p-2 hover:bg-gray-200 cursor-pointer" onClick={() => { setSelectedTokenB(token); setShowTokenListB(false); }}>
                <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 mr-2 rounded-full" />
                {token.name} ({token.symbol})
              </div>
            ))}
          </div>
        )}
        
        <motion.button 
          onClick={account ? swapTokens : connectWallet} 
          className="w-full py-3 bg-purple-700 text-white rounded-lg text-lg font-semibold mt-2"
        >
          {account ? 'Swap' : 'Kết nối ví'}
        </motion.button>
      </div>
    </div>
  );
}
