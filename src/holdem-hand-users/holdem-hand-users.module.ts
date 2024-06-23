import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
/* Entities */
import { HoldemHandUser } from './entities/holdem-hand-user.entity';
/* Services */
import { HoldemHandUsersService } from './holdem-hand-users.service';
@Module({
  imports: [TypeOrmModule.forFeature([HoldemHandUser])],
  exports: [TypeOrmModule],
  controllers: [],
  providers: [HoldemHandUsersService],
})
export class HoldemHandUsersModule {}
