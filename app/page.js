"use client"; // Nếu dùng App Router

import { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701"; // Hợp đồng Swap trên Monad
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "tokenA", "type": "address" },
      { "internalType": "address", "name": "tokenB", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "swap",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export default function Swap() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [tokenA, setTokenA] = useState("0x083978Dd12842779e907472A331314190730a5Bf");
  const [tokenB, setTokenB] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
    }
  }, []);

  async function connectWallet() {
    if (!provider) return alert("Vui lòng cài đặt MetaMask!");
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    setSigner(signer);
    setContract(contract);
  }

  async function swapTokens() {
    if (!contract) return alert("Vui lòng kết nối ví!");
    const tx = await contract.swap(tokenA, tokenB, ethers.parseUnits(amount, 18));
    await tx.wait();
    alert("Swap thành công trên Monad!");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">DApp Swap trên Monad</h1>
      <button onClick={connectWallet} className="bg-blue-600 px-6 py-2 rounded-lg mb-4">
        Kết nối Ví
      </button>
      <input
        type="text"
        placeholder="Token A Address"
        value={tokenA}
        onChange={(e) => setTokenA(e.target.value)}
        className="w-80 p-2 mb-2 text-black rounded-lg"
      />
      <input
        type="text"
        placeholder="Token B Address"
        onChange={(e) => setTokenB(e.target.value)}
        className="w-80 p-2 mb-2 text-black rounded-lg"
      />
      <input
        type="number"
        placeholder="Số lượng"
        onChange={(e) => setAmount(e.target.value)}
        className="w-80 p-2 mb-4 text-black rounded-lg"
      />
      <button onClick={swapTokens} className="bg-green-600 px-6 py-2 rounded-lg">
        Swap
      </button>
    </div>
  );
}
