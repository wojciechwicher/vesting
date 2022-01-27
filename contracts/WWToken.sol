pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
 
contract WWToken is ERC20, Ownable {
    constructor() ERC20("Wojciech Wicher Token A", "WWTA") {
        _mint(msg.sender, 1000 * 10 ** 18);
    }

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }
}
