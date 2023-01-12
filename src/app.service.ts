import {
  ForbiddenException,
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
import {
  ClientOptions,
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

const clientOptions: ClientOptions = {
  transport: Transport.REDIS,
  options: {
    port: parseInt(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    retryAttempts: parseInt(process.env.REDIS_CONNECTION_RETRY),
    retryDelay: parseInt(process.env.REDIS_CONNECTION_RETRY_BACKOFF),
  },
};

@Injectable()
export class AppService {
  logger = new Logger(AppService.name);
  private readonly accountsClient: ClientProxy;

  constructor(
    @InjectRepository(Accounts)
    private readonly accountsRepository: Repository<Accounts>,
  ) {
    this.accountsClient = ClientProxyFactory.create(clientOptions);
  }

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
    this.accountsClient.send('new_account_notification', newAccount);
    return { account: newAccount.accountNumber };
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
    this.accountsClient.send('deposit_notifications', newTransaction);
    this.accountsClient.send('deposit_transaction', newTransaction);
    this.accountsClient.send('deposit_revenue', {
      amount: charge,
      currency: depoData.currency,
    });
    return {
      transaction: 'deposit',
      revenue: { amount: charge, currency: depoData.currency },
      message: `Deposit of ${depoData.currency}: ${depoData.amount} to ${depoData.accountNumber} is successfull`,
    };
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
    this.accountsClient.send('transfer_notifications', newTransaction);
    this.accountsClient.send('transfer_transaction', newTransaction);
    this.accountsClient.send('transfer_revenue', {
      amount: totalRecepientCredit,
      currency: transferData.from.currency,
    });
    return {
      transaction: 'fundsTransfer',
      revenue: {
        amount: totalRecepientCredit,
        currency: transferData.from.currency,
      },
      message: `Transfer for ${transferData.from.currency}: ${transferData.from.amount} to ${transferData.to.accountNumber} is succesfull.`,
    };
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
