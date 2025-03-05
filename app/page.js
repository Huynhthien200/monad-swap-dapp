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
    await tx.wait(
