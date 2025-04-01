import { useWallet } from "@initia/react-wallet-widget"
import { truncate } from "@initia/utils"
import classes from "./AppHeader.module.css"

const AppHeader = () => {
  const { address, onboard, view } = useWallet()

  return (
    <div className={classes.header}>
      <h1>LBP</h1>

      <div className={classes.wallet}>
        {address ? (
          <button onClick={view}>{truncate(address)}</button>
        ) : (
          <button onClick={onboard}>Connect wallet</button>
        )}
      </div>
    </div>
  )
}

export default AppHeader
