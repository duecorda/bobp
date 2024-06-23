import { Body, Controller, Post, HttpCode, HttpStatus, Get, Req } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
/* DTOs */
import { SignInDto } from './dto/sign-in.dto';
import { CreateMemberDto } from 'src/members/dto/create-member.dto';
/* Decorators */
import { Public } from 'src/common/decorators/public.metadata';
/* Services */
import { MembersService } from 'src/members/members.service';
import { AuthService } from 'src/auth/auth.service';
import { Request } from 'express';
import { JwtPayload } from 'src/auth/interfaces/jwt.payload';

interface RequestWithUser extends Request {
  member: JwtPayload;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly membersService: MembersService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Public()
  @ApiExcludeEndpoint()
  @Post('signup')
  signUp(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get('me')
  me(@Req() request: RequestWithUser) {
    return request.member;
  }
}
