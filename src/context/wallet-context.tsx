'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { ethers, BrowserProvider, Contract } from 'ethers';
import { useToast } from '@/hooks/use-toast';

// Define the shape of the ethereum object in the window
interface Window {
    ethereum?: any;
}

// A generic ABI for ERC20 transfer function
const erc20Abi = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
];

// This should be your actual $JIN token contract address
const JIN_TOKEN_CONTRACT_ADDRESS = "0xYOUR_JIN_TOKEN_CONTRACT_ADDRESS"; 
const GAME_ROOM_MANAGER_ADDRESS = "0xYOUR_GAME_ROOM_MANAGER_ADDRESS"; // The contract that collects fees

interface WalletContextType {
  walletAddress: string | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
  deductTokens: (amount: number) => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { toast } = useToast();

  const connectWallet = useCallback(async () => {
    const windowWithEthereum = window as Window;
    if (windowWithEthereum.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(windowWithEthereum.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error("Error connecting to wallet:", error);
        toast({
            variant: "destructive",
            title: "钱包连接失败 (Wallet Connection Failed)",
            description: "用户拒绝了连接请求。(User rejected the connection request.)"
        });
      }
    } else {
       toast({
            variant: "destructive",
            title: "MetaMask 未安装 (MetaMask Not Installed)",
            description: "请先安装 MetaMask 插件。(Please install the MetaMask extension to use this feature.)"
        });
    }
  }, [toast]);

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
  }, []);

  const deductTokens = useCallback(async (amount: number): Promise<boolean> => {
      const windowWithEthereum = window as Window;
      if (!windowWithEthereum.ethereum || !walletAddress) {
          toast({
              variant: "destructive",
              title: "钱包未连接 (Wallet Not Connected)",
              description: "请先连接您的钱包。(Please connect your wallet first.)"
          });
          return false;
      }
      
      try {
          const provider = new ethers.BrowserProvider(windowWithEthereum.ethereum);
          const signer = await provider.getSigner();
          const jinTokenContract = new Contract(JIN_TOKEN_CONTRACT_ADDRESS, erc20Abi, signer);

          // Convert the amount to the smallest unit (e.g., wei for Ether)
          const amountInSmallestUnit = ethers.parseUnits(amount.toString(), 18); // Assuming 18 decimal places

          // This is a placeholder. In a real scenario, you'd likely use `approve` and then the GameRoomManager would call `transferFrom`.
          // For this simulation, we'll directly "transfer" to a placeholder address to demonstrate the concept.
          // This simulates paying an entry fee.
          
          toast({
              title: "请求交易授权 (Requesting Transaction)",
              description: `请求授权扣除 ${amount} $JIN 作为入场费。`
          });

          const tx = await jinTokenContract.transfer(GAME_ROOM_MANAGER_ADDRESS, amountInSmallestUnit);
          
          toast({
              title: "正在处理交易 (Processing Transaction)",
              description: `交易正在区块链上确认... (Transaction hash: ${tx.hash})`
          });

          await tx.wait(); // Wait for the transaction to be mined

          toast({
            title: "交易成功 (Transaction Successful)",
            description: `已成功扣除 ${amount} $JIN。`
          });
          
          return true;
          
      } catch (error: any) {
          console.error("Token deduction failed:", error);
          toast({
              variant: "destructive",
              title: "代币扣款失败 (Token Deduction Failed)",
              description: error.reason || "交易被拒绝或发生错误。(The transaction was rejected or an error occurred.)"
          });
          return false;
      }

  }, [walletAddress, toast]);
  
  // Check for an already connected wallet on component mount
  useEffect(() => {
    const checkForConnectedWallet = async () => {
       const windowWithEthereum = window as Window;
       if (windowWithEthereum.ethereum) {
           try {
               const provider = new ethers.BrowserProvider(windowWithEthereum.ethereum);
               const accounts = await provider.listAccounts();
               if (accounts.length > 0 && accounts[0]) {
                   setWalletAddress(accounts[0].address);
               }
           } catch(error) {
               console.error("Could not check for connected wallet:", error);
           }
       }
    };
    checkForConnectedWallet();
  }, []);
  
  // Listen for account changes
  useEffect(() => {
    const windowWithEthereum = window as Window;
    if (windowWithEthereum.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          disconnectWallet();
        }
      };

      windowWithEthereum.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        windowWithEthereum.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [disconnectWallet]);


  return (
    <WalletContext.Provider value={{ walletAddress, connectWallet, disconnectWallet, deductTokens }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
