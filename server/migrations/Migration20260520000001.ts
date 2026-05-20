import { Migration } from '@mikro-orm/migrations';

export class Migration20260520000001 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "word" alter column "ent_seq" type bigint using "ent_seq"::bigint;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "word" alter column "ent_seq" type int using "ent_seq"::int;`);
  }

}
