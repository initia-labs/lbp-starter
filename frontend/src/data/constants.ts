export const restUrl = "https://rest.testnet.initia.xyz"

export const pair = "0x7c4b0843e2544ec4e09f459a24edee3172f84f7a07a1fd78c49cd1fa4bd14d87"

export interface PairCoin {
  denom: string
  metadata: string
  symbol: string
  decimals: number
}

export const coinA: PairCoin = {
  denom: "uinit",
  metadata: "0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9",
  symbol: "INIT",
  decimals: 6,
}

export const coinB: PairCoin = {
  denom: "utia",
  metadata: "0xacceb3b245392afe08346b794cf5c4ff85e7e9a8c82fcaf5112ae9d64ba57ccb",
  symbol: "TIA",
  decimals: 6,
}

export const baseCoin = coinA
export const quoteCoin = coinB
