import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import * as bcrypt from 'bcrypt';

export class CreateUserDto {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  name: string;
  profile?: string; 
  country?: string;
  email?: string;
  balance?: number;
}