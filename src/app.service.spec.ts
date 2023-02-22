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
  balance: 99,
  currency: Currency.KSH,
  activatedAt: new Date('000000001'),
  createdAt: new Date(),
  deletedAt: null,
  updatedBy: 'testUser',
  updatedAt: new Date(),
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
            findOne: jest.fn().mockResolvedValueOnce(MOCK_ACCOUNTS_ENTITY),
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

  afterEach(() => {
    jest.clearAllMocks();
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
      accountNumber: 'testUUID',
      amount: 100,
      channel: 'mpesa',
      currency: Currency.KSH,
      tarrif: {
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
        tarrif: {
          deposit: 0.1,
          transfer: 0.1,
          withdraw: 0.1,
        },
      };
      expect(
        service.depositToAccount(depoDTOWithDiffCurrency),
      ).rejects.toThrowError(ForbiddenException);
    });

    test('Deductions to the deposit comensurate to the deposit tarrif are made', async () => {
      const updatedAccount = { ...MOCK_ACCOUNTS_ENTITY };
      updatedAccount.balance =
        MOCK_ACCOUNTS_ENTITY.balance +
        (MockDepositDTO.amount -
          MockDepositDTO.amount * MockDepositDTO.tarrif.deposit);
      const spy = jest
        .spyOn(accountsRepository, 'findOneByOrFail')
        .mockResolvedValue(MOCK_ACCOUNTS_ENTITY);
      jest.spyOn(accountsRepository, 'save');
      await service.depositToAccount(MockDepositDTO);
      expect(accountsRepository.save).toHaveBeenCalledWith(updatedAccount);
      spy.mockReset();
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
        tarrif: {
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

  describe('When fundsTransfer is called', () => {
    const transferDTO = {
      from: {
        accountNumber: 'testUUID1',
        amount: 10,
        channel: 'mpesa',
        currency: Currency.KSH,
        tarrif: {
          deposit: 0.1,
          transfer: 0.1,
          withdraw: 0.1,
        },
      },
      to: {
        accountNumber: 'testUUID2',
        amount: 10,
        channel: 'mpesa',
        currency: Currency.KSH,
        tarrif: {
          deposit: 0.1,
          transfer: 0.1,
          withdraw: 0.1,
        },
      },
      channel: 'mpesa',
    };
    test('Amount deposited should always be greater than 1', () => {
      const transferWithNegativeAmount = { ...transferDTO };
      transferWithNegativeAmount.from.amount = -100;
      transferWithNegativeAmount.to.amount = -100;
      const sender = { ...MOCK_ACCOUNTS_ENTITY };
      sender.accountNumber = 'testing_mocker';
      const receiver = { ...MOCK_ACCOUNTS_ENTITY };
      receiver.accountNumber = 'testing_mocker2';

      jest
        .spyOn(accountsRepository, 'findOneByOrFail')
        .mockResolvedValueOnce(sender)
        .mockResolvedValueOnce(receiver);
      expect(
        service.fundsTransfer(transferWithNegativeAmount),
      ).rejects.toThrowError(ForbiddenException);
    });

    test('Sender balance must exceed amount + tarrif deductions', () => {
      const transferWithNegativeAmount = { ...transferDTO };
      transferWithNegativeAmount.from.amount = -100;
      transferWithNegativeAmount.to.amount = -100;
      jest
        .spyOn(accountsRepository, 'findOneByOrFail')
        .mockResolvedValue(MOCK_ACCOUNTS_ENTITY);
      expect(
        service.fundsTransfer(transferWithNegativeAmount),
      ).rejects.toThrowError(ForbiddenException);
    });

    test('Should not allow transfer within the same account', () => {
      expect(service.fundsTransfer(transferDTO)).rejects.toThrowError(
        ForbiddenException,
      );
    });

    test('Deductions to the sender and beneficiary should be comensurate to tarrifs', async () => {
      const sender = { ...MOCK_ACCOUNTS_ENTITY };
      sender.balance = 200;
      sender.accountNumber = 'testUUID1';
      sender.id = 'testUUID1';

      const recepient = { ...MOCK_ACCOUNTS_ENTITY };
      recepient.balance = 200;
      recepient.accountNumber = 'testUUID2';
      recepient.id = 'testUUID2';

      const updatedSender = { ...sender };
      updatedSender.balance = 189;

      const updatedRecepient = { ...recepient };
      updatedRecepient.balance = 209;
      jest
        .spyOn(accountsRepository, 'findOneByOrFail')
        .mockResolvedValueOnce(sender)
        .mockResolvedValueOnce(recepient);
      const response = await service.fundsTransfer(transferDTO);
      expect(accountsRepository.save).toHaveBeenCalledTimes(2);
      expect(accountsRepository.save).toHaveBeenCalledWith(updatedSender);
      expect(accountsRepository.save).toHaveBeenLastCalledWith(
        updatedRecepient,
      );
      expect(response).toHaveProperty('message');
    });
  });

  describe('When freezeAccount is called', () => {
    test('deletedAt time is updated', async () => {
      await service.freezeAccount({ accountNumber: '123456', months: 1 });
      expect(accountsRepository.save).toBeCalledWith(
        expect.objectContaining({ deletedAt: MOCK_ACCOUNTS_ENTITY.deletedAt }),
      );
    });
  });

  describe('When deactivateAccount is called', () => {
    test('The item to be deleted exists', async () => {
      jest.spyOn(accountsRepository, 'findOneByOrFail');
      await service.deactivateAccount({
        accountNumber: 'already_deleted',
      });
      expect(accountsRepository.findOneByOrFail).rejects.toMatchObject(
        new Error(),
      );
    });

    test('Item is deleted and message returned', async () => {
      jest.spyOn(accountsRepository, 'save');
      const spy = jest
        .spyOn(global, 'Date')
        .mockImplementation(() => '2023-02-20T13:29:07.450Z');
      const response = await service.deactivateAccount({
        accountNumber: '1234',
      });
      expect(accountsRepository.save).toBeCalledWith(
        expect.objectContaining({ deletedAt: new Date() }),
      );
      expect(response).toHaveProperty('message');
      spy.mockReset();
    });
  });
  describe('When reactivateAccount is called', () => {
    test('Account must be saved with null for deletedAt', async () => {
      const deactivatedAccount = { ...MOCK_ACCOUNTS_ENTITY };
      deactivatedAccount.deletedAt = new Date();
      const reactivateAccount = { ...MOCK_ACCOUNTS_ENTITY };
      reactivateAccount.activatedAt = new Date();
      jest.spyOn(accountsRepository, 'findOne');
      await service.reactivateAccount(MOCK_ACCOUNTS_ENTITY);
      expect(accountsRepository.save).toBeCalledWith(
        expect.objectContaining({ deletedAt: null }),
      );
    });
  });
});
