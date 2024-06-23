import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Transform } from "class-transformer";
/* Enums */
import { UserStatus } from "src/common/enums/user-status.enum";
import { HoldemTableUser } from "src/holdem-table-users/entities/holdem-table-user.entity";
import { HoldemHandUser } from "src/holdem-hand-users/entities/holdem-hand-user.entity";
import { SidePotWinner } from "src/pots/entities/side-pot-winner.entity";
import { Action } from "src/actions/entities/action.entity";
import { FixedDecimal } from "src/common/decorators/fixed-decimal.decorator";

@Entity()
export class User {
  @PrimaryColumn({ type: 'int', generated: false })
  id: number;

  @Transform(({ value }) => value?.trim() || null)
  @Column({ type: 'varchar', length: 191, nullable: false })
  name: string;

  @Transform(({ value }) => value?.trim() || null)
  @Column({ type: 'varchar', length: 255, nullable: true })
  profile?: string;

  @Transform(({ value }) => value?.trim() || null)
  @Column({ type: 'varchar', length: 191, nullable: true })
  country: string;

  @Transform(({ value }) => value?.trim() || null)
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @FixedDecimal()
  balance: number;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

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

  @OneToMany(() => HoldemTableUser, (holdemTableUser) => holdemTableUser.user)
  holdemTableUsers: HoldemTableUser[];

  @OneToMany(() => HoldemHandUser, (holdemHandUser) => holdemHandUser.user)
  holdemHandUsers: HoldemHandUser[];

  @OneToMany(() => SidePotWinner, (sidePotWinner) => sidePotWinner.user)
  sidePotWinners: SidePotWinner[];

  @OneToMany(() => Action, (action) => action.user)
  actions: Action[];
}
