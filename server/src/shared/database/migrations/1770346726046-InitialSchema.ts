import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1770346726046 implements MigrationInterface {
  name = 'InitialSchema1770346726046';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "services" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime, "name" varchar(100) NOT NULL, "description" text, "price" decimal(10,2) NOT NULL, "duration_minutes" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT (1))`
    );
    await queryRunner.query(
      `CREATE TABLE "booking_services" ("id" varchar PRIMARY KEY NOT NULL, "booking_id" varchar NOT NULL, "service_id" varchar NOT NULL, "service_name" varchar(100) NOT NULL, "service_price" decimal(10,2) NOT NULL, "service_duration_minutes" integer NOT NULL)`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_12f15721492a512bc6165c4442" ON "booking_services" ("booking_id", "service_id") `
    );
    await queryRunner.query(
      `CREATE TABLE "bookings" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime, "user_id" varchar NOT NULL, "appointment_datetime" datetime NOT NULL, "appointment_date" date NOT NULL, "total_duration_minutes" integer NOT NULL, "status" varchar(20) NOT NULL DEFAULT ('PENDING_PAYMENT'), "payment_method" varchar(20) NOT NULL, "total_price" decimal(10,2) NOT NULL, "currency" varchar(3) NOT NULL DEFAULT ('USD'), "stripe_payment_intent_id" varchar(255), "idempotency_key" varchar(255) NOT NULL, "notes" text, "expires_at" datetime, "checked_in_at" datetime, "completed_at" datetime, "cancelled_at" datetime, CONSTRAINT "UQ_c827474891843af75341a82ceda" UNIQUE ("idempotency_key"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac0dc1315613e96b7874272ded" ON "bookings" ("stripe_payment_intent_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_72ce45c107eec98baa24bdd718" ON "bookings" ("appointment_datetime") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_abbb864eced6f069a987b75808" ON "bookings" ("appointment_date", "appointment_datetime") `
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime, "clerk_user_id" varchar(255) NOT NULL, "email" varchar(255) NOT NULL, "first_name" varchar(100) NOT NULL, "last_name" varchar(100) NOT NULL, "phone" varchar(20), "role" varchar(20) NOT NULL DEFAULT ('USER'), CONSTRAINT "UQ_69b38acaab6341c8769a0058721" UNIQUE ("clerk_user_id"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`
    );
    await queryRunner.query(`DROP INDEX "IDX_12f15721492a512bc6165c4442"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_booking_services" ("id" varchar PRIMARY KEY NOT NULL, "booking_id" varchar NOT NULL, "service_id" varchar NOT NULL, "service_name" varchar(100) NOT NULL, "service_price" decimal(10,2) NOT NULL, "service_duration_minutes" integer NOT NULL, CONSTRAINT "FK_813fb23d7e327b6d9cff929cce6" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_6e853453a3c24df1beed35c13eb" FOREIGN KEY ("service_id") REFERENCES "services" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_booking_services"("id", "booking_id", "service_id", "service_name", "service_price", "service_duration_minutes") SELECT "id", "booking_id", "service_id", "service_name", "service_price", "service_duration_minutes" FROM "booking_services"`
    );
    await queryRunner.query(`DROP TABLE "booking_services"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_booking_services" RENAME TO "booking_services"`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_12f15721492a512bc6165c4442" ON "booking_services" ("booking_id", "service_id") `
    );
    await queryRunner.query(`DROP INDEX "IDX_ac0dc1315613e96b7874272ded"`);
    await queryRunner.query(`DROP INDEX "IDX_72ce45c107eec98baa24bdd718"`);
    await queryRunner.query(`DROP INDEX "IDX_abbb864eced6f069a987b75808"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_bookings" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime, "user_id" varchar NOT NULL, "appointment_datetime" datetime NOT NULL, "appointment_date" date NOT NULL, "total_duration_minutes" integer NOT NULL, "status" varchar(20) NOT NULL DEFAULT ('PENDING_PAYMENT'), "payment_method" varchar(20) NOT NULL, "total_price" decimal(10,2) NOT NULL, "currency" varchar(3) NOT NULL DEFAULT ('USD'), "stripe_payment_intent_id" varchar(255), "idempotency_key" varchar(255) NOT NULL, "notes" text, "expires_at" datetime, "checked_in_at" datetime, "completed_at" datetime, "cancelled_at" datetime, CONSTRAINT "UQ_c827474891843af75341a82ceda" UNIQUE ("idempotency_key"), CONSTRAINT "FK_64cd97487c5c42806458ab5520c" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_bookings"("id", "created_at", "updated_at", "deleted_at", "user_id", "appointment_datetime", "appointment_date", "total_duration_minutes", "status", "payment_method", "total_price", "currency", "stripe_payment_intent_id", "idempotency_key", "notes", "expires_at", "checked_in_at", "completed_at", "cancelled_at") SELECT "id", "created_at", "updated_at", "deleted_at", "user_id", "appointment_datetime", "appointment_date", "total_duration_minutes", "status", "payment_method", "total_price", "currency", "stripe_payment_intent_id", "idempotency_key", "notes", "expires_at", "checked_in_at", "completed_at", "cancelled_at" FROM "bookings"`
    );
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_bookings" RENAME TO "bookings"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac0dc1315613e96b7874272ded" ON "bookings" ("stripe_payment_intent_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_72ce45c107eec98baa24bdd718" ON "bookings" ("appointment_datetime") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_abbb864eced6f069a987b75808" ON "bookings" ("appointment_date", "appointment_datetime") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_abbb864eced6f069a987b75808"`);
    await queryRunner.query(`DROP INDEX "IDX_72ce45c107eec98baa24bdd718"`);
    await queryRunner.query(`DROP INDEX "IDX_ac0dc1315613e96b7874272ded"`);
    await queryRunner.query(
      `ALTER TABLE "bookings" RENAME TO "temporary_bookings"`
    );
    await queryRunner.query(
      `CREATE TABLE "bookings" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "deleted_at" datetime, "user_id" varchar NOT NULL, "appointment_datetime" datetime NOT NULL, "appointment_date" date NOT NULL, "total_duration_minutes" integer NOT NULL, "status" varchar(20) NOT NULL DEFAULT ('PENDING_PAYMENT'), "payment_method" varchar(20) NOT NULL, "total_price" decimal(10,2) NOT NULL, "currency" varchar(3) NOT NULL DEFAULT ('USD'), "stripe_payment_intent_id" varchar(255), "idempotency_key" varchar(255) NOT NULL, "notes" text, "expires_at" datetime, "checked_in_at" datetime, "completed_at" datetime, "cancelled_at" datetime, CONSTRAINT "UQ_c827474891843af75341a82ceda" UNIQUE ("idempotency_key"))`
    );
    await queryRunner.query(
      `INSERT INTO "bookings"("id", "created_at", "updated_at", "deleted_at", "user_id", "appointment_datetime", "appointment_date", "total_duration_minutes", "status", "payment_method", "total_price", "currency", "stripe_payment_intent_id", "idempotency_key", "notes", "expires_at", "checked_in_at", "completed_at", "cancelled_at") SELECT "id", "created_at", "updated_at", "deleted_at", "user_id", "appointment_datetime", "appointment_date", "total_duration_minutes", "status", "payment_method", "total_price", "currency", "stripe_payment_intent_id", "idempotency_key", "notes", "expires_at", "checked_in_at", "completed_at", "cancelled_at" FROM "temporary_bookings"`
    );
    await queryRunner.query(`DROP TABLE "temporary_bookings"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_abbb864eced6f069a987b75808" ON "bookings" ("appointment_date", "appointment_datetime") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_72ce45c107eec98baa24bdd718" ON "bookings" ("appointment_datetime") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac0dc1315613e96b7874272ded" ON "bookings" ("stripe_payment_intent_id") `
    );
    await queryRunner.query(`DROP INDEX "IDX_12f15721492a512bc6165c4442"`);
    await queryRunner.query(
      `ALTER TABLE "booking_services" RENAME TO "temporary_booking_services"`
    );
    await queryRunner.query(
      `CREATE TABLE "booking_services" ("id" varchar PRIMARY KEY NOT NULL, "booking_id" varchar NOT NULL, "service_id" varchar NOT NULL, "service_name" varchar(100) NOT NULL, "service_price" decimal(10,2) NOT NULL, "service_duration_minutes" integer NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "booking_services"("id", "booking_id", "service_id", "service_name", "service_price", "service_duration_minutes") SELECT "id", "booking_id", "service_id", "service_name", "service_price", "service_duration_minutes" FROM "temporary_booking_services"`
    );
    await queryRunner.query(`DROP TABLE "temporary_booking_services"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_12f15721492a512bc6165c4442" ON "booking_services" ("booking_id", "service_id") `
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP INDEX "IDX_abbb864eced6f069a987b75808"`);
    await queryRunner.query(`DROP INDEX "IDX_72ce45c107eec98baa24bdd718"`);
    await queryRunner.query(`DROP INDEX "IDX_ac0dc1315613e96b7874272ded"`);
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(`DROP INDEX "IDX_12f15721492a512bc6165c4442"`);
    await queryRunner.query(`DROP TABLE "booking_services"`);
    await queryRunner.query(`DROP TABLE "services"`);
  }
}
