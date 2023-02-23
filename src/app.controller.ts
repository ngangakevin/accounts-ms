import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import {
  CreateAccountDTO,
  CreateDepositDTO,
  CreateTransferDTO,
  FreezeTimeDTO,
  ReactivateDTO,
  DeleteDTO,
} from '@common';
import { MessagePattern } from '@nestjs/microservices';
import { AccountType } from './enums';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('accounts')
@Controller('/accounts')
export class AppController {
  constructor(private readonly appService: AppService) {}
  // TODO  cron to reactivate freezed accounts.

  @Get('/find-account/user/:userId')
  @MessagePattern('find_account_by_owner')
  async findAccByOwner(@Param('userId') userId: string) {
    return this.appService.findAccByOwner(userId);
  }

  @Get('find-account/account-id/:accountId')
  @MessagePattern('find_account_by_id')
  async findAccById(@Param('accountId') accountId: string) {
    return this.appService.findAccById(accountId);
  }

  @Get('find-account/account-number/:accountNumber')
  @MessagePattern('find_account_by_account_number')
  async findAccByAccNumber(@Param('accountNumber') accountNumber: string) {
    return this.appService.findAccByNumber(accountNumber);
  }

  @Get('find-account/account-type/:accountType')
  @MessagePattern('find_account_by_type')
  async findAccByType(@Param('accountType') accountType: AccountType) {
    return this.appService.findByType(accountType);
  }

  @Post('/create')
  async createAcccount(@Body() newAccount: CreateAccountDTO) {
    return this.appService.createAccount(newAccount);
  }

  @Post('/deposit')
  async accountDeposit(@Body() deposit: CreateDepositDTO) {
    return this.appService.depositToAccount(deposit);
  }

  @Post('/transfer')
  async transferFunds(@Body() transferData: CreateTransferDTO) {
    return this.appService.fundsTransfer(transferData);
  }

  @Post('reactivate')
  async reactivateAcccount(@Body() reactivateData: ReactivateDTO) {
    return this.appService.reactivateAccount(reactivateData);
  }

  @Delete('freeze')
  @MessagePattern('freeze_Account')
  async freezeAccount(@Body() freezeTime: FreezeTimeDTO) {
    return this.appService.freezeAccount(freezeTime);
  }

  @Delete('delete')
  @MessagePattern('deactivate_account')
  async deactivateAccount(@Body() deleteDTO: DeleteDTO) {
    return this.appService.deactivateAccount(deleteDTO);
  }
}
