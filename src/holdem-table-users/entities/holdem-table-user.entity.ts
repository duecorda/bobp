import { FixedDecimal } from "src/common/decorators/fixed-decimal.decorator";
import { HoldemTable } from "src/games/entities/holdem-table.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class HoldemTableUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  holdemTableId: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @FixedDecimal()
  startingStack: number;
  @FixedDecimal({ nullable: true })
  endingStack?: number;

  @Column({ type: 'int', nullable: false })
  seatNumber: number;

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

  @ManyToOne(() => HoldemTable, (holdemTable) => holdemTable.holdemTableUsers)
  holdemTable: HoldemTable;

  @ManyToOne(() => User, (user) => user.holdemTableUsers)
  user: User;
}
