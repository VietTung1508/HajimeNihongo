import { Migration } from '@mikro-orm/migrations';

export class Migration20260323034429 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "meaning" alter column "text" type text using ("text"::text);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "meaning" alter column "text" type varchar(255) using ("text"::varchar(255));`);
  }

}
