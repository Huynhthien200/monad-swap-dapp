import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Web3 from 'web3';

const MONAD_TESTNET_PARAMS = {
  chainId: '0x279F', // 10143 ở dạng hex
  chainName: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: ['https://testnet-rpc.monad.xyz/'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com/'],
};

export default function Swap() {
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('');
  const [availableTokens, setAvailableTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState('');
  const [tokenB, setTokenB] = useState('Select a token');
  const [loading, setLoading] = useState(false);
  const [web3, setWeb3] = useState(null);

  const tokenList = [
    { symbol: 'BTC', address: '0xBTCADDRESS', isNative: false },
    { symbol: 'BNB', address: '0xBNBADDRESS', isNative: false },
    { symbol: 'USDT', address: '0xUSDTADDRESS', isNative: false },
  ];

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
    }
  }, []);

  const handleInput = (e) => setAmount(e.target.value);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        await switchToMonadTestnet();
        fetchBalance(accounts[0]);
      } catch (error) {
        console.error('User denied account access', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const switchToMonadTestnet = async () => {
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: MONAD_TESTNET_PARAMS.chainId }] });
    } catch (error) {
      if (error.code === 4902) {
        await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [MONAD_TESTNET_PARAMS] });
      } else {
        console.error('Failed to switch network', error);
      }
    }
  };

  const fetchBalance = async (walletAddress) => {
    const balanceWei = await web3.eth.getBalance(walletAddress);
    setBalance(web3.utils.fromWei(balanceWei, 'ether'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(to bottom, #ebf8ff, white)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Swap</h2>
          <motion.button 
            style={{ backgroundColor: '#3b82f6', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={connectWallet}
          >
            {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
          </motion.button>
        </div>
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#4b5563' }}>Balance: {balance} MON</p>
        <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: '#4b5563' }}>You pay</label>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input type="number" style={{ backgroundColor: 'transparent', textAlign: 'right', width: '100%', outline: 'none', border: 'none' }} placeholder="Amount" value={amount} onChange={handleInput} />
          </div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <button style={{ backgroundColor: '#3b82f6', color: 'white', padding: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer' }}>⬇️ Swap</button>
        </div>
        <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: '#4b5563' }}>You receive</label>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{tokenB}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
