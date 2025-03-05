import { useState } from 'react';
import { motion } from 'framer-motion';
import Web3 from 'web3';

export default function Swap() {
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(''); // Số dư native (MON)
  const [availableTokens, setAvailableTokens] = useState([]); // Danh sách token có số dư > 0
  const [selectedToken, setSelectedToken] = useState(''); // Token đang chọn ở mục "You pay"
  const [tokenB, setTokenB] = useState('Select a token'); // Token ở mục "Select a token"
  const [loading, setLoading] = useState(false); // Trạng thái loading khi đang swap

  // Dummy list các token ERC20 trên Monad Testnet (địa chỉ cần thay bằng thật)
  const tokenList = [
    { symbol: "BTC", address: "0xBTCADDRESS", isNative: false },
    { symbol: "BNB", address: "0xBNBADDRESS", isNative: false },
    { symbol: "USDT", address: "0xUSDTADDRESS", isNative: false },
  ];

  const handleInput = (e) => {
    setAmount(e.target.value);
  };

  // Hàm truy vấn số dư của các token ERC20 và cập nhật availableTokens
  const fetchTokenBalances = async (web3, account, nativeBalance) => {
    const erc20ABI = [
      {
        constant: true,
        inputs: [{ name: "_owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        type: "function",
      },
    ];

    const tokensWithBalance = [];

    // Thêm native token MON
    if (parseFloat(nativeBalance) > 0) {
      tokensWithBalance.push({ symbol: "MON", balance: nativeBalance, isNative: true });
    }

    // Duyệt qua danh sách token ERC20
    for (const token of tokenList) {
      try {
        const contract = new web3.eth.Contract(erc20ABI, token.address);
        const tokenBalanceWei = await contract.methods.balanceOf(account).call();
        const tokenBalance = web3.utils.fromWei(tokenBalanceWei, 'ether');
        if (parseFloat(tokenBalance) > 0) {
          tokensWithBalance.push({ ...token, balance: tokenBalance });
        }
      } catch (error) {
        console.error("Error fetching balance for", token.symbol, error);
      }
    }

    // Quét số dư của token MON (native)
    const monBalanceWei = await web3.eth.getBalance(account);
    const monBalance = web3.utils.fromWei(monBalanceWei, 'ether');
    if (parseFloat(monBalance) > 0) {
      tokensWithBalance.push({ symbol: "MON", balance: monBalance, isNative: true });
    }

    return tokensWithBalance;
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        // Thêm mạng Monad Testnet với thông số mới
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: "0x279F", // 10143 ở dạng hex
            chainName: "Monad Testnet",
            nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
            rpcUrls: ["https://testnet-rpc.monad.xyz/"],
            blockExplorerUrls: ["https://testnet.monadexplorer.com/"]
          }]
        });
        // Kết nối ví
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        // Lấy số dư native token
        const balanceInWei = await web3.eth.getBalance(accounts[0]);
        const nativeBalance = web3.utils.fromWei(balanceInWei, 'ether');
        setBalance(nativeBalance);
        // Lấy danh sách token có số dư > 0 (bao gồm native MON)
        const tokens = await fetchTokenBalances(web3, accounts[0], nativeBalance);
        setAvailableTokens(tokens);
        // Nếu danh sách có token, chọn token đầu tiên làm mặc định
        if (tokens.length > 0) {
          setSelectedToken(tokens[0].symbol);
        }
      } catch (error) {
        console.error("User denied account access or error occurred", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // Hàm thực hiện swap
  const swapTokens = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount to swap.");
      return;
    }

    setLoading(true);
    const web3 = new Web3(window.ethereum);
    const fromToken = selectedToken;
    const toToken = tokenB;

    // Lógica swap với token ERC20
    if (fromToken === "MON" && toToken !== "MON") {
      // Nếu từ MON chuyển sang token ERC20
      const token = tokenList.find(token => token.symbol === toToken);
      if (!token) {
        alert("Invalid token selected for swap.");
        setLoading(false);
        return;
      }

      const contract = new web3.eth.Contract(erc20ABI, token.address);
      const amountInWei = web3.utils.toWei(amount, 'ether');
      
      try {
        // Gọi hàm chuyển token từ MON sang token ERC20 (tạm giả định sử dụng hàm chuyển cho ví MON)
        const tx = await web3.eth.sendTransaction({
          from: account,
          to: token.address,
          value: amountInWei,
        });
        console.log("Swap success:", tx);
        alert("Swap successful!");
      } catch (error) {
        console.error("Error during swap:", error);
        alert("Swap failed.");
      }
    } else {
      // Thêm logic cho trường hợp swap giữa hai token ERC20 nếu cần thiết
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-white p-10">
      {/* Header */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-10">
        <div className="text-2xl font-bold">Trade</div>
        <motion.button 
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-400"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={connectWallet}
        >
          {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect wallet'}
        </motion.button>
      </div>

      {/* Hiển thị số dư nếu đã kết nối */}
      {account && (
        <div className="mb-5 text-lg font-bold">
          Balance: {balance} MON
        </div>
      )}

      {/* Mục "You pay" chỉ hiển thị khi ví đã được kết nối */}
      {account ? (
        <motion.div 
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full relative"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-xl font-bold text-center mb-5">Swap</div>
          <div className="bg-gray-100 p-4 rounded-lg mb-3">
            <label className="block text-sm text-gray-600 mb-1">You pay</label>
            <div className="flex justify-between items-center">
              <select 
                className="bg-transparent outline-none font-bold" 
                onChange={(e) => setSelectedToken(e.target.value)}
                value={selectedToken}
              >
                {availableTokens.length > 0 ? (
                  availableTokens.map((token, idx) => (
                    <option key={idx} value={token.symbol}>
                      {token.symbol} ({token.balance})
                    </option>
                  ))
                ) : (
                  <option>No token available</option>
                )}
              </select>
              <input 
                type="number" 
                className="bg-transparent text-right w-24 outline-none" 
                placeholder="Amount" 
                value={amount} 
                onChange={handleInput} 
              />
            </div>
          </div>

          <div className="text-center mb-3">
            <button onClick={swapTokens} disabled={loading} className="bg-blue-500 text-white p-2 rounded-full">
              {loading ? "Swapping..." : "⬇️ Swap"}
            </button>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-5">
            <label className="block text-sm text-gray-600 mb-1">Select a token</label>
            <select 
              className="w-full p-2 rounded-lg outline-none" 
              onChange={(e) => setTokenB(e.target.value)}
              value={tokenB}
            >
              <option>Select a token</option>
              <option>BTC</option>
              <option>BNB</option>
              <option>USDT</option>
            </select>
          </div>

        </motion.div>
      ) : (
        <div className="text-lg font-bold">
          Please connect your wallet to access swap functionality.
        </div>
      )}

      {/* Banner */}
      <motion.div 
        className="mt-10 bg-black text-white p-4 rounded-lg shadow-lg max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Cross-chain swaps are here! <button className="bg-white text-black rounded-lg px-3 py-1 ml-2">Learn more</button>
      </motion.div>

      <p className="mt-5 text-gray-500">Made by Huynhthien200 ❤️</p>
    </div>
  );
}
