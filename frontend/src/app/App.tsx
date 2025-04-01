import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import AppHeader from "./AppHeader"
import PriceGraph from "./PriceGraph"
import Swap from "./Swap"
import classes from "./App.module.css"

const App = () => {
  return (
    <>
      <AppHeader />

      <div className={classes.container}>
        <ErrorBoundary fallbackRender={({ error }) => error.message}>
          <Suspense>
            <PriceGraph />
          </Suspense>
        </ErrorBoundary>

        <Swap />
      </div>
    </>
  )
}

export default App
