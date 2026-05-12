import { Migration } from '@mikro-orm/migrations';

export class Migration20260512083919 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "review_history" ("id" serial primary key, "user_id" varchar(255) not null, "word_id" int null, "grammar_id" int null, "is_correct" boolean not null, "reviewed_at" timestamptz not null);`);
    this.addSql(`create index "review_history_reviewed_at_index" on "review_history" ("reviewed_at");`);
    this.addSql(`create index "review_history_user_id_grammar_id_index" on "review_history" ("user_id", "grammar_id");`);
    this.addSql(`create index "review_history_user_id_word_id_index" on "review_history" ("user_id", "word_id");`);
    this.addSql(`create index "review_history_user_id_index" on "review_history" ("user_id");`);

    this.addSql(`alter table "review_history" add constraint "review_history_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "review_history" add constraint "review_history_word_id_foreign" foreign key ("word_id") references "word" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "review_history" add constraint "review_history_grammar_id_foreign" foreign key ("grammar_id") references "grammar" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "review_history" cascade;`);
  }

}
