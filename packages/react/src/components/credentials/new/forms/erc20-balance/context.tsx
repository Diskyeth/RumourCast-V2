import { createContext, useContext, useEffect, useState } from 'react'
import { ContractType, CredentialType, StorageType, Vault } from '@anonworld/common'
import { useCredentials, useSDK } from '../../../../../providers'
import { erc20Abi, formatUnits, parseUnits } from 'viem'
import { useAccount, useReadContract } from 'wagmi'

interface NewERC20CredentialContextValue {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  connectWallet: () => void
  isConnecting: boolean
  tokenId: { chainId: number; address: string } | undefined
  setTokenId: (token?: { chainId: number; address: string }) => void
  balance: number
  setBalance: (balance: number) => void
  maxBalance: number
  setMaxBalance: (maxBalance: number) => void
  decimals: number
  setDecimals: (decimals: number) => void
  handleAddCredential: () => void
  isLoading: boolean
  error: string | undefined
  initialTokenId?: { chainId: number; address: string }
  parentId?: string
}

const NewERC20CredentialContext = createContext<NewERC20CredentialContextValue | null>(
  null
)

export function NewERC20CredentialProvider({
  children,
  initialTokenId,
  initialBalance,
  isOpen,
  setIsOpen,
  parentId,
  vault,
}: {
  children: React.ReactNode
  initialTokenId?: { chainId: number; address: string }
  initialBalance?: number
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  parentId?: string
  vault?: Vault
}) {
  const { connectWallet, isConnecting } = useSDK()
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)
  const [tokenId, setTokenId] = useState<
    { chainId: number; address: string } | undefined
  >(initialTokenId)
  const [balance, setBalance] = useState<number>(initialBalance ?? 0)
  const [maxBalance, setMaxBalance] = useState<number>(0)
  const [decimals, setDecimals] = useState<number>(
    initialTokenId?.address.toLowerCase() === '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
      ? 6
      : 18
  )
  const { address } = useAccount()
  const { add, addToVault } = useCredentials()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()
  const { sdk } = useSDK()

  const { data: onchainBalance } = useReadContract({
    chainId: tokenId?.chainId,
    address: tokenId?.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  })

  useEffect(() => {
    if (onchainBalance) {
      setMaxBalance(Math.floor(Number(formatUnits(onchainBalance, decimals))))
      if (initialBalance) {
        setBalance(
          Math.min(
            Math.floor(Number(formatUnits(onchainBalance, decimals))),
            initialBalance
          )
        )
      } else {
        setBalance(Math.floor(Number(formatUnits(onchainBalance, decimals))))
      }
    }
  }, [onchainBalance, decimals])

  const handleConnectWallet = () => {
    if (!connectWallet) return
    setIsOpen(false)
    setIsConnectingWallet(true)
    connectWallet()
  }

  useEffect(() => {
    if (isConnectingWallet && !isConnecting) {
      setIsConnectingWallet(false)
      setIsOpen(true)
    }
  }, [isConnecting])

  useEffect(() => {
    if (isOpen) {
      if (initialTokenId) {
        setTokenId(initialTokenId)
      }
      if (initialBalance) {
        setBalance(initialBalance)
      }
    }
  }, [isOpen, initialTokenId, initialBalance])

  const handleAddCredential = async () => {
    if (!tokenId) return
    try {
      setIsLoading(true)

      if (!address) {
        throw new Error('No address connected')
      }

      const response = await sdk.getStorageSlot(
        tokenId.chainId,
        tokenId.address,
        ContractType.ERC20,
        StorageType.BALANCE
      )
      if (!response.data) {
        throw new Error('Failed to find balance storage slot')
      }

      const credential = await add(
        CredentialType.ERC20_BALANCE,
        {
          address,
          chainId: tokenId.chainId,
          tokenAddress: tokenId.address as `0x${string}`,
          verifiedBalance: parseUnits(balance.toString(), decimals),
          balanceSlot: response.data.slot,
        },
        parentId
      )

      if (vault) {
        await addToVault(vault, credential)
      }

      setIsLoading(false)
      setIsOpen(false)
    } catch (e) {
      setError((e as Error).message ?? 'Failed to add credential')
      setIsLoading(false)
    }
  }

  return (
    <NewERC20CredentialContext.Provider
      value={{
        isOpen,
        setIsOpen,
        connectWallet: handleConnectWallet,
        isConnecting: isConnectingWallet,
        tokenId,
        setTokenId,
        balance,
        setBalance,
        maxBalance,
        setMaxBalance,
        decimals,
        setDecimals,
        handleAddCredential,
        isLoading,
        error,
        initialTokenId,
        parentId,
      }}
    >
      {children}
    </NewERC20CredentialContext.Provider>
  )
}

export function useNewERC20Credential() {
  const context = useContext(NewERC20CredentialContext)
  if (!context) {
    throw new Error(
      'useNewERC20Credential must be used within a NewERC20CredentialProvider'
    )
  }
  return context
}
