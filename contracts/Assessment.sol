// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    struct Transaction {
        address sender;
        string transactionType;
        uint256 amount;
        uint256 timestamp;
    }

    Transaction[] public transactions;

    event Deposit(address indexed sender, uint256 amount);
    event Withdraw(address indexed sender, uint256 amount);

    constructor(uint256 initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    receive() external payable {}

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function deposit() public payable onlyOwner {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        balance += msg.value;
        emit Deposit(msg.sender, msg.value);
        addTransaction(msg.sender, "Deposit", msg.value);
    }

    function withdraw(uint256 _withdrawAmount) public onlyOwner {
        require(_withdrawAmount > 0, "Withdrawal amount must be greater than 0");
        require(address(this).balance >= _withdrawAmount, "Balance is insufficient");

        balance -= _withdrawAmount;
        payable(msg.sender).transfer(_withdrawAmount);
        emit Withdraw(msg.sender, _withdrawAmount);
        addTransaction(msg.sender, "Withdrawal", _withdrawAmount);
    }

    function addTransaction(address _sender, string memory _transactionType, uint256 _amount) internal {
        Transaction memory newTransaction = Transaction({
            sender: _sender,
            transactionType: _transactionType,
            amount: _amount,
            timestamp: block.timestamp
        });
        transactions.push(newTransaction);
    }

    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }

    function getTransaction(uint256 index) public view returns (address sender, string memory transactionType, uint256 amount, uint256 timestamp) {
        require(index < transactions.length, "Index out of bounds");
        Transaction memory transaction = transactions[index];
        return (transaction.sender, transaction.transactionType, transaction.amount, transaction.timestamp);
    }
}
