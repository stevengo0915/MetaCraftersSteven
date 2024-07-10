import { useState, useEffect } from "react";
import { ethers } from "ethers";

import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
    const [ethWallet, setEthWallet] = useState(undefined);
    const [account, setAccount] = useState(undefined);
    const [atm, setATM] = useState(undefined);
    const [balance, setBalance] = useState(undefined);
    const [showDepositConfirmation, setShowDepositConfirmation] = useState(false);
    const [showWithdrawConfirmation, setShowWithdrawConfirmation] = useState(false);
    const [transactions, setTransactions] = useState([]);

    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const atmABI = atm_abi.abi;

    // Function to connect to MetaMask wallet
    const getWallet = async () => {
        if (window.ethereum) {
            setEthWallet(window.ethereum);
        }

        if (ethWallet) {
            try {
                const accounts = await ethWallet.request({ method: "eth_accounts" });
                handleAccount(accounts[0]); // Assuming first account is used
            } catch (error) {
                console.error("Error fetching accounts:", error);
                // Handle error fetching accounts
            }
        }
    };

    // Function to handle connected account
    const handleAccount = (account) => {
        if (account) {
            console.log("Account connected: ", account);
            setAccount(account);
        } else {
            console.log("No account found");
        }
    };

    // Function to connect MetaMask account and initialize ATM contract
    const connectAccount = async () => {
        if (!ethWallet) {
            alert("MetaMask wallet is required to connect");
            return;
        }

        try {
            const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
            handleAccount(accounts[0]); // Assuming first account is used
            getATMContract();
        } catch (error) {
            console.error("Error connecting account:", error);
            // Handle error connecting account
        }
    };

    // Function to initialize ATM contract
    const getATMContract = () => {
        const provider = new ethers.providers.Web3Provider(ethWallet);
        const signer = provider.getSigner();
        const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

        setATM(atmContract);
    };

    // Function to get current balance from ATM contract
    const getBalance = async () => {
        try {
            if (atm) {
                const balance = await atm.getBalance(); // Assuming atm.getBalance() returns a BigNumber
                setBalance(balance.toString()); // Convert BigNumber to string for safe handling in React state
            }
        } catch (error) {
            console.error("Error fetching balance:", error);
            // Handle error fetching balance
        }
    };

    // Function to trigger deposit operation
    const deposit = async () => {
        setShowDepositConfirmation(true); // Show deposit confirmation dialog
    };

    // Function to confirm deposit operation
    const confirmDeposit = async () => {
        try {
            if (atm) {
                let tx = await atm.deposit(ethers.utils.parseEther("1")); // Deposit 1 ETH (assuming ATM contract handles ETH)
                await tx.wait();
                getBalance();
                addToTransactionHistory("Deposit", "1 ETH");
            }
        } catch (error) {
            console.error("Error depositing:", error);
            // Handle error depositing
        } finally {
            setShowDepositConfirmation(false); // Close deposit confirmation dialog
        }
    };

    // Function to trigger withdraw operation
    const withdraw = async () => {
        setShowWithdrawConfirmation(true); // Show withdraw confirmation dialog
    };

    // Function to confirm withdraw operation
    const confirmWithdraw = async () => {
        try {
            if (atm) {
                let tx = await atm.withdraw(ethers.utils.parseEther("1")); // Withdraw 1 ETH (assuming ATM contract handles ETH)
                await tx.wait();
                getBalance();
                addToTransactionHistory("Withdrawal", "1 ETH");
            }
        } catch (error) {
            console.error("Error withdrawing:", error);
            // Handle error withdrawing
        } finally {
            setShowWithdrawConfirmation(false); // Close withdraw confirmation dialog
        }
    };

    // Function to add transaction to history
    const addToTransactionHistory = (type, amount) => {
        const newTransaction = {
            type: type,
            amount: amount,
            timestamp: new Date().toLocaleString(),
        };
        setTransactions([...transactions, newTransaction]);
    };

    // Function to initialize user interface based on MetaMask connection and account status
    const initUser = () => {
        if (!ethWallet) {
            return (
                <div className="container">
                    <p>Please install MetaMask to use this ATM.</p>
                </div>
            );
        }

        if (!account) {
            return (
                <div className="container">
                    <button className="connect-button" onClick={connectAccount}>
                        Connect MetaMask
                    </button>
                </div>
            );
        }

        if (balance === undefined) {
            getBalance();
        }

        return (
            <div className="container">
                <p className="account-info">Account: {account}</p>
                <p className="account-info">Balance: {balance} ETH</p>
                <div className="button-container">
                    <button className="action-button" onClick={deposit}>
                        Deposit 1 ETH
                    </button>
                    <button className="action-button" onClick={withdraw}>
                        Withdraw 1 ETH
                    </button>
                </div>
            </div>
        );
    };

    // Effect hook to connect MetaMask on component mount
    useEffect(() => {
        getWallet();
    }, []);

    return (
        <main className="main-container">
            <header className="header">
                <h1>Welcome to the Stevens ATM!</h1>
            </header>
            {initUser()}

            {/* Deposit Confirmation Modal */}
            {showDepositConfirmation && (
                <div className="overlay">
                    <div className="modal">
                        <h2>Confirm Deposit</h2>
                        <p>Are you sure you want to deposit 1 ETH?</p>
                        <div className="button-container">
                            <button className="action-button" onClick={confirmDeposit}>
                                Confirm
                            </button>
                            <button className="action-button" onClick={() => setShowDepositConfirmation(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Confirmation Modal */}
            {showWithdrawConfirmation && (
                <div className="overlay">
                    <div className="modal">
                        <h2>Confirm Withdrawal</h2>
                        <p>Are you sure you want to withdraw 1 ETH?</p>
                        <div className="button-container">
                            <button className="action-button" onClick={confirmWithdraw}>
                                Confirm
                            </button>
                            <button className="action-button" onClick={() => setShowWithdrawConfirmation(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction History */}
            <div className="transaction-history">
                <h2>Transaction History</h2>
                {transactions.length > 0 ? (
                    <ul>
                        {transactions.map((transaction, index) => (
                            <li key={index} className="transaction-item">
                                <span>{transaction.type}</span>
                                <span>{transaction.amount}</span>
                                <span>{transaction.timestamp}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No transactions yet.</p>
                )}
            </div>

            <style jsx>{`
                .main-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    flex-direction: column;
                    background-color: #ffe8ca;
                }

                .header {
                    margin-bottom: 20px;
                    text-align: center;
                }

                .container {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .connect-button {
                    padding: 10px 20px;
                    font-size: 1rem;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    cursor: pointer;
                    border-radius: 4px;
                    outline: none;
                }

                .account-info {
                    font-size: 1.2rem;
                    margin-bottom: 10px;
                }

                .button-container {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-top: 10px;
                }

                .action-button {
                    padding: 10px 20px;
                    font-size: 1rem;
                    background-color: #008CBA;
                    color: white;
                    border: none;
                    cursor: pointer;
                    border-radius: 4px;
                    outline: none;
                }

                .overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .modal {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    max-width: 80%;
                }

                .modal h2 {
                    margin-bottom: 10px;
                }

                .transaction-history {
                    margin-top: 30px;
                    max-width: 600px;
                    width: 100%;
                }

                .transaction-history h2 {
                    margin-bottom: 10px;
                }

                .transaction-history ul {
                    list-style-type: none;
                    padding: 0;
                }

                .transaction-history .transaction-item {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px solid #ccc;
                    padding: 10px 0;
                }
            `}</style>
        </main>
    );
}
