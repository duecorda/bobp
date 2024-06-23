import { FixedDecimal } from "src/common/decorators/fixed-decimal.decorator";
import { ActionType } from "src/common/enums/action-type";
import { Actor } from "src/common/enums/actor.enum";
import { HandStatus } from "src/common/enums/hand-status.enum";
import { HoldemHand } from "src/games/entities/holdem-hand.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Action {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  holdemHandId: number;

  @Column({ type: 'int', nullable: false })
  userId?: number;

  @Column({ type: 'enum', enum: HandStatus, default: HandStatus.READY })
  status: HandStatus;

  @Column({ type: 'enum', enum: ActionType, nullable: false })
  actionType: ActionType;

  @Column({ type: 'enum', enum: Actor, nullable: false })
  actor: Actor;

  @FixedDecimal({ nullable: true })
  amount?: number;

  @Column({ type: 'int', nullable: false })
  sequence: number;

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

  @ManyToOne(() => HoldemHand, (holdemHand) => holdemHand.actions)
  holdemHand: HoldemHand;

  @ManyToOne(() => User, (user) => user.actions)
  user: User;
}