import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { HoldemHand } from "./holdem-hand.entity";

@Entity()
export class Board {
  @OneToOne(() => HoldemHand, (holdemHand) => holdemHand.board)
  @JoinColumn()
  holdemHand: HoldemHand;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  holdemHandId: number;

  @Column({ type: 'varchar', length: 12, nullable: true })
  flop1?: string;
  @Column({ type: 'varchar', length: 12, nullable: true })
  flop2?: string;
  @Column({ type: 'varchar', length: 12, nullable: true })
  flop3?: string;
  @Column({ type: 'varchar', length: 12, nullable: true })
  turn?: string;
  @Column({ type: 'varchar', length: 12, nullable: true })
  river?: string;

  @Column({ type: 'datetime', precision: 6, nullable: true })
  flopTime: Date;
  @Column({ type: 'datetime', precision: 6, nullable: true })
  turnTime: Date;
  @Column({ type: 'datetime', precision: 6, nullable: true })
  riverTime: Date;

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
}
