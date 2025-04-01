import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WalletWidgetProvider } from "@initia/react-wallet-widget"
import App from "./app/App"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <WalletWidgetProvider
        registryUrl="https://registry.testnet.initia.xyz"
        apiUrl="https://api.testnet.initia.xyz"
        dexApiUrl="https://dex-api.testnet.initia.xyz"
        explorerUrl="https://scan.testnet.initia.xyz"
        swaplistUrl="https://list.testnet.initia.xyz/pairs.json"
        modules={{
          usernames: "0x42cd8467b1c86e59bf319e5664a09b6b5840bb3fac64f5ce690b5041c530565a",
          dex_utils: "0x42cd8467b1c86e59bf319e5664a09b6b5840bb3fac64f5ce690b5041c530565a",
          swap_transfer: "0x42cd8467b1c86e59bf319e5664a09b6b5840bb3fac64f5ce690b5041c530565a",
        }}
      >
        <App />
      </WalletWidgetProvider>
    </QueryClientProvider>
  </StrictMode>,
)
