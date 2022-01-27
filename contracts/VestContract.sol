pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VestContract is Ownable {
    struct data {
        uint256 vestAmount;
        uint256 vestedAmount;
        uint256 startOfVesting;
    }

    ERC20 private token;
    uint256 VESTING_TIME = 2592000; //30 days  60*60*24*30days == 2592000
    mapping( address => data ) private users;

    // Event that log deposit operation
    event DepositTokens( address sender, uint256 amount );

    // Event that log vest operation
    event VestTokens( address receiver, uint256 amount );

    // Event that log claim operation
    event ClaimTokens( address sender, uint256 amount );

    constructor( address tokenAddress ) {
        token = ERC20(tokenAddress);
    }

    function vest( address receiver, uint256 amount ) public onlyOwner{
        require(users[receiver].vestAmount == 0, "it is forbidden to vest more than once");
        require(token.balanceOf(address(this)) >= amount, "there are not enough tokens in the deposit");
        users[receiver].vestAmount = amount;
        users[receiver].vestedAmount = 0;
        users[receiver].startOfVesting = block.timestamp;
        emit VestTokens(receiver, amount);
    }

    function claim () public {
        require(users[msg.sender].vestAmount > 0, "there are no tokens to claim");
        uint256 t1 = users[msg.sender].startOfVesting;
        uint256 t2 = block.timestamp;
        uint256 time = (t2 - t1);
        uint256 vestedcoins = 0;
        if (time >= VESTING_TIME){
            vestedcoins = users[msg.sender].vestAmount;
        } 
        else {
            vestedcoins = (users[msg.sender].vestAmount * time / VESTING_TIME);
        }
        uint256 coinstotransfer = (vestedcoins - users[msg.sender].vestedAmount);
        (users[msg.sender]).vestedAmount = vestedcoins;
        token.approve(msg.sender, coinstotransfer);
        ERC20(token).transfer(msg.sender, coinstotransfer);
        emit ClaimTokens(msg.sender, coinstotransfer);
        if (users[msg.sender].vestAmount == users[msg.sender].vestedAmount){
            users[msg.sender].vestAmount = 0;
            users[msg.sender].vestedAmount = 0;
        }
    }

    function deposit ( uint256 amount ) public onlyOwner {
        require(token.balanceOf(msg.sender) >= amount, "there are not enough tokens to make a deposit");
        ERC20(token).transferFrom(msg.sender, address(this), amount);
        emit DepositTokens(msg.sender, amount);
    }

    function getVestedAmount() public view returns( uint256 ) {
        return (users[msg.sender]).vestedAmount;
    }

}