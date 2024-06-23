import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MembersService } from '../members/members.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
/* DTOs */
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly membersService: MembersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<{ token: string }> {
    const member = await this.membersService.findByLogin(signInDto.login);

    if (!member || !(await bcrypt.compare(signInDto.password, member.password))) {
      throw new UnauthorizedException('Please check your login and password');
    }

    return {
      token: await this.jwtService.signAsync({ sub: member.id, login: member.login }),
    };
  }
}
