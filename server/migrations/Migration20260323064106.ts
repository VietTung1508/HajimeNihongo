import { Migration } from '@mikro-orm/migrations';

export class Migration20260323064106 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "example" ("id" serial primary key, "sentence" text not null, "translation" text not null, "audio_url" varchar(255) null, "word_id" int not null);`);

    this.addSql(`alter table "example" add constraint "example_word_id_foreign" foreign key ("word_id") references "word" ("id") on update cascade;`);

    this.addSql(`alter table "word" add column "is_common" boolean not null default false, add column "jlpt_level" int null, add column "audio_url" varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "example" cascade;`);

    this.addSql(`alter table "word" drop column "is_common", drop column "jlpt_level", drop column "audio_url";`);
  }

}
