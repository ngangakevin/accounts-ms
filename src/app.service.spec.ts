import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Accounts } from '@entities';
import { AccountType, Currency } from '@enums';
import { AppService } from './app.service';
import { uniqueId } from '@common';

const DETAULT_ACCOUNT_ID = uniqueId(12);

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
              .mockResolvedValueOnce([
                {
                  id: DETAULT_ACCOUNT_ID,
                },
              ])
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
    test('account owner is passed as an accountNumber parameter', async () => {
      jest.spyOn(service, 'findAccByOwner');
      await service.findAccByOwner(owner);
      expect(accountsRepository.find).toBeCalledWith({
        where: { accountOwner: owner },
      });
    });
    test('database performs successfull search for account_number', async () => {
      jest.spyOn(service, 'findAccByOwner');
      const account = await service.findAccByOwner(owner);
      expect(accountsRepository.find).toBeCalledTimes(1);
      expect(accountsRepository.find).toReturn();
      expect(account).toMatchObject([new Accounts()]);
    });
  });

  describe('When findAccByType is called', () => {
    const accountType = AccountType.Loans;
    test('account owner is passed as an accountNumber parameter', async () => {
      jest.spyOn(service, 'findByType');
      await service.findByType(accountType);
      expect(accountsRepository.find).toBeCalledWith({
        where: { accountType: accountType },
      });
    });
    test('database performs successfull search for account_number', async () => {
      jest.spyOn(service, 'findByType');
      const account = await service.findAccByOwner(accountType);
      expect(accountsRepository.find).toBeCalledTimes(1);
      expect(accountsRepository.find).toReturn();
      expect(account).toMatchObject([new Accounts()]);
    });
  });
});
