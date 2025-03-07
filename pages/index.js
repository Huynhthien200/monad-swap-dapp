import { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import { motion } from 'framer-motion';
import { FiArrowDown, FiSettings, FiRepeat } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';

// -------------------- CONSTANTS --------------------
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

const PERMIT2_ABI = [{
  "inputs": [
    { "internalType": "address", "name": "owner", "type": "address" },
    { "internalType": "address", "name": "spender", "type": "address" },
    { "internalType": "uint256", "name": "value", "type": "uint256" },
    { "internalType": "uint256", "name": "deadline", "type": "uint256" },
    { "internalType": "uint8", "name": "v", "type": "uint8" },
    { "internalType": "bytes32", "name": "r", "type": "bytes32" },
    { "internalType": "bytes32", "name": "s", "type": "bytes32" }
  ],
  "name": "permit",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}];

const UNIVERSAL_ROUTER_ABI = [{
  "inputs": [
    { "internalType": "bytes", "name": "commands", "type": "bytes" },
    { "internalType": "bytes[]", "name": "inputs", "type": "bytes[]" },
    { "internalType": "uint256", "name": "deadline", "type": "uint256" }
  ],
  "name": "execute",
  "outputs": [],
  "stateMutability": "payable",
  "type": "function"
}];

// Địa chỉ contract
const WMON_ADDRESS = '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701';
const UNISWAP_ROUTER_ADDRESS = '0xfb8e1c3b833f9e67a71C859a132cf783b645e436';
const PERMIT2_ADDRESS = '0x000000000022d473030f116ddee9f6b43ac78ba3';
const UNIVERSAL_ROUTER_ADDRESS = '0x3ae6d8a282d67893e17aa70ebffb33ee5aa65893';

// --- Các hằng số mới cho phí giao dịch ---
const FEE_RECIPIENT = '0x9D4F166DD709Cb74C0BCD598D7854bd51c777b0C';
const FEE_PERCENTAGE = 0.01; // 1% phí giao dịch

// Placeholder cho Uniswap V2 Factory & Pair
const UNISWAP_V2_FACTORY_ADDRESS = '0xYourFactoryAddress'; // Cập nhật địa chỉ chính xác
const UNISWAP_V2_FACTORY_ABI = [
  {
    "constant": true,
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "getPair",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];
const UNISWAP_V2_PAIR_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "getReserves",
    "outputs": [
      { "internalType": "uint112", "name": "_reserve0", "type": "uint112" },
      { "internalType": "uint112", "name": "_reserve1", "type": "uint112" },
      { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
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

const getWrappedNativeAddress = () => WMON_ADDRESS;

// -------------------- COMPONENTS --------------------

// Cập nhật giao diện SwapInfo hiển thị exchangeRate, fee và địa chỉ nhận phí
const SwapInfo = ({ theme, inputToken, outputToken, priceImpact, exchangeRate, isLoading, gasFee, feeAmount }) => (
  <div style={{
    borderTop: `1px solid ${theme.border}`,
    padding: '16px',
    margin: '16px 0',
    background: theme.container,
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FiArrowDown style={{ color: theme.textSecondary }}/>
        <span style={{ color: theme.textSecondary }}>Tỷ giá</span>
      </div>
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ display: 'inline-block' }}
        >
          ⏳
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ color: theme.textPrimary, fontWeight: 500 }}>
            {exchangeRate ? `1 ${inputToken.symbol} = ${exchangeRate} ${outputToken.symbol}` : 'Đang tính...'}
          </span>
          <span style={{ 
            color: priceImpact > 2 ? '#FF3B3B' : priceImpact > 1 ? '#FFA500' : '#21BF73',
            fontSize: '12px'
          }}>
            (Price Impact: {priceImpact}%)
          </span>
        </div>
      )}
    </div>
    
    <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: theme.textSecondary, fontSize: '14px' }}>
        Phí giao dịch ({FEE_PERCENTAGE * 100}%)
      </span>
      <span style={{ color: theme.textPrimary, fontSize: '14px' }}>
        {feeAmount.toFixed(4)} {inputToken.symbol}
      </span>
    </div>
    
    <div style={{ 
      padding: '12px',
      background: theme.inputBg,
      borderRadius: '8px',
      fontSize: '12px',
      color: theme.textSecondary
    }}>
      📢 Phí được chuyển đến: 
      <span style={{ fontFamily: 'monospace', color: theme.accent, marginLeft: '4px' }}>
        {FEE_RECIPIENT.slice(0, 6)}...{FEE_RECIPIENT.slice(-4)}
      </span>
    </div>
    
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      marginTop: '12px'
    }}>
      <div style={{
        padding: '12px',
        background: theme.inputBg,
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div style={{ color: theme.textSecondary, fontSize: '12px' }}>Phí giao dịch</div>
        <div style={{ color: theme.textPrimary, fontWeight: 500 }}>${gasFee}</div>
      </div>
      <div style={{
        padding: '12px',
        background: theme.inputBg,
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div style={{ color: theme.textSecondary, fontSize: '12px' }}>Thời gian</div>
        <div style={{ color: theme.textPrimary, fontWeight: 500 }}>~3 phút</div>
      </div>
    </div>
  </div>
);

// Cập nhật TokenSelector với tìm kiếm
const TokenSelector = ({ token, theme, onSelect, onImageError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
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
          background: theme.container,
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          width: '320px',
          maxHeight: '400px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '16px' }}>
            <input
              type="text"
              placeholder="Tìm kiếm token..."
              style={{
                width: '100%',
                padding: '12px',
                background: theme.inputBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                color: theme.textPrimary,
                marginBottom: '12px'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ 
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '0 16px 16px'
          }}>
            {TOKEN_LIST.tokens
              .filter(t => 
                t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((t) => (
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
                    transition: 'background 0.2s ease'
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

// -------------------- MAIN SWAP INTERFACE --------------------
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
  const [exchangeRate, setExchangeRate] = useState('');
  const [feeAmount, setFeeAmount] = useState(0);
  const [isRateLoading, setIsRateLoading] = useState(false);
  const [balances, setBalances] = useState({});
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  // State cho Permit2 & Universal Router
  const [usePermit2, setUsePermit2] = useState(false);
  const [useUniversalRouter, setUseUniversalRouter] = useState(false);

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

  const currentTheme = darkMode ? theme.dark : theme.light;

  // -------------------- WALLET & NETWORK --------------------
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

  // -------------------- useEffect TÍNH TỶ GIÁ --------------------
  useEffect(() => {
    const fetchRate = async () => {
      if (web3 && inputAmount && inputToken && outputToken) {
        setIsRateLoading(true);
        await calculateSwapRate();
        setIsRateLoading(false);
      }
    };
    const debouncedFetch = setTimeout(fetchRate, 500);
    return () => clearTimeout(debouncedFetch);
  }, [inputToken, outputToken, inputAmount, web3]);

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
      const monBalance = await web3.eth.getBalance(account);
      newBalances.MON = web3.utils.fromWei(monBalance, 'ether');
      const pdcContract = new web3.eth.Contract(ERC20_ABI, TOKEN_LIST.tokens[0].address);
      const pdcBalance = await pdcContract.methods.balanceOf(account).call();
      newBalances.PDC = web3.utils.fromWei(pdcBalance, 'ether');
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

  // -------------------- switchTokens --------------------
  const switchTokens = () => {
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
    setInputAmount('');
    setOutputAmount('');
    calculateSwapRate();
  };

  // -------------------- PHÊ DUYỆT & UNIVERSAL ROUTER --------------------
  const approveWithPermit2 = async (tokenAddress, amount) => {
    const permit2 = new web3.eth.Contract(PERMIT2_ABI, PERMIT2_ADDRESS);
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const nonce = await permit2.methods.nonces(account).call();
    const message = {
      owner: account,
      spender: useUniversalRouter ? UNIVERSAL_ROUTER_ADDRESS : UNISWAP_ROUTER_ADDRESS,
      value: amount,
      nonce: nonce,
      deadline: deadline
    };
    const signature = {
      v: 28,
      r: '0x'.padEnd(66, '1'),
      s: '0x'.padEnd(66, '2')
    };
    await permit2.methods.permit(
      message.owner,
      message.spender,
      message.value,
      message.deadline,
      signature.v,
      signature.r,
      signature.s
    ).send({ from: account });
  };

  const executeUniversalSwap = async () => {
    const universalRouter = new web3.eth.Contract(UNIVERSAL_ROUTER_ABI, UNIVERSAL_ROUTER_ADDRESS);
    const deadline = Math.floor(Date.now() / 1000) + 300;
    const amountIn = web3.utils.toWei(inputAmount, 'ether');
    const amountOutMin = web3.utils.toWei(
      (outputAmount * (1 - slippage / 100)).toString(),
      'ether'
    );
    const path = [inputToken.address, outputToken.address];
    const commands = '0x0b'; // Lệnh swap V2
    const inputs = web3.eth.abi.encodeParameters(
      ['address[]', 'address', 'uint256', 'uint256'],
      [path, account, amountIn, amountOutMin]
    );
    return await universalRouter.methods.execute(
      commands,
      [inputs],
      deadline
    ).send({ from: account, value: inputToken.symbol === 'MON' ? amountIn : 0 });
  };

  // -------------------- calculateSwapRate --------------------
  const calculateSwapRate = async () => {
    if (!inputAmount || !web3 || !inputToken || !outputToken) {
      setOutputAmount('');
      setExchangeRate('');
      return;
    }
    
    try {
      const router = new web3.eth.Contract(ROUTER_ABI, UNISWAP_ROUTER_ADDRESS);
      const path = buildSwapPath();
      const amountIn = web3.utils.toWei(inputAmount, 'ether');
      
      const amounts = await router.methods.getAmountsOut(amountIn, path).call();
      // Lấy giá đầu ra raw
      const rawOutput = web3.utils.fromWei(amounts[amounts.length - 1], 'ether');
      
      // Tính phí giao dịch
      const fee = parseFloat(inputAmount) * FEE_PERCENTAGE;
      const actualInput = parseFloat(inputAmount) - fee;
      const actualAmountIn = web3.utils.toWei(actualInput.toString(), 'ether');
      
      const actualAmounts = await router.methods.getAmountsOut(actualAmountIn, path).call();
      const actualOutput = web3.utils.fromWei(actualAmounts[actualAmounts.length - 1], 'ether');
      
      setFeeAmount(fee);
      setOutputAmount(actualOutput);
      setExchangeRate((actualOutput / actualInput).toFixed(6));
      
      // Có thể cập nhật tính toán Price Impact nếu có API hay thông số pool
      // Ví dụ: sử dụng getPoolReserves (nếu được)
      // const reserves = await getPoolReserves(path[0], path[1]);
      // const idealOutput = actualInput * (reserves[1] / reserves[0]);
      // const impact = ((idealOutput - actualOutput) / idealOutput * 100).toFixed(2);
      // setPriceImpact(Math.abs(impact));
      
    } catch (error) {
      console.error('Lỗi tính tỷ giá:', error);
      setOutputAmount('');
      setExchangeRate('');
    }
  };

  // Hàm xây dựng đường dẫn swap
  const buildSwapPath = () => {
    let path = [];
    if (inputToken.symbol === 'MON') {
      path = [WMON_ADDRESS, outputToken.address];
    } else if (outputToken.symbol === 'MON') {
      path = [inputToken.address, WMON_ADDRESS];
    } else {
      path = [inputToken.address, outputToken.address];
    }
    return path.filter(addr => addr !== '0xNative');
  };

  // -------------------- getPoolReserves --------------------
  const getPoolReserves = async (tokenA, tokenB) => {
    const factory = new web3.eth.Contract(UNISWAP_V2_FACTORY_ABI, UNISWAP_V2_FACTORY_ADDRESS);
    const pairAddress = await factory.methods.getPair(tokenA, tokenB).call();
    const pairContract = new web3.eth.Contract(UNISWAP_V2_PAIR_ABI, pairAddress);
    const reserves = await pairContract.methods.getReserves().call();
    return [reserves[0], reserves[1]];
  };

  // -------------------- handleSwap --------------------
  const handleSwap = async () => {
    if (!validateInput() || !web3 || !account) return;
    try {
      setLoading(true);
      const deadline = Math.floor(Date.now() / 1000) + 300;
      // Tính phí và số lượng thực tế sau khi trừ phí
      const fee = parseFloat(inputAmount) * FEE_PERCENTAGE;
      const actualInput = parseFloat(inputAmount) - fee;
      
      // Chuyển phí đến địa chỉ nhận phí
      if (inputToken.symbol === 'MON') {
        await web3.eth.sendTransaction({
          from: account,
          to: FEE_RECIPIENT,
          value: web3.utils.toWei(fee.toString(), 'ether')
        });
      } else {
        const tokenContract = new web3.eth.Contract(ERC20_ABI, inputToken.address);
        await tokenContract.methods.transfer(
          FEE_RECIPIENT,
          web3.utils.toWei(fee.toString(), 'ether')
        ).send({ from: account });
      }
      
      const amountIn = web3.utils.toWei(actualInput.toString(), 'ether');
      const amountOutMin = web3.utils.toWei(
        (outputAmount * (1 - slippage / 100)).toString(),
        'ether'
      );
      let tx;
      let path = [];
      
      if (useUniversalRouter) {
        await executeUniversalSwap();
        setLoading(false);
        return;
      }
      
      const router = new web3.eth.Contract(ROUTER_ABI, UNISWAP_ROUTER_ADDRESS);
      
      if (inputToken.symbol !== 'MON' && usePermit2) {
        await approveWithPermit2(inputToken.address, amountIn);
      } else if (inputToken.symbol !== 'MON') {
        const tokenContract = new web3.eth.Contract(ERC20_ABI, inputToken.address);
        await tokenContract.methods.approve(UNISWAP_ROUTER_ADDRESS, amountIn).send({ from: account });
      }
      
      if (inputToken.symbol === 'MON') {
        path = [WMON_ADDRESS, outputToken.address];
        if (path.length < 2) {
          alert('Đường giao dịch không hợp lệ!');
          setLoading(false);
          return;
        }
        tx = await router.methods
          .swapExactETHForTokens(amountOutMin, path, account, deadline)
          .send({ from: account, value: amountIn });
      } else if (outputToken.symbol === 'MON') {
        path = [inputToken.address, WMON_ADDRESS];
        if (path.length < 2) {
          alert('Đường giao dịch không hợp lệ!');
          setLoading(false);
          return;
        }
        tx = await router.methods
          .swapExactTokensForETH(amountIn, amountOutMin, path, account, deadline)
          .send({ from: account });
      } else {
        path = [inputToken.address, outputToken.address];
        if (path.length < 2) {
          alert('Đường giao dịch không hợp lệ!');
          setLoading(false);
          return;
        }
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

  // -------------------- RENDER --------------------
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
        width: '440px',
        background: currentTheme.container,
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: `1px solid ${currentTheme.border}`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Hiệu ứng gradient */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: `linear-gradient(45deg, ${currentTheme.accent}20 0%, ${currentTheme.bg} 100%)`,
          zIndex: 0,
          pointerEvents: 'none'
        }}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
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
            onAmountChange={(value) => setInputAmount(value)}
            onTokenSelect={(token) => {
              setInputToken(token);
              setInputAmount('');
            }}
            onImageError={handleImageError}
          />
          <div style={{ margin: '16px 0', position: 'relative' }}>
            <button
              onClick={switchTokens}
              style={{
                background: currentTheme.accent,
                border: 'none',
                borderRadius: '50%',
                padding: '10px',
                cursor: 'pointer',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <FiRepeat 
                style={{ 
                  color: '#fff',
                  fontSize: '20px',
                  transition: 'transform 0.3s ease'
                }}
              />
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
            exchangeRate={exchangeRate}
            isLoading={isRateLoading}
            gasFee={gasFee}
            feeAmount={feeAmount}
          />
          <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
            <label style={{ color: currentTheme.textPrimary, fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={usePermit2}
                onChange={(e) => setUsePermit2(e.target.checked)}
              />
              Sử dụng Permit2
            </label>
            <label style={{ color: currentTheme.textPrimary, fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={useUniversalRouter}
                onChange={(e) => setUseUniversalRouter(e.target.checked)}
              />
              Sử dụng Universal Router
            </label>
          </div>
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
    </div>
  );
};

export default SwapInterface;
