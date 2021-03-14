import React, { useCallback } from 'react'

import { ImportList as ImportListMod } from './ImportListMod'
import { enableList as enableListMod, removeList as removeListMod } from 'state/lists/actions'
import { TokenList } from '@uniswap/token-lists'
import { CurrencyModalView } from '@src/components/SearchModal/CurrencySearchModal'
import { useActiveWeb3React } from '@src/hooks'
import { DEFAULT_NETWORK_FOR_LISTS } from '@src/custom/constants/lists'
import { useDispatch } from 'react-redux'

export interface ImportProps {
  listURL: string
  list: TokenList
  onDismiss: () => void
  setModalView: (view: CurrencyModalView) => void
  enableList?: (url: string) => ReturnType<typeof enableListMod>
  removeList?: (url: string) => ReturnType<typeof removeListMod>
}

export function ImportList(props: ImportProps) {
  const { chainId = DEFAULT_NETWORK_FOR_LISTS } = useActiveWeb3React()
  const dispatch = useDispatch()

  // wrap actions in dispatch and pass new 'chainId' prop here to avoid changing in children
  const enableList = useCallback((url: string) => dispatch(enableListMod({ url, chainId })), [chainId, dispatch])
  const removeList = useCallback((url: string) => dispatch(removeListMod({ url, chainId })), [chainId, dispatch])

  return <ImportListMod {...props} enableList={enableList} removeList={removeList} />
}
