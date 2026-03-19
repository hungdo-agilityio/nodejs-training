import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1773893853214 implements MigrationInterface {
  name = 'InitialSchema1773893853214';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(100) NOT NULL, "description" text, "price" numeric(10,2) NOT NULL, "duration_minutes" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "booking_services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "booking_id" uuid NOT NULL, "service_id" uuid NOT NULL, "service_name" character varying(100) NOT NULL, "service_price" numeric(10,2) NOT NULL, "service_duration_minutes" integer NOT NULL, CONSTRAINT "PK_8997bf4d0728c8740c87694d59a" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_12f15721492a512bc6165c4442" ON "booking_services" ("booking_id", "service_id") `
    );
    await queryRunner.query(
      `CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "appointment_datetime" TIMESTAMP NOT NULL, "appointment_date" date NOT NULL, "total_duration_minutes" integer NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'PENDING_PAYMENT', "payment_method" character varying(20) NOT NULL, "total_price" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'USD', "stripe_payment_intent_id" character varying(255), "idempotency_key" character varying(255) NOT NULL, "notes" text, "checked_in_at" TIMESTAMP, "completed_at" TIMESTAMP, "cancelled_at" TIMESTAMP, CONSTRAINT "UQ_c827474891843af75341a82ceda" UNIQUE ("idempotency_key"), CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`
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
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "clerk_user_id" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "phone" character varying(20), "role" character varying(20) NOT NULL DEFAULT 'USER', CONSTRAINT "UQ_69b38acaab6341c8769a0058721" UNIQUE ("clerk_user_id"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" ADD CONSTRAINT "FK_813fb23d7e327b6d9cff929cce6" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" ADD CONSTRAINT "FK_6e853453a3c24df1beed35c13eb" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_64cd97487c5c42806458ab5520c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_64cd97487c5c42806458ab5520c"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" DROP CONSTRAINT "FK_6e853453a3c24df1beed35c13eb"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_services" DROP CONSTRAINT "FK_813fb23d7e327b6d9cff929cce6"`
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_abbb864eced6f069a987b75808"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_72ce45c107eec98baa24bdd718"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ac0dc1315613e96b7874272ded"`
    );
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_12f15721492a512bc6165c4442"`
    );
    await queryRunner.query(`DROP TABLE "booking_services"`);
    await queryRunner.query(`DROP TABLE "services"`);
  }
}
