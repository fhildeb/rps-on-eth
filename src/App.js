import React from 'react';
import Web3 from "web3";
import './App.css';

import OperatorABI from "./eth/OperatorABI.json";
import RPSABI from "./eth/RPSABI.json";

const operatorAddress = "0x59D1fE63AFce87Cd5F7af3EF1279Ba7dcC80E15f";
var rpsAddress = "0x0";
var userGesture = "";
var opponentGuesture = "";
var gameresult = "";
var opponentAddress = "";
var option = "";
var password = "";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

      // Minimal
      balance: 0,
      message: "No proccess pending",
      error: "No errors",
      betamount: "",
      walleterror: "Loading information",
      address: "0x",
      lockedfunds: "(not checked)",
      result: ""
    }
  }

  /**
   * When webcomponents from render()
   * are displayed correctly, this function
   * will be called to execute JS code.
   */
  componentDidMount = async () => {

    /**
     * Accessing Metamask
     */

    // Initiate a wallet provider for older brownsers
    let web3Provider;

    // For modern browsers
    if (window.ethereum) {
      web3Provider = window.ethereum;
      try {
        // Request Account Access
        await window.ethereum.enable();
      } catch (error) {
        // User denied Account Access
        this.logMetaMask("Please allow access to MetaMask");
        return;
      }
    }
    // For old browsers
    else if (window.web3) {
      web3Provider = window.web3.currentProvider;
    }
    // Default
    else {
      this.logMetaMask("Please install MetaMask");
      return;
    }

    /**
     * Accessing Ropsten Network
     */

    //create web3 wrapper for ethereum modules
    const web3 = new Web3(web3Provider);

    // Compare network ID´s
    const networkID = await web3.eth.net.getId();
    if (networkID !== 3) {
      this.logMetaMask("Please set your network to Ropsten");
      return;
    }
    // Ropsten selected
    else {
      this.logMetaMask("MetaMask connected to Ropsten Wallet");
    }

    // Refresh if permission request is still pending
    if(this.state.metamask === "Loading information" ){
      this.refreshPage();
    }
    
    // Update Ether balance every 2 seconds
    this.setState({ web3 }, () => {
      this.updateBalance();
      setInterval(() => {
        this.updateBalance();
      }, 2 * 1000);
    });
    document.getElementById("starting").style.display = "block";
  }

  /**
   * Will render all tags from React
   * into one webpage and binding the
   * state variables into the frontend.
   * 
   * Formatting is done with CSS
   * in ./App.css
   */
  render = () => {
    const { balance, 
            message, 
            error,
            walleterror,
            address,
            result,
            lockedfunds
          } = this.state;
    return (
      <div className="App Mobile">
        <div className="Container">
          <div className="WalletStatusContainer">
            <div className="WalletStatusBar">
              <div className="WalletStatusLeft" >
                <img className="MetamaskPicture" alt="MetaMask" src="./metamask_logo.png"></img>
              </div>
              <div className="WalletStatusRight">
                <p className="StatusBarText">{walleterror}</p>
              </div>
            </div>
          </div>
          <div>
            <div className="WalletOverview">
              <div>
                <p className="WalletHeading">Authentic kindness has a power greater than rock, paper, and scissors combined. <span className="Author">-Toni Sorenson</span></p>
                <p>Current Funds: {balance} ETH </p>
              </div>
            </div>
            <div className="RPS">
              <div id="starting" className="FunctionBar Hide">
                <button className="StartButton" onClick={() => this.toggleBet()}><span>Create new Game</span></button>
                <button className="StartButton" onClick={() => this.toggleJoin()}><span>Join Game</span></button>
              </div>
              <div id="joining" className="BlankFunctionBar Hide">
                <div className="AddressBar">
                  <p>Enter your opponents address</p>
                  <p>to see information and join</p>
                </div>
                <form autoComplete="off"><input type="text" id="joinaddress"></input></form>
                <button id="lookupbutton" className="FullSizeForwardButton" onClick={() => this.lookUp()}><span> look up</span></button>
                <div id="lookUpError" className="Bar Red">
                  <p>{error}</p>
                </div>
                <div id="lookUpMessage" className="BarLookUp">
                  <p>{message}</p>
                </div>
                <button id="joinaddressButton" className="FullSizeForwardButton Push" onClick={() => this.joinAddress()}><span> join now</span></button>
              </div>
              <div id="betting" className="FunctionBar Hide">
                <button className="BetButton" onClick={() => this.chooseBet("50000")}><span>BET <br></br> 0.05 <br></br> ETH</span></button>
                <button className="BetButton" onClick={() => this.chooseBet("5000")}><span>BET <br></br> 0.005 <br></br> ETH</span></button>
                <button className="BetButton" onClick={() => this.chooseBet("500")}><span>BET <br></br> 0.0005 <br></br> ETH</span></button>
                <button className="BackButton FullSizeButton" onClick={() => this.toggleStart()}><span> go back</span></button>
                <div id="betError" className="Bar Red">
                  <p>{error}</p>
                </div>
              </div>
              <div id="loading" className="Hide">
                <button className="BackButton MediumButton" onClick={() => this.refreshPage()}><span>abort</span></button>
                <div id="loadstatusbar" className="RPSStatusBar">
                  <img id="lspicture" className="Picture" alt="Loadingscreen" src="./loadingscreen.png"></img>
                  <div className="Message">
                    <p>{message}</p>
                  </div>
                </div>
              </div>
              <div id="playing" className="LightFunctionBar Hide">
                <div className="AddressBar">
                  <p>Choose your gesture and secure your</p>
                  <p>input with a sequence of numbers </p>
                </div>
                <button id="rock" className="ButtonUnselected" onClick={() => this.rps("rock")}><img className="RPSImage" src="./rock.png" alt="Rock"></img></button>
                <button id="paper" className="ButtonUnselected" onClick={() => this.rps("paper")}><img className="RPSImage" src="./paper.png" alt="Paper"></img></button>
                <button id="scissor" className="ButtonUnselected" onClick={() => this.rps("scissor")}><img className="RPSImage" src="./scissor.png" alt="Scissor"></img></button>
                <form autoComplete="off"><input type="password" id="password"></input></form>
                <button className="FullSizeForwardButton" onClick={() => this.publish()}><span> enter input</span></button>
                <div id="error" className="Bar Red">
                  <p>{error}</p>
                </div>
              </div>
              <div id="revealing" className="LightFunctionBar Hide">
                <div className="AddressBar">
                  <p>Both of you submitted a choice.</p>
                  <p>Reveal your´s now!</p>
                </div>
                <button className="FullSizeForwardButton" onClick={() => this.reveal()}><span> reveal your choice</span></button>
                <div id="revealstatusbar" className="RPSStatusBar">
                  <img id="revealpicture" className="Picture" alt="Loadingscreen" src="./loadingscreen.png"></img>
                  <div className="Message">
                    <p>{message}</p>
                  </div>
                </div>
                  <div id="revealerror" className="Bar Red">
                    <p>{error}</p>
                  </div>
              </div>
              <div id="waiting" className="FunctionBar Hide">
                <div id="address" className="AddressBar">
                  <p>Game Address:</p>
                  <p>{address}</p>
                </div>
                <button className="FullSizeForwardButton" onClick={() => this.toggleCloseGame()}><span>close this Game</span></button>
                <div id="waitstatusbar" className="RPSStatusBar">
                  <img id="waitpicture" className="Picture" alt="Loadingscreen" src="./loadingscreen.png"></img>
                  <div className="Message">
                    <p>{message}</p>
                  </div>
                </div>
              </div>
              <div id="checking" className="FunctionBar Hide">
                <div id="revealInfo" className="AddressBar">
                  <p>If your opponent does not reveal within three </p>
                  <p>minutes, you can manually claim the reward</p>
                </div>
                <button id="forceReward" className="FullSizeForwardButton" onClick={() => this.forceReward()}><span>manually claim reward</span></button>
                <div id="checkbar" className="RPSStatusBar">
                  <img className="Picture" alt="Loadingscreen" src="./loadingscreen.png"></img>
                  <div className="Message">
                    <p>{message}</p>
                  </div>
                </div>
                <button id="checkWinner" className="FullSizeForwardButton Hide" onClick={() => this.playRPS()}><span>check winner</span></button>
                <button id="forceRewardClaim" className="FullSizeForwardButton Hide" onClick={() => this.claimReward()}><span> claim your reward</span></button>
              </div>
              <div id="finishing" className="FunctionBar Hide">
                <button id="showResult" className="FullSizeForwardButton" onClick={() => this.showResult()}><span>show result</span></button>
                <div id="resultText" className="AddressBar FinalScreen">
                  <p>The game is finished</p>
                  <p>{result}</p>
                </div>
                <div id="resultScreen">
                  <span className="RPSFinished"><img id="myresult" className="RPSFinishImage" src="./rock.png" alt="Rock"></img></span>
                  <span className="RPSFinished Right" ><img id="opresult" className="RPSFinishImage" src="./paper.png" alt="Paper"></img></span>
                  <span className="FinishedSpan Footer">You</span>
                  <span className="FinishedSpan Right Footer">Opponent</span>
                  <button id="tieOrWin" className="FullSizeForwardButton Hide" onClick={() => this.claimLastReward()}><span> claim your reward</span></button>
                  <button id="playAnotherOne" className="FullSizeForwardButton Hide" onClick={() => this.refreshPage()}><span> play again</span></button>
                </div>
              </div>
              <div id="admin" className="FunctionBar Hide">
                <div className="AdminBar">
                  <p>Locked Funds: {lockedfunds} ETH</p>
                </div>
                <button className="FullSizeForwardButton" onClick={() => this.showBalance()}><span> check balance</span></button>
                <button className="FullSizeForwardButton" onClick={() => this.cashOut()}><span> cash out</span></button>
              </div>
            </div>
          </div>
        </div>
        <div className="OptionWindow">
          <div>
            <button className="OptionButton" onClick={() => this.refreshPage()}>R</button>
          </div>
          <p></p>
          <div>
            <button className="OptionButton" onClick={() => this.toggleAdmin()}>?</button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Functions declared within the App class
   */

  /**
   * CORE STACK
   */

  /**
   * Save wallet related errors to state
   * 
   * @param {raw string} walleterror 
   */
  logMetaMask = (walleterror) => {
    this.setState({ walleterror: String((walleterror || {}).metamask || walleterror) });
  }

  /**
   * Option Window Function: 
   * Manually refresh Page
   * from frontend
   */
  refreshPage = () => {
    window.location.reload();
  }

  /**
   * Loading the current balances of
   * Ethereum from the wallet
   * 
   * Asyncronus function, so information can be
   * resolved besides the regular program flow
   */
  updateBalance = async () => {
    const { web3 } = this.state;

    var accountaddress = web3.currentProvider.selectedAddress;
    this.setState({ address: accountaddress });
    const balance = await web3.eth.getBalance(accountaddress);
    this.setState({ balance: Number(web3.utils.fromWei(balance)).toFixed(5) });
  }

  /**
   * WINDOW CHANGES
   */

  /**
   * Option Window Function:
   * Hide all Windows
   */
  closeAll = () => {
    document.getElementById("starting").style.display = "none";
    document.getElementById("betting").style.display = "none";
    document.getElementById("loading").style.display = "none";
    document.getElementById("playing").style.display = "none";
    document.getElementById("revealing").style.display = "none";
    document.getElementById("checking").style.display = "none";
    document.getElementById("finishing").style.display = "none";
  }

  /**
   * Option Window Function:
   * Switch to the Bet Menu
   */
  toggleBet = () => {
    document.getElementById("starting").style.display = "none";
    document.getElementById("betting").style.display = "block";
  }

  /**
   * Option Window Function:
   * Switch to Start Menu
   */
  toggleStart = () => {
    document.getElementById("starting").style.display = "block";
    document.getElementById("betting").style.display = "none";
    document.getElementById("loading").style.display = "none";
    this.picturePulse(0);
  }

  /**
   * Option Window Function:
   * Switch to the Admin Menu
   */
  toggleAdmin = () => {
    this.closeAll();
    document.getElementById("admin").style.display = "block";
  }

  /**
   * Option Window Function:
   * Switch to the Loading Screen
   * 
   * @param {String, indicates past screen} String 
   */
  toggleLoadingscreen = (oldScreen) => {
    this.picturePulse(1);
    document.getElementById("loading").style.display = "block";
    document.getElementById(oldScreen).style.display = "none";
  }

  /**
   * Option Window Function:
   * Switch to the Waiting Screen
   */
  toggleWaitingScreen = async () => {
    const { web3 } = this.state;

    document.getElementById("waiting").style.display = "block";
    document.getElementById("loading").style.display = "none";

    this.setState({ message: "Send your Game Address to your opponent" });
    this.picturePulse(1);

    const operator = new web3.eth.Contract(OperatorABI, operatorAddress);

    await operator.events.publishRPS()
    .on("data", function(event){
      rpsAddress = event.returnValues.clone;
      document.getElementById("lspicture").className="Picture";
      document.getElementById("waitpicture").className="Picture";
      document.getElementById("revealpicture").className="Picture";    
      
      document.getElementById("playing").style.display = "block";
      document.getElementById("waiting").style.display = "none";
    });
  }

  /**
   * Option Window Function:
   * Switch to the Revealing Screen
   */
  toggleCheckingScreen = async () => {
    this.picturePulse(1);
    document.getElementById("checking").style.display = "block";
    document.getElementById("revealing").style.display = "none";
    document.getElementById("checkWinner").style.display = "none";
    document.getElementById("forceRewardClaim").style.display = "none";

    this.setState({ message: "Waiting for opponent´s reveal" });

  }

  /**
   * Option Window Function:
   * Switch to the Loading Screen
   */
  toggleLoadingscreen = () => {
    document.getElementById("loading").style.display = "block";
    document.getElementById("betting").style.display = "none";
  }

  /**
   * Option Window Function:
   * Switch to the Closing Window
   */
  toggleCloseGame = () => {
    this.setState({ message: "Currently closing the game..." });

    //send closing transaction
    this.toggleLoadingscreen("waiting");
  }

  /**
   * Option Window Function:
   * Switch to the Reveal Screen
   */
  toggleReveal = () => {
    document.getElementById("revealing").style.display = "block";
    document.getElementById("loading").style.display = "none";
    document.getElementById("revealstatusbar").style.display ="none";
  }

  /**
   * Option Window Function:
   * Switch to the Play Screen
   */
  togglePlayGame = () => {
    document.getElementById("playing").style.display = "block";
    document.getElementById("waiting").style.display = "none";
  }

  /**
   * Option Window Function:
   * Switch to the Finish Screen
   */
  toggleFinish = () => {
    document.getElementById("finishing").style.display = "block";
    document.getElementById("checking").style.display = "none";
    document.getElementById("playAnotherOne").style.display = "none";
  }

  /**
   * Option Window Function:
   * Switch to the Join Screen
   */
  toggleJoin = () => {
    document.getElementById("starting").style.display = "none";
    document.getElementById("joining").style.display = "block";
    document.getElementById("joinaddressButton").style.display = "none";
  }

  /**
   * BUTTON FUNCTIONS
   */

  /**
   * Button Press Function:
   * Admin cashes out locked funds
   */
  cashOut = async () => {
    const { web3 } = this.state;
    const operator = new web3.eth.Contract(OperatorABI, operatorAddress);

    await operator.methods.cashOut().send({
        from: web3.currentProvider.selectedAddress});
    }

  /**
   * Button Press Function:
   * Someone wants to look at the contracts balance
   */
  showBalance = async () => {
    const { web3 } = this.state;
      this.setState({ lockedfunds: Number(web3.utils.fromWei(await web3.eth.getBalance(operatorAddress), 'ether')).toFixed(5) });
  }

  /**
   * Button Press Function:
   * Play RPS with guestures and reveal winner
   */
  playRPS = async () => {
    document.getElementById("checkbar").style.display = "block";
    this.picturePulse(1)
    this.setState({ message: "Currently checking winner" });

    const { web3 } = this.state;
    const rps = new web3.eth.Contract(RPSABI, rpsAddress);
    
    await rps.events.WinnerSet()
    .on("data", function(event){
      var winner = event.returnValues.winner;
      if(winner === web3.currentProvider.selectedAddress){
        gameresult = "You´ve won!"
      }
      else if(winner === "0x0000000000000000000000000000000000000000"){
        gameresult = "There was a tie!"
      }
      else{
        gameresult = "You´ve lost !"
      }
      document.getElementById("lspicture").className="Picture";
      document.getElementById("waitpicture").className="Picture";
      document.getElementById("revealpicture").className="Picture";
      document.getElementById("checking").style.display = "none";
      document.getElementById("finishing").style.display = "block";
      document.getElementById("playAnotherOne").style.display = "none";
      document.getElementById("resultText").style.display = "none";
      document.getElementById("resultScreen").style.display = "none";
      document.getElementById("myresult").src = "./"+userGesture+".png";
      document.getElementById("opresult").src = "./"+opponentGuesture+".png";
    });
    
    await rps.methods.playRPS().send({
      from: web3.currentProvider.selectedAddress
    });


  }

  /**
   * Button Press Function:
   * Show the result within the final screen
   */
  showResult = () => {
    this.setState({ result: gameresult });
    document.getElementById("resultText").style.display = "block";
    document.getElementById("resultScreen").style.display = "block";

    if(this.state.result === "You´ve lost !"){
      document.getElementById("tieOrWin").style.display = "none";
    }
  }

  /**
   * Button Press Function:
   * Claim reward after game finished
   */
  claimReward = async () => {
    const { web3 } = this.state;
    const rps = new web3.eth.Contract(RPSABI, rpsAddress);

    await rps.methods.claimReward().send({
      from: web3.currentProvider.selectedAddress,
    });
  }

  /**
   * Button Press Function:
   * Claim reward if opponent does not answer
   */
  claimLastReward = async () => {
    document.getElementById("tieOrWin").style.display = "none";
    document.getElementById("playAnotherOne").style.display = "block";
    const { web3 } = this.state;
    const rps = new web3.eth.Contract(RPSABI, rpsAddress);

    await rps.methods.claimReward().send({
      from: web3.currentProvider.selectedAddress,
    });
  }

  /**
   * Button Press Function:
   * Player wants to join a game and the game
   * needs to check if it is valid
   */
  lookUp = async () => {
    var lookuperror = document.getElementById("lookUpError");
    var lookupmessage = document.getElementById("lookUpMessage");
    var input = document.getElementById("joinaddress").value;
    var isAddr = false;
    const { web3 } = this.state;

    try {
      isAddr = web3.utils.toChecksumAddress(input);
    } 
    // Not valid
    catch(e) { 
      this.setState({ message: "" });
      this.setState({ error: "This is an invalid address. Ask your opponent for his active address" });
      lookuperror.style.display = "block";
      lookupmessage.style.display = "none";
    }
    // No input
    if(input.toString().length === 0){
      this.setState({ message: "" });
      this.setState({ error: "Please input an address first, to check if you can join" });
      lookuperror.style.display = "block";
      lookupmessage.style.display = "none";
    }
    // Is address
    if(isAddr){
      var opbetamount;
      document.getElementById("joinaddress").disabled = true;
      const operator = new web3.eth.Contract(OperatorABI, operatorAddress);
      opbetamount = await operator.methods.betRegister(input).call();
      opponentAddress = input;
      this.setState({ error: "" });

      // Address is not active
      if(opbetamount === "0"){
        this.setState({ message: "This address is currently not playing with a bet." });
        lookuperror.style.display = "none";
        lookupmessage.style.display = "block";
      }
      // Game about 0.0005 ETH
      else if(opbetamount === web3.utils.toWei("500", "szabo")){
        opbetamount = "0.0005"
        this.setState({ betamount: "500" });
        this.setState({ message: "This address is currently playing with a bet of " + opbetamount + " ETH" });
        document.getElementById("lookupbutton").style.display = "none";
        document.getElementById("joinaddressButton").style.display = "block";
        lookuperror.style.display = "none";
        lookupmessage.style.display = "block";
      }
      // Game about 0.005ETH
      else if(opbetamount === web3.utils.toWei("5000", "szabo")){
        opbetamount = "0.005"
        this.setState({ betamount: "5000" });
        this.setState({ message: "This address is currently playing with a bet of " + opbetamount + " ETH" });
        document.getElementById("lookupbutton").style.display = "none";
        document.getElementById("joinaddressButton").style.display = "block";
        lookuperror.style.display = "none";
        lookupmessage.style.display = "block";
      }
      // Game about 0.05 ETH
      else if(opbetamount === web3.utils.toWei("50000", "szabo")){
        opbetamount = "0.05"
        this.setState({ betamount: "50000" });
        this.setState({ message: "This address is currently playing with a bet of " + opbetamount + " ETH" });
        document.getElementById("lookupbutton").style.display = "none";
        document.getElementById("joinaddressButton").style.display = "block";
        lookuperror.style.display = "none";
        lookupmessage.style.display = "block";
      }
    }
  }

  /**
   * Button Press Function:
   * Player joins active game
   */
  joinAddress = async () => {
    this.setState({ message: "Currently connecting to the game..." });
    document.getElementById("joining").style.display = "none";
    document.getElementById("loading").style.display = "block";

    const { web3 } = this.state;

    // Wait before first state amount, neccessary or it could crash
    await this.setState({ betamount: this.state.betamount });
    var balance = web3.eth.getBalance(this.state.address);
    var bet = web3.utils.toWei(this.state.betamount, "szabo");
    if(balance >= bet){
      const operator = new web3.eth.Contract(OperatorABI, operatorAddress);

      var prep = this.state.betamount;
      var fee = prep.substring(0, prep.length - 2);

      // Listen to the Contracts Event when Game is created
      await operator.events.publishRPS()
      .on("data", function(event){
        rpsAddress = event.returnValues.clone;
      });

      // Someone joined your address
      await operator.methods.joinAddress(opponentAddress).send({
      from: web3.currentProvider.selectedAddress,
      value: web3.utils.toWei(fee, "szabo")});

      this.picturePulse(0);
      document.getElementById("loading").style.display = "none";
      this.togglePlayGame();
    }
    // Not enough funds to play
    else{
      await this.setState({ message: "You dont have enough funds to participate in a rock paper scissor game."});
    }
  }

  /**
   * Button Press Function:
   * Player chooses bet amount
   * 
   * All state changes strictly need awaits
   * so act outside of the async function
   */
  chooseBet = async (amount) => {
    const { web3 } = this.state;

    // Wait before first state amount, neccessary or it could crash
    await this.setState({ betamount: amount });
    var balance = web3.eth.getBalance(this.state.address);
    var bet = web3.utils.toWei(amount, "szabo");
    if(balance >= bet){

      this.toggleLoadingscreen("betting");
      this.picturePulse(1);
      await this.setState({ message: "Currently deploying your bet..." });
      
      const operator = new web3.eth.Contract(OperatorABI, operatorAddress);
      
      var fee = amount.substring(0, amount.length - 2);
      await operator.methods.placeBet(this.state.betamount).send({
        from: web3.currentProvider.selectedAddress,
        value: web3.utils.toWei((fee), "szabo")});
      
      this.picturePulse(0);
      this.toggleWaitingScreen();
    }
    // Not enough funds to play
    else{
      await this.setState({ error: "You dont have enough funds to participate in a rock paper scissor game."});
      document.getElementById("betError").style.display = "block";
    }
  }

  /**
   * Button Press Function:
   * Player forces reward after no response
   * from opponent after three minutes
   */
  forceReward = async () =>{
    this.setState({ message: "Wait three minutes until you try" });

    const { web3 } = this.state;
    const rps = new web3.eth.Contract(RPSABI, rpsAddress);

    // hear if you got claimed your reward
    await rps.events.WinnerSet()
      .on("data", function(event){
    });

    // force the reward
    await rps.methods.forceReward().send({
      from: web3.currentProvider.selectedAddress})
    

    this.setState({ message: "Claim successful" });
    document.getElementById("forceReward").style.display = "none";
    document.getElementById("checkWinner").style.display = "none";
    document.getElementById("forceRewardClaim").style.display = "block";
  }

  /**
   * Button Press Function:
   * Player publishes his choice with secret
   */
  publish = () =>{    

    var input = document.getElementById("password").value;
    var error = document.getElementById("error");

    // password is not a number
    if(isNaN(input)){
      this.setState({ error: "You can only type in a sequence of numbers including characters from 0 to 9" });
      error.style.display = "block";
    }
    // password is clear
    else if(input.toString().length === 0){
      this.setState({ error: "You need to enter a password before you can submit your choice" });
      error.style.display = "block";
    }
    // forgot to pick option
    else if(option === ""){
      this.setState({ error: "You forgot to choose either rock, paper or scissor. Which one you choose?" });
      error.style.display = "block";
    }
    // all set
    else{
      error.style.display = "none";
      this.setState({ message: "Currently submitting your choice" });
      password = input;
      this.picturePulse(1);
      this.sendRPSInput();
    }
  }

  /** 
   * Async function handling the transaction
   * of the users guesture and password
  */
  sendRPSInput = async () =>{
      const { web3 } = this.state;
      const rps = new web3.eth.Contract(RPSABI, rpsAddress);

      document.getElementById("playing").style.display = "none";
      document.getElementById("loading").style.display = "block";
      
      // waiting for the opponent
      await rps.events.BothHashesReceived()
            .on("data", function(event){
              document.getElementById("revealing").style.display = "block";
              document.getElementById("loading").style.display = "none";
              document.getElementById("revealstatusbar").style.display ="none";
              document.getElementById("revealerror").style.display = "none";
              document.getElementById("lspicture").className="Picture";
              document.getElementById("waitpicture").className="Picture";
              document.getElementById("revealpicture").className="Picture";
              
      });

      // creating the users hash
      await rps.methods.createHash(option, password).send({
        from: web3.currentProvider.selectedAddress,
        value: web3.utils.toWei(this.state.betamount, "szabo")});
      
      document.getElementById("playing").style.display = "none";
      document.getElementById("loading").style.display = "block";
      this.setState({ message: "Waiting for opponent´s move" });
        

  }

  /**
   * Button Press Function:
   * Player reveals his gesture and password
   */
  reveal = async () =>{
    document.getElementById("revealerror").style.display = "none";
    var revealstatusbar = document.getElementById("revealstatusbar");
    revealstatusbar.style.display = "block";
      
    this.picturePulse(1);

    this.setState({ message: "revealing your choice" });
      
    const { web3 } = this.state;
    const rps = new web3.eth.Contract(RPSABI, rpsAddress);
    
    // Both players submitted their guestures
    await rps.events.BothGesturesRevealed()
    .on("data", function(event){
      userGesture = event.returnValues.userString;
      opponentGuesture = event.returnValues.opponentString;
      document.getElementById("forceReward").style.display = "none";
      document.getElementById("revealInfo").style.display = "none";
      document.getElementById("checkbar").style.display = "none";
      document.getElementById("waitpicture").style.display = "none";
      document.getElementById("checkWinner").style.display = "block";
      document.getElementById("forceRewardClaim").style.display = "none";
      document.getElementById("lspicture").className="Picture";
      document.getElementById("waitpicture").className="Picture";
      document.getElementById("revealpicture").className="Picture";
    });

    // revealing transaction
    await rps.methods.revealHash(option, password).send({
      from: web3.currentProvider.selectedAddress
    });

    revealstatusbar.style.display = "none";
    this.picturePulse(0);
    this.toggleCheckingScreen();
    }

  /**
   * INNER FUNCTIONS
   */

  /**
   * Inner Function:
   * Animates the RPS gestures within the loading screen
   * to indicate there is a pending transaction or
   * process that involves waiting for an answer
   * 
   * @param {boolean, indicates activity} bool 
   */
  picturePulse = (bool) => {
    // Enable animation
    if(bool === 1){
      document.getElementById("lspicture").className="Picture PicturePulse";
      document.getElementById("waitpicture").className="Picture PicturePulse";
      document.getElementById("revealpicture").className="Picture PicturePulse";
    }
    else{
      document.getElementById("lspicture").className="Picture";
      document.getElementById("waitpicture").className="Picture";
      document.getElementById("revealpicture").className="Picture";
    }
  }

  /**
   * Function to swap the users gesture choice
   * @param {String gesture} thisoption 
   */
  rps = (thisoption) => {
    option = thisoption;
    document.getElementById("rock").className="ButtonUnselected";
    document.getElementById("paper").className="ButtonUnselected";
    document.getElementById("scissor").className="ButtonUnselected";

    document.getElementById(thisoption).className="ButtonSelected";
  }
}
export default App;