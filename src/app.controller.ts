import { Body, Controller, Get, Post } from '@nestjs/common';
import { MessagePattern, EventPattern } from '@nestjs/microservices'
import { AppService } from './app.service';
import { CreateAccountDTO } from './common/dtos/create-account.dto';
import { CreateDepositDTO } from './common/dtos/create-deposit.dto';
import { CreateTransferDTO } from './common/dtos/create-transfer.dto';

@Controller('/accounts')
export class AppController {
  constructor(private readonly appService: AppService) {}
  // create microservice
  // publish deposit
  // publish transfer notification (To and from accounts
  // on-demand statements
  // live-statements

  @Post('/create')
  @MessagePattern('create_account')
  async createAcccount(@Body() newAccount: CreateAccountDTO) {
    console.log(newAccount);
    const {account} = await this.appService.createAccount(newAccount);
    return {message: `Successful. Your account number is ${account}`};
  }

  @Post('/deposit')
  @MessagePattern('account_deposit')
  async accountDeposit(@Body() deposit: CreateDepositDTO) {
    await this.appService.depositToAccount(deposit);
    return {message: `Successfull deposit to ${deposit.accountNumber}`}
  }

  @Post('/transfer')
  @MessagePattern('/transfer_funds')
  async transferFunds(@Body() transferData: CreateTransferDTO) {
    await this.appService.fundsTransfer(transferData);
    return {message: `Successful funds transfer from ${transferData.from.accountNumber}`}
  }

}
