import { Migration } from '@mikro-orm/migrations';

export class Migration20260506000001 extends Migration {

  override async up(): Promise<void> {
    // Create user_word_progress table
    this.addSql(`create table "user_word_progress" ("id" serial primary key, "user_id" varchar(255) not null, "word_id" int not null, "mastered_at" timestamptz not null default now());`);
    this.addSql(`create index "user_word_progress_user_id_index" on "user_word_progress" ("user_id");`);
    this.addSql(`create index "user_word_progress_word_id_index" on "user_word_progress" ("word_id");`);
    this.addSql(`alter table "user_word_progress" add constraint "user_word_progress_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "user_word_progress" add constraint "user_word_progress_word_id_foreign" foreign key ("word_id") references "word" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "user_word_progress" add constraint "user_word_progress_user_id_word_id_unique" unique ("user_id", "word_id");`);

    // Create user_grammar_progress table
    this.addSql(`create table "user_grammar_progress" ("id" serial primary key, "user_id" varchar(255) not null, "grammar_id" int not null, "mastered_at" timestamptz not null default now());`);
    this.addSql(`create index "user_grammar_progress_user_id_index" on "user_grammar_progress" ("user_id");`);
    this.addSql(`create index "user_grammar_progress_grammar_id_index" on "user_grammar_progress" ("grammar_id");`);
    this.addSql(`alter table "user_grammar_progress" add constraint "user_grammar_progress_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "user_grammar_progress" add constraint "user_grammar_progress_grammar_id_foreign" foreign key ("grammar_id") references "grammar" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "user_grammar_progress" add constraint "user_grammar_progress_user_id_grammar_id_unique" unique ("user_id", "grammar_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "user_word_progress" cascade;`);
    this.addSql(`drop table if exists "user_grammar_progress" cascade;`);
  }

}
