import { Migration } from '@mikro-orm/migrations';

export class Migration20260303103254 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user" alter column "phone_number" type varchar(255) using ("phone_number"::varchar(255));`);
    this.addSql(`alter table "user" alter column "phone_number" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" alter column "phone_number" type varchar(255) using ("phone_number"::varchar(255));`);
    this.addSql(`alter table "user" alter column "phone_number" set not null;`);
  }

}
