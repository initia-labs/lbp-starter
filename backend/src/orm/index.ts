import { DataSource } from 'typeorm'
import { options } from './ormconfig'

export * from './entities'
export const dataSource = new DataSource(options[0])

export async function initConnection() {
  await dataSource.initialize()
}
