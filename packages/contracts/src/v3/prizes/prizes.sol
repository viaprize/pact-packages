//SPDX-License-Identifier:MIT
pragma solidity ^0.8.1;

import "./helperLibraries/SubmissionLibrary.sol";
import "./logicContracts/SubmissionAVLTree.sol";
import "./helperLibraries/hashLibrary.sol";
import "./helperLibraries/errorEventsLibrary.sol";
import "../../helperContracts/safemath.sol";
import "../../helperContracts/ierc20_permit.sol";                                         
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "../../helperContracts/ierc20_weth.sol";
import "../../helperContracts/nonReentrant.sol";

contract PrizeV2 is ReentrancyGuard {

    /// @notice This variable tracks the total amount of funds raised.
    uint256 public totalFunds;
    /// @notice This variable tracks the total amount of rewards available after deducting visionary and platform fees.
    uint256 public totalRewards;
    /// @notice This variable represents the time when the voting period ends.
    uint256 public votingTime;
    /// @notice This variable represents the time when the submission period ends.
    uint256 public submissionTime;
    /// @notice This variable tracks the total votes gained by all submissions.
    uint256 public totalVotes;
    /// @notice This variable is a nonce tracker used for creating unique vote hashes.
    uint256 public nonce;
    /// @notice This variable represents the time when the dispute period ends.
    uint256 public disputePeriod;
    /// @notice This variable represents the time when the disputeSubmissionEnds.
    uint256 public disputeSubmission;
    /// @notice This variable represents the fee percentage of total funds paid to the visionary who proposed the idea.
    uint8 public visionaryFee;
    /// @notice This variable represents the fee percentage of total funds paid to the platform as a fee.
    uint8 public platformFee;
    /// @notice This constant represents the version of the contract.
    uint8 public constant VERSION = 202;
    /// @notice This variable represents the max slippage fee percentage for the minimum output in swaps.
    uint8 public maximumSlipageFeePercentage = 2;

    /// @notice This boolean indicates whether rewards have been distributed at the end of the voting period.
    bool public distributed = false;
    /// @notice This boolean indicates whether refunds have been issued.
    bool public refunded = false;
    /// @notice This boolean indicates whether the voting period is active.
    bool public votingPeriod = false;
    /// @notice This boolean indicates whether the submission period is active.
    bool public submissionPeriod = false;
    /// @notice This boolean indicates whether the campaign is active.
    bool public isActive = false;

    /// @notice This address represents the visionary who proposed the prize.
    address public visionary;
    /// @notice An array of addresses representing the crypto funders.
    address[] private cryptoFunders;
    /// @notice An array of addresses representing the fiat funders.
    address[] private fiatFunders;
    /// @notice An array of addresses representing the platform admins.
    address[] private platformAdmins;
    /// @notice An array of addresses representing funders who have requested refunds.
    address[] private refundRequestedFunders;

    /// @notice A mapping that tracks whether an address is the visionary.
    mapping(address => bool) public isVisionary;
    /// @notice A mapping that tracks whether an address is a crypto funder.
    mapping(address => bool) public isCryptoFunder;
    /// @notice A mapping that tracks whether an address is a fiat funder.
    mapping(address => bool) public isFiatFunder;
    /// @notice A mapping that tracks whether an address has requested a refund.
    mapping(address => bool) public isRefundRequestedAddress;
    /// @notice A mapping that tracks whether an address is a contestant.
    mapping(address => bool) public isContestant;
    /// @notice A mapping that tracks whether an address is a platform admin.
    mapping(address => bool) public isPlatformAdmin;
    /// @notice A mapping of funder addresses to the amount of USD they have donated (crypto).
    mapping(address => uint256) public cryptoFunderAmount;
    /// @notice A mapping of funder addresses to the amount of USD they have donated (fiat).
    mapping(address => uint256) public fiatFunderAmount;
    /// @notice A mapping of funder addresses to their individual fiat contribution percentage.
    mapping(address => uint256) public individualFiatPercentage;
    /// @notice A mapping of funder addresses to their individual crypto contribution percentage.
    mapping(address => uint256) public individualCryptoPercentage;
    /// @notice A mapping that tracks the total amount contributed by each funder includes (crypto and fiat).
    mapping(address => uint256) public totalFunderAmount;
    /// @notice A nested mapping that tracks each funder's votes on each submission.
    mapping(address => mapping(bytes32 => uint256)) public funderVotes;

    /// @notice This directive allows the use of the SafeMath, VoteLibrary, and ErrorAndEventsLibrary libraries.
    using SafeMath for uint256;
    using VoteLibrary for *;
    using ErrorAndEventsLibrary for *;

    /// @notice Initializes the interfaces for WETH, USDC, and USDC.e tokens.
    IWETH private _weth;
    IERC20Permit private immutable _usdc;
    IERC20Permit private immutable _usdcBridged;

    /// @notice Initializes the SwapRouter interface.
    ISwapRouter private  immutable swapRouter;
    /// @notice Initializes the Uniswap V3 pool interface for bridged USDC and USDC.e.
    IUniswapV3Pool private  immutable bridgedUsdcPool;
    /// @notice Initializes the Uniswap V3 pool interface for ETH and USDC.
    IUniswapV3Pool private  immutable ethUsdcPool;

    /// @notice Initializes the Chainlink or Oracle price aggregator interface for ETH prices.
    AggregatorV3Interface private  immutable ethPriceAggregator;

    /// @notice This variable represents the platform's address.
    address public immutable platformAddress = 0x1f00DD750aD3A6463F174eD7d63ebE1a7a930d0c;

    /// @notice This variable represents the contract instance of the SubmissionAVLTree.
    SubmissionAVLTree private _submissionTree;

    ///@notice creating a hash to treat refund as a submission
    bytes32 public constant REFUND_SUBMISSION_HASH = keccak256(abi.encodePacked("REFUND"));

    /// @notice Constructor function to initialize the campaign contract.
    /// @param _visionary The address of the visionary who proposes the prize.
    /// @param _platformAdmins An array of addresses for platform admins.
    /// @param _platFormFee The fee percentage of total funds allocated to the platform.
    /// @param _visionaryFee The fee percentage of total funds allocated to the visionary.
    /// @param _usdcAddress The address of the USDC token contract.
    /// @param _usdcBridgedAddress The address of the bridged USDC (USDC.e) token contract.
    /// @param _swapRouter The address of the Uniswap V3 SwapRouter contract.
    /// @param _usdcToUsdcePool The address of the Uniswap V3 pool for USDC to USDC.e swaps.
    /// @param _usdcToEthPool The address of the Uniswap V3 pool for USDC to ETH swaps.
    /// @param _ethPriceAggregator The address of the Chainlink price aggregator for ETH.
    /// @param _wethToken The address of the WETH token contract.
    constructor(address _visionary, address[] memory _platformAdmins, uint8 _platFormFee, uint8 _visionaryFee, address _usdcAddress, address _usdcBridgedAddress , address _swapRouter ,address _usdcToUsdcePool,address _usdcToEthPool,address _ethPriceAggregator,address _wethToken) {

        visionary = _visionary;
        isVisionary[visionary] = true;
        for (uint i = 0; i < _platformAdmins.length; i++) {
            platformAdmins.push(_platformAdmins[i]);
            isPlatformAdmin[_platformAdmins[i]] = true;
        }
        _submissionTree = SubmissionAVLTree(SubmissionLibrary.deploySubmission(address(this)));
        visionaryFee = _visionaryFee;
        platformFee = _platFormFee;
        _usdc = IERC20Permit(_usdcAddress);
        _usdcBridged = IERC20Permit(_usdcBridgedAddress);
        isActive = true;
        swapRouter = ISwapRouter(_swapRouter);
        bridgedUsdcPool = IUniswapV3Pool(_usdcToUsdcePool);
        ethUsdcPool = IUniswapV3Pool(_usdcToEthPool);
        ethPriceAggregator = AggregatorV3Interface(_ethPriceAggregator);
        _weth = IWETH(_wethToken);
        _submissionTree.addSubmission(platformAdmins[0], REFUND_SUBMISSION_HASH, "REFUND");
        
        emit ErrorAndEventsLibrary.CampaignCreated(visionary, address(this));
    }

    /// @notice Checks if the campaign is active. Reverts with NotActive error if not.
    function _onlyActive() private view {
        if (!isActive) revert ErrorAndEventsLibrary.NotActive();
    }
    /// @notice Modifier to ensure the function is only executed if the campaign is active.
    modifier onlyActive() {
        _onlyActive();
        _;
    }

    /// @notice Checks if the caller is a platform admin. Reverts with NP error if not.
    function _onlyPlatformAdmin() private view {
        if (!isPlatformAdmin[msg.sender]) revert ErrorAndEventsLibrary.NP();
    }
    /// @notice Modifier to ensure the function is only executed by platform admins.
    modifier onlyPlatformAdmin() {
        _onlyPlatformAdmin();
        _;
    }

    /// @notice Checks if the caller is either a platform admin or the visionary. Reverts with NPP error if not.
    function _onlyPlatformAdminOrVisionary() private view {
        if (!(isPlatformAdmin[msg.sender] || isVisionary[msg.sender])) revert ErrorAndEventsLibrary.NPP();
    }
    /// @notice Modifier to ensure the function is only executed by platform admins or the visionary.
    modifier onlyPlatformAdminOrVisionary() {
        _onlyPlatformAdminOrVisionary();
        _;
    }

    /// @notice Checks if the dispute period is currently active. Reverts with DPNA error if not.
    function _disputePeriodActive() private view {
        if (disputePeriod < block.timestamp) revert ErrorAndEventsLibrary.DPNA();
    }
    /// @notice Modifier to ensure the function is only executed during the active dispute period.
    modifier disputePeriodActive() {
        _disputePeriodActive();
        _;
    }

    /// @notice Starts the submission period by setting the submission time and enabling the submission period flag.
    /// @param _submissionTime The duration (in minutes) for which the submission period will be active.
    function startSubmissionPeriod(uint256 _submissionTime) public  onlyPlatformAdminOrVisionary onlyActive {
        submissionTime = block.timestamp + _submissionTime * 1 minutes;
        submissionPeriod = true;
        emit ErrorAndEventsLibrary.SubmissionStarted(block.timestamp, submissionTime);
    }

    

    /// @notice Allows platform admins to change the submission period duration, provided the voting period is not active and the submission period is active.
    /// @param _submissionTime The new duration (in minutes) for the submission period.
    function changeSubmissionPeriod(uint256 _submissionTime) public onlyPlatformAdmin onlyActive {
        if(votingPeriod) revert ErrorAndEventsLibrary.VotingPeriodActive();
        if(!submissionPeriod) revert ErrorAndEventsLibrary.SubmissionPeriodNotActive();
        submissionTime = block.timestamp + _submissionTime * 1 minutes;
        emit ErrorAndEventsLibrary.SubmissionPeriodChanged(block.timestamp, _submissionTime, submissionTime);
    }

    /// @notice Ends the submission period and checks if a refund or reward distribution is necessary.
    /// If only one submission exists(because by default we have refund as a submission), refunds the funds and ends the campaign.
    function endSubmissionPeriod() public onlyPlatformAdmin onlyActive{
        if(submissionTime == 0) revert ErrorAndEventsLibrary.SubmissionPeriodNotActive();
        SubmissionAVLTree.SubmissionInfo[] memory allSubmissions = getAllSubmissions();
        if(allSubmissions.length == 1) {
            submissionPeriod = false;
            submissionTime = 0;
            refundLogic();
            refunded = true;
            distributed = true;
            isActive = false;
        } else {
            submissionPeriod = false;
            submissionTime = 0;
        }
        emit ErrorAndEventsLibrary.SubmissionEnded(block.timestamp);
    }

    /// @notice Starts the voting period after the submission period has ended.
    /// @param _votingTime The duration (in minutes) for which the voting period will be active.
    function startVotingPeriod(uint256 _votingTime) public  onlyPlatformAdminOrVisionary onlyActive {
        if(block.timestamp < submissionTime) revert ErrorAndEventsLibrary.SubmissionPeriodActive();
        votingTime = block.timestamp + _votingTime * 1  minutes;
        votingPeriod = true;
        emit ErrorAndEventsLibrary.VotingStarted(block.timestamp, votingTime);
    }
    /// @notice Allows platform admins to change the voting period duration, provided the voting period is active and rewards haven't been distributed.
    /// @param _votingTime The new duration (in minutes) for the voting period.
    function changeVotingPeriod(uint256 _votingTime) public onlyPlatformAdmin onlyActive {
        if(!votingPeriod) revert ErrorAndEventsLibrary.VotingPeriodNotActive();
        if(distributed == true) revert ErrorAndEventsLibrary.RewardsAlreadyDistributed();
        votingTime = block.timestamp + _votingTime * 1 minutes;
        emit ErrorAndEventsLibrary.VotingPeriodChanged(block.timestamp, _votingTime, votingTime);
    }

    /// @notice Ends the voting period and starts the dispute period.
    /// The dispute period lasts for 2 days.
    function endVotingPeriod() public onlyPlatformAdmin onlyActive {
        if(votingTime == 0) revert ErrorAndEventsLibrary.VotingPeriodNotActive();
        votingTime = 0;
        votingPeriod = false;
        disputePeriod = block.timestamp + 2 days;
        emit ErrorAndEventsLibrary.VotingEnded(block.timestamp);
        if(totalVotes == 0) {
            emit ErrorAndEventsLibrary.DisputeRaised(REFUND_SUBMISSION_HASH, platformAdmins[0]);
        }
    }

    /// @notice Allows a contestant to raise a dispute, if they not satisfied with votes, during the dispute period.
    /// @param _submissionHash The hash of the submission being disputed.
    /// @param v The `v, s, r` value of the signature
    function raiseDispute(bytes32 _submissionHash, uint8 v, bytes32 s, bytes32 r) public onlyActive disputePeriodActive {
        bytes32 signedMessageHash = VoteLibrary.DISPUTE_HASH(address(this), nonce+=1, _submissionHash);
        SubmissionAVLTree.SubmissionInfo memory submission = _submissionTree.getSubmission(_submissionHash);
        address sender =  ecrecover(signedMessageHash, v, r, s);
        if(sender != submission.contestant) revert ErrorAndEventsLibrary.NAC(); //NAS - Not a Submitter
        emit ErrorAndEventsLibrary.DisputeRaised(_submissionHash, sender);
    }

    /// @notice Ends the dispute period and distributes any unused votes and rewards.
    function endDispute() public onlyPlatformAdmin onlyActive {
        _distributeUnusedVotes();
        _distributeRewards();
        isActive = false;
        emit ErrorAndEventsLibrary.DisputeEnded(block.timestamp);
    }

    /// @notice Internal logic to distribute rewards.
    /// @param reward The total reward amount to be distributed.
    function _distributeRewardsLogic(uint256 reward) private {
        for(uint256 j=0; j<refundRequestedFunders.length; j++) {
            uint256 reward_amount = _submissionTree.submissionFunderBalances(REFUND_SUBMISSION_HASH,refundRequestedFunders[j]);
            reward -= reward_amount;
            if(reward_amount > 0) {
                if (isFiatFunder[refundRequestedFunders[j]]) {
                    uint256 fiatToSend = reward_amount;
                    if (isCryptoFunder[refundRequestedFunders[j]]) {
                        fiatToSend = (reward_amount.mul(individualFiatPercentage[refundRequestedFunders[j]])).div(100);
                        uint256 cryptoToSend = reward_amount.sub(fiatToSend);
                        emit ErrorAndEventsLibrary.FunderRefund(refundRequestedFunders[j], fiatToSend, false);
                        _usdc.transfer(refundRequestedFunders[j], cryptoToSend);
                    }
                    _usdc.transfer(platformAddress, fiatToSend);
                    emit ErrorAndEventsLibrary.FunderRefund(refundRequestedFunders[j], fiatToSend, true);
                } else {
                    _usdc.transfer(refundRequestedFunders[j], reward_amount);
                    emit ErrorAndEventsLibrary.FunderRefund(refundRequestedFunders[j], reward_amount, true);
                }
            }
        }
    }

    /// @notice Distributes the rewards based on individual votes.
    /// @dev This function checks whether rewards have already been distributed and handles the refund logic.
    function _distributeRewards() private {
        if(distributed == true) revert ErrorAndEventsLibrary.RewardsAlreadyDistributed();
        SubmissionAVLTree.SubmissionInfo[] memory allSubmissions = getAllSubmissions();
        uint256 usdcPlatformReward;
        uint256 usdcProposerReward;
        if(allSubmissions.length > 0 && totalVotes > 0 ) {
            for (uint256 i = 0; i < allSubmissions.length;) {
                if(allSubmissions[i].funded && allSubmissions[i].usdcVotes > 0) {
                    uint256 reward = allSubmissions[i].usdcVotes;
                    if(allSubmissions[i].submissionHash == REFUND_SUBMISSION_HASH && reward > 0) {
                        _distributeRewardsLogic(reward);
                    } else {
                        allSubmissions[i].usdcVotes = 0;
                        _usdc.transfer(allSubmissions[i].contestant, reward);
                    }
                }
                unchecked { ++i; }
            }
            totalRewards = 0;
            if(totalFunds > 0) {
                usdcPlatformReward = (totalFunds * platformFee) / 100;
                usdcProposerReward = (totalFunds * visionaryFee) / 100;
                totalFunds = totalFunds.sub(usdcPlatformReward.add(usdcProposerReward));
                _usdc.transfer(platformAddress, usdcPlatformReward);
                _usdc.transfer(visionary, usdcProposerReward);
            }
            distributed = true;
        }
        if(totalVotes == 0) {
            refundLogic();
            distributed = true;
        }
    }

    /// @notice Adds a submission to the platform.
    /// @param contestant is the address of the contestant submitting the entry.
    /// @param submissionText is the content of the submission.
    /// @return submissionHash is the hash of the submission created from the contestant's address and submission text.
    function addSubmission(address contestant, string memory submissionText) public onlyActive onlyPlatformAdmin nonReentrant returns(bytes32) {
        if (block.timestamp > submissionTime) revert ErrorAndEventsLibrary.SubmissionPeriodNotActive();
        if(isContestant[contestant]) revert ErrorAndEventsLibrary.CAE(); // CAE -> Contestant already Exists
        bytes32 submissionHash = keccak256(abi.encodePacked(contestant, submissionText));
        isContestant[contestant] = true;
        _submissionTree.addSubmission(contestant, submissionHash, submissionText);
        emit ErrorAndEventsLibrary.SubmissionCreated(contestant, submissionHash);
        return submissionHash;
    }

    /// @notice internal voting logic for a submission, called by vote function
    /// @param _amount The amount of funds being used to vote.
    /// @param _submissionHash The hash of the submission being voted on.
    /// @param sender The address of the funder voting.
    function _voteLogic(uint256 _amount, bytes32 _submissionHash, address sender) private {
        if(cryptoFunderAmount[sender] > 0 && fiatFunderAmount[sender] > 0){
            uint256 cryptoAmountToVote = (_amount.mul(individualCryptoPercentage[sender])).div(100);
            uint256 fiatAmountToVote = (_amount.mul(individualFiatPercentage[sender])).div(100);
            if(_amount != (cryptoAmountToVote + fiatAmountToVote)) revert ErrorAndEventsLibrary.VMPPEIL(); // VM,PPEIL -> votes mismatch, probably precise error in logic
            cryptoFunderAmount[sender] = cryptoFunderAmount[sender].sub(cryptoAmountToVote);
            fiatFunderAmount[sender] = fiatFunderAmount[sender].sub(fiatAmountToVote);
            totalFunderAmount[sender] = totalFunderAmount[sender].sub(cryptoAmountToVote + fiatAmountToVote);
            cryptoAmountToVote = 0;
            fiatAmountToVote = 0;
        } else if(cryptoFunderAmount[sender] > 0) {
            uint256 cryptoAmountToVote = (_amount.mul(individualCryptoPercentage[sender])).div(100);
            if(_amount != cryptoAmountToVote) revert ErrorAndEventsLibrary.VMPPEIL(); // VM,PPEIL -> votes mismatch, probably precise error in logic
            cryptoFunderAmount[sender] = cryptoFunderAmount[sender].sub(cryptoAmountToVote);
            totalFunderAmount[sender] = totalFunderAmount[sender].sub(cryptoAmountToVote);
            cryptoAmountToVote = 0;
        } else if(fiatFunderAmount[sender] > 0) {
            uint256 fiatAmountToVote = (_amount.mul(individualFiatPercentage[sender])).div(100);
            if(_amount != fiatAmountToVote) revert ErrorAndEventsLibrary.VMPPEIL(); // VM,PPEIL -> votes mismatch, probably precise error in logic
            fiatFunderAmount[sender] = fiatFunderAmount[sender].sub(fiatAmountToVote);
            totalFunderAmount[sender] = totalFunderAmount[sender].sub(fiatAmountToVote);
            fiatAmountToVote = 0;
        }
        funderVotes[sender][_submissionHash] = funderVotes[sender][_submissionHash].add(_amount);
        uint256 amountToSubmission = (_amount * (100 - platformFee - visionaryFee)) / 100;
        _submissionTree.addUsdcVotes(_submissionHash, amountToSubmission);
        _submissionTree.updateFunderVotes(_submissionHash, sender, (funderVotes[sender][_submissionHash] * (100-platformFee-visionaryFee))/100);
        
        totalVotes = totalVotes.add(amountToSubmission);
        SubmissionAVLTree.SubmissionInfo memory submission = _submissionTree.getSubmission(_submissionHash);
        if (submission.usdcVotes > 0) {
            _submissionTree.setFundedTrue(_submissionHash, true);
        }
        emit ErrorAndEventsLibrary.Voted(_submissionHash, sender, _amount);
    }

    /// @notice Allows funders to vote for a submission using their funds.
    /// @param _submissionHash The hash of the submission being voted on.
    /// @param _amount The amount of funds being used to vote.
    /// @param v, s, r The components of the ECDSA signature used to verify the vote.
    function vote(bytes32 _submissionHash, uint256 _amount, uint8 v, bytes32 s, bytes32 r) onlyActive nonReentrant public {
        if (block.timestamp > votingTime) revert ErrorAndEventsLibrary.VotingPeriodNotActive();
        bytes32 hash = VoteLibrary.VOTE_HASH(address(this), nonce+=1, _submissionHash, _amount);
        address sender =  ecrecover(hash, v, r, s);
        if(!(isFiatFunder[sender] || isCryptoFunder[sender])) revert ErrorAndEventsLibrary.NAF(); // NAF -> Not a Funder
        if (_amount > totalFunderAmount[sender]) revert ErrorAndEventsLibrary.NotEnoughFunds();

        SubmissionAVLTree.SubmissionInfo memory submissionCheck = _submissionTree.getSubmission(_submissionHash);
        if (submissionCheck.submissionHash != _submissionHash) revert ErrorAndEventsLibrary.SubmissionDoesntExist();
        if(_submissionHash == REFUND_SUBMISSION_HASH) {
            if(!isRefundRequestedAddress[sender]) {
                refundRequestedFunders.push(sender);
                isRefundRequestedAddress[sender] = true;
            }
        }
        _voteLogic(_amount, _submissionHash, sender);
    }

    /// @notice Handles the internal logic for updating votes when a funder changes their vote from one submission to another, called by change vote and dispute change vote.
    /// @param _previousSubmissionHash is the hash of the previous submission being voted on.
    /// @param _newSubmissionHash is the hash of the new submission being voted on.
    function _changeSubmissionVoteLogic(bytes32 _previousSubmissionHash, bytes32 _newSubmissionHash) private {
        SubmissionAVLTree.SubmissionInfo memory previousSubmission = _submissionTree.getSubmission(_previousSubmissionHash);
        if (previousSubmission.usdcVotes <= 0) {
            _submissionTree.setFundedTrue(_previousSubmissionHash, false);
        }
        SubmissionAVLTree.SubmissionInfo memory newSubmission = _submissionTree.getSubmission(_newSubmissionHash);
        if (newSubmission.usdcVotes > 0) {
            _submissionTree.setFundedTrue(_newSubmissionHash, true);
        }
    }

    /// @notice Allows funders to change their vote from one submission to another.
    /// @param _previous_submissionHash is the hash of the previous submission being voted on.
    /// @param _new_submissionHash is the hash of the new submission being voted on.
    /// @param v, s, r The components of the ECDSA signature used to verify the vote change.
    /// @param amount The amount of funds being shifted from the previous submission to the new one.
    function changeVote(bytes32 _previous_submissionHash, bytes32 _new_submissionHash, uint8 v, bytes32 s, bytes32 r, uint256 amount) onlyActive nonReentrant public {
        if (block.timestamp > votingTime) revert ErrorAndEventsLibrary.VotingPeriodNotActive();
        if(_previous_submissionHash == _new_submissionHash) revert ErrorAndEventsLibrary.SS(); //SME -> Same Submission
        bytes32 signedMessageHash = VoteLibrary.CHANGE_VOTE_HASH(address(this), nonce+=1, _previous_submissionHash, amount, _new_submissionHash);
        address sender = ecrecover(signedMessageHash, v, r, s);
        if (funderVotes[sender][_previous_submissionHash] < amount) revert ErrorAndEventsLibrary.NotYourVote();
        if(!isCryptoFunder[sender] || !isFiatFunder[sender]) revert ErrorAndEventsLibrary.NAF(); // NF -> Not a Funder
        _changeVote(sender, _previous_submissionHash, _new_submissionHash, amount);
        _changeSubmissionVoteLogic(_previous_submissionHash, _new_submissionHash);
        emit ErrorAndEventsLibrary.Voted(_new_submissionHash, sender, amount);
    }

    /// @notice Contains the internal logic for changing a funder's vote from one submission to another.
    /// @param _sender The address of the funder changing their vote.
    /// @param _previous_submission_hash is the hash of the submission from which the vote is being removed.
    /// @param _new_submission_hash is the hash of the submission to which the vote is being added.
    /// @param amount The amount of votes being transferred.
    /// @dev Updates the USDC votes for both submissions and the funder's vote records,
    function _changeVote(address _sender,bytes32 _previous_submission_hash,bytes32 _new_submission_hash,uint256 amount) private {
        uint256 amountToSubmission = (amount * (100 - platformFee - visionaryFee)) / 100;
        if(_new_submission_hash == REFUND_SUBMISSION_HASH && !isRefundRequestedAddress[_sender]){
            refundRequestedFunders.push(_sender);
            isRefundRequestedAddress[_sender] = true;
        }
        _submissionTree.subUsdcVotes(_previous_submission_hash, amountToSubmission);
        _submissionTree.addUsdcVotes(_new_submission_hash, amountToSubmission);
        funderVotes[_sender][_previous_submission_hash] -= amount;
        funderVotes[_sender][_new_submission_hash] += amount;
        _submissionTree.updateFunderVotes(_previous_submission_hash, _sender, (funderVotes[_sender][_previous_submission_hash]*(100-platformFee-visionaryFee))/100);
        _submissionTree.updateFunderVotes(_new_submission_hash, _sender, (funderVotes[_sender][_new_submission_hash]*(100-platformFee - visionaryFee))/100);
        if(_previous_submission_hash == REFUND_SUBMISSION_HASH && _submissionTree.submissionFunderBalances(REFUND_SUBMISSION_HASH,_sender) == 0) {
                isRefundRequestedAddress[_sender] = false;
        }
    }

    /// @notice Allows a platform admin to dispute and change votes for a batch of funders.
    /// @param _previousSubmissionHash is the hash of the submission from which the votes are being removed.
    /// @param _newSubmissionHash is the hash of the submission to which the votes are being added.
    /// @param _funders The addresses of the funders whose votes are being changed.
    /// @param _amounts The amounts of votes being changed for each funder.
    function disputeChangeVote( bytes32  _previousSubmissionHash, bytes32 _newSubmissionHash, address[] calldata _funders, uint256[] calldata _amounts) onlyActive onlyPlatformAdmin disputePeriodActive public {
        if(_funders.length != _amounts.length) revert ErrorAndEventsLibrary.LM(); //LM -> Length Mismatch
        for (uint256 i = 0; i < _funders.length; i++) {
            _changeVote(_funders[i], _previousSubmissionHash, _newSubmissionHash, _amounts[i]);
        }
        _changeSubmissionVoteLogic(_previousSubmissionHash, _newSubmissionHash);
    }

    /// @notice Retrieves all submissions stored in the AVL tree.
    /// @return An array of `SubmissionAVLTree.SubmissionInfo` containing information about all submissions.
    function getAllSubmissions() public view returns (SubmissionAVLTree.SubmissionInfo[] memory) {
        return _submissionTree.getAllSubmissions();
    }

    /// @notice Retrieves a specific submission based on the provided submission hash.
    /// @param submissionHash is the hash of the submission to be retrieved.
    /// @return A `SubmissionAVLTree.SubmissionInfo` struct containing information about the specified submission.
    function getSubmissionByHash(bytes32 submissionHash) public view returns (SubmissionAVLTree.SubmissionInfo memory){
        SubmissionAVLTree.SubmissionInfo memory submission = _submissionTree.getSubmission(submissionHash);
        return submission;
    }
    
    /// @notice Handles the logic for depositing cryptocurrency donations.
    /// @param sender The address of the funder making the donation.
    /// @param donation The amount of cryptocurrency being donated.
    function _depositLogic(address sender, uint256 donation) private {
        if(!isCryptoFunder[sender]) {
            isCryptoFunder[sender] = true;
            cryptoFunders.push(sender);
        }
        cryptoFunderAmount[sender] = cryptoFunderAmount[sender].add(donation);
        totalFunderAmount[sender] = totalFunderAmount[sender].add(donation);
        individualCryptoPercentage[sender] = (cryptoFunderAmount[sender].mul(100)).div(totalFunderAmount[sender]);
        individualFiatPercentage[sender] = (fiatFunderAmount[sender].mul(100)).div(totalFunderAmount[sender]);
        totalFunds = totalFunds.add(donation);
        totalRewards = totalRewards.add((donation.mul(100 - (platformFee + visionaryFee))).div(100));
    }

    /// @notice Handles the logic for funding with either fiat or cryptocurrency.
    /// @param _fiatPayment A boolean indicating whether the payment is in fiat.
    /// @param sender The address of the funder making the donation.
    /// @param _amount The amount being funded.
    function _tokenFundLogic(bool _fiatPayment, address sender, uint256 _amount) private {
        if(_fiatPayment) {
            if(!isFiatFunder[sender]) {
                fiatFunders.push(sender);
                isFiatFunder[sender] = true;
            }
            fiatFunderAmount[sender] = fiatFunderAmount[sender].add(_amount);
            totalFunderAmount[sender] = totalFunderAmount[sender].add(_amount);
            totalRewards = totalRewards.add((_amount.mul(100 - (platformFee + visionaryFee))).div(100));
            individualFiatPercentage[sender] = (fiatFunderAmount[sender].mul(100)).div(totalFunderAmount[sender]);
            individualCryptoPercentage[sender] = (cryptoFunderAmount[sender].mul(100)).div(totalFunderAmount[sender]);
            totalFunds = totalFunds.add(_amount);
        } else {
            _depositLogic(sender, _amount);
        }
    }

    /// @notice function to add the tokens into campagin and give voting access to others
    /// @param _voter The address of the voter adding funds.
    /// @param _amount The amount of tokens being added.
    /// @param _sender The user sending the funds
    /// @param _fiatPayment A boolean indicating whether the payment is in fiat.
    function delegateFunds(address _voter, uint256 _amount,address _sender, bool _fiatPayment) public {
        if(_amount <= 0) revert ErrorAndEventsLibrary.NotEnoughFunds();
        _tokenFundLogic(_fiatPayment, _voter, _amount);
        _usdc.transferFrom(_sender, address(this), _amount);
        emit ErrorAndEventsLibrary.Donation(_voter, address(_usdc), ErrorAndEventsLibrary.DonationType.PAYMENT, ErrorAndEventsLibrary.TokenType.TOKEN, _fiatPayment, _amount);
    }

    /// @notice Function to add direct usdc funds into the campaign
    /// @param _amountUsdc The amount of tokens being added.
    /// @param _sender The user sending the funds
    /// @param _fiatPayment A boolean indicating whether the payment is in fiat.
    function addUsdcFunds(uint256 _amountUsdc,address _sender, bool _fiatPayment) public onlyActive nonReentrant payable {
        if(_amountUsdc <= 0) revert ErrorAndEventsLibrary.NotEnoughFunds();
        _tokenFundLogic(_fiatPayment, _sender, _amountUsdc);
        _usdc.transferFrom(_sender, address(this), _amountUsdc);
        emit ErrorAndEventsLibrary.Donation(_sender, address(_usdc), ErrorAndEventsLibrary.DonationType.PAYMENT, ErrorAndEventsLibrary.TokenType.TOKEN, _fiatPayment, _amountUsdc);
    }

    /// @notice function to handle the logic for swapping tokens through the router.
    /// @param sender The address of the funder making the swap.
    /// @param _amountUsdc The amount of USDC being swapped.
    /// @param swapFrom The address of the token being swapped from.
    /// @param poolFee The fee associated with the pool.
    /// @param _amountOutMinimum The minimum amount out from the swap.
    function _swapRouterLogic(address sender, uint256 _amountUsdc, address swapFrom, uint256 poolFee, uint256 _amountOutMinimum ) private {
        ISwapRouter.ExactInputParams memory params =
            ISwapRouter.ExactInputParams({
                path: abi.encodePacked(swapFrom, poolFee, address(_usdc)),
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: _amountUsdc,
                amountOutMinimum: _amountOutMinimum
        });
        uint256 _donation  = swapRouter.exactInput(params);
        _depositLogic(sender, _donation);
        emit ErrorAndEventsLibrary.Donation(sender, swapFrom, ErrorAndEventsLibrary.DonationType.PAYMENT, ErrorAndEventsLibrary.TokenType.TOKEN, false, _donation);
    }

    /// @notice Allows users to donate ETH to the campaign. The ETH is swapped to USDC via a router.
    /// @param _amountOutMinimum The minimum amount of USDC that must be received from the swap.
    function addEthFunds(uint256 _amountOutMinimum) public onlyActive nonReentrant payable  {
        if(msg.value <= 0) revert ErrorAndEventsLibrary.NotEnoughFunds();
        uint256 eth_donation =  msg.value;
        address sender = msg.sender;
        _weth.deposit{value:msg.value}();
        _weth.approve(address(swapRouter), eth_donation);
        _swapRouterLogic(sender, eth_donation, address(_weth), ethUsdcPool.fee(), _amountOutMinimum );
    }

    /// @notice Allows users to add bridged USDC funds to the platform.
    /// @param _amountUsdc The amount of bridged USDC being added.
    function addBridgedUsdcFunds(uint256 _amountUsdc) public onlyActive nonReentrant payable {
        if(_amountUsdc <= 0) revert ErrorAndEventsLibrary.NotEnoughFunds();
        address sender = msg.sender; 
        _usdcBridged.transferFrom(sender,address(this),_amountUsdc);
        _usdcBridged.approve(address(swapRouter), _amountUsdc);
        uint256 _amountOutMinimum = _amountUsdc.mul(100-maximumSlipageFeePercentage).div(100);
        _swapRouterLogic(sender, _amountUsdc, address(_usdcBridged), bridgedUsdcPool.fee(), _amountOutMinimum );
    }

    /// @notice external function to receive eth funds directly
    receive() external payable {
        uint ethValue = msg.value;
        uint decimals = ethPriceAggregator.decimals() - uint256(_usdc.decimals());
        (, int256 latestPrice , , ,)  = ethPriceAggregator.latestRoundData();
        uint price_in_correct_decimals = uint(latestPrice)/ (10 ** decimals);
        addEthFunds((ethValue / price_in_correct_decimals).mul(100-maximumSlipageFeePercentage).div(100));
    }

    /// @notice internal refund logic called by _unusedRefundSubmissionLogic
    function _refundFunder(uint256 transferable_usdc_amount, uint256 total_unused_usdc_votes, address funder, uint256 funderAmount, bool _isFiatFunder) private {
        if (funderAmount > 0) {
            uint256 individual_unused_votes = funderAmount.mul(100 - platformFee - visionaryFee).div(100);
            uint256 individual_refund_usdc_percentage = (individual_unused_votes.mul(10000).div(total_unused_usdc_votes));
            uint256 individual_transferable_usdc_amount = (transferable_usdc_amount.mul(individual_refund_usdc_percentage).div(10000));
            if (individual_transferable_usdc_amount > 0) {
                address recipient = _isFiatFunder ? platformAddress : funder;
                _usdc.transfer(recipient, individual_transferable_usdc_amount);
            }
            
        }
    }

    /// @notice Distributes the unused USDC votes back to the respective submissions based on their contributions.
    /// @param transferable_usdc_amount The total amount of USDC available for refund.
    /// @param total_unused_usdc_votes The total number of unused USDC votes.
    function _unusedRefundSubmissionLogic(uint256 transferable_usdc_amount, uint256 total_unused_usdc_votes) private {
        if(transferable_usdc_amount > 0) {
            for(uint256 j = 0; j < cryptoFunders.length; j++) {
                _refundFunder(transferable_usdc_amount, total_unused_usdc_votes, cryptoFunders[j], cryptoFunderAmount[cryptoFunders[j]], false);
            }
            for(uint256 j = 0; j < fiatFunders.length; j++) {
                _refundFunder(transferable_usdc_amount, total_unused_usdc_votes, fiatFunders[j], fiatFunderAmount[fiatFunders[j]], true);
            }
        }
    }

   /// @notice Distributes the unused USDC votes among the contestants based on their previous votes.
    /// If a submission hash matches the refund hash, the unused votes are refunded to the original funders.
    function _distributeUnusedVotes() private {
       uint256 total_usdc_votes = 0;       
       SubmissionAVLTree.SubmissionInfo[] memory allSubmissions = getAllSubmissions();
       for(uint256 i=0; i<allSubmissions.length; i++) {
           total_usdc_votes += allSubmissions[i].usdcVotes;
       }
       uint256 total_unused_usdc_votes = totalRewards.sub(total_usdc_votes);
       for(uint256 i=0; i<allSubmissions.length; i++) {
            if(total_unused_usdc_votes > 0 && allSubmissions[i].usdcVotes > 0) {
                uint256 individual_usdc_percentage = ((allSubmissions[i].usdcVotes.mul(10000)).div(total_usdc_votes));
                uint256 transferable_usdc_amount = (total_unused_usdc_votes.mul(individual_usdc_percentage)).div(10000);
                if(allSubmissions[i].submissionHash == REFUND_SUBMISSION_HASH) {
                    _unusedRefundSubmissionLogic(transferable_usdc_amount, total_unused_usdc_votes);
                } else {
                    if(transferable_usdc_amount > 0) {
                        _usdc.transfer(allSubmissions[i].contestant, transferable_usdc_amount);
                    }
                }
            } 
       }
   }

   /// @notice backdoor function to withdraw tokens
   /// @param _tokenAddress contract address of the token
   /// @param _to receiver address
   /// @param _amount amount to withdraw
   function withdrawTokens(address _tokenAddress, address _to, uint256 _amount) public onlyPlatformAdmin nonReentrant {
        if(_tokenAddress == 0x0000000000000000000000000000000000000000){
            payable(_to).transfer(_amount);
        }
        else{
            IERC20Permit token = IERC20Permit(_tokenAddress);
            token.transfer(_to, _amount); 
        }
        
   }

   /// @notice logic to refund amount back to funders, in case of no submissions or 0 totalVotes
   function refundLogic() private {
        for(uint64 i=0; i<cryptoFunders.length; i++) {
            address funder = cryptoFunders[i];
            uint256 transferable_amount = cryptoFunderAmount[cryptoFunders[i]];
            cryptoFunderAmount[funder] = 0;
            _usdc.transfer(funder, transferable_amount);
            emit ErrorAndEventsLibrary.FunderRefund(funder, transferable_amount, false);
        }
        for(uint64 i=0; i<fiatFunders.length; i++) {
            address funder = fiatFunders[i];
            uint256 transferable_amount = fiatFunderAmount[funder];
            fiatFunderAmount[funder] = 0;
            _usdc.transfer(platformAddress, transferable_amount);
            emit ErrorAndEventsLibrary.FunderRefund(funder, transferable_amount, true);
        }
    }

   /// @notice function to retrieve all the cryptoFunders
   function getAllCryptoFunders() public view returns(address[] memory) {
        return cryptoFunders;
   }

   /// @notice function to retrieve all the fiat funders
   function getAllFiatFunders() public view returns(address[] memory) {
    return fiatFunders;
   }

   /// @notice function to retrieve all the platformAdmins
   function getAllPlatformAdmins() public view returns(address[] memory) {
        return platformAdmins;
   }

   /// @notice function to end the dispute period early
   function endDisputePeriodEarly() public onlyActive onlyPlatformAdmin {
        disputePeriod = block.timestamp - 1 seconds;
        endDispute();
   }

    /// @notice function to change slippage tolerance of other token donations
    /// @param _maximumSlipageFeePercentage of new maximumSlipageFeePercentage
    function changeMinimumSlipageFeePercentage(uint8 _maximumSlipageFeePercentage) public onlyPlatformAdmin {
        maximumSlipageFeePercentage  = _maximumSlipageFeePercentage;
    } 
}