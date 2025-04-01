import example from "./example.json"

export interface PriceEntry {
  timestamp: string // ISO 8601 format
  coin_a_price: number
  coin_b_price: number
}

// Mock API call to fetch prices
export async function fetchPrices() {
  return new Promise<{ prices: PriceEntry[] }>((resolve) => {
    setTimeout(() => {
      resolve(example)
    }, 1000)
  })
}
