import { CompiledCircuit, type Noir as NoirType } from '@noir-lang/noir_js'
import type {
  UltraHonkBackend as UltraHonkBackendType,
  BarretenbergVerifier as BarretenbergVerifierType,
  ProofData as ProofDataType,
} from '@aztec/bb.js'

type ProverModules = {
  backend: UltraHonkBackendType
  noir: NoirType
}

type Verifier = {
  verifier: BarretenbergVerifierType
}

const resolveImports = async () => {
  const bbModule = await import('@aztec/bb.js')
  const noirModule = await import('@noir-lang/noir_js')
  
  return { 
    BarretenbergVerifier: bbModule.BarretenbergVerifier, 
    UltraHonkBackend: bbModule.UltraHonkBackend, 
    Noir: noirModule.Noir 
  }
}

let _initVerifier: Promise<Verifier> | null = null
const initVerifier = async () => {
  if (!_initVerifier) {
    console.time('initVerifier')
    _initVerifier = (async () => {
      const { BarretenbergVerifier } = await resolveImports()
      const verifier = new BarretenbergVerifier({ crsPath: process.env.TEMP_DIR })
      await verifier.instantiate()
      console.timeEnd('initVerifier')
      return { verifier }
    })()
  }
  return _initVerifier
}

const initProver = async (circuit: CompiledCircuit) => {
  const timerKey = `initProver_${Math.random().toString(36).slice(2)}`
  console.time(timerKey)
  const { UltraHonkBackend, Noir } = await resolveImports()
  const backend = new UltraHonkBackend(circuit.bytecode)
  await backend.instantiate()
  const noir = new Noir(circuit)
  console.timeEnd(timerKey)
  return {
    backend,
    noir,
  }
}

export abstract class Circuit {
  private verifierPromise: Promise<Verifier>
  private proverPromise: Promise<ProverModules>

  private circuit: CompiledCircuit
  private vkey: Uint8Array

  constructor(circuit: unknown, vkey: unknown) {
    this.circuit = circuit as CompiledCircuit
    this.vkey = vkey as Uint8Array
    this.proverPromise = initProver(this.circuit)
    this.verifierPromise = initVerifier()
  }

  async verify(proofData: ProofDataType) {
    const { verifier } = await this.verifierPromise

    const result = await verifier.verifyUltraHonkProof(proofData, this.vkey)

    return result
  }

  async generate(input: Record<string, any>) {
    const { backend, noir } = await this.proverPromise

    const { witness } = await noir.execute(input)

    return await backend.generateProof(witness)
  }

  abstract parseData(publicInputs: string[]): any
}
