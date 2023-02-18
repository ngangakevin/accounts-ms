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
  FreezeTimeDTO,
  DeleteDTO,
  ReactivateDTO,
} from '@common';
import { ClientProxy } from '@nestjs/microservices';
import { TransactionType } from './enums/transter-type.enum';

@Injectable()
export class AppService {
  logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(Accounts)
    private readonly accountsRepository: Repository<Accounts>,
    @Inject('ACCOUNTS_SERVICE') private accountsClient: ClientProxy,
  ) {}

  async createAccount(account: CreateAccountDTO) {
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
      .find({ where: { accountType: accountType } })
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
        if (error.status !== 404) {
          this.logger.error(error);
          throw new InternalServerErrorException({
            error: 'An error has occured processing your request',
          });
        }
        throw error;
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
    if (account.balance > 1) {
      await this.accountsRepository.save(account).catch((error) => {
        this.logger.error(error);
        throw new InternalServerErrorException({
          error: 'An error has occured processing your request',
        });
      });
    } else {
      throw new ForbiddenException({
        error: 'cannot deposit a value less than 1',
      });
    }
    const newTransaction: ITransaction = {
      transactionTime: Date.now().toLocaleString(),
      beneficiary: account,
      channel: depoData.channel,
      fundsSource: 'deposit',
      amount: depoData.amount,
      transaction: Currency.KSH,
      transactionType: TransactionType.Deposit,
      creditCharge: 0,
      debitCharge: depoData.taarif.deposit,
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
    recepientAccount.balance = recepientAccount.balance + totalRecepientCredit;
    await this.accountsRepository.save(senderAccount);
    await this.accountsRepository.save(recepientAccount);
    const newTransaction: ITransaction = {
      transactionTime: Date.now().toLocaleString(),
      beneficiary: recepientAccount,
      channel: transferData.channel,
      fundsSource: transferData.from.accountNumber,
      amount: transferData.from.amount,
      transaction: Currency.KSH,
      transactionType: TransactionType.Transfer,
      creditCharge: transferData.from.taarif.transfer,
      debitCharge: transferData.to.taarif.deposit,
    };

    return this.accountsClient.send('transfer', {
      newTransaction,
      amount: totalRecepientCredit,
      currency: transferData.from.currency,
    });
  }

  async freezeAccount(freezeTime: FreezeTimeDTO) {
    const account = await this.findAccByNumber(freezeTime.accountNumber);
    if (freezeTime.days) {
      account.activatedAt = new Date();
      account.activatedAt.setDate(new Date().getDate() + freezeTime.days);
    }

    if (freezeTime.months) {
      account.activatedAt = new Date();
      account.activatedAt.setMonth(new Date().getMonth() + freezeTime.months);
    }

    if (freezeTime.years) {
      account.activatedAt = new Date();
      account.activatedAt.setFullYear(
        new Date().getFullYear() + freezeTime.years,
      );
    }

    account.deletedAt = new Date();
    await this.accountsRepository.save(account);

    return {
      message: 'Account has been freezed successfully',
    };
  }

  async deactivateAccount(deleteDTO: DeleteDTO) {
    const account = await this.findAccByNumber(deleteDTO.accountNumber);
    account.deletedAt = new Date();

    await this.accountsRepository.save(account).catch((error) => {
      this.logger.error(error);
      throw new InternalServerErrorException({
        error: 'An error has occured while processing your request',
      });
    });

    return { message: 'Account has been deactivated successfully' };
  }

  async reactivateAccount(reactivateData: ReactivateDTO) {
    const account = await this.accountsRepository
      .findOne({
        where: { accountNumber: reactivateData.accountNumber },
        withDeleted: true,
      })
      .catch((error) => {
        console.log(error);
        throw new Error('error');
      });
    account.deletedAt = null;
    account.activatedAt = new Date();

    await this.accountsRepository.save(account);

    return { message: 'Account has been reactivated successfully' };
  }
}
