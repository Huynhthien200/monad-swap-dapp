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

const SWAP_CONTRACT_ADDRESS = '0x083978Dd12842779e907472A331314190730a5Bf';
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

const getTokenList = async (web3, account) => {
  const tokenList = [
    {
      name: "PurpleDuck",
      symbol: "PDC",
      address: "0x083978Dd12842779e907472A331314190730a5Bf",
      decimals: 18,
      chainId: 10143,
      logoURI: "https://raw.githubusercontent.com/Huynhthien200/file/refs/heads/main/08a10a45-3c84-4b21-b202-53b952780b39.webp"
    }
  ];
  
  for (const token of tokenList) {
    const contract = new web3.eth.Contract([
      { "constant": true, "inputs": [{ "name": "owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "type": "function" }
    ], token.address);
    const balance = await contract.methods.balanceOf(account).call();
    token.balance = web3.utils.fromWei(balance, 'ether');
  }
  return tokenList;
};

export default function Swap() {
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState(null);
  const [tokenList, setTokenList] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [tokenB, setTokenB] = useState(null);
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
        const tokens = await getTokenList(web3, accounts[0]);
        setTokenList(tokens);
        setSelectedToken(tokens[0]?.address);
        setTokenB(tokens[1]?.address);
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
    } catch (error) {
      console.error('Swap failed', error);
      alert('Swap failed.');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(to bottom, #ebf8ff, white)', padding: '24px' }}>
      <button onClick={connectWallet} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#ff9800', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Connect Wallet</button>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '16px', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center' }}>Swap</h2>
        <select value={selectedToken} onChange={(e) => setSelectedToken(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
          {tokenList.map((token) => (
            <option key={token.address} value={token.address}>{token.symbol} ({token.balance} available)</option>
          ))}
        </select>
        <select value={tokenB} onChange={(e) => setTokenB(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
          {tokenList.map((token) => (
            <option key={token.address} value={token.address}>{token.symbol} ({token.balance} available)</option>
          ))}
        </select>
        <input 
          type="number" 
          value={amount} 
          onChange={handleInput} 
          placeholder="Enter amount" 
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px' }}
        />
        <motion.button 
          onClick={swapTokens} 
          disabled={loading} 
          style={{ width: '100%', padding: '10px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Swapping...' : 'Swap'}
        </motion.button>
      </div>
    </div>
  );
}
