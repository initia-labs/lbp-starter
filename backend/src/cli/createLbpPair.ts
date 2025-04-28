import {
  AccAddress,
  bcs,
  EthPublicKey,
  MnemonicKey,
  MsgExecute,
  RESTClient,
  Wallet,
} from '@initia/initia.js'
import * as readline from 'readline'
import * as crypto from 'crypto'
import { config } from '../config'

async function main() {
  const rest = new RESTClient(config.REST_URI, {
    gasPrices: {
      uinit: 0.015,
    },
  })
  const chainId = await rest.tendermint.chainId()

  const networkInfo = {
    restUri: config.REST_URI,
    chainId,
  }
  console.log(
    `Network Information\n${JSON.stringify(networkInfo, undefined, 2)}\n`
  )

  const mnemonic = await question('> Enter your bip39 mnemonic\n')

  const key = new MnemonicKey({ mnemonic })
  const keyInfo = {
    bech32Address: key.accAddress,
    hexAddress: AccAddress.toHex(key.accAddress),
    publicKey: (key.publicKey as EthPublicKey).key,
    balances: (await rest.bank.balance(key.accAddress))[0].toData(),
  }
  console.log(`\nKey Information\n${JSON.stringify(keyInfo, undefined, 2)}\n`)

  let coinA = await question('> Enter coinA(denom or metadata)\n')
  coinA = parseCoinToMetadata(coinA)
  let coinB = await question('> Enter coinB(denom or metadata)\n')
  coinB = parseCoinToMetadata(coinB)

  const startTimestamp = Math.floor(
    new Date(
      await question('> Enter LBP start time in ISO string\n')
    ).valueOf() / 1000
  )
  const coinAStartWeight = Number(
    await question('> Enter coinA start weight (0.5 == 50%)\n')
  )
  if (coinAStartWeight > 1) {
    throw Error(`Percent can not be higer than 100%`)
  }
  if (coinAStartWeight.toString().split('.')[1]?.length > 6) {
    throw Error(`coinAStartWeight cannot have more than 6 decimal places`)
  }
  const coinBStartWeight = 1 - coinAStartWeight

  const endTimestamp = Math.floor(
    new Date(await question('> Enter LBP end time in ISO string\n')).valueOf() /
      1000
  )
  const coinAEndWeight = Number(
    await question('> Enter coinA end weight (0.5 == 50%)\n')
  )
  if (coinAEndWeight > 1) {
    throw Error(`Percent can not be higer than 100%`)
  }
  if (coinAEndWeight.toString().split('.')[1]?.length > 6) {
    throw Error(`coinAEndWeight cannot have more than 6 decimal places`)
  }
  const coinBEndWeight = 1 - coinAEndWeight

  const coinAAmount = BigInt(
    await question(
      '> Enter coinA amount (YOU CANNOT PROVIDE MORE COIN UNTIL LBP END) \n'
    )
  )
  const coinBAmount = BigInt(
    await question(
      '> Enter coinB amount (YOU CANNOT PROVIDE MORE COIN UNTIL LBP END)\n'
    )
  )

  const swapFeeRate = Number(
    await question('> Enter swap fee rate (0.003 == 0.3%)\n')
  )

  const name = await question('> Enter pair name\n')
  const symbol = await question('> Enter pair symbol\n')

  const msg = new MsgExecute(
    key.accAddress,
    '0x1',
    'dex',
    'create_lbp_pair_script',
    [],
    [
      bcs.string().serialize(name),
      bcs.string().serialize(symbol),
      bcs.bigdecimal().serialize(swapFeeRate),
      bcs.u64().serialize(startTimestamp),
      bcs.bigdecimal().serialize(coinAStartWeight.toFixed(6)),
      bcs.bigdecimal().serialize(coinBStartWeight.toFixed(6)),
      bcs.u64().serialize(endTimestamp),
      bcs.bigdecimal().serialize(coinAEndWeight.toFixed(6)),
      bcs.bigdecimal().serialize(coinBEndWeight.toFixed(6)),
      bcs.object().serialize(coinA),
      bcs.object().serialize(coinB),
      bcs.u64().serialize(coinAAmount),
      bcs.u64().serialize(coinBAmount),
    ].map((v) => v.toBase64())
  )

  const wallet = new Wallet(rest, key)
  const tx = await wallet.createAndSignTx({ msgs: [msg] })
  console.log('TX:\n' + JSON.stringify(tx.toData(), undefined, 2))
  const yesOrNo = await question('> Do you want to broadcast TX? [y/n] \n')
  if (yesOrNo.toLowerCase() !== 'y') {
    return
  }

  console.log(await rest.tx.broadcastSync(tx))
}

main()

function question(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise<string>((resolve, reject) => {
    rl.question(question, (res) => {
      rl.close()
      resolve(res)
    })
  })
}

function parseCoinToMetadata(coin: string): string {
  if (coin.startsWith('0x')) {
    return coin
  }

  if (coin.startsWith('move/')) {
    return '0x' + coin.slice(5)
  }

  return coinMetadata('0x1', coin)
}

export function coinMetadata(creator: string, symbol: string): string {
  const OBJECT_FROM_SEED_ADDRESS_SCHEME = 0xfe
  const addrBytes = bcs.address().serialize(creator).toBytes()
  const seed = Buffer.from(symbol, 'ascii')
  const hash = crypto.createHash('SHA3-256')
  const sum = hash
    .update(
      Buffer.from([...addrBytes, ...seed, OBJECT_FROM_SEED_ADDRESS_SCHEME])
    )
    .digest()
  return '0x' + Buffer.from(sum).toString('hex')
}
