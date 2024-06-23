import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SidePot } from "./side-pot.entity";
import { User } from "src/users/entities/user.entity";

@Entity()
export class SidePotWinner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  sidePotId: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'decimal', precision: 8, scale: 5, default: 0.00 })
  amount: number;

  @ManyToOne(() => SidePot, (sidePot) => sidePot.sidePotWinners)
  sidePot: SidePot;

  @ManyToOne(() => User, (user) => user.sidePotWinners)
  user: User;
}
