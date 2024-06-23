import {
  Controller,
  Delete,
  Get,
} from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';
import { parse } from 'csv-parse';
import * as fs from 'fs';
/* Services */
import { CsvService } from 'src/csv/csv.service';

@ApiTags('csv')
@Controller('csv')
export class CsvController {
  constructor(private readonly csvService: CsvService) {}

  /*
   * USERS
  */
  @Get('parse/users')
  async parseUsersCsv() {
    const filePath = './sample/user.csv';
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const parser = await parse(fileContent, {
      delimiter: ',',
      columns: true,
    });

    const records: any[] = [];
    for await (const record of parser) {
      records.push(record);
    }

    return this.csvService.processUserData(records);
  }

  @Delete('delete/users')
  async deleteAllUsers() {
    return this.csvService.deleteAllUsers();
  };

  /*
   * TABLES
  */
  @Get('parse/holdem-tables')
  @Timeout(600000)
  async parseTablesCsv() {
    const filePath = './sample/holdem_table.csv';
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const parser = await parse(fileContent, {
      delimiter: ',',
      columns: true,
    });

    const records: any[] = [];
    for await (const record of parser) {
      records.push(record);
    }

    return this.csvService.processHoldemTableData(records);
  }

  @Delete('delete/holdem-tables')
  async deleteAllHoldemTables() {
    return this.csvService.deleteAllHoldemTables();
  };

  /*
   * HANDS
  */
  @Get('parse/holdem-hands')
  @Timeout(6000000)
  async parseHandsCsv() {
    // const filePath = './sample/holdem_hand.csv';
    const filePath = './sample/partial_hand.csv';
    // const filePath = './sample/tiny_hand.csv';
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const parser = await parse(fileContent, {
      delimiter: ',',
      columns: true,
    });

    const records: any[] = [];
    for await (const record of parser) {
      records.push(record);
    }

    return this.csvService.processHoldemHandData(records);
  }

  @Delete('delete/holdem-hands')
  async deleteAllHoldemHands() {
    return this.csvService.deleteAllHoldemHands();
  };
  
}
