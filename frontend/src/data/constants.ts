export const restUrl = "https://rest.testnet.initia.xyz"

export const pair = "0xf9bf6fe0e4e060135704917866bd35889ac7898c45bf0416b354acdc2205fc6e"

export interface PairCoin {
  denom: string
  metadata: string
  symbol: string
  decimals: number
}

export const coinA: PairCoin = {
  denom: "utia",
  metadata: "0xacceb3b245392afe08346b794cf5c4ff85e7e9a8c82fcaf5112ae9d64ba57ccb",
  symbol: "TIA",
  decimals: 6,
}

export const coinB: PairCoin = {
  denom: "uinit",
  metadata: "0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9",
  symbol: "INIT",
  decimals: 6,
}

export const baseCoin = coinB
export const quoteCoin = coinA
