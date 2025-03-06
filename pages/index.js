import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { motion } from 'framer-motion';
import { FiArrowDown, FiSettings, FiRepeat } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';

// Constants
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
  }
];

const MONAD_TESTNET_PARAMS = {
  chainId: '0x279F',
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
  name: "PurpleDuck Token List",
  logoURI: "https://raw.githubusercontent.com/Huynhthien200/file/main/08a10a45-3c84-4b21-b202-53b952780b39.webp",
  tokens: [
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
  ]
};

// Helper Components
const TokenSelector = ({ token, theme, onSelect, onImageError }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: theme.inputBg,
          padding: '8px 12px',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <img
          src={token.logoURI}
          onError={onImageError}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%'
          }}
          alt={token.symbol}
        />
        <span style={{ 
          color: theme.textPrimary,
          fontWeight: '500'
        }}>
          {token.symbol}
        </span>
        <IoIosArrowDown style={{ 
          color: theme.textSecondary,
          fontSize: '16px'
        }}/>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          marginTop: '8px',
          background: theme.container,
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '280px',
          zIndex: 100
        }}>
          <div style={{
            padding: '12px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              marginBottom: '8px'
            }}>
              <img
                src={TOKEN_LIST.logoURI}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  marginRight: '12px'
                }}
                alt="Token List Logo"
                onError={onImageError}
              />
              <span style={{
                color: theme.textPrimary,
                fontWeight: '600'
              }}>
                {TOKEN_LIST.name}
              </span>
            </div>
            
            {TOKEN_LIST.tokens.map((t) => (
              <div
                key={t.address}
                onClick={() => {
                  onSelect(t);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  ':hover': {
                    background: theme.inputBg
                  }
                }}
              >
                <img
                  src={t.logoURI}
                  onError={onImageError}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    marginRight: '12px'
                  }}
                  alt={t.symbol}
                />
                <div>
                  <div style={{ 
                    color: theme.textPrimary,
                    fontWeight: '500'
                  }}>
                    {t.name}
                  </div>
                  <div style={{ 
                    color: theme.textSecondary,
                    fontSize: '14px'
                  }}>
                    {t.symbol}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TokenInput = ({ 
  theme, 
  token, 
  amount, 
  balance, 
  readOnly, 
  onAmountChange, 
  onTokenSelect, 
  onImageError 
}) => (
  <div style={{
    backgroundColor: theme.inputBg,
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '12px'
  }}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    }}>
      <input
        type="number"
        placeholder="0.0"
        value={amount}
        readOnly={readOnly}
        onChange={(e) => onAmountChange?.(e.target.value)}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontSize: '24px',
          color: theme.textPrimary,
          fontWeight: '500'
        }}
      />
      <TokenSelector 
        token={token}
        theme={theme}
        onSelect={onTokenSelect}
        onImageError={onImageError}
      />
    </div>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span style={{ 
        color: theme.textSecondary,
        fontSize: '14px'
      }}>
        Balance: {typeof balance !== 'undefined' ? 
          parseFloat(balance).toLocaleString(undefined, {
            maximumFractionDigits: 4
          }) : 'Loading...'}
      </span>
      {!readOnly && (
        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: theme.accent,
            cursor: 'pointer',
            fontSize: '14px'
          }}
          onClick={() => onAmountChange?.(balance)}
        >
          Max
        </button>
      )}
    </div>
  </div>
);

const SwapInfo = ({ theme, inputToken, outputToken, priceImpact, gasFee }) => (
  <div style={{
    borderTop: `1px solid ${theme.border}`,
    paddingTop: '16px',
    marginBottom: '24px'
  }}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px'
    }}>
      <span style={{ color: theme.textSecondary }}>Tỷ giá</span>
      <span style={{ color: theme.textPrimary }}>
        1 {inputToken.symbol} ≈ 1.5 {outputToken.symbol}
      </span>
    </div>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px'
    }}>
      <span style={{ color: theme.textSecondary }}>Price Impact</span>
      <span style={{ color: priceImpact > 2 ? '#FF3B3B' : theme.textPrimary }}>
        {priceImpact}%
      </span>
    </div>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between'
    }}>
      <span style={{ color: theme.textSecondary }}>Phí ước tính</span>
      <span style={{ color: theme.textPrimary }}>
        ${gasFee}
      </span>
    </div>
  </div>
);

const SettingsModal = ({ theme, slippage, setSlippage, onClose }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <div style={{
      background: theme.container,
      padding: '24px',
      borderRadius: '16px',
      width: '400px'
    }}>
      <h3 style={{
        color: theme.textPrimary,
        marginBottom: '20px'
      }}>
        Cài đặt giao dịch
      </h3>
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          color: theme.textSecondary,
          marginBottom: '8px'
        }}>
          Dung sai trượt giá (%)
        </label>
        <input
          type="number"
          value={slippage}
          onChange={(e) => setSlippage(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            background: theme.inputBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            color: theme.textPrimary
          }}
        />
      </div>
      <button
        style={{
          width: '100%',
          padding: '12px',
          background: theme.accent,
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
        onClick={onClose}
      >
        Lưu cài đặt
      </button>
    </div>
  </div>
);

// Main Component
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
        
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          await fetchBalances(accounts[0]);
        } catch (error) {
          console.error('Error connecting to wallet:', error);
        }
      }
    };
    
    initWeb3();
  }, []);

  const fetchBalances = async (account) => {
    const newBalances = {};
    for (const token of TOKEN_LIST.tokens) {
      try {
        if (token.address === '0xNative') {
          const balance = await web3.eth.getBalance(account);
          newBalances[token.symbol] = web3.utils.fromWei(balance);
        } else {
          const contract = new web3.eth.Contract(ERC20_ABI, token.address);
          const balance = await contract.methods.balanceOf(account).call();
          newBalances[token.symbol] = web3.utils.fromWei(balance);
        }
      } catch (error) {
        console.error(`Error fetching ${token.symbol} balance:`, error);
      }
    }
    setBalances(newBalances);
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/32';
  };

  const switchTokens = () => {
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
  };

  const handleSwap = async () => {
    if (!account) {
      alert('Vui lòng kết nối ví!');
      return;
    }
    if (!inputAmount || inputAmount <= 0) {
      alert('Vui lòng nhập số lượng hợp lệ');
      return;
    }
    
    setLoading(true);
    try {
      // Giả lập quá trình swap
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

        <TokenInput
          theme={currentTheme}
          token={inputToken}
          amount={inputAmount}
          balance={balances[inputToken.symbol]}
          onAmountChange={setInputAmount}
          onTokenSelect={setInputToken}
          onImageError={handleImageError}
        />

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

        <TokenInput
          theme={currentTheme}
          token={outputToken}
          amount={outputAmount}
          balance={balances[outputToken.symbol]}
          readOnly
          onTokenSelect={setOutputToken}
          onImageError={handleImageError}
        />

        <SwapInfo 
          theme={currentTheme} 
          inputToken={inputToken}
          outputToken={outputToken}
          priceImpact={priceImpact}
          gasFee={gasFee}
        />

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
          onClick={account ? handleSwap : () => window.ethereum?.request({ method: 'eth_requestAccounts' })}
          disabled={loading}
        >
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: '20px
