import { Migration } from '@mikro-orm/migrations';

export class Migration20260519025110 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user" add column "gender" text check ("gender" in ('MALE', 'FEMALE', 'OTHER')) null, add column "date_of_birth" date null, add column "must_change_password" boolean not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop column "gender", drop column "date_of_birth", drop column "must_change_password";`);
  }

}
