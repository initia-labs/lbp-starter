import { config } from './config'
import { getConfig, runFetchWorker } from './fetchBalances'
import { getPrices } from './getPrices'
import { initConnection } from './orm'
import express, { Request, Response } from 'express'

const lengthAllow = [100, 300, 500]

async function main() {
  await initConnection()
  runFetchWorker()

  const app = express()
  const port = config.PORT
  const pairConfig = await getConfig(config.PAIR_METADATA)

  app.use(express.json())

  app.get('/prices', async (req: Request, res: Response) => {
    const limit = parseInt((req.query.length as string | undefined) ?? '100')
    if (lengthAllow.indexOf(limit) === -1) {
      res
        .status(400)
        .json({ error: `Limit must be one of ${lengthAllow.join(', ')}` })
    } else {
      res.json(await getPrices(pairConfig, limit))
    }
  })

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
  })
}

main()
