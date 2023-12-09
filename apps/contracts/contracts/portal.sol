// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract portal {
    address[] public owners;
    mapping(address => bool) public isOwner;
    address public receiverAddress;
    uint256 public goalAmount = 0;
    uint256 public deadline;
    uint256 public platformFee;
    address public platformAddress = 0xdD870fA1b7C4700F2BD7f44238821C26f7392148;
    mapping(address => uint256) public patrons;
    uint256 totalFunds;
    uint256 totalRewards;
    bool allowDonationAboveGoalAmount;
    bool isActive;
    bool one;
    bool two;
    bool three;
    uint256 public currentTimestamp = block.timestamp;
    uint256 deadline1;

    error NotEnoughFunds();
    error FundingToContractEnded();
    error oneError();
    error twoError();
    error threeError();

    event Values(
        address receiverAddress,
        uint256 totalFunds,
        uint256 totalRewards,
        bool goalMet,
        bool allowDonationsAboveGoalAmount,
        uint256 deadline,
        uint256 goalAmount,
        bool deadlineAvailable,
        bool goalAmountAvailable
    );

    constructor(
        address[] memory _owners,
        uint256 _goal,
        uint256 _deadline,
        bool _allowDonationAboveGoalAmount,
        uint256 _platformFee
    ) {
        for (uint256 i = 0; i < _owners.length; i++) {
            owners.push(_owners[i]);
            isOwner[_owners[i]] = true;
        }
        receiverAddress = owners[0];
        platformFee = _platformFee;

        goalAmount = _goal;
        deadline = block.timestamp + _deadline * 86400;
        deadline1 = _deadline;
        allowDonationAboveGoalAmount = _allowDonationAboveGoalAmount;
        isActive = true;
        one = true;
        two = true;
        three = true;
    }

    function addFunds() public payable returns (uint256, uint256, uint256, bool, bool, bool)
    {
        if (msg.value == 0) revert NotEnoughFunds();
        if (!isActive) revert FundingToContractEnded();
        if (!one) revert oneError();

        if (!two) revert twoError();

        if (!three) revert threeError();

        patrons[msg.sender] += msg.value;
        totalFunds += msg.value;
        totalRewards += (msg.value * (100 - platformFee)) / 100;

        bool goalAmountAvailable = goalAmount > 0;
        bool deadlineAvailable = deadline1 > 0;
        bool metDeadline = deadlineAvailable && deadline <= block.timestamp;
        bool metGoal = totalRewards >= goalAmount;

        if (!goalAmountAvailable && !deadlineAvailable) {
            payable(receiverAddress).transfer(
                (msg.value * (100 - platformFee)) / 100
            );
            payable(platformAddress).transfer(
                (msg.value * (platformFee)) / 100
            );
        }

        if (goalAmountAvailable && deadlineAvailable) {
            if (metDeadline ||(!allowDonationAboveGoalAmount && totalRewards >= goalAmount)) {
                payable(receiverAddress).transfer(totalRewards);
                payable(platformAddress).transfer(totalFunds - totalRewards);
                one = false;
            }
        }
        if (goalAmountAvailable && !deadlineAvailable) {
            if (metGoal) {
                payable(receiverAddress).transfer(totalRewards);
                payable(platformAddress).transfer(totalFunds - totalRewards);
                two = false;
            }
        }
        if (!goalAmountAvailable && deadlineAvailable) {
            if (metDeadline) {
                payable(receiverAddress).transfer(totalRewards);
                payable(platformAddress).transfer(totalFunds - totalRewards);
                three = false;
            }
        }

        emit Values(
            receiverAddress, 
            totalFunds, 
            totalRewards, 
            metGoal, 
            allowDonationAboveGoalAmount, 
            deadline, 
            goalAmount, 
            deadlineAvailable, 
            goalAmountAvailable
        );
        return (
            address(this).balance,
            goalAmount,
            totalRewards,
            totalRewards >= goalAmount,
            deadlineAvailable,
            goalAmountAvailable
        );
    }

    receive() external payable {
        addFunds();
    }
}
