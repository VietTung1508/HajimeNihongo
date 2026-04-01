import { Migration } from '@mikro-orm/migrations';

export class Migration20260324095648 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "kana_section" ("id" serial primary key, "type" varchar(255) not null, "title" varchar(255) not null, "content" text not null, "order" int not null);`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "kana_section" cascade;`);
  }

}
