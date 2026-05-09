import { Migration } from '@mikro-orm/migrations';

export class Migration20260508000001 extends Migration {

  override async up(): Promise<void> {
    // Create daily_learn table
    this.addSql(`create table "daily_learn" ("id" serial primary key, "user_id" varchar(255) not null, "generated_date" timestamptz not null, "status" varchar(20) not null default 'PENDING', "completed_at" timestamptz);`);
    this.addSql(`create index "daily_learn_user_id_index" on "daily_learn" ("user_id");`);
    this.addSql(`create index "daily_learn_generated_date_index" on "daily_learn" ("generated_date");`);
    this.addSql(`alter table "daily_learn" add constraint "daily_learn_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "daily_learn" add constraint "daily_learn_user_id_status_unique" unique ("user_id", "status");`);

    // Create daily_learn_item table
    this.addSql(`create table "daily_learn_item" ("id" serial primary key, "daily_learn_id" int not null, "word_id" int, "grammar_id" int, "viewed_at" timestamptz, "pushed_to_review_at" timestamptz, "mastered_at" timestamptz);`);
    this.addSql(`create index "daily_learn_item_daily_learn_id_index" on "daily_learn_item" ("daily_learn_id");`);
    this.addSql(`create index "daily_learn_item_word_id_index" on "daily_learn_item" ("word_id");`);
    this.addSql(`create index "daily_learn_item_grammar_id_index" on "daily_learn_item" ("grammar_id");`);
    this.addSql(`alter table "daily_learn_item" add constraint "daily_learn_item_daily_learn_id_foreign" foreign key ("daily_learn_id") references "daily_learn" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "daily_learn_item" add constraint "daily_learn_item_word_id_foreign" foreign key ("word_id") references "word" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "daily_learn_item" add constraint "daily_learn_item_grammar_id_foreign" foreign key ("grammar_id") references "grammar" ("id") on update cascade on delete cascade;`);

    // Create streak table
    this.addSql(`create table "streak" ("id" serial primary key, "user_id" varchar(255) not null unique, "current_streak" int not null default 0, "longest_streak" int not null default 0, "last_completed_date" timestamptz, "freeze_available_at" timestamptz, "freezes_used" int not null default 0);`);
    this.addSql(`alter table "streak" add constraint "streak_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "daily_learn_item" cascade;`);
    this.addSql(`drop table if exists "daily_learn" cascade;`);
    this.addSql(`drop table if exists "streak" cascade;`);
  }
}
