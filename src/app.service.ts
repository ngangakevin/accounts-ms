import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
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
} from '@common';

@Injectable()
export class AppService {
  logger = new Logger(AppService.name);
  constructor(
    @InjectRepository(Accounts)
    private readonly accountsRepository: Repository<Accounts>,
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
    return { account: newAccount.accountNumber };
  }

  async findAccById(accountId: string): Promise<Accounts> {
    const account = await this.accountsRepository
      .findOneByOrFail({ id: accountId })
      .catch((error) => {
        this.logger.error(error);
        throw new InternalServerErrorException({
          error: 'An error has occured processing your request',
        });
      });
    return account;
  }

  async findAccByNumber(accountNumber: string): Promise<Accounts> {
    const account = await this.accountsRepository
      .findOneByOrFail({ id: accountNumber })
      .catch((error) => {
        this.logger.error(error);
        throw new InternalServerErrorException({
          error: 'An error has occured processing your request',
        });
      });
    return account;
  }

  async findAccByOwner(ownerId: string): Promise<Accounts[]> {
    const accounts = await this.accountsRepository
      .find({ where: { accountOwner: ownerId } })
      .catch((error) => {
        this.logger.error(error);
        throw new InternalServerErrorException({
          error: 'An error has occured processing your request',
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
    const account = await this.findAccById(depoData.accountNumber).catch(
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
    account.balance =
      account.balance +
      (depoData.amount - depoData.amount * depoData.taarif.deposit);
    await this.accountsRepository.save(account).catch((error) => {
      this.logger.error(error);
      throw new InternalServerErrorException({
        error: 'An error has occured processing your request',
      });
    });
  }

  async fundsTransfer(transferData: CreateTransferDTO) {
    if (transferData.from.currency !== transferData.from.currency) {
      this.logger.warn({ error: 'Currency mismatch' });
      throw new ForbiddenException({
        error: 'Account does not accept specified currency',
      });
    }

    const accounts = await this.accountsRepository.findAndCount({
      where: [
        { accountNumber: transferData.from.accountNumber },
        { accountNumber: transferData.to.accountNumber },
      ],
    });

    if (accounts[1] !== 2) {
      this.logger.log({ error: 'Missing Account' });
      throw new ForbiddenException({ error: 'Recepient not found' });
    }

    accounts[0][1].balance =
      accounts[0][1].balance +
      (transferData.from.amount -
        transferData.from.amount * transferData.from.taarif.deposit);
    await this.accountsRepository.save(accounts[0][1]).catch((error) => {
      this.logger.error(error);
      throw new InternalServerErrorException({
        error: 'An error has occured processing your request',
      });
    });

    accounts[0][0].balance =
      accounts[0][0].balance -
      (transferData.from.amount +
        transferData.from.amount * transferData.from.taarif.deposit);
    await this.accountsRepository.save(accounts[0][1]).catch((error) => {
      this.logger.error(error);
      throw new InternalServerErrorException({
        error: 'An error has occured processing your request',
      });
    });
  }

  async deactivateAccount(accountNumber: string) {
    await this.accountsRepository
      .softDelete({ id: accountNumber })
      .catch((error) => {
        this.logger.warn({ error });
        throw new ForbiddenException({ error: 'Account does not exist' });
      });
  }
}
