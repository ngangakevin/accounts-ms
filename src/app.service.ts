import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Accounts } from '@entities';
import { AccountType, Currency } from '@enums';
import {
  uniqueId,
  CreateAccountDTO,
  CreateDepositDTO,
  CreateTransferDTO,
  ITransaction,
} from '@common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(Accounts)
    private readonly accountsRepository: Repository<Accounts>,
    @Inject('ACCOUNTS_SERVICE') private accountsClient: ClientProxy,
  ) {}

  async createAccount(account: CreateAccountDTO) {
    if (!account.accountType) {
      account.accountType = AccountType.Savings;
    }

    if (!account.currency) {
      account.currency = Currency.KSH;
    }

    const accountNumber = 'QB' + uniqueId(12);

    const newAccount = this.accountsRepository.create({
      accountOwner: account.ownerId,
      balance: 0.0,
      currency: account.currency,
      accountType: account.accountType,
      accountNumber,
    });

    await this.accountsRepository.save(newAccount).catch((error) => {
      this.logger.error(error);
      throw new InternalServerErrorException({
        error: 'An error has occured processing your request',
      });
    });
    return this.accountsClient.send('create_account', newAccount);
  }

  async findAccById(accountId: string): Promise<Accounts> {
    const account = await this.accountsRepository
      .findOneByOrFail({ id: accountId })
      .catch((error) => {
        this.logger.error(error);
        throw new NotFoundException({
          error: `Account ${accountId} does not exist`,
        });
      });
    return account;
  }

  async findAccByNumber(accountNumber: string): Promise<Accounts> {
    const account = await this.accountsRepository
      .findOneByOrFail({ accountNumber: accountNumber })
      .catch((error) => {
        this.logger.error(error);
        throw new NotFoundException({
          error: `Account ${accountNumber} does not exist`,
        });
      });
    return account;
  }

  async findAccByOwner(ownerId: string): Promise<Accounts[]> {
    const accounts = await this.accountsRepository
      .find({ where: { accountOwner: ownerId } })
      .catch((error) => {
        this.logger.error(error);
        throw new NotFoundException({
          error: `Account ${ownerId} does not exist`,
        });
      });
    return accounts;
  }

  async findByType(accountType: AccountType): Promise<Accounts[]> {
    const accounts = await this.accountsRepository
      .find({ where: { accountOwner: accountType } })
      .catch((error) => {
        this.logger.error(error);
        throw new InternalServerErrorException({
          error: 'An error has occured processing your request',
        });
      });
    return accounts;
  }

  async depositToAccount(depoData: CreateDepositDTO) {
    const account = await this.findAccByNumber(depoData.accountNumber).catch(
      (error) => {
        this.logger.error(error);
        throw new InternalServerErrorException({
          error: 'An error has occured processing your request',
        });
      },
    );
    if (depoData.currency !== account.currency) {
      this.logger.log({ error: 'Currency mismatch' });
      // TODO add forex rates;
      throw new ForbiddenException({
        error: 'Account does not accept specified currency',
      });
    }
    const charge = depoData.amount * depoData.taarif.deposit;
    const totalCharge = depoData.amount - charge;
    account.balance = account.balance + totalCharge;
    await this.accountsRepository.save(account).catch((error) => {
      this.logger.error(error);
      throw new InternalServerErrorException({
        error: 'An error has occured processing your request',
      });
    });
    const newTransaction: ITransaction = {
      transactionTime: Date.now().toLocaleString(),
      beneficiary: account,
      channel: depoData.channel,
      fundsSource: 'deposit',
      amount: depoData.amount,
    };
    return this.accountsClient.send('deposit', {
      newTransaction,
      amount: charge,
      currency: depoData.currency,
    });
  }

  async fundsTransfer(transferData: CreateTransferDTO) {
    if (transferData.from.currency !== transferData.to.currency) {
      this.logger.error('Currency Missmatch');
      throw new ForbiddenException({ error: 'Currency Mismatch' });
    }
    const senderAccount = await this.findAccByNumber(
      transferData.from.accountNumber,
    );

    const senderProvisionalCharge =
      transferData.from.amount * transferData.from.taarif.transfer;
    const totalSenderDeductions =
      transferData.from.amount + senderProvisionalCharge;

    const recepientProvisionalCharge =
      transferData.from.amount * transferData.to.taarif.deposit;
    const totalRecepientCredit =
      transferData.from.amount - recepientProvisionalCharge;

    if (senderAccount.balance < totalSenderDeductions) {
      this.logger.error(
        `${senderAccount} has insufficient balance to transfer funds`,
      );
      throw new ForbiddenException({
        error: 'Insufficient funds to commit to funds transfer.',
      });
    }

    const recepientAccount = await this.findAccByNumber(
      transferData.to.accountNumber,
    );

    senderAccount.balance = senderAccount.balance - totalSenderDeductions;
    recepientAccount.balance =
      recepientAccount.balance + transferData.from.amount;
    await this.accountsRepository.save(senderAccount);
    await this.accountsRepository.save(recepientAccount);
    const newTransaction: ITransaction = {
      transactionTime: Date.now().toLocaleString(),
      beneficiary: recepientAccount,
      channel: transferData.channel,
      fundsSource: 'deposit',
      amount: transferData.from.amount,
    };
    return this.accountsClient.send('transfer', {
      newTransaction,
      amount: totalRecepientCredit,
      currency: transferData.from.currency,
    });
  }

  async deactivateAccount(accountNumber: string) {
    await this.accountsRepository
      .softDelete({ id: accountNumber })
      .catch((error) => {
        this.logger.warn({ error });
        throw new ForbiddenException({ error: 'Account does not exist' });
      });

    return {
      message: 'Account has been deactivated successfully',
    };
  }
}
