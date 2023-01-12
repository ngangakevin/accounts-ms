import { Body, Controller, Post } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
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
  @MessagePattern('create_account')
  async createAcccount(@Body() newAccount: CreateAccountDTO) {
    const { account } = await this.appService.createAccount(newAccount);
    return { message: `Successful. Your account number is ${account}` };
  }

  @Post('/deposit')
  @MessagePattern('account_deposit')
  async accountDeposit(@Body() deposit: CreateDepositDTO) {
    return await this.appService.depositToAccount(deposit);
  }

  @Post('/transfer')
  @MessagePattern('/transfer_funds')
  async transferFunds(@Body() transferData: CreateTransferDTO) {
    return await this.appService.fundsTransfer(transferData);
  }
}
