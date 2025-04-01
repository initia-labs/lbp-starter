import ky from "ky"
import { z } from "zod"
import BigNumber from "bignumber.js"
import { useMemo } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MsgExecute } from "@initia/initia.proto/initia/move/v1/tx"
import { bcs, formatAmount, toAmount } from "@initia/utils"
import { useWallet } from "@initia/react-wallet-widget"
import { baseCoin, pair, quoteCoin, restUrl } from "../data/constants"
import { moveClient, useSpotPriceQuery } from "../data/rest"
import classes from "./Swap.module.css"

const formValuesSchema = z.object({
  quantity: z.number().positive(),
  slippagePercent: z.number().min(0).max(50),
})

type FormValues = z.infer<typeof formValuesSchema>

const Swap = () => {
  const { address, requestTx } = useWallet()

  const { register, handleSubmit, watch, formState } = useForm<FormValues>({
    defaultValues: { quantity: 0, slippagePercent: 0.5 },
    resolver: zodResolver(formValuesSchema),
  })

  const { quantity, slippagePercent } = watch()
  const { errors, disabled } = formState

  const { data: price } = useSpotPriceQuery()

  const { data: balances } = useQuery({
    queryKey: ["balances", address],
    queryFn: () => {
      return ky
        .get(`cosmos/bank/v1beta1/balances/${address}`, { prefixUrl: restUrl })
        .json<{ balances: { amount: string; denom: string }[] }>()
    },
    enabled: !!address,
    select: ({ balances }) => balances,
  })

  const balance = balances?.find((balance) => balance.denom === baseCoin.denom)?.amount ?? "0"

  const simulate = useQuery({
    queryKey: ["simulate", quantity],
    queryFn: async () => {
      const amount = toAmount(quantity, baseCoin.decimals)
      return moveClient.view<string>({
        moduleAddress: "0x1",
        moduleName: "dex",
        functionName: "get_swap_simulation",
        typeArgs: [],
        args: [
          bcs.address().serialize(pair).toBase64(),
          bcs.address().serialize(baseCoin.metadata).toBase64(),
          bcs.u64().serialize(amount).toBase64(),
        ],
      })
    },
    enabled: !!quantity,
    refetchInterval: 5000,
  })

  const { data: simulated = 0 } = simulate

  const minimumReceived = useMemo(
    () => BigNumber(simulated).times(BigNumber(100).minus(slippagePercent)).div(100).toFixed(0),
    [simulated, slippagePercent],
  )

  const swap = useMutation({
    mutationFn: async ({ quantity }: FormValues) => {
      const amount = toAmount(quantity, baseCoin.decimals)

      const message = {
        typeUrl: "/initia.move.v1.MsgExecute",
        value: MsgExecute.fromPartial({
          sender: address,
          moduleAddress: "0x1",
          moduleName: "dex",
          functionName: "swap_script",
          typeArgs: [],
          args: [
            bcs.address().serialize(pair).toBytes(),
            bcs.address().serialize(baseCoin.metadata).toBytes(),
            bcs.u64().serialize(amount).toBytes(),
            bcs.option(bcs.u64()).serialize(minimumReceived).toBytes(),
          ],
        }),
      }

      return requestTx({ messages: [message] })
    },
    onSuccess: (txhash) => {
      window.alert(`Transaction sent: ${txhash}`)
    },
    onError: (error) => {
      window.alert(`Transaction failed: ${error.message}`)
    },
  })

  return (
    <form onSubmit={handleSubmit((values) => swap.mutate(values))}>
      <h2 className={classes.title}>Swap</h2>

      <div>
        <div className={classes.field}>
          <label htmlFor="quantity">{baseCoin.symbol}</label>
          <input {...register("quantity", { valueAsNumber: true })} />
          <span>Balance: {formatAmount(balance, { decimals: baseCoin.decimals })}</span>
        </div>

        {errors.quantity && <p className={classes.error}>{errors.quantity.message}</p>}
      </div>

      <div>
        <div className={classes.field}>
          <label htmlFor="slippagePercent">Slippage (%)</label>
          <input {...register("slippagePercent", { valueAsNumber: true })} />
        </div>

        {errors.slippagePercent && (
          <p className={classes.error}>{errors.slippagePercent.message}</p>
        )}
      </div>

      <ul>
        <li>
          Current price: 1 {quoteCoin.symbol} = {price} {baseCoin.symbol}
        </li>

        <li>
          Simulated received: {formatAmount(simulated, { decimals: quoteCoin.decimals })}{" "}
          {quoteCoin.symbol}
        </li>

        <li>
          Minimum received: {formatAmount(minimumReceived, { decimals: quoteCoin.decimals })}{" "}
          {quoteCoin.symbol}
        </li>
      </ul>

      <button type="submit" disabled={simulate.isLoading || swap.isPending || disabled}>
        {simulate.isLoading ? "Simulating..." : swap.isPending ? "Swapping..." : "Swap"}
      </button>
    </form>
  )
}

export default Swap
