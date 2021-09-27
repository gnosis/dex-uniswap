import { useMemo } from 'react'
import { isTransactionRecent, useAllTransactions } from 'state/transactions/hooks'
import { useOrder, useOrders } from 'state/orders/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { Order, OrderStatus } from 'state/orders/actions'
import { TransactionDetails } from 'state/transactions/reducer'
import { SupportedChainId as ChainId } from 'constants/chains'

export type TransactionAndOrder =
  | (Order & { addedTime: number })
  | (TransactionDetails & {
      id: string
      status: OrderStatus
    })

export enum ActivityType {
  ORDER = 'order',
  TX = 'tx',
}

export enum ActivityStatus {
  PENDING,
  CONFIRMED,
  EXPIRED,
  CANCELLING,
  CANCELLED,
}

enum TxReceiptStatus {
  PENDING,
  CONFIRMED,
}

function sortByDate(a: Order, b: Order): number {
  const dateA = new Date(a.creationTime)
  const dateB = new Date(b.creationTime)

  return dateA > dateB ? -1 : dateA < dateB ? 1 : 0
}
/**
 * useRecentActivity
 * @description returns all RECENT (last day) transaction and orders in 2 arrays: pending and confirmed
 */
export default function useRecentActivity() {
  const { chainId, account } = useActiveWeb3React()
  const allTransactions = useAllTransactions()
  const allNonEmptyOrders = useOrders({ chainId })

  const recentOrdersAdjusted = useMemo<TransactionAndOrder[]>(() => {
    if (!chainId || !account) {
      return []
    }
    return (
      allNonEmptyOrders
        // only show orders for connected account
        .filter((order) => order.owner.toLowerCase() === account.toLowerCase())
        .map((order) =>
          // we need to essentially match TransactionDetails type which uses "addedTime" for date checking
          // and time in MS vs ISO string as Orders uses
          ({
            ...order,
            addedTime: Date.parse(order.creationTime),
          })
        )
        .sort(sortByDate)
        // show at most 10 regular orders, and as much pending as there are
        .filter((order, index) => index < 10 || order.status === OrderStatus.PENDING)
    )
  }, [account, allNonEmptyOrders, chainId])

  const recentTransactionsAdjusted = useMemo<TransactionAndOrder[]>(
    () =>
      // Filter out any pending/fulfilled transactions OLDER than 1 day
      // and adjust order object to match Order id + status format
      // which is used later in app to render list of activity
      Object.values(allTransactions)
        .filter(isTransactionRecent)
        .filter((tx) => tx.from === account)
        .map((tx) => ({
          ...tx,
          // we need to adjust Transaction object and add "id" + "status" to match Orders type
          id: tx.hash,
          status: tx.receipt ? OrderStatus.FULFILLED : OrderStatus.PENDING,
        })),
    [account, allTransactions]
  )

  return useMemo(
    () =>
      // Concat together the TransactionDetails[] and Orders[]
      // then sort them by newest first
      recentTransactionsAdjusted.concat(recentOrdersAdjusted).sort((a, b) => b.addedTime - a.addedTime),
    [recentOrdersAdjusted, recentTransactionsAdjusted]
  )
}

interface ActivityDescriptors {
  activity: TransactionDetails | Order
  summary?: string
  status: ActivityStatus
  type: ActivityType
}

export function useActivityDescriptors({ chainId, id }: { chainId?: ChainId; id: string }): ActivityDescriptors | null {
  const allTransactions = useAllTransactions()
  const order = useOrder({ id, chainId })

  const tx = allTransactions?.[id]

  return useMemo(() => {
    if ((!tx && !order) || !chainId) return null

    let activity: TransactionDetails | Order, type: ActivityType

    let isPending: boolean, isConfirmed: boolean, isCancelling: boolean, isCancelled: boolean

    if (!tx && order) {
      // We're dealing with an ORDER
      // setup variables accordingly...
      isPending = order?.status === OrderStatus.PENDING
      isConfirmed = !isPending && order?.status === OrderStatus.FULFILLED
      isCancelling = (order.isCancelling || false) && isPending
      isCancelled = !isConfirmed && order?.status === OrderStatus.CANCELLED

      activity = order
      type = ActivityType.ORDER
    } else {
      // We're dealing with a TRANSACTION
      // setup variables accordingly...
      const isReceiptConfirmed =
        tx.receipt?.status === TxReceiptStatus.CONFIRMED || typeof tx.receipt?.status === 'undefined'
      isPending = !tx?.receipt
      isConfirmed = !isPending && isReceiptConfirmed
      // TODO: can't tell when it's cancelled from the network yet
      isCancelling = false
      isCancelled = false

      activity = tx
      type = ActivityType.TX
    }

    let status

    if (isCancelling) {
      status = ActivityStatus.CANCELLING
    } else if (isPending) {
      status = ActivityStatus.PENDING
    } else if (isConfirmed) {
      status = ActivityStatus.CONFIRMED
    } else if (isCancelled) {
      status = ActivityStatus.CANCELLED
    } else {
      status = ActivityStatus.EXPIRED
    }
    const summary = activity.summary

    return {
      activity,
      summary,
      status,
      type,
    }
  }, [chainId, order, tx])
}
