import { HoldemHand } from "src/games/entities/holdem-hand.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Pot  {
  @OneToOne(() => HoldemHand, (holdemHand) => holdemHand.pot)
  @JoinColumn()
  holdemHand: HoldemHand;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  holdemHandId: number;

  @Column({ type: 'decimal', precision: 8, scale: 5, default: 0.00 })
  size: number;

  @Column({ type: 'decimal', precision: 8, scale: 5, default: 0.00 })
  rake: number;
}
