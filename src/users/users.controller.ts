import { Controller, Get, Post, Body, Patch, Param, Res, Query, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
/* DTOs */
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { ListQueryParamsDto } from 'src/users/dto/list-query-params.dto';
/* Services */
import { UsersService } from 'src/users/users.service';
import { GamesService } from 'src/games/games.service';
import { HoldemHandUsersService } from 'src/holdem-hand-users/holdem-hand-users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly gamesService: GamesService,
    private readonly holdemHandUsersService: HoldemHandUsersService
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(
    @Query() listQueryParams: ListQueryParamsDto,
    @Res() res: Response
  ) {
    const { users, contentRange } = await this.usersService.findAll(listQueryParams);

    res.setHeader('Content-Range', contentRange);
    res.status(200).json(users);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('date-range') dateRange?: string
  ) {

    console.log(dateRange); // table, hand 데이터 조회시 사용.

    return await this.usersService.findOne(+id);
  }

  @Get(':id/holdem-hands')
  async findHoldemHands(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException();
    }
    return this.gamesService.findHoldemHandByUser(user.id);
  }

  @Get(':id/game-data')
  async gameData(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException();
    }

    return await this.holdemHandUsersService.gameDataByUser(user.id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(+id, updateUserDto);
  }
}
