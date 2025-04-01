import { APIRequester, bcs, RESTClient } from '@initia/initia.js'
import { config } from './config'
import { EntityManager } from 'typeorm'
import { BalanceEntity } from './orm/entities'
import { dataSource } from './orm'
import { setTimeout } from 'timers/promises'
import { ConfigResponse, PoolInfoResponse } from './types'

export async function runFetchWorker() {
  const manager = dataSource.createEntityManager()

  // get syncedHeight
  const latestBalance = await manager
    .getRepository(BalanceEntity)
    .findOne({ where: {}, order: { timestamp: 'DESC' } })

  let syncedHeight =
    latestBalance === null ? undefined : Number(latestBalance.height)
  for (;;) {
    syncedHeight = await fetchData(manager, syncedHeight)
    await setTimeout(1000)
  }
}

async function fetchData(
  manager: EntityManager,
  syncedHeight?: number
): Promise<number | undefined> {
  try {
    if (syncedHeight === undefined) {
      syncedHeight =
        config.PAIR_CREATION_HEIGHT -
        (config.PAIR_CREATION_HEIGHT % config.HEIGHT_INTERVAL)
    }

    const fetchHeight = (syncedHeight += 100)
    const currentHeight = Number(
      (await config.rest.tendermint.blockInfo()).block.header.height
    )

    if (currentHeight < fetchHeight) return syncedHeight
    const timestamp = new Date(
      (await config.rest.tendermint.blockInfo(fetchHeight)).block.header.time
    )

    const rest = getRestWithHeight(fetchHeight)
    const poolInfo = await getPoolInfo(rest, config.PAIR_METADATA)
    const balancEntity: BalanceEntity = {
      height: fetchHeight.toString(),
      timestamp,
      coinABalance: poolInfo.coin_a_amount,
      coinBBalance: poolInfo.coin_b_amount,
    }

    await manager.getRepository(BalanceEntity).insert(balancEntity)

    return fetchHeight
  } catch (e) {
    console.log(e)
    return syncedHeight
  }
}

// help functions
export async function getConfig(pair: string): Promise<ConfigResponse> {
  return config.rest.move.viewFunction<ConfigResponse>(
    '0x1',
    'dex',
    'get_config',
    [],
    [bcs.object().serialize(pair).toBase64()]
  )
}

export async function getPoolInfo(
  rest: RESTClient,
  pair: string
): Promise<PoolInfoResponse> {
  return rest.move.viewFunction<PoolInfoResponse>(
    '0x1',
    'dex',
    'get_pool_info',
    [],
    [bcs.object().serialize(pair).toBase64()]
  )
}

export function getRestWithHeight(height: number): RESTClient {
  return new RESTClient(
    config.REST_URI,
    undefined,
    new APIRequester(config.REST_URI, {
      headers: {
        'x-cosmos-block-height': height,
      },
    })
  )
}
