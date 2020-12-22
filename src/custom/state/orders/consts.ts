// import { ChainId } from '@uniswap/sdk'
import { ChainId } from 'xdai'

// TODO: fill contract deploymentblocks
// to start checking for orders from that point
export const ContractDeploymentBlocks: Partial<Record<ChainId, number>> = {
  [ChainId.MAINNET]: 11469934,
  [ChainId.RINKEBY]: 7724701
}
