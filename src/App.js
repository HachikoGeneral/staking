import './App.css';
import {ethers} from 'ethers';
import { Component } from 'react';
import Staking from './contracts/build/Staking.json'

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      provider: null,
      account: null,
      contract: null,
      myBalance:0,
      stakedBalance:0,
      stakeAmount:0,
      myStakedAmount:0,
    }
  }

  async componentDidMount() {
    await this.loadWallet();
    await this.setContract();
  };

  loadWallet = async () => {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what MetaMask injects as window.ethereum into each page
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // // MetaMask requires requesting permission to connect users accounts
    await provider.send("eth_requestAccounts", []);
    const accounts = await provider.listAccounts();
    const account = accounts[0];
    const balance = await provider.getBalance(account);
    const balanceInEth = ethers.utils.formatEther(balance);
    
    this.setState({provider: provider, account: account, myBalance: balanceInEth});
  }

  setContract = async() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    //const networkId = await ethers.net.getId();
    const { chainId } = await provider.getNetwork();
    
    const networkData = Staking.networks[5777];
    
    if(networkData) {
      const abi = Staking.abi;
      const contractAddress = networkData.address;
      console.log('abi',abi);
      const signer = provider.getSigner();
      const contract = await new ethers.Contract(contractAddress, abi, signer);
      
      this.setState({contract:contract});
    }
  }

  getStakedBalance = async () => {
    const contract = this.state.contract;
    const stakedBalance = await contract.getStakedBalance();
    const balanceInEth = ethers.utils.formatEther(stakedBalance);

    this.setState({stakedBalance:balanceInEth});
  }

  stake = async() => {
    const contract = this.state.contract;
    await contract.stack({from:this.state.account,value:ethers.utils.parseEther(this.state.stakeAmount)});
  }

  withdraw = async() => {
    const contract = this.state.contract;
    await contract.withdraw({from:this.state.account});
  }

  myStakedAmount = async() => {
    const contract = this.state.contract;
    const amount = await contract.myStakedAmount({from:this.state.account});
    const balanceInEth = ethers.utils.formatEther(amount);
    this.setState({myStakedAmount:balanceInEth});
  }

  handleChange = event => {
    this.setState({stakeAmount:event.target.value});
  };

  render() {
    return (
      <div className="App">
          Hello {this.state.account}
          <div>
            <b>Balance:</b> {this.state.myBalance}
          </div>
          <div>
            <b>My Staked Amout:</b> {this.state.myStakedAmount} <button onClick={this.myStakedAmount}>Refresh</button>
          </div>
          <div>
            <b>Total Staked Amount: </b> {this.state.stakedBalance} <button onClick={this.getStakedBalance}>Refresh</button>
          </div>
          <div>
          <div>
            <input type="text" id="amount" name="amount" onChange={this.handleChange} value={this.state.stakeAmount} autoComplete="off"></input>
            <button onClick={this.stake}>Stake</button>
          </div>
          <button onClick={this.withdraw}>Withdraw</button>
          </div>
      </div>
    );
  };
}
export default App;