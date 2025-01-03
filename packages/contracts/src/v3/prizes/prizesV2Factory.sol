/// @notice  SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./prizes.sol";
contract PrizeFactoryV2 {
    // Event declaration
    event NewViaPrizeCreated(string indexed id, address indexed viaPrizeAddress);	   
    function createViaPrize(
       string memory _id , address _proposer, address[] memory _platformAdmins, uint8 _platFormFee, uint8 _proposerFee, address _usdcAddress, address _usdcBridgedAddress , address _swapRouter ,address _usdcToUsdcePool,address _usdcToEthPool,address _ethPriceAggregator,address _wethToken,address _refundAddress
    ) public returns (address) {
        // Deploy a new ViaPrize contract and store its address	        // Deploy a new ViaPrize contract and store its address
        PrizeV2 newViaPrize = new PrizeV2(_proposer, _platformAdmins, _platFormFee, _proposerFee, _usdcAddress,_usdcBridgedAddress,_swapRouter,_usdcToUsdcePool,_usdcToEthPool,_ethPriceAggregator,_wethToken,_refundAddress);
        // Emit the event with the contractId and the address of the newly created contract	        // Emit the event with the contractId and the address of the newly created contract
        emit NewViaPrizeCreated(_id, address(newViaPrize));

        // Return the address of the newly created contractx
        return address(newViaPrize);
    }
}
