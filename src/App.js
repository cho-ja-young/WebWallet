import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setAccount('');
          setIsConnected(false);
        } else {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      });
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);
        setIsConnected(true);
      } catch (error) {
        console.error('Connection to MetaMask failed:', error);
      }
    } else {
      alert('Please install MetaMask to use this feature.');
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setBalance('');
    setRecipient('');
    setAmount('');
    setIsConnected(false);
    setWeb3(null);
  };

  const getBalance = async () => {
    if (isConnected && web3 && account) {
      const balance = await web3.eth.getBalance(account);
      setBalance(web3.utils.fromWei(balance, 'ether'));
    } else {
      alert('Please connect your wallet first.');
    }
  };

  const sendTransaction = async () => {
    if (!web3 || !account) {
      alert('Please connect your wallet first.');
      return;
    }

    if (!recipient || !amount) {
      alert('Please enter both recipient address and amount.');
      return;
    }

    try {
      await web3.eth.sendTransaction({
        from: account,
        to: recipient,
        value: web3.utils.toWei(amount, 'ether'),
      });
      alert('Transaction Sent!');
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed.');
    }
  };

  const getTransactionHistory = () => {
    alert('Transaction history function placeholder.');
  };

  return (
    <div className="wallet-container">
      <h1>Web 3.0 Wallet</h1>

      <div className="section">
        <h2>Account Management</h2>
        {isConnected ? (
          <button onClick={disconnectWallet}>Disconnect Wallet</button>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
        <p>{account ? `Connected: ${account}` : ''}</p>
      </div>

      <div className="section">
        <h2>Balance Display</h2>
        <button onClick={getBalance}>Check Balance</button>
        <p>{balance ? `Balance: ${balance} ETH` : ''}</p>
      </div>

      <div className="section">
        <h2>Transaction Execution</h2>
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          type="text"
          placeholder="Amount to Send"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={sendTransaction}>Send Transaction</button>
      </div>

      <div className="section">
        <h2>Transaction History</h2>
        <button onClick={getTransactionHistory}>View Transaction History</button>
        <ul>
          <li>Transaction history function placeholder.</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
