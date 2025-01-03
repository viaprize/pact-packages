import Safe from '@safe-global/protocol-kit'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { Resource } from 'sst'
import {
  http,
  type Abi,
  type ContractEventName,
  ParseEventLogsParameters,
  type ParseEventLogsReturnType,
  type TransactionReceipt,
  createPublicClient,
  createWalletClient,
  hashTypedData,
  parseEventLogs,
} from 'viem'
import {
  generatePrivateKey,
  privateKeyToAccount,
  privateKeyToAddress,
} from 'viem/accounts'
import { NONCE_ABI, PRIZE_FACTORY_ABI } from './abi'
import { CONTRACT_CONSTANTS_PER_CHAIN, type ValidChainIDs } from './constants'
import { AESCipher } from './encryption'
import { Blockchain } from './smart-contracts/blockchain'
import { getChain, usdcSignType, voteMessageHash } from './utils'

export type WalletType = 'gasless'
export type AddressType = 'signer' | 'vault'

type TransactionData = {
  to: string
  value: string
  data: string
}

export class Wallet extends Blockchain {
  private secretKey: string
  private gaslessKey: `0x${string}`
  private cipher: AESCipher
  constructor(
    rpcUrl: string,
    chainId: ValidChainIDs,
    secretKey: string,
    gaslessKey: `0x${string}`,
  ) {
    super(rpcUrl, chainId)
    this.secretKey = secretKey

    this.gaslessKey = gaslessKey
    this.cipher = new AESCipher(this.secretKey)
  }
  async generateWallet() {
    const privateKey = generatePrivateKey()
    const address = privateKeyToAddress(privateKey)

    return {
      address,
      key: this.cipher.encrypt(privateKey),
    }
  }
  async withTransactionEvents<
    abi extends Abi | readonly unknown[],
    eventName extends
      | ContractEventName<abi>
      | ContractEventName<abi>[]
      | undefined = undefined,
  >(
    abi: abi,
    tx: TransactionData[],
    type: WalletType,
    events:
      | eventName
      | ContractEventName<abi>
      | ContractEventName<abi>[]
      | undefined,
    callback: (
      event: ParseEventLogsReturnType<abi, eventName>,
      tx: TransactionReceipt,
    ) => Awaited<void>,
  ) {
    const transaction = await this.sendTransaction(tx, type)
    console.log({ transaction })
    await callback(
      parseEventLogs({ logs: transaction.logs, abi, eventName: events }),
      transaction,
    )
    return transaction
  }

  async simulateTransaction(
    tx: TransactionData,
    type: WalletType,
    addressType: AddressType,
  ) {
    const address = await this.getAddress(type, addressType)
    const res = await this.blockchainClient.call({
      account: address as `0x${string}`,
      to: tx.to as `0x${string}`,
      value: BigInt(tx.value),
      data: tx.data as `0x${string}`,
    })
    return res.data
  }
  async signVoteForCustodial({
    amount,
    contractAddress,
    encryptedKey,
    submissionHash,
  }: {
    amount: number
    contractAddress: `0x${string}`
    encryptedKey: `0x${string}`
    submissionHash: `0x${string}`
  }) {
    const account = privateKeyToAccount(
      this.cipher.decrypt(encryptedKey) as `0x${string}`,
    )
    const chainObject = getChain(this.chainId)
    const wallet = createWalletClient({
      transport: http(this.rpcUrl),
      chain: chainObject,
      account,
    })
    const nonce = await this.blockchainClient.readContract({
      abi: [
        {
          inputs: [],
          name: 'nonce',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ] as const,
      address: contractAddress,
      functionName: 'nonce',
    })
    const messageHash = voteMessageHash(
      submissionHash,
      amount,
      Number.parseInt(nonce.toString()) + 1,
      contractAddress,
    )
    const signature = await wallet.signMessage({
      message: {
        raw: messageHash as `0x${string}`,
      },
    })
    return {
      hash: messageHash,
      signature: signature,
    }
  }

  async signUsdcTransactionForCustodial({
    spender,
    key,
    value,
    deadline,
  }: { spender: `0x${string}`; key: string; value: number; deadline: number }) {
    const account = privateKeyToAccount(
      this.cipher.decrypt(key) as `0x${string}`,
    )
    const chainObject = getChain(this.chainId)
    console.log({ chainObject })
    const wallet = createWalletClient({
      transport: http(this.rpcUrl),
      chain: chainObject,
      account,
    })
    console.log(this.rpcUrl, 'this.rpcUrl')
    const constants = CONTRACT_CONSTANTS_PER_CHAIN[this.chainId]
    const usdc = constants.USDC
    const nonce = await this.blockchainClient.readContract({
      abi: NONCE_ABI,
      address: usdc,
      functionName: 'nonces',
      args: [wallet.account.address],
    })
    console.log(wallet.account.address, 'wallet.account.address')
    console.log({ nonce })
    console.log(this.chainId)
    const signType = usdcSignType({
      deadline: BigInt(deadline),
      nonce: nonce,
      owner: wallet.account.address,
      spender,
      usdc: usdc,
      value: BigInt(value),
      chainId: this.chainId,
      tokenName: constants.USDC_DETAIL.name,
      version: constants.USDC_DETAIL.version,
    })
    const hash = hashTypedData(signType as any)
    const signature = await wallet.signTypedData(signType as any)
    return {
      hash,
      signature,
    }
  }

  async sendTransaction(tx: MetaTransactionData[], type: WalletType) {
    const safeAddress = this.getAddress(type, 'vault')
    // @ts-ignore
    const safe = Safe.default ? Safe.default : Safe
    const protocolKit = await safe.init({
      provider: this.rpcUrl,
      signer: this.gaslessKey,
      safeAddress: safeAddress as `0x${string}`,
    })

    const safeTransactionProtocol = await protocolKit.createTransaction({
      transactions: tx,
    })

    const executeTxResponse = await protocolKit.executeTransaction(
      safeTransactionProtocol,
    )
    const transaction = await this.blockchainClient.waitForTransactionReceipt({
      hash: executeTxResponse.hash as `0x${string}`,
    })
    return transaction
  }

  getAddress(type: WalletType, addressType: AddressType) {
    if (type === 'gasless') {
      switch (addressType) {
        case 'signer':
          return privateKeyToAddress(this.gaslessKey)
        case 'vault':
          return CONTRACT_CONSTANTS_PER_CHAIN[this.chainId]
            .GASLESS_VAULT_ADDRESS
      }
    }
  }
}
