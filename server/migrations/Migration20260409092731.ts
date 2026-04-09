import { Migration } from '@mikro-orm/migrations';

export class Migration20260409092731 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "grammar_example" ("id" serial primary key, "sentence" text not null, "translation" text not null, "audio_url" varchar(255) null, "grammar_id" int not null);`);

    this.addSql(`create index "grammar_example_grammar_id_idx" on "grammar_example" ("grammar_id");`);

    this.addSql(`alter table "grammar_example" add constraint "grammar_example_grammar_id_foreign" foreign key ("grammar_id") references "grammar" ("id") on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "grammar_example" drop constraint "grammar_example_grammar_id_foreign";`);

    this.addSql(`drop table if exists "grammar_example" cascade;`);
  }

}
