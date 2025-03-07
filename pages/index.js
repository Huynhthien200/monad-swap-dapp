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

const ROUTER_ABI = [
  // Swap MON (native) -> ERC20
  {
    "inputs": [
      { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
      { "internalType": "address[]", "name": "path", "type": "address[]" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "name": "swapExactETHForTokens",
    "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
    "stateMutability": "payable",
    "type": "function"
  },
  // Swap ERC20 -> MON (native)
  {
    "inputs": [
      { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
      { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
      { "internalType": "address[]", "name": "path", "type": "address[]" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "name": "swapExactTokensForETH",
    "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Swap ERC20 -> ERC20
  {
    "inputs": [
      { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
      { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
      { "internalType": "address[]", "name": "path", "type": "address[]" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "name": "swapExactTokensForTokens",
    "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Get price quote
  {
    "inputs": [
      { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
      { "internalType": "address[]", "name": "path", "type": "address[]" }
    ],
    "name": "getAmountsOut",
    "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const WMON_ADDRESS = '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701';
const UNISWAP_ROUTER_ADDRESS = '0xfb8e1c3b833f9e67a71C859a132cf783b645e436';

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

const getWrappedNativeAddress = () => {
  return WMON_ADDRESS;
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
        if (chainId !== MONAD_TESTNET_PARAMS.chainId) {
          alert('Vui lòng chuyển về Monad Testnet!');
          disconnectWallet();
        } else if (account) {
          fetchBalances(account);
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

  const fetchBalances = async (account) => {
    try {
      const newBalances = {};
      // Lấy native MON balance
      const monBalance = await web3.eth.getBalance(account);
      newBalances.MON = web3.utils.fromWei(monBalance, 'ether');
      // Lấy PDC balance
      const pdcContract = new web3.eth.Contract(ERC20_ABI, TOKEN_LIST.tokens[0].address);
      const pdcBalance = await pdcContract.methods.balanceOf(account).call();
      newBalances.PDC = web3.utils.fromWei(pdcBalance, 'ether');
      // Lấy WMON balance
      const wmonContract = new web3.eth.Contract(ERC20_ABI, WMON_ADDRESS);
      const wmonBalance = await wmonContract.methods.balanceOf(account).call();
      newBalances.WMON = web3.utils.fromWei(wmonBalance, 'ether');

      setBalances({
        MON: Number(newBalances.MON).toFixed(4),
        PDC: Number(newBalances.PDC).toFixed(4),
        WMON: Number(newBalances.WMON).toFixed(4)
      });
    } catch (error) {
      console.error('Lỗi lấy số dư:', error);
      setBalances({ MON: '0.0000', PDC: '0.0000', WMON: '0.0000' });
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

  const handleSwap = async () => {
    if (!validateInput() || !web3 || !account) return;
    try {
      setLoading(true);
      const router = new web3.eth.Contract(UNISWAP_ROUTER_ABI, UNISWAP_ROUTER_ADDRESS);
      const deadline = Math.floor(Date.now() / 1000) + 300;
      const amountIn = web3.utils.toWei(inputAmount, 'ether');
      const amountOutMin = web3.utils.toWei(
        (outputAmount * (1 - slippage / 100)).toString(),
        'ether'
      );
      let tx;
      if (inputToken.symbol === 'MON') {
        const path = [WMON_ADDRESS, TOKEN_LIST.tokens[0].address];
        tx = await router.methods
          .swapExactETHForTokens(amountOutMin, path, account, deadline)
          .send({ from: account, value: amountIn });
      } else if (outputToken.symbol === 'MON') {
        const path = [inputToken.address, WMON_ADDRESS];
        const tokenContract = new web3.eth.Contract(ERC20_ABI, inputToken.address);
        await tokenContract.methods.approve(UNISWAP_ROUTER_ADDRESS, amountIn).send({ from: account });
        tx = await router.methods
          .swapExactTokensForETH(amountIn, amountOutMin, path, account, deadline)
          .send({ from: account });
      } else {
        const path = [inputToken.address, outputToken.address];
        const tokenContract = new web3.eth.Contract(ERC20_ABI, inputToken.address);
        await tokenContract.methods.approve(UNISWAP_ROUTER_ADDRESS, amountIn).send({ from: account });
        tx = await router.methods
          .swapExactTokensForTokens(amountIn, amountOutMin, path, account, deadline)
          .send({ from: account });
      }
      if (tx.status) {
        alert(`Swap thành công! TX Hash: ${tx.transactionHash}`);
        await fetchBalances(account);
        setInputAmount('');
        setOutputAmount('');
      }
    } catch (error) {
      console.error('Lỗi swap:', error);
      alert(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateSwapRate = async () => {
    if (!inputAmount || !web3) return;
    try {
      const router = new web3.eth.Contract(UNISWAP_ROUTER_ABI, UNISWAP_ROUTER_ADDRESS);
      let path = [];
      if (inputToken.symbol === 'MON') {
        path = [WMON_ADDRESS, outputToken.address];
      } else if (outputToken.symbol === 'MON') {
        path = [inputToken.address, WMON_ADDRESS];
      } else {
        path = [inputToken.address, outputToken.address];
      }
      const amountIn = web3.utils.toWei(inputAmount, 'ether');
      const amounts = await router.methods.getAmountsOut(amountIn, path).call();
      const output = web3.utils.fromWei(amounts[1], 'ether');
      setOutputAmount(output);
      // Giả sử giá thị trường là 1.5
      const idealOutput = inputAmount * 1.5;
      const impact = ((idealOutput - output) / idealOutput * 100).toFixed(2);
      setPriceImpact(Math.abs(impact));
    } catch (error) {
      console.error('Lỗi tính tỷ giá:', error);
      setOutputAmount('0.0000');
      setPriceImpact(0.00);
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
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                ⏳
              </motion.div>
              Đang xử lý...
            </div>
          ) : (
            'Swap Now'
          )}
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
