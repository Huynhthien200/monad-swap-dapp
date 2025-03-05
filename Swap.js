import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CONTRACT_ADDRESS = "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701"; // Thay bằng địa chỉ contract trên Monad Testnet
const CONTRACT_ABI = [
  // ABI của hàm swap
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
        <div className="p-6 flex flex-col items-center gap-4 bg-gray-900 text-white min-h-screen">
            <h1 className="text-2xl font-bold">DApp Swap trên Monad</h1>
            <Button onClick={connectWallet} className="bg-blue-600">Kết nối Ví</Button>
            <Input placeholder="Token A Address" value={tokenA} onChange={(e) => setTokenA(e.target.value)} className="text-black" />
            <Input placeholder="Token B Address" onChange={(e) => setTokenB(e.target.value)} className="text-black" />
            <Input placeholder="Số lượng" type="number" onChange={(e) => setAmount(e.target.value)} className="text-black" />
            <Button onClick={swapTokens} className="bg-green-600">Swap</Button>
        </div>
    );
}
