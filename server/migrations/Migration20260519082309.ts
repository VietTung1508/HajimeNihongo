import { Migration } from '@mikro-orm/migrations';

export class Migration20260519082309 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user" add column "last_login_at" timestamptz null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop column "last_login_at";`);
  }

}
