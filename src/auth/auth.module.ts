import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
/* Guards */
import { AuthGuard } from 'src/auth/auth.guard';
/* Controllers */
import { AuthController } from 'src/auth/auth.controller';
/* Services */
import { AuthService } from 'src/auth/auth.service';
import { MembersService } from 'src/members/members.service';
/* Modules */
import { MembersModule } from 'src/members/members.module';

@Module({
  imports: [
    MembersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthService,
    MembersService
  ]
})
export class AuthModule {}
