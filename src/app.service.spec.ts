import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Accounts } from '@entities';
import { AccountType, Currency } from '@enums';
import { AppService } from './app.service';
import { ForbiddenException } from '@nestjs/common';

const MOCK_ACCOUNTS_ENTITY: Accounts = {
  id: 'testUUID',
  accountNumber: 'testNumber',
  accountOwner: 'testOwner',
  accountType: AccountType.Savings,
  balance: 0,
  currency: Currency.KSH,
  activatedAt: new Date(),
  createdAt: new Date(),
  deletedAt: new Date(),
  updatedAt: new Date(),
  updatedBy: 'testUser',
};

describe('AccountsAppService', () => {
  let service: AppService;
  let accountsRepository: Repository<Accounts>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Accounts),
          useValue: {
            find: jest
              .fn()
              .mockResolvedValueOnce([MOCK_ACCOUNTS_ENTITY])
              .mockRejectedValueOnce(new Error()),
            save: jest.fn().mockResolvedValue(MOCK_ACCOUNTS_ENTITY),
            create: jest.fn().mockResolvedValue(MOCK_ACCOUNTS_ENTITY),
            findOneByOrFail: jest
              .fn()
              .mockResolvedValueOnce(MOCK_ACCOUNTS_ENTITY)
              .mockRejectedValueOnce(new Error()),
          },
        },
        {
          provide: 'ACCOUNTS_SERVICE',
          useValue: {
            send: jest
              .fn()
              .mockResolvedValue({ message: 'Account created successfully' }),
          },
        },
        AppService,
      ],
    }).compile();

    accountsRepository = await module.get(getRepositoryToken(Accounts));
    service = await module.get(AppService);
  });

  describe('When createAccount is called', () => {
    const createAccountDTO = {
      ownerId: 'testUUID',
      currency: Currency.KSH,
      accountType: AccountType.Loans,
    };
    test('A new account is added to the database', async () => {
      jest.spyOn(service, 'createAccount');
      await service.createAccount(createAccountDTO);
      expect(accountsRepository.save).toBeCalledTimes(1);
      expect(accountsRepository.save).toReturn();
    });

    test('A message is emited from accounts client proxy', async () => {
      const account = await service.createAccount(createAccountDTO);
      expect(account).toMatchObject({
        message: 'Account created successfully',
      });
    });
  });

  describe('When findAccById is called', () => {
    const account_id = 'test_id';
    test('account_id is passed as an id parameter', async () => {
      jest.spyOn(service, 'findAccById');
      await service.findAccById(account_id);
      expect(accountsRepository.findOneByOrFail).toBeCalledWith({
        id: account_id,
      });
    });

    test('database performs successfull search for account_id', async () => {
      jest.spyOn(service, 'findAccById');
      const account = await service.findAccById(account_id);
      expect(accountsRepository.findOneByOrFail).toBeCalledTimes(1);
      expect(accountsRepository.findOneByOrFail).toReturn();
      expect(account).toMatchObject(new Accounts());
    });

    test('function catches exceptions and handles in case they occur', async () => {
      const faulty_account_id = '1234';
      jest.spyOn(service, 'findAccById');
      await service.findAccById(faulty_account_id);
      expect(accountsRepository.findOneByOrFail).rejects.toMatchObject(
        new Error(),
      );
    });
  });

  describe('When findAccByNumber is called', () => {
    const account_number = '1234';
    test('account_number is passed as an accountNumber parameter', async () => {
      jest.spyOn(service, 'findAccById');
      await service.findAccByNumber(account_number);
      expect(accountsRepository.findOneByOrFail).toBeCalledWith({
        accountNumber: account_number,
      });
    });
    test('database performs successfull search for account_number', async () => {
      jest.spyOn(service, 'findAccByNumber');
      const account = await service.findAccById(account_number);
      expect(accountsRepository.findOneByOrFail).toBeCalledTimes(1);
      expect(accountsRepository.findOneByOrFail).toReturn();
      expect(account).toMatchObject(new Accounts());
    });

    test('function catches exceptions and handles in case they happen', async () => {
      const faulty_account_id = '1234';
      jest.spyOn(service, 'findAccByNumber');
      await service.findAccByNumber(faulty_account_id);
      expect(accountsRepository.findOneByOrFail).rejects.toMatchObject(
        new Error(),
      );
    });
  });

  describe('When findAccByOwner is called', () => {
    const owner = '1234';
    test('account owner is passed as an account owner id parameter', async () => {
      jest.spyOn(service, 'findAccByOwner');
      await service.findAccByOwner(owner);
      expect(accountsRepository.find).toBeCalledWith({
        where: { accountOwner: owner },
      });
    });
    test('database performs successfull search for account owner', async () => {
      jest.spyOn(service, 'findAccByOwner');
      const account = await service.findAccByOwner(owner);
      expect(accountsRepository.find).toBeCalledTimes(1);
      expect(accountsRepository.find).toReturn();
      expect(account).toMatchObject([new Accounts()]);
    });
  });

  describe('When findAccByType is called', () => {
    const accountType = AccountType.Loans;
    test('account owner is passed as an account type parameter', async () => {
      jest.spyOn(service, 'findByType');
      await service.findByType(accountType);
      expect(accountsRepository.find).toBeCalledWith({
        where: { accountType: accountType },
      });
    });
    test('database performs successfull search for account type', async () => {
      jest.spyOn(service, 'findByType');
      const account = await service.findByType(accountType);
      expect(accountsRepository.find).toBeCalledTimes(1);
      expect(accountsRepository.find).toReturn();
      expect(account).toMatchObject([new Accounts()]);
    });
  });

  describe('When depositToAccount is called', () => {
    const MockDepositDTO = {
      accountNumber: 'test_account',
      amount: 100,
      channel: 'mpesa',
      currency: Currency.KSH,
      taarif: {
        deposit: 0.1,
        transfer: 0.1,
        withdraw: 0.1,
      },
    };

    test('Deposit currency should match account currency', async () => {
      const depoDTOWithDiffCurrency = {
        accountNumber: 'test_account',
        amount: 100,
        channel: 'mpesa',
        currency: Currency.USDollar,
        taarif: {
          deposit: 0.1,
          transfer: 0.1,
          withdraw: 0.1,
        },
      };
      expect(
        service.depositToAccount(depoDTOWithDiffCurrency),
      ).rejects.toThrowError(ForbiddenException);
    });

    test('Deductions to the deposit comensurate to the deposit taarif are made', async () => {
      const updatedAccount = {
        id: 'testUUID',
        accountNumber: 'testNumber',
        accountOwner: 'testOwner',
        accountType: AccountType.Savings,
        balance: 90,
        currency: MOCK_ACCOUNTS_ENTITY.currency,
        activatedAt: MOCK_ACCOUNTS_ENTITY.activatedAt,
        createdAt: MOCK_ACCOUNTS_ENTITY.createdAt,
        deletedAt: MOCK_ACCOUNTS_ENTITY.deletedAt,
        updatedAt: MOCK_ACCOUNTS_ENTITY.updatedAt,
        updatedBy: 'testUser',
      };
      jest.spyOn(accountsRepository, 'save');
      await service.depositToAccount(MockDepositDTO);
      expect(accountsRepository.save).toHaveBeenCalledWith(updatedAccount);
    });

    test('An update is made to the account that is being deposited to', async () => {
      jest.spyOn(accountsRepository, 'save');
      await service.deactivateAccount(MockDepositDTO);
      expect(accountsRepository.save).toHaveBeenCalledTimes(1);
    });

    test('Amount deposited should always be greater than 1', () => {
      const depoDTOWithNegativeAmount = {
        accountNumber: 'test_account',
        amount: -100,
        channel: 'mpesa',
        currency: Currency.KSH,
        taarif: {
          deposit: 0.1,
          transfer: 0.1,
          withdraw: 0.1,
        },
      };
      expect(
        service.depositToAccount(depoDTOWithNegativeAmount),
      ).rejects.toThrowError(ForbiddenException);
    });
  });
  // describe('When freezeAccount is called', () => {});

  // describe('When deactivateAccount is called', () => {});

  // describe('When reactivateAccount is called', () => {});
});
