import WalletConnectProvider from '@walletconnect/web3-provider'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { useWeb3React } from '@web3-react/core'
import useENSName from '@src/hooks/useENSName'
import { useEffect, useState } from 'react'
import { NetworkContextName } from 'constants/index'
import { getProviderType, WalletProvider } from 'connectors'

export interface ConnectedWalletInfo {
  active: boolean
  account?: string | null
  activeNetwork: boolean // active default connection
  provider?: WalletProvider
  isSmartContractWallet: boolean
  walletName?: string
  ensName?: string
  icon?: string
  isSupportedWallet: boolean
}

async function getWcPeerMetadata(connector: WalletConnectConnector): Promise<{ walletName?: string; icon?: string }> {
  const provider = (await connector.getProvider()) as WalletConnectProvider
  console.log('Meta: ', provider.walletMeta)

  const meta = provider.walletMeta
  if (meta) {
    return {
      walletName: meta.name,
      icon: meta.icons.length > 0 ? meta.icons[0] : undefined
    }
  } else {
    return { walletName: undefined, icon: undefined }
  }
}

export function useWalletInfo(): ConnectedWalletInfo {
  const { active, account, connector } = useWeb3React()
  const [walletName, setWalletName] = useState<string>()
  const [icon, setIcon] = useState<string>()
  // const [isSupportedWallet, setIsSupportedWallet] = useState(false)
  const [provider, setProvider] = useState<WalletProvider>()
  const contextNetwork = useWeb3React(NetworkContextName)
  const { ENSName } = useENSName(account ?? undefined)

  useEffect(() => {
    // Set the current provider
    setProvider(getProviderType(connector))

    // If the connector is wallet connect, try to get the wallet name and icon
    if (connector instanceof WalletConnectConnector) {
      getWcPeerMetadata(connector).then(({ walletName, icon }) => {
        setWalletName(walletName)
        setIcon(icon)
      })
    }
  }, [connector])

  return {
    active,
    account,
    activeNetwork: contextNetwork.active,
    provider,
    isSmartContractWallet: false, // TODO: Check if the connected address has some code associated
    walletName,
    icon,
    ensName: ENSName || undefined,
    isSupportedWallet: true // TODO: We can do test of all wallets using WC, and see the ones we can support
  }
}
