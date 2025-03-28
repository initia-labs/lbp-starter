import { config } from './config'
import { getPoolInfo } from './fetchBalances'
import { setTimeout } from 'timers/promises'
import { ConfigResponse, GetLbpPricesResponse, LbpPrice } from './types'
import { EntityManager, LessThanOrEqual } from 'typeorm'
import { BalanceEntity, dataSource } from './orm'

const caches: Record<number, Record<number, LbpPrice>> = {} // limit > timestamp > price
const BALANCE_CACHE_TTL = 5000 // 5 secs
let currentBalance: {
  updateTimestamp: number
  coinABalance: bigint
  coinBBalance: bigint
  updating: boolean
} = { updateTimestamp: 0, coinABalance: 0n, coinBBalance: 0n, updating: false }

export async function getPrices(
  pairConfig: ConfigResponse,
  limit: number
): Promise<GetLbpPricesResponse> {
  // check cached records

  const timestamps = new Array(limit)
    .fill(0)
    .map(
      (_, i) =>
        new Date(
          Number(pairConfig.weights.weights_before.timestamp) * 1000 +
            ((Number(pairConfig.weights.weights_after.timestamp) -
              Number(pairConfig.weights.weights_before.timestamp)) /
              (limit - 1)) *
              1000 *
              i
        )
    )

  const manager = dataSource.createEntityManager()
  const latestBalance = await manager
    .getRepository(BalanceEntity)
    .findOne({ where: {}, order: { timestamp: 'DESC' } })
  const [balanceA, balanceB] = await requestBalances()
  const syncedTimestamp = latestBalance ? latestBalance.timestamp.valueOf() : 0
  const prices: LbpPrice[] = await Promise.all(
    timestamps.map((timestamp) =>
      getPrice(
        manager,
        timestamp.valueOf(),
        syncedTimestamp,
        pairConfig,
        balanceA,
        balanceB,
        limit
      )
    )
  )

  return { prices }
}

export async function updateBalance() {
  const poolInfo = await getPoolInfo(config.rest, config.PAIR_METADATA)
  currentBalance.updateTimestamp = Date.now()
  currentBalance.coinABalance = BigInt(poolInfo.coin_a_amount)
  currentBalance.coinBBalance = BigInt(poolInfo.coin_b_amount)
}

async function getPrice(
  manager: EntityManager,
  timestamp: number,
  syncedTimestamp: number,
  pairConfig: ConfigResponse,
  coinABalance: bigint,
  coinBBalance: bigint,
  limit: number
): Promise<LbpPrice> {
  // get future price
  if (syncedTimestamp < timestamp) {
    return calcPrice(timestamp, pairConfig, coinABalance, coinBBalance)
  }

  if (caches[limit] === undefined) {
    caches[limit] = {}
  }

  // if has cache return cached data
  if (caches[limit][timestamp]) {
    return caches[limit][timestamp]
  }

  // get balace just before timestamp
  const repo = manager.getRepository(BalanceEntity)
  const balances = await repo.findOne({
    where: { timestamp: LessThanOrEqual(new Date(timestamp)) },
    order: { timestamp: 'DESC' },
  })

  // no data

  const price =
    balances === null
      ? { timestamp: new Date(timestamp), coin_a_price: 0, coin_b_price: 0 }
      : calcPrice(
          timestamp,
          pairConfig,
          BigInt(balances.coinABalance),
          BigInt(balances.coinBBalance)
        )

  caches[limit][timestamp] = price

  return price
}

function calcPrice(
  timestamp: number,
  pairConfig: ConfigResponse,
  coinABalance: bigint,
  coinBBalance: bigint
): LbpPrice {
  const beforeTs = Number(pairConfig.weights.weights_before.timestamp) * 1000
  const afterTs = Number(pairConfig.weights.weights_after.timestamp) * 1000
  const lbpDuration = afterTs - beforeTs
  const gradientA =
    (Number(pairConfig.weights.weights_after.coin_a_weight) -
      Number(pairConfig.weights.weights_before.coin_a_weight)) /
    lbpDuration
  const gradientB =
    (Number(pairConfig.weights.weights_after.coin_b_weight) -
      Number(pairConfig.weights.weights_before.coin_b_weight)) /
    lbpDuration
  const timeDiff = timestamp - beforeTs

  const [weightA, weightB] =
    timestamp <= beforeTs
      ? [
          Number(pairConfig.weights.weights_before.coin_a_weight),
          Number(pairConfig.weights.weights_before.coin_b_weight),
        ]
      : timestamp >= afterTs
        ? [
            Number(pairConfig.weights.weights_after.coin_a_weight),
            Number(pairConfig.weights.weights_after.coin_b_weight),
          ]
        : [
            Number(pairConfig.weights.weights_before.coin_a_weight) +
              timeDiff * gradientA,
            Number(pairConfig.weights.weights_before.coin_b_weight) +
              timeDiff * gradientB,
          ]

  return {
    timestamp: new Date(timestamp),
    coin_a_price:
      (Number(coinBBalance) * weightA) / Number(coinABalance) / weightB,
    coin_b_price:
      (Number(coinABalance) * weightB) / Number(coinBBalance) / weightA,
  }
}

async function requestBalances(): Promise<[bigint, bigint]> {
  const updateTimestamp = currentBalance.updateTimestamp
  // not stale
  if (updateTimestamp + BALANCE_CACHE_TTL > Date.now()) {
    return [currentBalance.coinABalance, currentBalance.coinBBalance]
  }

  // need update
  if (
    updateTimestamp + BALANCE_CACHE_TTL < Date.now() &&
    !currentBalance.updating
  ) {
    currentBalance.updating = true
    try {
      await updateBalance()
      currentBalance.updateTimestamp = Date.now()
    } catch (e) {
      console.log(e)
    } finally {
      currentBalance.updating = false
    }
    return [currentBalance.coinABalance, currentBalance.coinBBalance]
  }

  // need to wait update
  const waitInterval = 100
  let waitTotal = 0
  for (;;) {
    if (updateTimestamp !== currentBalance.updateTimestamp) break
    if (waitInterval > BALANCE_CACHE_TTL) {
      currentBalance.updating = false
      break
    }
    await setTimeout(waitInterval)
    waitTotal += waitInterval
  }

  return [currentBalance.coinABalance, currentBalance.coinBBalance]
}
