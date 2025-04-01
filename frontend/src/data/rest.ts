import { useQuery } from "@tanstack/react-query"
import { bcs, createInitiaMoveClient } from "@initia/utils"
import { pair, quoteCoin, restUrl } from "./constants"

export const moveClient = createInitiaMoveClient(restUrl)

export function getSpotPrice() {
  return moveClient.view<string>({
    moduleAddress: "0x1",
    moduleName: "dex",
    functionName: "get_spot_price",
    typeArgs: [],
    args: [
      bcs.object().serialize(pair).toBase64(),
      bcs.object().serialize(quoteCoin.metadata).toBase64(),
    ],
  })
}

export function useSpotPriceQuery() {
  return useQuery({
    queryKey: ["spotPrice"],
    queryFn: getSpotPrice,
    refetchInterval: 5000,
  })
}
