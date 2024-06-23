import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Transform } from "class-transformer";
/* Enums */
import { HandStatus } from "src/common/enums/hand-status.enum";
import { Actor } from "src/common/enums/actor.enum";
import { HoldemTable } from "./holdem-table.entity";
import { Board } from "./board.entity";
import { Pot } from "src/pots/entities/pot.entity";
import { SidePot } from "src/pots/entities/side-pot.entity";
import { HoldemHandUser } from "src/holdem-hand-users/entities/holdem-hand-user.entity";
import { Action } from "src/actions/entities/action.entity";

@Entity()
export class HoldemHand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  holdemTableId: number;

  @Column({ type: 'int', nullable: false })
  handNumber: number;

  @Column({ type: 'enum', enum: HandStatus, default: HandStatus.READY })
  status: HandStatus;

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

  ////
  // Associations
  ////
  @ManyToOne(() => HoldemTable, (holdemTable) => holdemTable.holdemHands)
  holdemTable: HoldemTable;

  @OneToOne(() => Board, (board) => board.holdemHand)
  board: Board;

  @OneToOne(() => Pot, (pot) => pot.holdemHand)
  pot: Pot;

  @OneToMany(() => SidePot, (sidePot) => sidePot.holdemHand)
  sidePots: SidePot[];

  @OneToMany(() => HoldemHandUser, (holdemHandUser) => holdemHandUser.holdemHand)
  holdemHandUsers: HoldemHandUser[];

  @OneToMany(() => Action, (action) => action.holdemHand)
  actions: Action[];
}