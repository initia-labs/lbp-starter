export interface ConfigResponse {
  weights: Weights
  swap_fee_rate: BigDecimal
}

interface Weights {
  weights_before: Weight
  weights_after: Weight
}

interface Weight {
  coin_a_weight: BigDecimal
  coin_b_weight: BigDecimal
  timestamp: u64
}

export interface PoolInfoResponse {
  coin_a_amount: u64
  coin_b_amount: u64
  total_share: u128
}

type BigDecimal = string
type u64 = string
type u128 = string

export interface GetLbpPricesResponse {
  prices: LbpPrice[]
}

export interface LbpPrice {
  timestamp: Date
  coin_a_price: number
  coin_b_price: number
}
