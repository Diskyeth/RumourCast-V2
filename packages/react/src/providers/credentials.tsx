'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useSignMessage } from 'wagmi'
import { CredentialType, CredentialWithId, Vault } from '@anonworld/common'
import { useSDK } from './sdk'
import { useVaults } from '../hooks/use-vaults'
import { CredentialArgsTypeMap, CredentialsManager } from '@anonworld/credentials'
import { hashMessage } from 'viem'

const LOCAL_STORAGE_KEY = 'anon:credentials:v1'
const LOCAL_STORAGE_VAULT_KEY = 'anon:vault:v1'

const getInitialCredentials = () => {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (stored) {
    try {
      const credentials = JSON.parse(stored)
      return credentials
        .filter((credential: CredentialWithId) => !credential.vault_id)
        .map((credential: CredentialWithId) => ({
          ...credential,
          vault: null,
          vault_id: null,
        }))
    } catch (error) {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      return []
    }
  }
  return []
}

const getInitialVault = () => {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(LOCAL_STORAGE_VAULT_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return null
}

type CredentialsContextType = {
  localCredentials: CredentialWithId[]
  credentials: CredentialWithId[]
  delete: (id: string) => Promise<void>
  get: (id: string) => CredentialWithId | undefined
  add: (type: CredentialType, args: any, parentId?: string) => Promise<CredentialWithId>
  addToVault: (vault: Vault, credential: CredentialWithId) => Promise<void>
  removeFromVault: (vaultId: string, credential: CredentialWithId) => Promise<void>
  addVault: () => Promise<Vault>
  deleteVault: (vaultId: string) => Promise<void>
  switchVault: (vault: Vault) => void
  vaults: Vault[]
  vault: Vault | null
}

const CredentialsContext = createContext<CredentialsContextType | null>(null)

export const CredentialsProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const manager = useMemo(() => new CredentialsManager(), [])

  const { sdk } = useSDK()
  const [localCredentials, setLocalCredentials] = useState<CredentialWithId[]>(
    getInitialCredentials()
  )
  const { signMessageAsync } = useSignMessage()
  const { data: vaults, refetch: refetchVaults } = useVaults()
  const [vault, setVault] = useState<Vault | null>(getInitialVault())

  useEffect(() => {
    if (vaults && !vault) {
      switchVault({
        ...vaults[0],
        credentials: [],
      })
    }
  }, [vaults])

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localCredentials))
  }, [localCredentials])

  const addCredential = async <T extends CredentialType>(
    type: T,
    args: CredentialArgsTypeMap[T],
    parentId?: string
  ) => {
    const verifier = manager.getVerifier(type)

    const { input, message } = await verifier.buildInput(args)

    let inputSignature = input.signature
    let inputMessageHash = input.messageHash
    if (!inputSignature) {
      inputSignature = await signMessageAsync({ message })
      inputMessageHash = hashMessage(message)
    }

    const proof = await verifier.generateProof({
      ...input,
      signature: inputSignature,
      messageHash: inputMessageHash,
    })

    const credential = await sdk.createCredential({
      ...proof,
      parentId,
    })

    if (credential.error) {
      throw new Error(credential.error.message)
    }

    if (parentId) {
      setLocalCredentials((prev) =>
        prev.map((cred) =>
          cred.id === parentId
            ? {
                ...credential.data,
                vault_id: cred.vault_id,
                vault: cred.vault,
              }
            : cred
        )
      )
    } else {
      setLocalCredentials((prev) => [...prev, credential.data])
    }
    return credential.data
  }

  const deleteCredential = async (id: string) => {
    const credential = localCredentials.find((cred) => cred.id === id)
    if (credential?.vault_id) {
      await sdk.removeFromVault(credential.vault_id, id)
    }
    setLocalCredentials((prev) => prev.filter((cred) => cred.id !== id))
  }

  const getCredential = (id: string) => {
    return localCredentials.find((cred) => cred.id === id)
  }

  const addToVault = async (vault: Vault, credential: CredentialWithId) => {
    await sdk.addToVault(vault.id, credential.id)
    setLocalCredentials((prev) => prev.filter((cred) => cred.id !== credential.id))
    await refetchVaults()
  }

  const removeFromVault = async (vaultId: string, credential: CredentialWithId) => {
    await sdk.removeFromVault(vaultId, credential.id)
    setLocalCredentials((prev) => {
      prev.push({
        ...credential,
        vault_id: null,
        vault: null,
      })
      return prev
    })
    await refetchVaults()
  }

  const addVault = async () => {
    const response = await sdk.createVault()
    if (response.error) {
      throw new Error(response.error.message)
    }
    setVault(response.data)
    localStorage.setItem(LOCAL_STORAGE_VAULT_KEY, JSON.stringify(response.data))
    await refetchVaults()
    return response.data
  }

  const deleteVault = async (vaultId: string) => {
    const response = await sdk.deleteVault(vaultId)
    if (response.error) {
      throw new Error(response.error.message)
    }

    if (response.data.success) {
      setVault(null)
      localStorage.removeItem(LOCAL_STORAGE_VAULT_KEY)
      await refetchVaults()
    }
  }

  const switchVault = (vault: Vault) => {
    setVault(vault)
    localStorage.setItem(LOCAL_STORAGE_VAULT_KEY, JSON.stringify(vault))
  }

  return (
    <CredentialsContext.Provider
      value={{
        localCredentials,
        credentials: localCredentials.concat(
          vaults?.flatMap((vault) => vault.credentials) ?? []
        ),
        delete: deleteCredential,
        get: getCredential,
        add: addCredential,
        addToVault,
        removeFromVault,
        switchVault,
        vaults: vaults ?? [],
        vault,
        addVault,
        deleteVault,
      }}
    >
      {children}
    </CredentialsContext.Provider>
  )
}

export const useCredentials = () => {
  const context = useContext(CredentialsContext)
  if (!context) {
    throw new Error('useCredentials must be used within an CredentialsProvider')
  }
  return context
}
