import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { SidePotWinner } from "./side-pot-winner.entity";
import { HoldemHand } from "src/games/entities/holdem-hand.entity";

@Entity()
export class SidePot  {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  holdemHandId: number;

  @Column({ type: 'decimal', precision: 8, scale: 5, default: 0.00 })
  size: number;

  @Column({ type: 'decimal', precision: 8, scale: 5, default: 0.00 })
  rake: number;

  @Column({ type: 'json', nullable: true })
  winners?: any;

  @ManyToOne(() => HoldemHand, (holdemHand) => holdemHand.sidePots)
  holdemHand: HoldemHand;

  @OneToMany(() => SidePotWinner, (sidePotWinner) => sidePotWinner.sidePot)
  sidePotWinners: SidePotWinner[];
}

