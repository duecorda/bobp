import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SignInDto {
  @ApiProperty({  description: 'The login id(name) of the member' })
  @IsNotEmpty()
  login: string;

  @ApiProperty({ description: 'The password of the member' })
  @IsNotEmpty()
  password: string; 
}
