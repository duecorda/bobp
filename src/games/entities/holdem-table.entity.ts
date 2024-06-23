import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Transform } from "class-transformer";
/* Enums */
import { GameType } from "src/common/enums/game-type.enum";
import { GameStatus } from "src/common/enums/game-status.enum";
import { HoldemHand } from "./holdem-hand.entity";
import { HoldemTableUser } from "src/holdem-table-users/entities/holdem-table-user.entity";
import { FixedDecimal } from "src/common/decorators/fixed-decimal.decorator";

@Entity()
export class HoldemTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Transform(({ value }) => value?.trim() || null)
  @Column({ type: 'varchar', length: 191, nullable: true })
  title?: string;

  @Column({ type: 'int', nullable: false })
  ownerUserId: number;

  @Transform(({ value }) => value?.trim() || null)
  @Column({ type: 'varchar', length: 255, nullable: true })
  shareCode?: string;

  @Transform(({ value }) => value?.trim() || null)
  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string;

  @Transform(({ value }) => value?.trim() || null)
  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordEncrypt?: string;

  @Column({ type: 'int', nullable: true })
  minPlayerCount?: number;

  @Column({ type: 'enum', enum: GameType, default: GameType.PLAY_MONEY })
  gameType: GameType;

  @Column({ type: 'enum', enum: GameStatus, default: GameStatus.OPEN })
  status: GameStatus;

  @Transform(({ value }) => value?.trim() || null)
  @Column({ type: 'varchar', length: 191, nullable: true })
  asset?: string;

  @Column({ type: 'int', default: -1 })
  handCount: number;

  @Column({ type: 'int', nullable: false })
  actionTime: number;

  @FixedDecimal()
  buyInAmount: number;
  @FixedDecimal()
  buyInMinAmount?: number;
  @FixedDecimal()
  buyInMaxAmount?: number;
  @FixedDecimal()
  smallBlindAmount: number;
  @FixedDecimal()
  bigBlindAmount: number;
  @FixedDecimal()
  chipValueMultiplier?: number;

  @Column({ type: 'int', nullable: true })
  blindIncrementPeriod?: number;

  // rakeRate 0.00000 ~ 100까지 사용할 수 있도록 decimal(8,5)로 설정
  @Column({ type: 'decimal', precision: 8, scale: 5, default: 0.00 })
  rakeRate: number;

  @Column({ type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  startTime: Date;
  @Column({ type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  endTime: Date;

  @Column({ type: 'datetime', precision: 6, nullable: true })
  completedAt?: Date;

  @CreateDateColumn({
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)'
  })
  createdAt: Date;

  @CreateDateColumn({
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)'
  })
  updatedAt: Date;

  @OneToMany(() => HoldemHand, (holdemHand) => holdemHand.holdemTable)
  holdemHands: HoldemHand[];

  @OneToMany(() => HoldemTableUser, (holdemTableUser) => holdemTableUser.holdemTable)
  holdemTableUsers: HoldemTableUser[];
}