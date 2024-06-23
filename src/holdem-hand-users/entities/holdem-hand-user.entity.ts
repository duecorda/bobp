import { FixedDecimal } from "src/common/decorators/fixed-decimal.decorator";
import { HoldemHand } from "src/games/entities/holdem-hand.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class HoldemHandUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  holdemHandId: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  seatNumber: number;

  @Column({ type: 'varchar', length: 12, nullable: true })
  holeCard1?: string;

  @Column({ type: 'varchar', length: 12, nullable: true })
  holeCard2?: string;

  @Column({ type: 'boolean', default: false })
  isWinner: boolean;

  @FixedDecimal()
  winAmount: number;

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

  @ManyToOne(() => HoldemHand, (holdemHand) => holdemHand.holdemHandUsers)
  holdemHand: HoldemHand;

  @ManyToOne(() => User, (user) => user.holdemHandUsers)
  user: User;
}
