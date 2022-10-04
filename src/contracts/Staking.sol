// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Staking {

    mapping(address=>uint) balances;
    mapping(address=>uint) stackingTime;

    uint stakingDeadline = block.timestamp +  1 minutes;
    uint withdrawalDeadline = block.timestamp +  2 minutes;
    uint constant rewardRatePerSecond = 0.0000001 ether;

    // Events
    event Stake(address indexed sender, uint256 amount);
    event Withdrawal(address, uint);


    function stack() public payable {
        uint stakingTimeLeft = stakingDeadline - block.timestamp;
        require(stakingTimeLeft>0, "Staking deadline has been reached");
        require(msg.value>0, "Amount should be > 0");
        uint stackedAmount = balances[msg.sender];
                
        require(stackedAmount==0, "Can not stack 2nd time");
        balances[msg.sender] = msg.value;

        //we need to capture time to calculate Interest
        stackingTime[msg.sender] = block.timestamp;

        emit Stake(msg.sender, msg.value);
    }

    function withdraw() public payable {
         //can not Withdrawal until stacking time over
        uint stakingTimeLeft = block.timestamp - stakingDeadline;
        require(stakingTimeLeft>0, "Staking deadline has been reached");

        //can not Withdrawal after withdrawalDealline
        uint withdrawalTimeLeft = withdrawalDeadline - block.timestamp;
        require(withdrawalTimeLeft>0, "Withdrawal deadline has been reached");
        
        //get staked amount and check it should be > 0
        uint stackedAmount = balances[msg.sender];
        require(stackedAmount>0, "you have no balance to withdraw");
        
        // calculate Interest earn during stking time.
        uint amountWithInterest = stackedAmount + ((block.timestamp - stackingTime[msg.sender]) * rewardRatePerSecond);
        balances[msg.sender] = 0;

        (bool sent,) = msg.sender.call{value: amountWithInterest}("");

       
        require(sent, "RIP; withdrawal failed :( ");
        emit Withdrawal(msg.sender, amountWithInterest);
    }

    function getStakedBalance() public view returns (uint) {
        return address(this).balance;
    }

    function myStakedAmount() public view returns (uint) {
        return balances[msg.sender];
    }

}