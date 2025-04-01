import 'dotenv/config'
import { values, snakeCase } from 'lodash'
import { DefaultNamingStrategy } from 'typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import * as entities from './entities'

export function getEnv(key: string, defaultVal?: string): string {
  const val = process.env[key]
  if (!val) {
    if (defaultVal) {
      return defaultVal
    }
    throw Error(`${key} is not given`)
  } else {
    return val
  }
}

class CamelToSnakeNamingStrategy extends DefaultNamingStrategy {
  tableName(targetName: string, userSpecifiedName: string) {
    return userSpecifiedName ? userSpecifiedName : snakeCase(targetName)
  }
  columnName(
    propertyName: string,
    customName: string,
    embeddedPrefixes: string[]
  ) {
    return snakeCase(
      embeddedPrefixes.concat(customName ? customName : propertyName).join('_')
    )
  }
  columnNameCustomized(customName: string) {
    return customName
  }
  relationName(propertyName: string) {
    return snakeCase(propertyName)
  }
}

const connectionOptions = {
  host: getEnv('DBHOST'),
  port: Number(getEnv('DBPORT')),
  username: getEnv('DBUSERNAME'),
  password: getEnv('DBPASS'),
  database: getEnv('DATABASE'),
}

export const options: PostgresConnectionOptions[] = [
  {
    name: 'default',
    type: 'postgres',
    synchronize: true,
    logging: false,
    logger: 'file',
    entities: values(entities),
    namingStrategy: new CamelToSnakeNamingStrategy(),
    ...connectionOptions,
  },
]
