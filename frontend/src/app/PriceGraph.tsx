import { useSuspenseQuery } from "@tanstack/react-query"
import { Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"
import { baseCoin, coinA } from "../data/constants"
import { fetchPrices } from "../data/api"

const PriceGraph = () => {
  const { data } = useSuspenseQuery({
    queryKey: ["prices"],
    queryFn: fetchPrices,
    select: ({ prices }) => {
      const priceKey = coinA.denom === baseCoin.denom ? "coin_b_price" : "coin_a_price"
      return prices.map(({ timestamp, [priceKey]: value }) => {
        return { date: new Date(timestamp).getTime(), value }
      })
    },
  })

  return (
    <LineChart width={600} height={400} data={data}>
      <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleString()} />
      <YAxis />
      <Line type="monotone" dataKey="value" stroke="#8884d8" />
      <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
    </LineChart>
  )
}

export default PriceGraph
