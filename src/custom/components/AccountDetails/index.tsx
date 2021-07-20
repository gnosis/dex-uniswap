import React, {
  useCallback,
  // useContext
} from 'react'
import { batch, useDispatch } from 'react-redux'
// import { ThemeContext } from 'styled-components'
import { useActiveWeb3React } from 'hooks/web3'
import { AppDispatch } from 'state'
import { clearAllTransactions } from 'state/transactions/actions'
import { getExplorerLabel, shortenAddress } from 'utils'
// import { AutoRow } from 'components/Row'
import Copy, { CopyIcon } from 'components/AccountDetails/Copy'
import styled from 'styled-components'

import { SUPPORTED_WALLETS } from 'constants/index'
import { getEtherscanLink } from 'utils'
import { injected, walletconnect, walletlink, fortmatic, portis, WalletProvider } from 'connectors'
import CoinbaseWalletIcon from 'assets/images/coinbaseWalletIcon.svg'
import WalletConnectIcon from 'assets/images/walletConnectIcon.svg'
import FortmaticIcon from 'assets/images/fortmaticIcon.png'
import PortisIcon from 'assets/images/portisIcon.png'
import Identicon from 'components/Identicon'
import { ExternalLink as LinkIcon } from 'react-feather'
import {
  LinkStyledButton,
  // TYPE
} from 'theme'
import { clearOrders } from 'state/orders/actions'
import {
  WalletName,
  MainWalletAction,
  // AccountDetailsProps,
  UpperSection,
  CloseIcon as CloseIconMod,
  CloseColor,
  // HeaderRow,
  AccountSection as AccountSectionMod,
  YourAccount,
  InfoCard as InfoCardMod,
  AccountGroupingRow,
  WalletAction,
  AccountControl,
  AddressLink,
  // LowerSection,
  IconWrapper,
  renderTransactions,
  TransactionListWrapper,
} from './AccountDetailsMod'
import { ConnectedWalletInfo, useWalletInfo } from 'hooks/useWalletInfo'
import { MouseoverTooltip } from 'components/Tooltip'
import { OrdersPanelProps } from 'components/OrdersPanel'

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  color: ${({ theme }) => theme.text1};
  padding: 0;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 42px 0 0;`};

  ${WalletName},
  ${AddressLink},
  ${CopyIcon} {
    color: ${({ theme }) => theme.text1};
  }

  ${TransactionListWrapper} {
    padding: 0;
  }
`

const InfoCard = styled(InfoCardMod)`
  margin-bottom: 10px;
`

const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 1rem 1rem;
  font-weight: 500;
  color: ${(props) => (props.color === 'blue' ? ({ theme }) => theme.primary1 : 'inherit')};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `};
`

const AccountSection = styled(AccountSectionMod)`
  padding: 0;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0;`};
`

const NoActivityMessage = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
  width: 100%;
  padding: 24px 0 0;
  text-align: center;
  display: flex;
  justify-content: center;
`

const LowerSection = styled.div`
  flex-grow: 1;
  background-color: ${({ theme }) => theme.bg2};
  border-radius: 0;
  height: max-content;
  min-height: 100%;
  padding: 0 0 100px;

  > span {
    display: flex;
    justify-content: space-between;
    padding: 8px 16px;
    border-bottom: 1px solid #d9e8ef;
    position: sticky;
    top: 0;
    background: rgb(255 255 255 / 60%);
    backdrop-filter: blur(5px);
    z-index: 10;

    ${({ theme }) => theme.mediaWidth.upToMedium`
      top: 42px;
    `};
  }

  > div {
    display: flex;
    flex-flow: column wrap;
    padding: 0;
  }

  h5 {
    margin: 0;
    font-weight: 500;
    color: ${({ theme }) => theme.text2};
    line-height: 1;
    display: flex;
    align-items: center;

    > span {
      opacity: 0.6;
      margin: 0 0 0 4px;
    }
  }

  ${LinkStyledButton} {
    text-decoration: underline;
  }
`

const CloseIcon = styled(CloseIconMod)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
    top: 0;
    z-index: 99999;
    position: fixed;
    left: 0;
    right: initial;
    background: ${({ theme }) => theme.bg1};
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 42px;
    backdrop-filter: blur(5px);
  `};
`

type AbstractConnector = Pick<ReturnType<typeof useActiveWeb3React>, 'connector'>['connector']

function getWalletName(connector?: AbstractConnector): string {
  const { ethereum } = window
  const isMetaMask = !!(ethereum && ethereum.isMetaMask)

  const walletTuple = Object.entries(SUPPORTED_WALLETS).filter(
    ([walletType, { connector: walletConnector }]) =>
      walletConnector === connector && (connector !== injected || isMetaMask === (walletType === 'METAMASK'))
  )
  return walletTuple[0]?.[1]?.name || 'Unknown wallet'
}

export function formatConnectorName(connector?: AbstractConnector, walletInfo?: ConnectedWalletInfo) {
  const name = walletInfo?.walletName || getWalletName(connector)
  // In case the wallet is connected via WalletConnect and has wallet name set, add the suffix to be clear
  // This to avoid confusion for instance when using Metamask mobile
  // When name is not set, it defaults to WalletConnect already
  const walletConnectSuffix =
    walletInfo?.provider === WalletProvider.WALLET_CONNECT && walletInfo?.walletName ? ' (via WalletConnect)' : ''

  return (
    <WalletName>
      Connected with {name}
      {walletConnectSuffix}
    </WalletName>
  )
}

export function getStatusIcon(connector?: AbstractConnector, walletInfo?: ConnectedWalletInfo) {
  if (walletInfo && !walletInfo.isSupportedWallet) {
    /* eslint-disable jsx-a11y/accessible-emoji */
    return (
      <MouseoverTooltip text="This wallet is not yet supported">
        <IconWrapper role="img" aria-label="Warning sign. Wallet not supported">
          ⚠️
        </IconWrapper>
      </MouseoverTooltip>
    )
    /* eslint-enable jsx-a11y/accessible-emoji */
  } else if (walletInfo?.icon) {
    return (
      <IconWrapper size={16}>
        <img src={walletInfo.icon} alt={`${walletInfo?.walletName || 'wallet'} logo`} />
      </IconWrapper>
    )
  } else if (connector === injected) {
    return (
      <IconWrapper size={16}>
        <Identicon />
      </IconWrapper>
    )
  } else if (connector === walletconnect) {
    return (
      <IconWrapper size={16}>
        <img src={WalletConnectIcon} alt={'wallet connect logo'} />
      </IconWrapper>
    )
  } else if (connector === walletlink) {
    return (
      <IconWrapper size={16}>
        <img src={CoinbaseWalletIcon} alt={'coinbase wallet logo'} />
      </IconWrapper>
    )
  } else if (connector === fortmatic) {
    return (
      <IconWrapper size={16}>
        <img src={FortmaticIcon} alt={'fortmatic logo'} />
      </IconWrapper>
    )
  } else if (connector === portis) {
    return (
      <>
        <IconWrapper size={16}>
          <img src={PortisIcon} alt={'portis logo'} />
          <MainWalletAction
            onClick={() => {
              portis.portis.showPortis()
            }}
          >
            Show Portis
          </MainWalletAction>
        </IconWrapper>
      </>
    )
  }
  return null
}
interface AccountDetailsProps {
  pendingTransactions: string[]
  confirmedTransactions: string[]
  ENSName?: string
  openOptions: () => void
}

export default function AccountDetails({
  pendingTransactions,
  confirmedTransactions,
  ENSName,
  openOptions,
  setOrdersPanelOpen,
}: AccountDetailsProps & Pick<OrdersPanelProps, 'setOrdersPanelOpen'>) {
  const { chainId, account, connector } = useActiveWeb3React()
  const walletInfo = useWalletInfo()
  // const theme = useContext(ThemeContext)
  const dispatch = useDispatch<AppDispatch>()

  const clearAllActivityCallback = useCallback(() => {
    if (chainId) {
      batch(() => {
        dispatch(clearAllTransactions({ chainId }))
        dispatch(clearOrders({ chainId }))
      })
    }
  }, [dispatch, chainId])
  const explorerLabel = chainId && account ? getExplorerLabel(chainId, account, 'address') : undefined

  const activityTotalCount = pendingTransactions?.length + confirmedTransactions?.length || null

  return (
    <Wrapper>
      <UpperSection>
        <CloseIcon onClick={() => setOrdersPanelOpen(false)}>
          <CloseColor />
        </CloseIcon>
        <HeaderRow>Account</HeaderRow>
        <AccountSection>
          <YourAccount>
            <InfoCard>
              <AccountGroupingRow>
                {formatConnectorName(connector, walletInfo)}
                <div>
                  {/* connector !== injected && connector !== walletlink && (
                    <WalletAction
                      style={{ fontSize: '.825rem', fontWeight: 400, marginRight: '8px' }}
                      onClick={() => {
                        ;(connector as any).close()
                      }}
                    >
                      Disconnect
                    </WalletAction>
                  ) */}
                  <WalletAction
                    style={{ fontSize: '.825rem', fontWeight: 400 }}
                    onClick={() => {
                      openOptions()
                    }}
                  >
                    Change
                  </WalletAction>
                </div>
              </AccountGroupingRow>
              <AccountGroupingRow id="web3-account-identifier-row">
                <AccountControl>
                  {ENSName ? (
                    <>
                      <div>
                        {getStatusIcon(connector, walletInfo)}
                        <p> {ENSName}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        {getStatusIcon(connector, walletInfo)}
                        <p> {account && shortenAddress(account)}</p>
                      </div>
                    </>
                  )}
                </AccountControl>
              </AccountGroupingRow>
              <AccountGroupingRow>
                {ENSName ? (
                  <>
                    <AccountControl>
                      <div>
                        {account && (
                          <Copy toCopy={account}>
                            <span style={{ marginLeft: '4px' }}>Copy Address</span>
                          </Copy>
                        )}
                        {chainId && account && (
                          <AddressLink
                            hasENS={!!ENSName}
                            isENS={true}
                            href={getEtherscanLink(chainId, ENSName, 'address')}
                          >
                            <LinkIcon size={16} />
                            <span style={{ marginLeft: '4px' }}>{explorerLabel}</span>
                          </AddressLink>
                        )}
                      </div>
                    </AccountControl>
                  </>
                ) : (
                  <>
                    <AccountControl>
                      <div>
                        {account && (
                          <Copy toCopy={account}>
                            <span style={{ marginLeft: '4px' }}>Copy Address</span>
                          </Copy>
                        )}
                        {chainId && account && (
                          <AddressLink
                            hasENS={!!ENSName}
                            isENS={false}
                            href={getEtherscanLink(chainId, account, 'address')}
                          >
                            <LinkIcon size={16} />
                            <span style={{ marginLeft: '4px' }}>{explorerLabel}</span>
                          </AddressLink>
                        )}
                      </div>
                    </AccountControl>
                  </>
                )}
              </AccountGroupingRow>
            </InfoCard>
          </YourAccount>
        </AccountSection>
      </UpperSection>
      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <LowerSection>
          <span>
            {' '}
            <h5>
              Recent Activity <span>{`(${activityTotalCount})`}</span>
            </h5>
            <LinkStyledButton onClick={clearAllActivityCallback}>Clear activity</LinkStyledButton>
          </span>

          <div>
            {renderTransactions(pendingTransactions)}
            {renderTransactions(confirmedTransactions)}
          </div>
        </LowerSection>
      ) : (
        <LowerSection>
          <NoActivityMessage>Your orders activity will appear here...</NoActivityMessage>
        </LowerSection>
      )}
    </Wrapper>
  )
}
