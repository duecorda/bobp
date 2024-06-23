import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
/* Entities */
import { Action } from './entities/action.entity';
/* Services */
import { ActionsService } from './actions.service';
@Module({
  imports: [TypeOrmModule.forFeature([Action])],
  exports: [TypeOrmModule],
  controllers: [],
  providers: [ActionsService],
})
export class ActionsModule {}

