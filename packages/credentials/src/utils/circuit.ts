import { CompiledCircuit, type Noir } from '@noir-lang/noir_js'
import { UltraHonkBackend, BarretenbergVerifier, ProofData } from '@aztec/bb.js'

type ProverModules = {
  backend: UltraHonkBackend
  noir: Noir
}

type Verifier = {
  verifier: BarretenbergVerifier
}

let _initVerifier: Promise<Verifier> | null = null
export const initVerifier = async () => {
  if (!_initVerifier) {
    _initVerifier = (async () => {
      const { BarretenbergVerifier } = await import('@aztec/bb.js')
      const verifier = new BarretenbergVerifier({ crsPath: process.env.TEMP_DIR })
      await verifier.instantiate()
      return { verifier }
    })()
  }
  return _initVerifier
}

export abstract class Circuit {
  private proverPromise: Promise<ProverModules> | null = null

  private circuit: CompiledCircuit
  private vkey: Uint8Array

  constructor(circuit: unknown, vkey: unknown) {
    this.circuit = circuit as CompiledCircuit
    this.vkey = vkey as Uint8Array
  }

  async initProver(): Promise<ProverModules> {
    if (!this.proverPromise) {
      this.proverPromise = (async () => {
        const [{ Noir }, { UltraHonkBackend }] = await Promise.all([
          import('@noir-lang/noir_js'),
          import('@aztec/bb.js'),
        ])
        const backend = new UltraHonkBackend(this.circuit.bytecode)
        await backend.instantiate()
        const noir = new Noir(this.circuit)
        return {
          backend,
          noir,
        }
      })()
    }
    return this.proverPromise
  }

  async verify(proofData: ProofData) {
    const { verifier } = await initVerifier()

    const result = await verifier.verifyUltraHonkProof(proofData, this.vkey)

    return result
  }

  async generate(input: Record<string, any>) {
    const { backend, noir } = await this.initProver()

    const { witness } = await noir.execute(input)

    return await backend.generateProof(witness)
  }

  abstract parseData(publicInputs: string[]): any
}
