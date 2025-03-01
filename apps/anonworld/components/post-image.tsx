import {
  Credential,
  CredentialType,
  Post,
  Token,
  formatAmount,
  formatHexId,
  toHexColors,
} from '@anonworld/common'
import { ReactNode } from 'react'

export function PostImage({ post }: { post: Post }) {
  const text = post.text
  const vaultId = post.credentials?.[0]?.vault_id
  const maxCredentials = 5 + (vaultId ? 1 : 0)

  const imageEmbed = post.embeds.find((embed) =>
    embed.metadata?.content_type?.startsWith('image')
  )

  return (
    <div
      style={{
        background: '#201424',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 32,
        fontFamily: 'Geist',
        color: 'white',
        gap: 32,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          marginRight: 100,
          gap: 16,
        }}
      >
        {vaultId && <VaultBadge vaultId={vaultId} />}
        {post.credentials.slice(0, maxCredentials).map((credential, i) => (
          <CredentialBadge key={i} credential={credential} />
        ))}
      </div>

      <img
        src="https://anon.world/logo.svg"
        alt="AnonWorld"
        height={100}
        width={100}
        style={{
          display: 'flex',
          position: 'absolute',
          top: 16,
          right: 32,
        }}
      />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#151515',
          borderColor: '#424242',
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 32,
        }}
      >
        {text && (
          <div
            style={{
              fontSize: 40,
              lineHeight: 1.4,
              fontWeight: 600,
              display: '-webkit-box',
              WebkitLineClamp: 5,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'pre-wrap',
            }}
          >
            {text}
          </div>
        )}
        {!text && imageEmbed && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src={imageEmbed.url}
              alt="Post"
              style={{
                height: '100%',
                aspectRatio:
                  (imageEmbed.metadata?.image?.width_px ?? 1) /
                  (imageEmbed.metadata?.image?.height_px ?? 1),
                borderRadius: 16,
              }}
            />
          </div>
        )}
      </div>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div />
        <DateBadge timestamp={post.timestamp} />
      </div>
    </div>
  )
}

function VaultBadge({ vaultId }: { vaultId: string }) {
  const id = formatHexId(vaultId)
  const { background, secondary } = toHexColors(id)
  return (
    <Badge
      image={
        <div
          style={{
            width: 40,
            height: 40,
            background: `linear-gradient(135deg, ${secondary}, ${background})`,
            borderRadius: 40,
          }}
        />
      }
    >
      {id}
    </Badge>
  )
}

function TokenImage({ token }: { token: Token }) {
  const { background, secondary } = toHexColors(token.address)

  if (token.image_url) {
    return (
      <img
        src={token.image_url}
        alt="Token"
        height={40}
        width={40}
        style={{ borderRadius: 40 }}
      />
    )
  }

  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 40,
        background: `linear-gradient(135deg, ${secondary}, ${background})`,
      }}
    />
  )
}

function CredentialBadge({ credential }: { credential: Credential & { token?: Token } }) {
  switch (credential.type) {
    case CredentialType.ERC20_BALANCE: {
      if (!credential.token) {
        return null
      }
      const amount =
        Number(BigInt(credential.metadata.balance)) / 10 ** credential.token.decimals
      return (
        <Badge
          image={<TokenImage token={credential.token} />}
        >{`${formatAmount(Number(amount))}+ ${credential.token.symbol}`}</Badge>
      )
    }
    case CredentialType.ERC721_BALANCE: {
      if (!credential.token) {
        return null
      }
      return (
        <Badge
          image={<TokenImage token={credential.token} />}
        >{`${credential.token.name} Holder`}</Badge>
      )
    }
    case CredentialType.FARCASTER_FID: {
      return (
        <Badge
          image={
            <img
              src="https://anoncast.org/farcaster.svg"
              alt="Farcaster"
              height={40}
              width={40}
              style={{ borderRadius: 40, filter: 'invert(1)' }}
            />
          }
        >{`< ${formatAmount(credential.metadata.fid)} FID`}</Badge>
      )
    }
    case CredentialType.NATIVE_BALANCE: {
      const amount = Number(BigInt(credential.metadata.balance)) / 10 ** 18
      return (
        <Badge
          image={
            <img
              src="https://chain-icons.s3.amazonaws.com/ethereum.png"
              alt="ETH"
              height={40}
              width={40}
              style={{ borderRadius: 40 }}
            />
          }
        >{`${formatAmount(Number(amount))}+ ETH`}</Badge>
      )
    }
    default:
      return null
  }
}

function DateBadge({ timestamp }: { timestamp: string }) {
  const date = new Date(timestamp)
  const formatted = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return <Badge>{formatted}</Badge>
}

function Badge({ children, image }: { children: ReactNode; image?: ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: '#191919',
        borderColor: '#494949',
        borderWidth: 1.5,
        borderRadius: 64,
        paddingRight: 16,
        paddingLeft: 16,
        height: 64,
        display: 'flex',
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
      }}
    >
      {image}
      <span style={{ fontSize: 32, color: 'white' }}>{children}</span>
    </div>
  )
}
