import { AccountType, Currency } from '@enums';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class Accounts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    name: 'account_number',
    nullable: false,
    unique: true,
  })
  accountNumber: string;

  @Column({ type: 'uuid', name: 'account_owner', nullable: false })
  accountOwner: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    name: 'account_type',
    nullable: false,
    default: AccountType.Savings,
  })
  accountType: AccountType;

  @Column({ type: 'float', name: 'balance', nullable: false, default: 0.0 })
  balance: number;

  @Column({
    type: 'enum',
    enum: Currency,
    name: 'currency',
    nullable: false,
    default: Currency.KSH,
  })
  currency: Currency;

  @Column({
    type: 'date',
    name: 'activated_at',
  })
  activatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'varchar', name: 'updated_by', nullable: true })
  updatedBy: string;
}
