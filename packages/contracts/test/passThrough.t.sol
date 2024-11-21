// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {PassThroughV2} from "../src/v3/fundRaisers/passThroughV2.sol";
import {Test} from "forge-std/Test.sol";
import "../src/helperContracts/ierc20_permit.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PassThroughTest is Test {
    PassThroughV2 public passThrough;
    
    /// @notice this will be the total funds yet contributed to this campaign by funders
    uint256 public totalFunds;
    /// @notice this will be the total Rewards which goes to recipent after deducting platform fees
    uint256 public totalRewards;
    /// @notice to keep track of total platformAdmins
    uint256 public totalPlatformAdmins;
    /// @notice this will the percentage from totalFunds which goes to the platform address as Fee
    uint256 public  immutable platformFee;
    uint public minimumSlipageFeePercentage = 2; 

    /// @notice this is the address of visionary who deploys a contract
    address public visionary;
    /// @notice this is an usdc token address which will be assigned while deploying the contract.
    address public USDC;
    /// @notice this is an usdc token address which will be assigned while deploying the contract.
    address public USDC_E;
    /// @notice this is an Eth address which will be assigned while deploying the contract.
    address public WETH;
    /// @notice this will be the address to receive platform Fee
    address public immutable platformAddress = 0x1f00DD750aD3A6463F174eD7d63ebE1a7a930d0c;
    ///@notice array of platformAdmins address, there can be multiple platform admins
    address[] public platformAdmins;
    /// @notice this will be an array of address who funding to this campaign
    address[] public funders; 

    /// @notice bool to check status of campaign
    bool public isActive;
    
    /// @notice this will be a mapping of the address of a proposer to a boolean value of true or false
    mapping(address => bool) public isVisionary;
    /// @notice this will be a mapping of the addresses of a platformAdmins to a boolean value of true or false
    mapping(address => bool) public isPlatformAdmin;
    /// @notice this will be a mapping of the addresses of a funder to a boolean value of true or false
    mapping(address => bool) public isFunder;
    /// @notice this will be a mapping of the addresses of the funders to the amount they have contributed
    mapping(address => uint256) public funderAmount;
    /// @notice this mapping will be to track of votesToRevokePlatformAdmin for all the platformAdmins
    mapping(address => uint8) public votesToRevokePlatformAdmin;
    /// @notice this mapping will be to track of votes to add platformAdmin for all the platformAdmins
    mapping(address => uint8) public votesToAddPlatformAdmin;

    /// @notice initializing the erc20 interface for usdc token
    IERC20Permit private _usdc;
    /// @notice initializing the erc20 interface for usdc bridged usdc token
    IERC20Permit private _usdcBridged;
    /// @notice initializing the interface for weth
    IWETH private _weth;
    /// @notice initializing swaprouter interface
    ISwapRouter public immutable swapRouter;
    /// @notice initializing brdiged usdc and usdc pool 
    IUniswapV3Pool public immutable bridgedUsdcPool;
    /// @notice initalizing eth and usdc pool
    IUniswapV3Pool public immutable ethUsdcPool;
    /// @notice initializing chainlink or oracle price aggregator
    AggregatorV3Interface public immutable ethPriceAggregator;

    function setUp() public {
        visionary = address(0x12344567)
        isVisionary[visionary] = true;
        platformAdmins.push(1234);
        isPlatformAdmin[1234] = true;
        totalPlatformAdmins = 1;
        platformFee = 5;
        USDC = address(0x1234);
        USDC_E = address(0x1234);
        WETH = address(0x1234);
        _usdc = IERC20Permit(address(0x1234));
        _usdcBridged = IERC20Permit(address(0x1234));
        _weth = IWETH(address(0x1234));
        swapRouter = ISwapRouter(address(0x1234));
        bridgedUsdcPool = IUniswapV3Pool(address(0x1234));
        ethUsdcPool = IUniswapV3Pool(address(0x1234));
        ethPriceAggregator = AggregatorV3Interface(address(0x1234));
        passThrough = new PassThroughV2({
            visionary,
            platformAdmins,
            platformFee,
            USDC,
            USDC_E,
            WETH,
            swapRouter,
            bridgedUsdcPool,
            ethUsdcPool,
            ethPriceAggregator
        })
    }
}