import { RESTClient } from '@initia/initia.js'
import 'dotenv/config'

export const config = {
  REST_URI: getEnv('REST_URI'),
  HEIGHT_INTERVAL: parseInt(getEnv('HEIGHT_INTERVAL', '100')),
  PAIR_METADATA: getEnv('PAIR_METADATA'),
  PAIR_CREATION_HEIGHT: parseInt(getEnv('PAIR_CREATION_HEIGHT')),
  PORT: parseInt(getEnv('PORT', '3000')),
  rest: new RESTClient(getEnv('REST_URI')),
}

function getEnv(key: string, defaultVal?: string): string {
  if (process.env[key]) {
    return process.env[key]
  }

  if (defaultVal) {
    return defaultVal
  }

  throw Error(`Env ${key} not found`)
}
