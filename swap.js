"use client";
import { useState } from 'react';
import { ethers } from 'ethers';

export default function App() {
  const [userAddress, setUserAddress] = useState(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const contractAddress = "0xYourSmartContractAddressHere";
  const contractABI = [
    "function swap(uint256 amount) public",
    "function getRate() public view returns (uint256)"
  ];

  async function connectWallet() {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setUserAddress(address);
    } else {
      alert("Vui lòng cài đặt MetaMask!");
    }
  }

  async function swapToken() {
    if (!userAddress) {
      alert("Vui lòng kết nối ví trước!");
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    try {
      const tx = await contract.swap(ethers.utils.parseEther(amount));
      setMessage("Giao dịch đang xử lý...");
      await tx.wait();
      setMessage(`Swap thành công: ${amount} Token`);
    } catch (error) {
      setMessage("Giao dịch thất bại!");
    }
  }

  return (
    <div className="bg-gray-900 text-white text-center p-10">
      <h1 className="text-4xl mb-6">Monad Swap DApp</h1>
      <button onClick={connectWallet} className="bg-blue-600 p-3 rounded-lg">
        {userAddress ? `Đã kết nối: ${userAddress}` : "Kết nối ví MetaMask"}
      </button>
      <div className="mt-6">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Nhập số lượng Token"
          className="p-2 text-black"
        />
        <button onClick={swapToken} className="bg-green-600 p-3 rounded-lg">
          Swap Token
        </button>
      </div>
      <div className="mt-4">{message}</div>
    </div>
  );
}
