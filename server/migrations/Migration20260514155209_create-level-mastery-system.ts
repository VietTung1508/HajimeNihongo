import { Migration } from '@mikro-orm/migrations';

export class Migration20260514155209 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "user_level_mastery" ("id" serial primary key, "user_id" varchar(255) not null, "level" varchar(20) not null, "mastery_type" varchar(20) not null, "waived_at" timestamptz null, "earned_at" timestamptz null, "created_at" timestamptz not null default now());`);
    this.addSql(`create index "user_level_mastery_user_id_index" on "user_level_mastery" ("user_id");`);
    this.addSql(`create index "user_level_mastery_level_index" on "user_level_mastery" ("level");`);
    this.addSql(`create unique index "user_level_mastery_user_id_level_unique" on "user_level_mastery" ("user_id", "level");`);
    this.addSql(`alter table "user_level_mastery" add constraint "user_level_mastery_user_id_foreign" foreign key ("user_id") references "user" ("id") on delete cascade;`);

    this.addSql(`create table "placement_test" ("id" serial primary key, "user_id" varchar(255) not null, "level" varchar(20) not null, "score" int not null, "attempt_number" int not null, "questions" jsonb not null, "status" varchar(20) not null, "created_at" timestamptz not null default now());`);
    this.addSql(`alter table "placement_test" add constraint "placement_test_user_id_foreign" foreign key ("user_id") references "user" ("id") on delete cascade;`);

    this.addSql(`alter table "user_onboarding" add column "placement_test_completed_at" timestamptz null;`);
    this.addSql(`alter table "user_onboarding" add column "has_taken_placement_test" boolean not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "placement_test" cascade;`);

    this.addSql(`drop table if exists "user_level_mastery" cascade;`);

    this.addSql(`alter table "user_onboarding" drop column "placement_test_completed_at", drop column "has_taken_placement_test";`);
  }

}
