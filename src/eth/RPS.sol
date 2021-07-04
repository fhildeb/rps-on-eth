pragma solidity ^0.4.26;

/* Contract for controlling the RPS
   inner logic and determine the winner
*/
contract RPS {
    
    //User-related
    address public userAddress;
    string public userString;
    bytes32 public userHashedString;
    uint256 public userPrice;
    
    //Opponent-related
    address public opponentAddress;
    string public opponentString;
    bytes32 public opponentHashedString;
    uint256 public opponentPrice;

    //Infrastructure
    address public operatorAddress;
    uint256 public firstHashTime;
    bool public firstHashSent;
    bool public GesturesRevealed;
    bool public gamePending;
    uint256 public betamount;

    /* By creating clones and no new contracts there
       are no new constructors either.
       The function is needed to mimic its usecase.
       It is only called one time on clone creation.
    */
    function factoryConstructor(address _userAddress, 
                                address _opponentAddress, 
                                address _operatorAddress, 
                                uint256 _betamount) public {
        //Handover
        userAddress = _userAddress;
        opponentAddress = _opponentAddress;
        operatorAddress = _operatorAddress;
        betamount = _betamount;
                
        //Infrastructure
        firstHashSent = false;
        gamePending = true;
        GesturesRevealed = false;
        userPrice = 0;
        opponentPrice = 0;
    }

    /* User sends the gesture + password. Their hash is 
       published and the bet amount is demanded.
    */
    function createHash(string gesture, string password) public payable player {
        // Check balance
        require(msg.value >= betamount);
        
        // Check gesture
        require(    (keccak256((gesture)) == (keccak256("rock"))) || 
                    (keccak256((gesture)) == (keccak256("paper"))) || 
                    (keccak256((gesture)) == (keccak256("scissor"))) );

        /* First Request marked and timestamped
           on the functions execution
        */
        if (firstHashSent == false) {
            firstHashSent = true;
            firstHashTime = now;
        }

        // Receiving users gesture + password
        if (msg.sender == userAddress) {
            // Only one-time hash submission
            require(userHashedString == 0);
            userHashedString = sha256(abi.encodePacked(gesture, password));
        }
        
        // Receiving opponents gesture + password
        else if (msg.sender == opponentAddress) {
            // Only one-time hash submission
            require(opponentHashedString == 0);
            opponentHashedString = sha256(abi.encodePacked(gesture, password));
        }

        // Both hashes received
        if (userHashedString != 0 && opponentHashedString != 0) {
            emit BothHashesReceived();
        }
    }

    /* User reveals gesture + password.
       The hash is calculated and compared
    */
    function revealHash(string gesture, string password) public player {
        
        // Check gesture
        require(    ((keccak256(gesture)) == (keccak256("rock"))) || 
                    ((keccak256(gesture)) == (keccak256("paper"))) ||
                    ((keccak256(gesture)) == (keccak256("scissor"))) );
                    
        //Receiving users gesture + password
        if (msg.sender == userAddress) {
        
            //Hash must be equal
            require(userHashedString == sha256(abi.encodePacked(gesture, password)));
            userString = gesture;
        }
        
        //Receiving opponents gesture + password
        else if (msg.sender == opponentAddress) {
            
            // Hash must be equal
            require(opponentHashedString == sha256(abi.encodePacked(gesture, password)));
            opponentString = gesture;
        }

        // Both gesture revealed
        if (bytes(userString).length != 0 && bytes(opponentString).length != 0) {
            emit BothGesturesRevealed(userString, opponentString);
            GesturesRevealed = true;
        }
    }

    /* Play RPS and check for
       the winner gesture
    */
    function playRPS() public player {

        // gestures are revealed
        require(GesturesRevealed == true);
        
        // There is a tie
        if((keccak256(bytes(userString))) == (keccak256(bytes(opponentString)))){
            userPrice = address(this).balance / 2;
            opponentPrice = address(this).balance / 2;
            emit WinnerSet(address(0x0));
        }
        
        // User lost, Opponent won
        else if(    ( ((keccak256(bytes(userString))) == (keccak256(("rock")))) && ((keccak256(bytes(opponentString))) == (keccak256(("paper"))) )) ||
                    ( ((keccak256(bytes(userString))) == (keccak256(("paper")))) && ((keccak256(bytes(opponentString))) == (keccak256(("scissor"))) )) ||
                    ( ((keccak256(bytes(userString))) == (keccak256(("scissor")))) && ((keccak256(bytes(opponentString))) == (keccak256(("rock"))) )) ){
            opponentPrice = address(this).balance;
            emit WinnerSet(opponentAddress);
        }
        // User won, Opponent lost
        else{
            userPrice = address(this).balance;
            emit WinnerSet(userAddress);
        }
        
        gamePending = false;
    }
    
    /* If someone is not responding, the
       other person can claim the full reward
    */
    function forceReward() public player {
        
        // Atleast 3 minutes old
        require(now > (firstHashTime + 180));
        
        // Atleast user hash missing, opponent gets win
        if ((userHashedString == 0) || (bytes(opponentString).length != 0)) {
            opponentPrice = address(this).balance;
            emit WinnerSet(opponentAddress);
            gamePending = false;
        }
        
        // Atleast opponent hash missing, user gets win
        else if ((opponentHashedString == 0) || (bytes(userString).length != 0)) {
            userPrice = address(this).balance;
            emit WinnerSet(userAddress);
            gamePending = false;
        }
    }

    /* Person claiming the owed
       reward from the RPS
    */
    function claimReward() public player {
        
        // Game closed
        require(gamePending == false);
        
        bool success;
        uint256 owedAmount;
        
        // User claims reward
        if (msg.sender == userAddress) {
            owedAmount = userPrice;
            userPrice = 0;
            success = userAddress.call.value(owedAmount)();
            require(success);
        // Opponent claims reward
        } else {
            owedAmount = opponentPrice;
            opponentPrice = 0;
            success = opponentAddress.call.value(owedAmount)();
            require(success);
        }

        /* Destroying the contract after all rewards have
           been taken, so the contract is immune to attacks
        */
        if (address(this).balance == 0) {
            selfdestruct(operatorAddress);
        }
    }
    
    event BothHashesReceived();
    event BothGesturesRevealed(string userString, string opponentString);
    event WinnerSet(address winner);

    modifier player() {
        require(msg.sender == userAddress || msg.sender == opponentAddress);
        _;
    }
}