import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateAccountDTO, CreateDepositDTO, CreateTransferDTO } from '@common';

@Controller('/accounts')
export class AppController {
  constructor(private readonly appService: AppService) {}
  // create microservice
  // publish deposit
  // publish transfer notification (To and from accounts
  // on-demand statements
  // live-statements

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
}
