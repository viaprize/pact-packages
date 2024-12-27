import { encodePacked, keccak256 } from 'viem'
import { version } from 'vite'
import { z } from 'zod'
export const ValidChainSchema = z.union([z.literal(11155111), z.literal(10)])
export type ValidChainIDs = keyof typeof CONTRACT_CONSTANTS_PER_CHAIN
export const CONTRACT_CONSTANTS_PER_CHAIN = {
  11155111: {
    ADMINS: [
      '0x850a146D7478dAAa98Fc26Fd85e6A24e50846A9d',
      '0xd9ee3059F3d85faD72aDe7f2BbD267E73FA08D7F',
      '0x8e0103Af21C9a474035Bf00B56195b9ef3196C99',
      '0x8b5E4bA136D3a483aC9988C20CBF0018cC687E6f',
    ] as `0x${string}`[],
    USDC: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238' as `0x${string}`,
    USDC_BRIDGE: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238' as `0x${string}`,
    SWAP_ROUTER: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E' as `0x${string}`,
    USDC_TO_USDCE_POOL:
      '0x0000000000000000000000000000000000000000' as `0x${string}`,
    USDC_TO_ETH_POOL:
      '0x0000000000000000000000000000000000000000' as `0x${string}`,
    ETH_PRICE: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    WETH: '0x4200000000000000000000000000000000000006' as `0x${string}`,
    PRIZE_FACTORY_V2_ADDRESS:
      '0x1303614aa05A282842482dD864583d16ABF594e5' as `0x${string}`,
    REFUND_HASH: keccak256(encodePacked(['string'], ['REFUND'])),
    GASLESS_VAULT_ADDRESS: '0x8e0103Af21C9a474035Bf00B56195b9ef3196C99',
    USDC_DETAIL: {
      name: 'USDC',
      version: '2',
    },
  },
  10: {
    ADMINS: [
      '0x850a146D7478dAAa98Fc26Fd85e6A24e50846A9d',
      '0xd9ee3059F3d85faD72aDe7f2BbD267E73FA08D7F',
      '0x8e0103Af21C9a474035Bf00B56195b9ef3196C99',
      '0x8b5E4bA136D3a483aC9988C20CBF0018cC687E6f',
    ] as `0x${string}`[],
    USDC: '0x0b2c639c533813f4aa9d7837caf62653d097ff85' as `0x${string}`,
    USDC_BRIDGE: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607' as `0x${string}`,
    SWAP_ROUTER: '0xE592427A0AEce92De3Edee1F18E0157C05861564' as `0x${string}`,
    USDC_TO_USDCE_POOL:
      '0x2ab22ac86b25bd448a4d9dc041bd2384655299c4' as `0x${string}`,
    USDC_TO_ETH_POOL:
      '0x85149247691df622eaf1a8bd0cafd40bc45154a9' as `0x${string}`,
    ETH_PRICE: '0x13e3Ee699D1909E989722E753853AE30b17e08c5' as `0x${string}`,
    WETH: '0x4200000000000000000000000000000000000006' as `0x${string}`,
    PRIZE_FACTORY_V2_ADDRESS:
      '0x03fC77fB9E8449cE1D9f822fBA406379b89b0FA5' as `0x${string}`,
    REFUND_HASH: keccak256(encodePacked(['string'], ['REFUND'])),
    GASLESS_VAULT_ADDRESS: '0x8e0103Af21C9a474035Bf00B56195b9ef3196C99',
    USDC_DETAIL: {
      name: 'USD Coin',
      version: '2',
    },
    // RESERVE_FUND_PRIZE_ADDRESS:
    //   '0x3cBE69793295ca673E89adE141796611db4E4560' as `0x${string}`,
  },
}
