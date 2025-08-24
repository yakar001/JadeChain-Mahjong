
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { ethers, BrowserProvider } from 'ethers';

// Define the shape of the ethereum object in the window
interface Window {
    ethereum?: any;
}

interface WalletContextType {
  walletAddress: string | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    const windowWithEthereum = window as Window;
    if (windowWithEthereum.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(windowWithEthereum.ethereum);
        // It will prompt user for authorization
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
  }, []);
  
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
    <WalletContext.Provider value={{ walletAddress, connectWallet, disconnectWallet }}>
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
