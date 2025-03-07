import { ContractType } from '@anonworld/common'
import { db } from '../db'
import { DBToken } from '../db/types'
import { redis } from './redis'
import { simplehash } from './simplehash'
import { zerion } from './zerion'
import { formatUnits, zeroAddress } from 'viem'

class TokensService {
  async getOrCreate({
    contractType,
    chainId,
    address,
  }: { contractType: string; chainId: number; address: string }) {
    switch (contractType as ContractType) {
      case ContractType.ERC20:
        return this.getOrCreateERC20(chainId, address)
      case ContractType.ERC721:
        return this.getOrCreateERC721(chainId, address)
    }
  }
  async getOrCreateERC20(chainId: number, tokenAddress: string) {
    // const token = await redis.getToken(chainId, tokenAddress)
    // if (token) return JSON.parse(token)
    return this.syncERC20(chainId, tokenAddress)
  }

  async syncERC20(chainId: number, tokenAddress: string) {
    const id = `${chainId}:${tokenAddress}`
    const token = await db.tokens.get(id)
    if (token) {
      if (token.type === ContractType.ERC721) {
        return await this.updateERC721(token)
      }
      return await this.updateERC20(token)
    }
    return await this.createERC20(chainId, tokenAddress)
  }

  async updateERC20(token: DBToken) {
    const zerionToken = await zerion.getFungible(token.chain_id, token.address)
    const simpleHashToken = await simplehash.getToken(token.chain_id, token.address)

    const totalSupply = Number.parseInt(
      formatUnits(
        BigInt(
          simpleHashToken?.supply ?? zerionToken?.attributes.market_data.total_supply ?? 0
        ),
        token.decimals
      )
    )

    const prices = [
      simpleHashToken?.prices?.[0]?.value_usd_string,
      zerionToken?.attributes.market_data.price?.toFixed(10),
      '0',
    ]

    for (const price of prices) {
      if (!price) continue

      const marketCap = totalSupply * Number(price)
      const fields = {
        price_usd: price,
        market_cap: Math.round(marketCap),
        total_supply: Math.round(totalSupply),
        holders: simpleHashToken?.holder_count ?? 0,
      }

      try {
        await db.tokens.update(token.id, fields)
      } catch (e) {
        continue
      }

      const result = {
        ...token,
        ...fields,
      }
      await redis.setToken(token.chain_id, token.address, JSON.stringify(result))

      return result
    }
  }

  async updateNative(token: DBToken) {
    const zerionToken = await zerion.getFungible(token.chain_id, token.address)

    const prices = [zerionToken?.attributes.market_data.price?.toFixed(10), '0']

    for (const price of prices) {
      if (!price) continue

      const marketCap = token.total_supply * Number(price)
      const fields = {
        price_usd: price,
        market_cap: Math.round(marketCap),
      }

      try {
        await db.tokens.update(token.id, fields)
      } catch (e) {
        continue
      }

      const result = {
        ...token,
        ...fields,
      }
      await redis.setToken(token.chain_id, token.address, JSON.stringify(result))

      return result
    }
  }

  async createERC20(chainId: number, tokenAddress: string) {
    const id = `${chainId}:${tokenAddress}`
    const zerionToken = await zerion.getFungible(chainId, tokenAddress)
    const simpleHashToken = await simplehash.getToken(chainId, tokenAddress)

    const impl = zerionToken.relationships.chain
      ? zerionToken.attributes.implementations.find(
          (i) =>
            i.chain_id === zerionToken.relationships.chain.data.id &&
            i.address === tokenAddress
        )
      : zerionToken.attributes.implementations[0]

    const token = {
      id: id.toLowerCase(),
      chain_id: chainId,
      address: tokenAddress.toLowerCase(),
      symbol: zerionToken.attributes.symbol,
      name: zerionToken.attributes.name,
      decimals: impl?.decimals ?? simpleHashToken?.decimals ?? 18,
      image_url: zerionToken.attributes.icon?.url,
      price_usd: zerionToken.attributes.market_data.price?.toFixed(8) ?? 0,
      market_cap: Math.round(zerionToken.attributes.market_data.market_cap ?? 0),
      total_supply: Math.round(zerionToken.attributes.market_data.total_supply ?? 0),
      holders: simpleHashToken?.holder_count ?? 0,
      balance_slot: 0,
      type: tokenAddress === zeroAddress ? 'NATIVE' : 'ERC20',
    }
    await db.tokens.create(token)
    await redis.setToken(chainId, tokenAddress, JSON.stringify(token))

    return token
  }

  async createNewERC20(args: {
    chainId: number
    address: string
    name: string
    symbol: string
    imageUrl: string
    platform: string
  }) {
    const id = `${args.chainId}:${args.address}`
    const token = {
      id: id.toLowerCase(),
      chain_id: args.chainId,
      address: args.address.toLowerCase(),
      symbol: args.symbol,
      name: args.name,
      decimals: 18,
      image_url: args.imageUrl,
      price_usd: '0',
      market_cap: 0,
      total_supply: 0,
      holders: 0,
      balance_slot: 0,
      type: ContractType.ERC20,
      platform: args.platform,
    }
    await db.tokens.create(token)
    await redis.setToken(args.chainId, args.address.toLowerCase(), JSON.stringify(token))
    return token
  }

  async getOrCreateERC721(chainId: number, tokenAddress: string) {
    const token = await redis.getToken(chainId, tokenAddress)
    if (token) return JSON.parse(token)
    return this.syncERC721(chainId, tokenAddress)
  }

  async syncERC721(chainId: number, tokenAddress: string) {
    const id = `${chainId}:${tokenAddress}`
    const token = await db.tokens.get(id)
    if (token) {
      await this.updateERC721(token)
    } else {
      await this.createERC721(chainId, tokenAddress)
    }
  }

  async updateERC721(token: DBToken) {
    const collection = await simplehash.getNFTCollection(token.chain_id, token.address)
    if (!collection) return

    let floorPrice = 0
    if (collection.floor_prices && collection.floor_prices.length > 0) {
      floorPrice = Math.min(
        ...collection.floor_prices.map((fp) => fp.value_usd_cents / 100)
      )
    } else {
      floorPrice = collection.top_bids[0]?.value_usd_cents ?? 0
    }

    const fields = {
      image_url: collection.image_url,
      price_usd: floorPrice.toFixed(8),
      market_cap: Math.round(floorPrice * collection.distinct_nft_count),
      holders: collection.distinct_owner_count,
      total_supply: collection.distinct_nft_count,
    }
    await db.tokens.update(token.id, fields)

    const result = {
      ...token,
      ...fields,
    }

    await redis.setToken(token.chain_id, token.address, JSON.stringify(result))

    return result
  }

  async createERC721(chainId: number, tokenAddress: string) {
    const id = `${chainId}:${tokenAddress}`
    const collection = await simplehash.getNFTCollection(chainId, tokenAddress)
    if (!collection) return

    let floorPrice = 0
    if (collection.floor_prices && collection.floor_prices.length > 0) {
      floorPrice = Math.min(
        ...collection.floor_prices.map((fp) => fp.value_usd_cents / 100)
      )
    }

    const token = {
      id: id.toLowerCase(),
      chain_id: chainId,
      address: tokenAddress.toLowerCase(),
      symbol: collection.top_contract_details[0]?.symbol ?? '',
      name: collection.name,
      decimals: 0,
      image_url: collection.image_url,
      price_usd: floorPrice.toFixed(8),
      market_cap: Math.round(floorPrice * collection.distinct_nft_count),
      total_supply: collection.distinct_nft_count,
      holders: collection.distinct_owner_count,
      type: tokenAddress === zeroAddress ? 'NATIVE' : 'ERC721',
    }
    await db.tokens.create(token)
    await redis.setToken(chainId, tokenAddress, JSON.stringify(token))

    return token
  }
}

export const tokens = new TokensService()
