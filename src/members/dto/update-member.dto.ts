import { PartialType } from '@nestjs/mapped-types';
/* DTOs */
import { CreateMemberDto } from 'src/members/dto/create-member.dto';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {}
