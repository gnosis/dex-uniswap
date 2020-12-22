import { createAction } from '@reduxjs/toolkit'
// import { ChainId } from '@uniswap/sdk'
import { ChainId } from 'xdai'
import { FeeInformation } from './reducer'

export const updateFee = createAction<{ token: string; fee: FeeInformation; chainId: ChainId }>('fee/updateFee')
export const clearFee = createAction<{ token: string; chainId: ChainId }>('fee/clearFee')
