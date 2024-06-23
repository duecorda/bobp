import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
/* Entities */
import { Member } from 'src/members/entities/member.entity';
/* Controllers */
import { MembersController } from 'src/members/members.controller';
/* Services */
import { MembersService } from 'src/members/members.service';

@Module({
  imports: [TypeOrmModule.forFeature([Member])],
  exports: [TypeOrmModule],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
