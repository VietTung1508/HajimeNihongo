import { Migration } from '@mikro-orm/migrations';

export class Migration20260428090739 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "bookmark" ("id" serial primary key, "user_id" varchar(255) not null, "word_id" int null, "grammar_id" int null, "created_at" timestamptz not null);`);
    this.addSql(`create index "bookmark_created_at_index" on "bookmark" ("created_at");`);
    this.addSql(`create index "bookmark_user_id_index" on "bookmark" ("user_id");`);
    this.addSql(`alter table "bookmark" add constraint "bookmark_user_id_grammar_id_unique" unique ("user_id", "grammar_id");`);
    this.addSql(`alter table "bookmark" add constraint "bookmark_user_id_word_id_unique" unique ("user_id", "word_id");`);

    this.addSql(`alter table "bookmark" add constraint "bookmark_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "bookmark" add constraint "bookmark_word_id_foreign" foreign key ("word_id") references "word" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "bookmark" add constraint "bookmark_grammar_id_foreign" foreign key ("grammar_id") references "grammar" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "bookmark" cascade;`);
  }

}
