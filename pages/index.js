import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faHistory } from "@fortawesome/free-solid-svg-icons";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [walletBalance, setWalletBalance] = useState(undefined);
  const [isHovered, setIsHovered] = useState(false);
  const [showATMBalance, setShowATMBalance] = useState(false);
  const [showWalletBalance, setShowWalletBalance] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  // Function to toggle ATM Balance visibility
  const toggleATMBalance = () => {
    setShowATMBalance(!showATMBalance);
  };

  // Function to toggle Wallet Balance visibility
  const toggleWalletBalance = () => {
    setShowWalletBalance(!showWalletBalance);
  };

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set, we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const atmBalance = (await atm.getBalance()).toNumber();
      setBalance(atmBalance);

      if (account) {
        const provider = new ethers.providers.Web3Provider(ethWallet);
        const wallet = provider.getSigner(account);
        const walletBalance = ethers.utils.formatEther(await wallet.getBalance());
        setWalletBalance(walletBalance);
      }
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      updateTransactions("Deposit");
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      updateTransactions("Withdraw");
      getBalance();
    }
  };

  const updateTransactions = (type) => {
    const newTransaction = {
      type: type,
      timestamp: new Date().toLocaleString(),
    };
    setTransactions([...transactions, newTransaction]);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button className="connect-btn" onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div className={`user-section ${isHovered ? "hovered" : ""}`}>
        <p className="account">Your Account: {account}</p>
        <div className="balance">
          ATM Balance:{" "}
          {showATMBalance ? `${balance} ETH` : <FontAwesomeIcon icon={faEyeSlash} onClick={toggleATMBalance} />}
          {showATMBalance && (
            <FontAwesomeIcon icon={faEye} onClick={toggleATMBalance} style={{ marginLeft: "10px", cursor: "pointer" }} />
          )}
        </div>
        {walletBalance && (
          <div className="balance">
            Wallet Balance:{" "}
            {showWalletBalance ? `${walletBalance} ETH` : <FontAwesomeIcon icon={faEyeSlash} onClick={toggleWalletBalance} />}
            {showWalletBalance && (
              <FontAwesomeIcon icon={faEye} onClick={toggleWalletBalance} style={{ marginLeft: "10px", cursor: "pointer" }} />
            )}
          </div>
        )}
        <div className="balance-actions">
          <button className="action-btn deposit" onClick={deposit}>
            Deposit 1 ETH
          </button>
          <button className="action-btn withdraw" onClick={withdraw}>
            Withdraw 1 ETH
          </button>
          <button className="action-btn history" onClick={() => setShowTransactions(true)}>
            Transaction History <FontAwesomeIcon icon={faHistory} style={{ marginLeft: "10px" }} />
          </button>
        </div>
      </div>
    );
  };

  const [showTransactions, setShowTransactions] = useState(false);

  const showTransactionHistory = () => {
    return (
      <div className="transaction-history">
        <h2>Transaction History</h2>
        {transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <ul>
            {transactions.map((transaction, index) => (
              <li key={index}>
                {transaction.type} - {transaction.timestamp}
              </li>
            ))}
          </ul>
        )}
        <button className="close-btn" onClick={() => setShowTransactions(false)}>
          Close
        </button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main
      className={`container ${isHovered ? "hovered" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <header>
        <h1>Welcome to Steven's ATM!</h1>
      </header>
      {initUser()}
      {showTransactions && showTransactionHistory()}
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: Arial, sans-serif;
          text-align: center;
          transition: background-color 0.5s;
        }

        .container.hovered {
          background-color: #E7FFCA;
        }

        .connect-btn {
          padding: 10px 20px;
          background-color: #2ecc71;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
          outline: none;
        }

        .connect-btn:hover {
          background-color: #27ae60;
        }

        .connect-btn:active {
          transform: scale(0.98);
        }

        .user-section {
          margin-top: 40px;
          transition: background-color 0.5s;
        }

        .user-section.hovered {
          background-color: #2980b9;
        }

        .account {
          font-size: 20px;
          margin-bottom: 10px;
          color: #fff;
        }

        .balance {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .balance-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
        }

        .action-btn {
          padding: 10px 20px;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
          outline: none;
        }

        .action-btn.deposit {
          background-color: #16a085;
        }

        .action-btn.withdraw {
          background-color: #c0392b;
        }

        .action-btn.history {
          background-color: #3498db;
        }

        .action-btn:hover {
          opacity: 0.8;
        }

        .action-btn:active {
          transform: scale(0.98);
        }

        .transaction-history {
          margin-top: 20px;
          padding: 20px;
          background-color: #ecf0f1;
          border: 1px solid #bdc3c7;
          border-radius: 5px;
          text-align: left;
        }

        .transaction-history h2 {
          font-size: 20px;
          margin-bottom: 10px;
        }

        .transaction-history ul {
          list-style-type: none;
          padding: 0;
          margin: 0;
        }

        .transaction-history li {
          margin-bottom: 5px;
        }

        .close-btn {
          padding: 8px 16px;
          background-color: #e74c3c;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.3s;
          outline: none;
          margin-top: 10px;
        }

        .close-btn:hover {
          background-color: #c0392b;
        }

        .close-btn:active {
          transform: scale(0.98);
        }
      `}</style>
    </main>
  );
}
