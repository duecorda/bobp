import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import * as bcrypt from 'bcrypt';

export class CreateMemberDto {
  @ApiProperty({ description: 'The login id(name) of the member' })
  @IsNotEmpty()
  login: string;

  @ApiProperty({ description: 'The password of the member' })
  @Transform(({ value }) => bcrypt.hashSync(value, 10), { toClassOnly: true })
  @IsNotEmpty()
  password: string; 
}
