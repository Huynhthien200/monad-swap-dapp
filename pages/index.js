import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { motion } from 'framer-motion';
import { FiArrowDown, FiSettings, FiRepeat } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';

// ERC20 ABI cơ bản
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    type: "function"
  }
];

// Cấu hình mạng lưới Monad Testnet
const MONAD_TESTNET_PARAMS = {
  chainId: '0x279F', // 10143 trong hệ thập phân
  chainName: 'Monad Testnet',
  nativeCurrency: { 
    name: 'MON', 
    symbol: 'MON', 
    decimals: 18 
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz/'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com/']
};

const TOKEN_LIST = {
  "name": "PurpleDuck Token List",
  "logoURI": "https://raw.githubusercontent.com/Huynhthien200/file/refs/heads/main/08a10a45-3c84-4b21-b202-53b952780b39.webp",
  "tokens": [
    {
      "chainId": 10143,
      "address": "0x083978Dd12842779e907472A331314190730a5Bf",
      "symbol": "PDC",
      "name": "PurpleDuck",
      "decimals": 18,
      "logoURI": "https://raw.githubusercontent.com/Huynhthien200/file/refs/heads/main/08a10a45-3c84-4b21-b202-53b952780b39.webp"
    },
    {
      "chainId": 10143,
      "address": "0xNative",
      "symbol": "MON",
      "name": "Monad",
      "decimals": 18,
      "logoURI": "https://example.com/monad-logo.png"
    }
  ]
};

const SwapInterface = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [inputToken, setInputToken] = useState(TOKEN_LIST.tokens[1]);
  const [outputToken, setOutputToken] = useState(TOKEN_LIST.tokens[0]);
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [priceImpact, setPriceImpact] = useState(1.2);
  const [gasFee, setGasFee] = useState(0.0034);
  const [balances, setBalances] = useState({});
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  // Theme configuration
  const theme = {
    dark: {
      bg: '#191B1F',
      container: '#1F2128',
      inputBg: '#2C2F36',
      textPrimary: '#FFFFFF',
      textSecondary: '#6C7284',
      accent: '#2172E5',
      border: '#40444F'
    },
    light: {
      bg: '#FFFFFF',
      container: '#F7F8FA',
      inputBg: '#EDEEF2',
      textPrimary: '#000000',
      textSecondary: '#888D9B',
      accent: '#007AFF',
      border: '#E0E0E0'
    }
  };

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        
        // Thêm event listeners
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        
        await checkNetwork();
        await loadAccount(web3Instance);
      }
    };
    
    initWeb3();
    return () => {
      window.ethereum?.removeAllListeners();
    };
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

  const loadAccount = async (web3) => {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      await fetchBalances(accounts[0]);
    }
  };

  const fetchBalances = async (account) => {
    try {
      const newBalances = {};
      
      for (const token of TOKEN_LIST.tokens) {
        if (token.address === '0xNative') {
          const balance = await web3.eth.getBalance(account);
          newBalances[token.symbol] = web3.utils.fromWei(balance);
        } else {
          const contract = new web3.eth.Contract(ERC20_ABI, token.address);
          const balance = await contract.methods.balanceOf(account).call();
          const decimals = await contract.methods.decimals().call();
          newBalances[token.symbol] = (balance / 10 ** decimals).toFixed(4);
        }
      }
      
      setBalances(newBalances);
    } catch (error) {
      console.error('Lỗi khi lấy số dư:', error);
      alert('Không thể lấy số dư, vui lòng thử lại!');
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      fetchBalances(accounts[0]);
    } else {
      setAccount(null);
      setBalances({});
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/32';
  };

  const switchTokens = () => {
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
    setInputAmount('');
    setOutputAmount('');
  };

  const calculateSwapRate = async () => {
    if (!inputAmount || isNaN(inputAmount)) return;
    
    // Giả lập tỷ giá 1:1.5
    const mockRate = 1.5;
    setOutputAmount((inputAmount * mockRate).toFixed(4));
    setPriceImpact((Math.random() * 2).toFixed(2));
  };

  const validateInput = () => {
    if (!account) {
      alert('Vui lòng kết nối ví!');
      return false;
    }
    if (inputAmount <= 0 || isNaN(inputAmount)) {
      alert('Số lượng không hợp lệ!');
      return false;
    }
    if (parseFloat(inputAmount) > parseFloat(balances[inputToken.symbol] || 0)) {
      alert('Số dư không đủ!');
      return false;
    }
    return true;
  };

  const approveToken = async () => {
    const contract = new web3.eth.Contract(ERC20_ABI, inputToken.address);
    await contract.methods
      .approve(
        '0xYourRouterAddress', // Thay bằng địa chỉ router thực tế
        web3.utils.toWei(inputAmount, 'ether')
      )
      .send({ from: account });
  };

  const executeSwap = async () => {
    setLoading(true);
    try {
      // Giả lập swap thành công
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Swap thành công!');
      setInputAmount('');
      setOutputAmount('');
      await fetchBalances(account);
    } catch (error) {
      alert('Swap thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!validateInput()) return;
    
    try {
      if (inputToken.address !== '0xNative') {
        await approveToken();
      }
      await executeSwap();
    } catch (error) {
      console.error('Lỗi swap:', error);
      alert('Có lỗi xảy ra: ' + error.message);
    }
  };

  const connectWallet = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await checkNetwork();
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      await fetchBalances(accounts[0]);
    } catch (error) {
      alert('Lỗi kết nối ví: ' + error.message);
    }
  };

  const currentTheme = darkMode ? theme.dark : theme.light;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: currentTheme.bg,
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        width: '420px',
        backgroundColor: currentTheme.container,
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${currentTheme.border}`
      }}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            color: currentTheme.textPrimary,
            fontSize: '20px',
            fontWeight: '600'
          }}>
            Monad Swap
          </h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <FiSettings 
              style={{ 
                color: currentTheme.textSecondary,
                cursor: 'pointer'
              }}
              onClick={() => setShowSettings(!showSettings)}
            />
          </div>
        </div>

        {/* Input Section */}
        <TokenInput
          theme={currentTheme}
          token={inputToken}
          amount={inputAmount}
          balance={balances[inputToken.symbol] || 0}
          onAmountChange={(value) => {
            setInputAmount(value);
            calculateSwapRate();
          }}
          onTokenSelect={setInputToken}
          onImageError={handleImageError}
        />

        {/* Switch Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          margin: '12px 0',
          position: 'relative'
        }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: currentTheme.container,
              border: `2px solid ${currentTheme.border}`,
              borderRadius: '12px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={switchTokens}
          >
            <FiRepeat style={{ 
              color: currentTheme.textSecondary,
              fontSize: '20px'
            }}/>
          </motion.button>
        </div>

        {/* Output Section */}
        <TokenInput
          theme={currentTheme}
          token={outputToken}
          amount={outputAmount}
          balance={balances[outputToken.symbol] || 0}
          readOnly
          onTokenSelect={setOutputToken}
          onImageError={handleImageError}
        />

        {/* Swap Info */}
        <SwapInfo 
          theme={currentTheme} 
          inputToken={inputToken}
          outputToken={outputToken}
          priceImpact={priceImpact}
          gasFee={gasFee}
        />

        {/* Connect/Swap Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            padding: '16px',
            background: currentTheme.accent,
            color: '#FFFFFF',
            borderRadius: '12px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.7 : 1
          }}
          onClick={account ? handleSwap : connectWallet}
          disabled={loading}
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

        {/* Settings Modal */}
        {showSettings && (
          <SettingsModal
            theme={currentTheme}
            slippage={slippage}
            setSlippage={setSlippage}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </div>
  );
};

// Các components phụ (TokenInput, TokenSelector, SwapInfo, SettingsModal) giữ nguyên như trong code trước

export default SwapInterface;
