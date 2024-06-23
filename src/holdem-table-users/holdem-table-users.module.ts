import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
/* Entities */
import { HoldemTableUser } from './entities/holdem-table-user.entity';
/* Services */
import { HoldemTableUsersService } from './holdem-table-users.service';
@Module({
  imports: [TypeOrmModule.forFeature([HoldemTableUser])],
  exports: [TypeOrmModule],
  controllers: [],
  providers: [HoldemTableUsersService],
})
export class HoldemTableUsersModule {}
