import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [gas, setGas] = useState('21000');
  const [gasPrice, setGasPrice] = useState('20000000000');
  const [isConnected, setIsConnected] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);

  const infuraUrl = 'https://polygon-mumbai.infura.io/v3/YOUR_INFURA_PROJECT_ID'; // Replace with your Infura Project ID

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
    setGas('21000');
    setGasPrice('20000000000');
    setIsConnected(false);
    setWeb3(null);
    setTransactionHistory([]);
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
        gas: gas,
        gasPrice: gasPrice,
      });
      alert('Transaction Sent!');
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed.');
    }
  };

  const getTransactionHistory = async () => {
    if (!account) {
      alert('Please connect your wallet first.');
      return;
    }

    try {
      const web3Infura = new Web3(new Web3.providers.HttpProvider(infuraUrl));
      const transactionCount = await web3Infura.eth.getTransactionCount(account);
      const transactions = [];

      for (let i = 0; i < transactionCount; i++) {
        const tx = await web3Infura.eth.getTransactionFromBlock(account, i);
        if (tx) {
          transactions.push(tx);
        }
      }

      setTransactionHistory(transactions);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      alert('Could not fetch transaction history.');
    }
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
        <input
          type="text"
          placeholder="Gas Limit"
          value={gas}
          onChange={(e) => setGas(e.target.value)}
        />
        <input
          type="text"
          placeholder="Gas Price (in wei)"
          value={gasPrice}
          onChange={(e) => setGasPrice(e.target.value)}
        />
        <button onClick={sendTransaction}>Send Transaction</button>
      </div>

      <div className="section">
        <h2>Transaction History</h2>
        <button onClick={getTransactionHistory}>View Transaction History</button>
        <ul>
          {transactionHistory.length > 0 ? (
            transactionHistory.map((tx, index) => (
              <li key={index}>
                <p>Hash: {tx.hash}</p>
                <p>From: {tx.from}</p>
                <p>To: {tx.to}</p>
                <p>Value: {web3.utils.fromWei(tx.value, 'ether')} ETH</p>
                <hr />
              </li>
            ))
          ) : (
            <li>No transactions found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;
