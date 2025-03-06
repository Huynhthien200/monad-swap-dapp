import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowDown, FiSettings, FiRepeat, FiX } from 'react-icons/fi';
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

const TokenInput = ({ theme, token, amount, balance, readOnly, onAmountChange, onTokenSelect, onImageError }) => {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <div style={{
      backgroundColor: theme.inputBg,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      border: `1px solid ${theme.border}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: theme.textSecondary, fontSize: '14px' }}>Bạn có: {balance} {token.symbol}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.0"
          readOnly={readOnly}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '24px',
            color: theme.textPrimary,
            marginRight: '12px'
          }}
        />
        <button
          onClick={() => setShowSelector(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: theme.container,
            padding: '8px 12px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            cursor: 'pointer'
          }}
        >
          <img 
            src={token.logoURI} 
            alt={token.symbol} 
            style={{ width: '24px', height: '24px' }}
            onError={onImageError}
          />
          <span style={{ color: theme.textPrimary }}>{token.symbol}</span>
          <IoIosArrowDown style={{ color: theme.textSecondary }}/>
        </button>
      </div>

      <AnimatePresence>
        {showSelector && (
          <TokenSelector 
            theme={theme}
            onSelect={(selectedToken) => {
              onTokenSelect(selectedToken);
              setShowSelector(false);
            }}
            onClose={() => setShowSelector(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const TokenSelector = ({ theme, onSelect, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
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
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        style={{
          background: theme.container,
          borderRadius: '16px',
          padding: '24px',
          width: '400px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ color: theme.textPrimary }}>Chọn token</h3>
          <FiX 
            style={{ color: theme.textSecondary, cursor: 'pointer' }}
            onClick={onClose}
          />
        </div>
        
        {TOKEN_LIST.tokens.map((token) => (
          <div
            key={token.symbol}
            onClick={() => onSelect(token)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              cursor: 'pointer',
              borderRadius: '8px',
              '&:hover': {
                background: theme.inputBg
              }
            }}
          >
            <img 
              src={token.logoURI} 
              alt={token.symbol} 
              style={{ width: '32px', height: '32px' }}
              onError={(e) => e.target.src = 'https://via.placeholder.com/32'}
            />
            <div>
              <div style={{ color: theme.textPrimary }}>{token.symbol}</div>
              <div style={{ color: theme.textSecondary, fontSize: '14px' }}>{token.name}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

const SwapInfo = ({ theme, inputToken, outputToken, priceImpact, gasFee }) => {
  return (
    <div style={{ 
      margin: '16px 0',
      padding: '12px',
      background: theme.inputBg,
      borderRadius: '8px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: theme.textSecondary }}>Tỷ giá</span>
        <span style={{ color: theme.textPrimary }}>
          1 {inputToken.symbol} ≈ 1.5 {outputToken.symbol}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: theme.textSecondary }}>Ảnh hưởng giá</span>
        <span style={{ color: priceImpact > 2 ? '#FF3B3B' : theme.textPrimary }}>
          {priceImpact}%
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: theme.textSecondary }}>Phí gas ước tính</span>
        <span style={{ color: theme.textPrimary }}>{gasFee} MON</span>
      </div>
    </div>
  );
};

const SettingsModal = ({ theme, slippage, setSlippage, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
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
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        style={{
          background: theme.container,
          borderRadius: '16px',
          padding: '24px',
          width: '400px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ color: theme.textPrimary }}>Cài đặt</h3>
          <FiX 
            style={{ color: theme.textSecondary, cursor: 'pointer' }}
            onClick={onClose}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            color: theme.textSecondary,
            marginBottom: '8px'
          }}>
            Độ trượt giá (Slippage)
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              style={{
                flex: 1,
                background: theme.inputBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                padding: '8px 12px',
                color: theme.textPrimary
              }}
            />
            <span style={{ 
              color: theme.textPrimary,
              padding: '8px 12px'
            }}>%</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SwapInterface = () => {
  // ... (Giữ nguyên phần state và các hàm từ code gốc)

  return (
    // ... (Giữ nguyên phần JSX từ code gốc)
  );
};

export default SwapInterface;
