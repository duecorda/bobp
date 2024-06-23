import { Injectable } from '@nestjs/common';
/* DTOs */
import { CreateHoldemTableFromCsvDto } from 'src/games/dto/create-holdem-table-from-csv.dto';
import { CreateHoldemHandFromCsvDto } from 'src/games/dto/create-holdem-hand-from-csv.dto';
/* Services */
import { UsersService } from 'src/users/users.service';
import { GamesService } from 'src/games/games.service';

import { HoldemHand } from 'src/games/entities/holdem-hand.entity';
import { HoldemTableUsersService } from 'src/holdem-table-users/holdem-table-users.service';
import { HoldemHandUser } from 'src/holdem-hand-users/entities/holdem-hand-user.entity';
import { HoldemTableUser } from 'src/holdem-table-users/entities/holdem-table-user.entity';
import { HoldemHandUsersService } from 'src/holdem-hand-users/holdem-hand-users.service';
import { ActionType } from 'src/common/enums/action-type';
import { ActionsService } from 'src/actions/actions.service';
import { Actor } from 'src/common/enums/actor.enum';
import { HandStatus } from 'src/common/enums/hand-status.enum';

@Injectable()
export class CsvService {
  [key: string]: any;

  constructor(
    private readonly usersService: UsersService,
    private readonly gamesService: GamesService,
    private readonly holdemTableUsersService: HoldemTableUsersService,
    private readonly holdemHandUsersService: HoldemHandUsersService,
    private readonly actionsService: ActionsService
  ) {}

  toCamelCase(data: Record<string, any>): Record<string, any> {
    const camelCaseData: Record<string, any> = {};
    for (const key in data) {
      if (
        data.hasOwnProperty(key) &&
        !/^\s*(null|undefined)?\s*$/i.test(String(data[key]))
      ) {
        const camelCaseKey = key.replace(/_([a-z])/g, (_, target) => target.toUpperCase());
        camelCaseData[camelCaseKey] = data[key];
      }
    }

    return camelCaseData;
  }

  async processUserData(data: any[]): Promise<{ created: number; skipped: number }> {
    let createdCount = 0;
    let skippedCount = 0;

    for (const row of data) {
      const { id, ...userData } = this.toCamelCase(row);
      delete userData.isNotificationEnabled;
      delete userData.accountType;
      delete userData.usernameKey;
      delete userData.nameUpdateCount;

      const existingUser = await this.usersService.findOne(+id);
      if (!existingUser) {
        await this.usersService.createFromCsv({ id: +id, ...userData });
        createdCount++;
      } else {
        skippedCount++;
      }
    }

    return {
      created: createdCount,
      skipped: skippedCount,
    };
  }

  async deleteAllUsers() {
    return this.usersService.deleteAll();
  }

  async processHoldemTableData(data: any[]): Promise<{ created: number; skipped: number }> {
    let createdCount = 0;
    let skippedCount = 0;

    for (const row of data) {
      const {
        tableId: id,
        tableTitle: title,
        minPlayersCnt: minPlayerCount,
        tablePassword: password,
        tablePasswordEncrypt: passwordEncrypt,
        ...rest
      } = this.toCamelCase(row);
      delete rest.id;

      const createHoldemTableFromCsvDto: CreateHoldemTableFromCsvDto = {
        id, title, minPlayerCount, password, passwordEncrypt,
         ...rest
      };

      const existingHoldemTable = await this.gamesService.findOneHoldemTable(+id);
      if (!existingHoldemTable) {
        await this.gamesService.createHoldemTableFromCsv(createHoldemTableFromCsvDto);
        createdCount++;
      } else {
        skippedCount++;
      }
    }

    return {
      created: createdCount,
      skipped: skippedCount,
    };
  }

  async deleteAllHoldemTables() {
    return this.gamesService.deleteAllHoldemTables();
  }

  async processHoldemHandData(data: any[]): Promise<{ created: number; skipped: number }> {

    // DELETE ALL
    await this.gamesService.deleteAllBoards();
    await this.actionsService.deleteAll();
    await this.holdemTableUsersService.deleteAll();
    await this.holdemHandUsersService.deleteAll();
    await this.gamesService.deleteAllHoldemHands();
    // await this.potsService.deleteAll();
    // await this.sidePotsService.deleteAll();
    // await this.sidePotWinnersService.deleteAll();

    let createdCount = 0;
    let skippedCount = 0;

    let handNumberToken = 0;
    let holdemTableIdToken = 0;
    for (const [index, row] of data.entries()) {
      const {
        id,
        tableId: holdemTableId,
        handId: handNumber,
        handStatus: status,
        ...rest
      } = this.toCamelCase(row);

      let holdemHand: HoldemHand | null = null;
      if (handNumber != handNumberToken || holdemTableId != holdemTableIdToken) {
        const createHoldemHandFromCsvDto: CreateHoldemHandFromCsvDto = {
          holdemTableId, handNumber, status, ...rest
        };
        holdemHand = await this.gamesService.createHoldemHandFromCsv(createHoldemHandFromCsvDto);
        createdCount++;
      } else {
        holdemHand = await this.gamesService.findHoldemHandByTableAndHandNumber(holdemTableId, handNumber);
        skippedCount++;
      }

      if (!holdemHand) {
        throw new Error(`Holdem hand with HoldemTableId ${holdemTableId}, HandNumber ${handNumber}, HandId ${id} not found`);
      }
      handNumberToken = holdemHand.handNumber;
      holdemTableIdToken = holdemHand.holdemTableId;

      const actionSource = JSON.parse(rest.action);
      actionSource.actor = rest.actor.toUpperCase();
      actionSource.timestamp = rest.createdAt;
      actionSource.sequence = index + 1;
      const snapshot = JSON.parse(rest.snapshot);
      const capitalizedStatus = actionSource.handStatus
        .toLowerCase()
        .split(/[-_\s]/)
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

      try {
        await this[`handleDataIn${capitalizedStatus}Status`](holdemHand, actionSource, snapshot);
      } catch (error) {
        console.error(`Error in ${capitalizedStatus} status`);
        console.log(actionSource);
        console.error(error);
      }
    }

    return {
      created: createdCount,
      skipped: skippedCount,
    };
  }

  // READY
  async handleDataInReadyStatus(holdemHand: HoldemHand, actionSource: Record<string, any>, snapshot: Record<string, any>) {
    // Create Board
    const existingBoard = await this.gamesService.findOneHoldemTable(holdemHand.id);
    if (!existingBoard) {
      await this.gamesService.createBoardFromReadyData({ holdemHandId: holdemHand.id, });
    }

    // Create HoldemTableUser, HoldemHandUser, Action
    await Promise.all(snapshot.players.map(async (player: Record<string, any>) => {
      const holdemTableUser = await this.holdemTableUsersService.findByHoldemTableAndUser(holdemHand.holdemTableId, player.userId);
      if (!holdemTableUser) {
        await this.holdemTableUsersService.createFromReadyData({
          holdemTableId: holdemHand.holdemTableId,
          userId: player.userId,
          startingStack: player.stack,
          seatNumber: player.seatId,
          createdAt: holdemHand.createdAt
        });
      }

      const holdemHandUser = await this.holdemHandUsersService.findByHoldemHandAndUser(holdemHand.id, player.userId);
      if (!holdemHandUser) {
        await this.holdemHandUsersService.createFromReadyData({
          holdemHandId: holdemHand.id,
          userId: player.userId,
          seatNumber: player.seatId,
          isWinner: false,
          winAmount: 0,
          createdAt: holdemHand.createdAt
        }); 
      }

      await this.actionsService.createByStatus({
        holdemHandId: holdemHand.id,
        userId: player.userId,
        status: HandStatus.READY,
        actionType: ActionType.READY,
        actor: actionSource.actor,
        sequence: actionSource.sequence,
        createdAt: actionSource.timestamp,
        updatedAt: actionSource.timestamp
      });
    }));
  }

  async handleDataInPreFlopStatus(holdemHand: HoldemHand, actionSource: Record<string, any>, snapshot: Record<string, any>) {

    if (actionSource.actor === Actor.DEALER) { // Hole cards.
      await Promise.all(snapshot.players.map(async (player: Record<string, any>) => {
        const actionData = {
          holdemHandId: holdemHand.id,
          userId: player.userId,
          status: HandStatus.PRE_FLOP,
          actionType: ActionType.HOLE_CARDS,
          actor: actionSource.actor,
          amount: null,
          sequence: actionSource.sequence,
          createdAt: actionSource.timestamp,
          updatedAt: actionSource.timestamp
        }

        const holdemHandUser = await this.holdemHandUsersService.findByHoldemHandAndUser(holdemHand.id, player.userId);
        if (holdemHandUser) {
          await this.holdemHandUsersService.updateHoleCards(holdemHandUser.id, {
            holeCard1: Object.values(player.cards[0]).join(''),
            holeCard2: Object.values(player.cards[1]).join('')
          });

          if (holdemHandUser.seatNumber === snapshot.smallBlindSeatId) {
            actionData.actionType = ActionType.SMALL_BLIND;
            actionData.amount = snapshot.smallBlindAmount;
          } else if (holdemHandUser.seatNumber === snapshot.bigBlindSeatId) {
            actionData.actionType = ActionType.BIG_BLIND;
            actionData.amount = snapshot.bigBlindAmount;
          }

          await this.actionsService.createByStatus(actionData);
        }
      }));
    } else {
      const holdemHandUser = await this.holdemHandUsersService.findByHoldemHandAndSeat(holdemHand.id, actionSource.seatId);
      if (holdemHandUser) {
        await this.actionsService.createByStatus({
          holdemHandId: holdemHand.id,
          userId: holdemHandUser.userId,
          status: actionSource.handStatus,
          actionType: actionSource.action,
          actor: actionSource.actor,
          amount: actionSource.actionAmount,
          sequence: actionSource.sequence,
          createdAt: actionSource.timestamp,
          updatedAt: actionSource.timestamp
        });
      }
    }
  }
  async handleDataInFlopStatus(holdemHand: HoldemHand, actionSource: Record<string, any>, snapshot: Record<string, any>) {
    if (actionSource.actor === Actor.DEALER) { // Flop cards.
      // board 갱신
      await this.gamesService.updateBoardFlopCards(holdemHand.id, {
        flop1: Object.values(snapshot.communityCards[0]).join(''),
        flop2: Object.values(snapshot.communityCards[1]).join(''),
        flop3: Object.values(snapshot.communityCards[2]).join(''),
        flopTime: actionSource.timestamp
      });
      await Promise.all(snapshot.players.map(async (player: Record<string, any>) => {
        await this.actionsService.createByStatus({
          holdemHandId: holdemHand.id,
          userId: player.userId,
          status: HandStatus.FLOP,
          actionType: ActionType.WAIT,
          actor: actionSource.actor,
          sequence: actionSource.sequence,
          createdAt: actionSource.timestamp,
          updatedAt: actionSource.timestamp
        });
      }));
    } else {
      const holdemHandUser = await this.holdemHandUsersService.findByHoldemHandAndSeat(holdemHand.id, actionSource.seatId);
      if (holdemHandUser) {
        await this.actionsService.createByStatus({
          holdemHandId: holdemHand.id,
          userId: holdemHandUser.userId,
          status: actionSource.handStatus,
          actionType: actionSource.action,
          actor: actionSource.actor,
          amount: actionSource.actionAmount,
          sequence: actionSource.sequence,
          createdAt: actionSource.timestamp,
          updatedAt: actionSource.timestamp
        });
      }
    }
  }
  async handleDataInTurnStatus(holdemHand: HoldemHand, actionSource: Record<string, any>, snapshot: Record<string, any>) {
    if (actionSource.actor === Actor.DEALER) { // Turn cards.
      // board 갱신
      await this.gamesService.updateBoardTurnCard(holdemHand.id, {
        turn: Object.values(snapshot.communityCards[3]).join(''),
        turnTime: actionSource.timestamp
      });
      await Promise.all(snapshot.players.map(async (player: Record<string, any>) => {
        await this.actionsService.createByStatus({
          holdemHandId: holdemHand.id,
          userId: player.userId,
          status: HandStatus.TURN,
          actionType: ActionType.WAIT,
          actor: actionSource.actor,
          sequence: actionSource.sequence,
          createdAt: actionSource.timestamp,
          updatedAt: actionSource.timestamp
        });
      }));
    } else {
      const holdemHandUser = await this.holdemHandUsersService.findByHoldemHandAndSeat(holdemHand.id, actionSource.seatId);
      if (holdemHandUser) {
        await this.actionsService.createByStatus({
          holdemHandId: holdemHand.id,
          userId: holdemHandUser.userId,
          status: actionSource.handStatus,
          actionType: actionSource.action,
          actor: actionSource.actor,
          amount: actionSource.actionAmount,
          sequence: actionSource.sequence,
          createdAt: actionSource.timestamp,
          updatedAt: actionSource.timestamp
        });
      }
    }
  }
  async handleDataInRiverStatus(holdemHand: HoldemHand, actionSource: Record<string, any>, snapshot: Record<string, any>) {
    if (actionSource.actor === Actor.DEALER) { // Turn cards.
      // board 갱신
      await this.gamesService.updateBoardRiverCard(holdemHand.id, {
        river: Object.values(snapshot.communityCards[4]).join(''),
        riverTime: actionSource.timestamp
      });
      await Promise.all(snapshot.players.map(async (player: Record<string, any>) => {
        await this.actionsService.createByStatus({
          holdemHandId: holdemHand.id,
          userId: player.userId,
          status: HandStatus.RIVER,
          actionType: ActionType.WAIT,
          actor: actionSource.actor,
          sequence: actionSource.sequence,
          createdAt: actionSource.timestamp,
          updatedAt: actionSource.timestamp
        });
      }));
    } else {
      const holdemHandUser = await this.holdemHandUsersService.findByHoldemHandAndSeat(holdemHand.id, actionSource.seatId);
      if (holdemHandUser) {
        await this.actionsService.createByStatus({
          holdemHandId: holdemHand.id,
          userId: holdemHandUser.userId,
          status: actionSource.handStatus,
          actionType: actionSource.action,
          actor: actionSource.actor,
          amount: actionSource.actionAmount,
          sequence: actionSource.sequence,
          createdAt: actionSource.timestamp,
          updatedAt: actionSource.timestamp
        });
      }
    }
  }
  async handleDataInShowdownStatus(holdemHand: HoldemHand, actionSource: Record<string, any>, snapshot: Record<string, any>) {
    await Promise.all(snapshot.players.map(async (player: Record<string, any>) => {
      let actionType; 
      if (snapshot.foldPlayers.includes(player.seatId)) {
        actionType = ActionType.FOLD;
      } else if (snapshot.winnerPlayers.includes(player.seatId)) {
        actionType = ActionType.WIN;
      } else {
        actionType = ActionType.LOSE;
      }

      await this.actionsService.createByStatus({
        holdemHandId: holdemHand.id,
        userId: player.userId,
        status: HandStatus.SHOWDOWN,
        actionType,
        actor: actionSource.actor,
        sequence: actionSource.sequence,
        createdAt: actionSource.timestamp,
        updatedAt: actionSource.timestamp
      });
    }));
  }
  async handleDataInCompleteStatus(holdemHand: HoldemHand, actionSource: Record<string, any>, snapshot: Record<string, any>) {

    await this.gamesService.updateHoldemHandCompletedAt(holdemHand.id, actionSource.timestamp);
    await this.holdemHandUsersService.updateAllCompletedAt(holdemHand.id, actionSource.timestamp);

    await Promise.all(snapshot.winners.map(async (winner: Record<string, any>) => {
      const holdemHandUser = await this.holdemHandUsersService.findByHoldemHandAndSeat(holdemHand.id, winner.seatId);
      if (holdemHandUser) {
        await this.holdemHandUsersService.updateWinAmount(holdemHandUser.id, winner.winAmount);

        await this.actionsService.createByStatus({
          holdemHandId: holdemHand.id,
          userId: holdemHandUser.userId,
          status: HandStatus.COMPLETE,
          actionType: ActionType.WIN,
          actor: actionSource.actor,
          sequence: actionSource.sequence,
          createdAt: actionSource.timestamp,
          updatedAt: actionSource.timestamp
        });
      }
    }));
  }

  async deleteAllHoldemHands() {
    return this.gamesService.deleteAllHoldemHands();
  }
}
