import { Column, Entity, Index, PrimaryColumn } from 'typeorm'

@Entity('balance')
export class BalanceEntity {
  @PrimaryColumn('bigint')
  height: string

  @Column('timestamptz')
  @Index('balance_timestamp')
  timestamp: Date

  @Column('bigint')
  coinABalance: string

  @Column('bigint')
  coinBBalance: string
}
