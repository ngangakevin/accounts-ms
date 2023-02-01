import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateAccountDTO, CreateDepositDTO, CreateTransferDTO } from '@common';
import { MessagePattern } from '@nestjs/microservices';
import { AccountType } from './enums';

@Controller('/accounts')
export class AppController {
  constructor(private readonly appService: AppService) {}
  // create microservice
  // publish deposit
  // publish transfer notification (To and from accounts
  // on-demand statements
  // live-statements

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

  @Delete('delete/:accountNumber')
  async deactivateAccount(@Param('accountNumber') accountNumber: string) {
    return this.appService.deactivateAccount(accountNumber);
  }
}
