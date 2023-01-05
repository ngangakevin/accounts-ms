import { MigrationInterface, QueryRunner } from 'typeorm';

export class initialSchema1672915686162 implements MigrationInterface {
  name = 'initialSchema1672915686162';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."accounts_currency_enum" AS ENUM('savings', 'loans', 'overdraft', 'fixedDeposit')`,
    );
    await queryRunner.query(
      `CREATE TABLE "accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "account_name" character varying NOT NULL, "account_owner" uuid NOT NULL, "currency" "public"."accounts_currency_enum" NOT NULL DEFAULT 'savings', "balance" double precision NOT NULL DEFAULT '0', "currency" "public"."accounts_currency_enum" NOT NULL DEFAULT 'Ksh', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" character varying, CONSTRAINT "UQ_e933a91919fb7409c5531b636f0" UNIQUE ("account_name"), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."accounts_currency_enum" RENAME TO "accounts_currency_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."accounts_currency_enum" AS ENUM('Ksh', '$')`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ALTER COLUMN "currency" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ALTER COLUMN "currency" TYPE "public"."accounts_currency_enum" USING "currency"::"text"::"public"."accounts_currency_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ALTER COLUMN "currency" SET DEFAULT 'Ksh'`,
    );
    await queryRunner.query(`DROP TYPE "public"."accounts_currency_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."accounts_currency_enum_old" AS ENUM('savings', 'loans', 'overdraft', 'fixedDeposit')`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ALTER COLUMN "currency" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ALTER COLUMN "currency" TYPE "public"."accounts_currency_enum_old" USING "currency"::"text"::"public"."accounts_currency_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ALTER COLUMN "currency" SET DEFAULT 'savings'`,
    );
    await queryRunner.query(`DROP TYPE "public"."accounts_currency_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."accounts_currency_enum_old" RENAME TO "accounts_currency_enum"`,
    );
    await queryRunner.query(`DROP TABLE "accounts"`);
    await queryRunner.query(`DROP TYPE "public"."accounts_currency_enum"`);
  }
}
