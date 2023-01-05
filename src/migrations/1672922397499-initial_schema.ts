import { MigrationInterface, QueryRunner } from 'typeorm';

export class loadEnums1672923989187 implements MigrationInterface {
  name = 'loadEnums1672923989187';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."accounts_account_type_enum" AS ENUM('savings', 'loans', 'overdraft', 'fixedDeposit')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."accounts_currency_enum" AS ENUM('Ksh', '$')`,
    );
    await queryRunner.query(
      `CREATE TABLE "accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "account_name" character varying NOT NULL, "account_owner" uuid NOT NULL, "account_type" "public"."accounts_account_type_enum" NOT NULL DEFAULT 'savings', "balance" double precision NOT NULL DEFAULT '0', "currency" "public"."accounts_currency_enum" NOT NULL DEFAULT 'Ksh', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" character varying, CONSTRAINT "UQ_e933a91919fb7409c5531b636f0" UNIQUE ("account_name"), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "accounts"`);
    await queryRunner.query(`DROP TYPE "public"."accounts_currency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."accounts_account_type_enum"`);
  }
}
