import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Web3 from 'web3';

const MONAD_TESTNET_PARAMS = {
  chainId: '0x279F',
  chainName: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: ['https://testnet-rpc.monad.xyz/'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com/'],
};

const SWAP_CONTRACT_ADDRESS = '0x083978Dd12842779e907472A331314190730a5Bf'; // Địa chỉ contract PDC
const SWAP_CONTRACT_ABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "amountIn", "type": "uint256" },
      { "name": "tokenIn", "type": "address" },
      { "name": "tokenOut", "type": "address" }
    ],
    "name": "swap",
    "outputs": [],
    "type": "function"
  }
];

const getTokenList = () => [
  {
    name: "PurpleDuck",
    symbol: "PDC",
    address: "0x083978Dd12842779e907472A331314190730a5Bf",
    decimals: 18,
    chainId: 10143,
    logoURI: "https://raw.githubusercontent.com/Huynhthien200/file/refs/heads/main/08a10a45-3c84-4b21-b202-53b952780b39.webp"
  }
];

export default function Swap() {
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('');
  const [selectedToken, setSelectedToken] = useState('MON');
  const [tokenB, setTokenB] = useState('PDC');
  const [loading, setLoading] = useState(false);
  const [web3, setWeb3] = useState(null);

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

  const swapTokens = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    const swapContract = new web3.eth.Contract(SWAP_CONTRACT_ABI, SWAP_CONTRACT_ADDRESS);
    const amountInWei = web3.utils.toWei(amount, 'ether');
    
    try {
      await swapContract.methods.swap(amountInWei, selectedToken, tokenB).send({ from: account });
      alert('Swap successful!');
      fetchBalance(account);
    } catch (error) {
      console.error('Swap failed', error);
      alert('Swap failed.');
    }
    setLoading(false);
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
      </div>
    </div>
  );
}
