import { base, CredentialType } from '@anonworld/common'
import { CredentialsManager } from '../..'
import { hashMessage } from 'viem'

const manager = new CredentialsManager()

const signature =
  '0x07813c43e688a5c60fb72c25eb0ad37ac2330db5091dc768424593e1d1fa944c44bc32d03b32e5ae83eaca369c8655a06641fa643c5766670d77c01b4075ddde1b'
const messageHash = hashMessage('test')
const address = '0xe4dd432fe405891ab0118760e3116e371188a1eb'

async function main() {
  const verifier = manager.getVerifier(CredentialType.NATIVE_BALANCE)

  const { input } = await verifier.buildInput({
    address,
    chainId: base.id,
    verifiedBalance: BigInt(1_000_000_000),
    balanceSlot: 0,
  })

  console.time('generateProof')
  const proof = await verifier.generateProof({
    ...input,
    signature,
    messageHash,
  })
  console.timeEnd('generateProof')

  console.time('verifyProof')
  const verified = await verifier.verifyProof({
    proof: Uint8Array.from(proof.proof),
    publicInputs: proof.publicInputs,
  })
  console.timeEnd('verifyProof')

  const data = verifier.parseData(proof.publicInputs)

  console.log({
    verified,
    proof,
    data,
  })
}

main()
  .catch(console.error)
  .finally(() => process.exit(0))
