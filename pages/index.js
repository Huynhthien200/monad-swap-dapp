import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { motion } from 'framer-motion';
import { FiArrowDown, FiSettings, FiRepeat } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';

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
  chainId: '0x279F', // 10175 in decimal
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
      chainId: 10175,
      address: "0x083978Dd12842779e907472A331314190730a5Bf",
      symbol: "PDC",
      name: "PurpleDuck",
      decimals: 18,
      logoURI: "https://raw.githubusercontent.com/Huynhthien200/file/main/08a10a45-3c84-4b21-b202-53b952780b39.webp"
    },
    {
      chainId: 10175,
      address: "0xNative",
      symbol: "MON",
      name: "Monad",
      decimals: 18,
      logoURI: "https://example.com/monad-logo.png"
    }
  ]
};

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
        <span style={{ color: theme.textPrimary, fontWeight: '500' }}>
          {token.symbol}
        </span>
        <IoIosArrowDown style={{ color: theme.textSecondary, fontSize: '16px' }}/>
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
              <span style={{ color: theme.textPrimary, fontWeight: '600' }}>
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
                  borderRadius: '12px'
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
                  <div style={{ color: theme.textPrimary, fontWeight: '500' }}>
                    {t.name}
                  </div>
                  <div style={{ color: theme.textSecondary, fontSize: '14px' }}>
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

const TokenInput = ({ theme, token, amount, balance, readOnly, onAmountChange, onTokenSelect, onImageError }) => (
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
        {token.symbol} Balance: {balance !== undefined ? 
          parseFloat(balance).toLocaleString('en-US', {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4
          }) : 'Connecting...'}
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
  const [walletLoading, setWalletLoading] = useState(false);

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

  const connectWallet = async () => {
    if (window.ethereum) {
      setWalletLoading(true);
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await fetchBalances(accounts[0]);
        }
      } catch (error) {
        console.error('Lỗi kết nối ví:', error);
        alert('Kết nối ví thất bại!');
      } finally {
        setWalletLoading(false);
      }
    } else {
      alert('Vui lòng cài đặt MetaMask!');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalances({});
  };

  // Lắng nghe sự thay đổi tài khoản và mạng
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          fetchBalances(accounts[0]);
        } else {
          disconnectWallet();
        }
      };

      const handleChainChanged = (chainId) => {
        if (chainId === MONAD_TESTNET_PARAMS.chainId) {
          if (account) fetchBalances(account);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account]);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          await checkNetwork(web3Instance);
          await loadAccount(web3Instance);
        } catch (error) {
          console.error('Lỗi khởi tạo Web3:', error);
          alert('Không thể kết nối với MetaMask');
        }
      } else {
        alert('Vui lòng cài đặt MetaMask!');
      }
    };
    initWeb3();
    return () => window.ethereum?.removeAllListeners();
  }, []);

  useEffect(() => {
    if (account && web3) {
      fetchBalances(account);
    }
  }, [account, web3]);

  const checkNetwork = async (web3) => {
    try {
      const chainId = await web3.eth.getChainId();
      if (chainId !== parseInt(MONAD_TESTNET_PARAMS.chainId, 16)) {
        await switchNetwork();
      }
    } catch (error) {
      console.error('Lỗi kiểm tra mạng:', error);
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
    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await fetchBalances(accounts[0]);
      }
    } catch (error) {
      console.error('Lỗi tải tài khoản:', error);
    }
  };

  // Cập nhật hàm fetchBalances để lấy số dư cho tất cả các token
  const fetchBalances = async (account) => {
    try {
      const newBalances = {};
      for (const token of TOKEN_LIST.tokens) {
        if (token.symbol === "MON") {
          const balance = await web3.eth.getBalance(account);
          newBalances[token.symbol] = web3.utils.fromWei(balance, 'ether');
        } else {
          const contract = new web3.eth.Contract(ERC20_ABI, token.address);
          const balance = await contract.methods.balanceOf(account).call();
          const decimals = await contract.methods.decimals().call();
          newBalances[token.symbol] = (Number(balance) / Math.pow(10, Number(decimals))).toFixed(4);
        }
      }
      setBalances(newBalances);
    } catch (error) {
      console.error('Lỗi lấy số dư:', error);
      setBalances({
        MON: '0.0000',
        PDC: '0.0000'
      });
    }
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
    const rate = inputToken.symbol === "MON" ? 1.5 : 1 / 1.5;
    setOutputAmount((inputAmount * rate).toFixed(4));
    setPriceImpact((Math.random() * 2).toFixed(2));
  };

  const handleSwap = async () => {
    if (!validateInput()) return;
    try {
      setLoading(true);
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

  const currentTheme = darkMode ? theme.dark : theme.light;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: currentTheme.bg,
      transition: 'all 0.3s ease',
      fontFamily: 'Arial, sans-serif'
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
          <h1 style={{ color: currentTheme.textPrimary, fontSize: '24px', fontWeight: 'bold' }}>
            Monad Swap
          </h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            {walletLoading ? (
              <button
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: currentTheme.accent,
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'not-allowed'
                }}
                disabled
              >
                Loading wallet...
              </button>
            ) : account ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: currentTheme.inputBg,
                  border: `1px solid ${currentTheme.border}`,
                  color: currentTheme.textPrimary
                }}>
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
                <button
                  onClick={disconnectWallet}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: '#FF3B3B',
                    border: 'none',
                    color: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: currentTheme.accent,
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                Connect Wallet
              </button>
            )}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: currentTheme.inputBg,
                border: `1px solid ${currentTheme.border}`,
                cursor: 'pointer'
              }}
            >
              {darkMode ? '🌞' : '🌜'}
            </button>
          </div>
        </div>
        <TokenInput
          theme={currentTheme}
          token={inputToken}
          amount={inputAmount}
          balance={balances[inputToken.symbol]}
          readOnly={false}
          onAmountChange={(value) => { setInputAmount(value); calculateSwapRate(); }}
          onTokenSelect={setInputToken}
          onImageError={handleImageError}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          margin: '16px 0'
        }}>
          <button
            onClick={switchTokens}
            style={{
              background: currentTheme.inputBg,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '50%',
              padding: '8px',
              cursor: 'pointer'
            }}
          >
            <FiRepeat style={{ color: currentTheme.textPrimary }} />
          </button>
        </div>
        <TokenInput
          theme={currentTheme}
          token={outputToken}
          amount={outputAmount}
          balance={balances[outputToken.symbol]}
          readOnly={true}
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
        <button
          onClick={handleSwap}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: currentTheme.accent,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Swapping...' : 'Swap'}
        </button>
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentTheme.accent,
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <FiSettings /> Cài đặt giao dịch
          </button>
        </div>
        {Object.keys(balances).length === 0 && (
          <div style={{
            textAlign: 'center',
            color: currentTheme.textSecondary,
            padding: '12px'
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ display: 'inline-block' }}
            >
              ⏳
            </motion.div>
            <p>Đang tải số dư ví...</p>
          </div>
        )}
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

export default SwapInterface;
