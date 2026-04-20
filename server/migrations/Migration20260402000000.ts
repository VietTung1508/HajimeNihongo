import {Migration} from '@mikro-orm/migrations'

export class Migration20260402000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table "grammar" (
        "id" serial primary key,
        "grammar_point" varchar(255) not null,
        "meaning" varchar(255) not null,
        "level" varchar(255) not null,
        "lesson_number" int,
        "lesson_title" varchar(255),
        "structure" text,
        "structure_display" text,
        "part_of_speech" varchar(255),
        "register" varchar(255),
        "about" text,
        "example_jp" text,
        "example_en" text,
        "synonyms" varchar(255),
        "antonyms" varchar(255),
        "meaning_hint" varchar(255)
      );
    `)

    this.addSql(
      `create index "grammar_level_idx" on "grammar" ("level");`,
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "grammar" cascade;`)
  }
}
