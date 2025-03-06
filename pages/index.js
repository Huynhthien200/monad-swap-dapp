import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { motion } from 'framer-motion';
import { FiArrowDown, FiSun, FiMoon, FiRepeat } from 'react-icons/fi';

// Cấu hình mạng lưới
const MONAD_TESTNET_PARAMS = {
  chainId: '0x279F',
  chainName: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: ['https://testnet-rpc.monad.xyz/'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com/'],
};

// Danh sách token mẫu
const TOKEN_LIST = [
  {
    chainId: 10143,
    address: "0x083978Dd12842779e907472A331314190730a5Bf",
    symbol: "PDC",
    name: "PurpleDuck",
    decimals: 18,
    logoURI: "https://raw.githubusercontent.com/Huynhthien200/file/main/08a10a45-3c84-4b21-b202-53b952780b39.webp"
  },
  {
    chainId: 10143,
    address: "0xNative",
    symbol: "MON",
    name: "Monad",
    decimals: 18,
    logoURI: "https://example.com/monad-logo.png"
  }
];

// Cấu hình swap
const SWAP_ROUTER_ADDRESS = "0xYourRouterAddress";
const ERC20_ABI = [/* Thêm ABI ERC20 thực tế */];
const SWAP_ROUTER_ABI = [/* Thêm ABI Router thực tế */];

export default function Swap() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [inputToken, setInputToken] = useState(TOKEN_LIST[1]);
  const [outputToken, setOutputToken] = useState(TOKEN_LIST[0]);
  const [amount, setAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [slippage, setSlippage] = useState(1.0);
  const [priceImpact, setPriceImpact] = useState(0.0);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        
        await checkNetwork();
        await loadAccountData(web3Instance);
      }
    };
    initWeb3();
    return () => window.ethereum?.removeAllListeners();
  }, []);

  const checkNetwork = async () => {
    const chainId = await web3?.eth.getChainId();
    if (chainId !== parseInt(MONAD_TESTNET_PARAMS.chainId, 16)) {
      await switchNetwork();
    }
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET_PARAMS.chainId }],
      });
    } catch (error) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [MONAD_TESTNET_PARAMS],
        });
      }
    }
  };

  const loadAccountData = async (web3) => {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      await fetchBalance(accounts[0]);
    }
  };

  const fetchBalance = async (account) => {
    if (inputToken.address === "0xNative") {
      const balance = await web3.eth.getBalance(account);
      setBalance(web3.utils.fromWei(balance));
    } else {
      const contract = new web3.eth.Contract(ERC20_ABI, inputToken.address);
      const balance = await contract.methods.balanceOf(account).call();
      setBalance(web3.utils.fromWei(balance));
    }
  };

  const handleAccountsChanged = (accounts) => {
    setAccount(accounts[0] || null);
    if (accounts[0]) loadAccountData(web3);
  };

  const handleChainChanged = () => window.location.reload();

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Vui lòng cài đặt MetaMask!");
    await checkNetwork();
    const accounts = await web3.eth.requestAccounts();
    setAccount(accounts[0]);
  };

  const switchTokens = () => {
    [inputToken, outputToken] = [outputToken, inputToken];
    setInputToken(inputToken);
    setOutputToken(outputToken);
    calculateSwapRate();
  };

  const calculateSwapRate = async () => {
    if (!amount || isNaN(amount)) return;
    
    // Tạm thời sử dụng tỷ giá cố định 1:1.5
    const rate = inputToken.symbol === "MON" ? 1.5 : 1/1.5;
    setOutputAmount((amount * rate).toFixed(4));
    setPriceImpact((Math.random() * 2).toFixed(2));
  };

  const handleSwap = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      
      if (inputToken.address !== "0xNative") {
        await approveToken();
      }

      const txReceipt = await executeSwap();
      handleSuccess(txReceipt);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const validateInputs = () => {
    if (!account) {
      alert("Vui lòng kết nối ví!");
      return false;
    }
    if (amount <= 0 || amount > balance) {
      alert("Số lượng không hợp lệ!");
      return false;
    }
    return true;
  };

  const approveToken = async () => {
    const contract = new web3.eth.Contract(ERC20_ABI, inputToken.address);
    await contract.methods
      .approve(SWAP_ROUTER_ADDRESS, web3.utils.toWei(amount))
      .send({ from: account });
  };

  const executeSwap = async () => {
    const contract = new web3.eth.Contract(SWAP_ROUTER_ABI, SWAP_ROUTER_ADDRESS);
    const value = inputToken.address === "0xNative" 
      ? web3.utils.toWei(amount) 
      : "0";

    return await contract.methods
      .swapExactTokensForTokens(
        web3.utils.toWei(amount),
        web3.utils.toWei(outputAmount * (1 - slippage/100)),
        [inputToken.address, outputToken.address],
        account,
        Math.floor(Date.now() / 1000) + 600
      )
      .send({ from: account, value });
  };

  const handleSuccess = (receipt) => {
    alert(`Swap thành công! TX Hash: ${receipt.transactionHash}`);
    fetchBalance(account);
    setAmount('');
  };

  const handleError = (error) => {
    console.error("Swap error:", error);
    alert(`Lỗi: ${error.message}`);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`w-full max-w-md p-6 rounded-xl shadow-lg ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Monad Swap</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>

        {/* Input Section */}
        <div className="mb-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex justify-between items-center mb-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className={`w-full text-2xl bg-transparent outline-none ${darkMode ? 'text-white' : 'text-gray-900'}`}
              />
              <TokenSelector 
                token={inputToken} 
                onSelect={setInputToken} 
                darkMode={darkMode} 
              />
            </div>
            <div className="text-sm text-gray-500">
              Balance: {parseFloat(balance).toFixed(4)} {inputToken.symbol}
            </div>
          </div>
        </div>

        {/* Switch Button */}
        <div className="flex justify-center my-2">
          <button
            onClick={switchTokens}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          >
            <FiRepeat className={`${darkMode ? 'text-white' : 'text-gray-900'}`} />
          </button>
        </div>

        {/* Output Section */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
          <div className="flex justify-between items-center">
            <input
              value={outputAmount}
              readOnly
              placeholder="0.0"
              className={`w-full text-2xl bg-transparent outline-none ${darkMode ? 'text-white' : 'text-gray-900'}`}
            />
            <TokenSelector 
              token={outputToken} 
              onSelect={setOutputToken} 
              darkMode={darkMode} 
            />
          </div>
        </div>

        {/* Swap Details */}
        <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex justify-between mb-2">
            <span>Tỷ giá:</span>
            <span>1 {inputToken.symbol} ≈ {(outputAmount / amount || 0).toFixed(4)} {outputToken.symbol}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Price Impact:</span>
            <span>{priceImpact}%</span>
          </div>
          <div className="flex justify-between">
            <span>Slippage:</span>
            <input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              className={`w-20 bg-transparent text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}
            />
          </div>
        </div>

        {/* Swap Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={account ? handleSwap : connectWallet}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold ${
            loading ? 'bg-gray-500' : 'bg-purple-600 hover:bg-purple-700'
          } text-white`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </div>
          ) : account ? (
            `Swap ${inputToken.symbol} → ${outputToken.symbol}`
          ) : (
            'Kết nối Ví'
          )}
        </motion.button>
      </div>
    </div>
  );
}

const TokenSelector = ({ token, onSelect, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
          darkMode ? 'bg-gray-600' : 'bg-gray-200'
        }`}
      >
        <img src={token.logoURI} className="w-6 h-6 rounded-full" />
        <span>{token.symbol}</span>
        <FiArrowDown className={`transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl z-10 ${
          darkMode ? 'bg-gray-700' : 'bg-white'
        }`}>
          {TOKEN_LIST.map((t) => (
            <button
              key={t.address}
              onClick={() => {
                onSelect(t);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left flex items-center space-x-2 hover:bg-opacity-10 ${
                darkMode ? 'hover:bg-white' : 'hover:bg-gray-100'
              }`}
            >
              <img src={t.logoURI} className="w-6 h-6 rounded-full" />
              <span>{t.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
