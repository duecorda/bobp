import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ClassSerializerInterceptor
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.metadata';
/* DTOs */
import { CreateMemberDto } from 'src/members/dto/create-member.dto';
import { UpdateMemberDto } from 'src/members/dto/update-member.dto';
/* Services */
import { MembersService } from 'src/members/members.service';

@ApiTags('members')
@Controller('members')
@UseInterceptors(ClassSerializerInterceptor)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Public()
  @Post()
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  findAll() {
    return this.membersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.membersService.update(+id, updateMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membersService.remove(+id);
  }
}
