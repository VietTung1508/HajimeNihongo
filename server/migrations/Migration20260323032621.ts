import { Migration } from '@mikro-orm/migrations';

export class Migration20260323032621 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "word" ("id" serial primary key, "ent_seq" int not null, "kanji" varchar(255) null, "reading" varchar(255) not null);`);
    this.addSql(`alter table "word" add constraint "word_ent_seq_unique" unique ("ent_seq");`);

    this.addSql(`create table "meaning" ("id" serial primary key, "text" varchar(255) not null, "word_id" int not null);`);

    this.addSql(`alter table "meaning" add constraint "meaning_word_id_foreign" foreign key ("word_id") references "word" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "meaning" drop constraint "meaning_word_id_foreign";`);

    this.addSql(`drop table if exists "word" cascade;`);

    this.addSql(`drop table if exists "meaning" cascade;`);
  }

}
