pragma solidity ^0.4.26;

import "./CloneFactory.sol";
import "./RPS.sol";

/* Operator Contract of the RPS which
   Manages Users and generates new RPS Instances
   via the Clone Factory Patern
*/
contract Operator is CloneFactory {
    address public adminAddress;
    address rpsAddress;

    // Register active users and their bet amount
    mapping(address => uint256) public betRegister;

    constructor(address _rpsAddress) public {
        
        adminAddress = msg.sender;
        rpsAddress = _rpsAddress;
    }
    
    /* User is placing a bet and
       the contract receives a 1% fee
    */
    function placeBet(uint256 _betAmount) public payable {
        
        // Fixed bet size
        require(_betAmount == 50000 || _betAmount == 5000 || _betAmount == 500);
        
        // Check balance
        require(msg.value >= (_betAmount *  10000000000) );

        // Double call overwrites last bet
        if(betRegister[msg.sender] != 0){
            betRegister[msg.sender] = 0;
        }

        betRegister[msg.sender] =  _betAmount * 1000000000000;
    }
    
    /* Anyone can look up how much 
       money the contract holds
    */
    function showBalance() public view returns (uint256 balance) {
        return address(this).balance;
    }
    
    /* Creator cashes out fees
       that where collected by the contract
    */
    function cashOut() public creator {
        msg.sender.call.value(address(this).balance);
    }
    
    /* User is joining an address
       the contract receives a 1% fee
    */
    function joinAddress(address _opponentAddress) public payable {
        
        // Check if Opponent has active bet
        require(betRegister[_opponentAddress] > 0);
        
        // Check balance
        require(msg.value *100 >= betRegister[_opponentAddress]);
        
        // You cant join yourself
        require(msg.sender != _opponentAddress);
        
        // Joining overwrites placed bet
        if(betRegister[msg.sender] != 0){
            betRegister[msg.sender] = 0;
        }
        
        uint256 betAmount = betRegister[_opponentAddress];
        
        // Remove addressAmount from register
        betRegister[_opponentAddress] = 0;
        
        // Create new Instance to play RPS
        createRPS(_opponentAddress, msg.sender, betAmount);
    }

    /* Create new Instance or Clone to play RPS.
       Function Call from joinAddress
    */
    function createRPS(address _userAddress, address _opponentAddress, uint256 _theirBetAmount) private {
        RPS rps = RPS(createClone(rpsAddress));
        rps.factoryConstructor(_userAddress, _opponentAddress, address(this), _theirBetAmount);

        emit publishRPS(_userAddress, _opponentAddress, rps, _theirBetAmount);
    }
    
    // FallBack if someone wants to donate ETH
    function() external payable {}
    
    // Publish RPS Instance from betRegster
    event publishRPS(address userAddress, address opponentAddress, address clone, uint256 theirBetAmount);

    modifier creator() {
        require(msg.sender == adminAddress);
        _;
    }
}