import { Migration } from '@mikro-orm/migrations';

export class Migration20260502000001 extends Migration {

  override async up(): Promise<void> {
    // Drop table if exists to handle manual creation
    this.addSql(`drop table if exists "review_queue" cascade;`);

    this.addSql(`create table "review_queue" ("id" serial primary key, "user_id" varchar(255) not null, "word_id" int null, "grammar_id" int null, "created_at" timestamptz not null default now());`);
    this.addSql(`create index "review_queue_created_at_index" on "review_queue" ("created_at");`);
    this.addSql(`create index "review_queue_user_id_index" on "review_queue" ("user_id");`);
    this.addSql(`alter table "review_queue" add constraint "review_queue_user_id_grammar_id_unique" unique ("user_id", "grammar_id");`);
    this.addSql(`alter table "review_queue" add constraint "review_queue_user_id_word_id_unique" unique ("user_id", "word_id");`);

    this.addSql(`alter table "review_queue" add constraint "review_queue_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "review_queue" add constraint "review_queue_word_id_foreign" foreign key ("word_id") references "word" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "review_queue" add constraint "review_queue_grammar_id_foreign" foreign key ("grammar_id") references "grammar" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "review_queue" cascade;`);
  }

}
