import { Migration } from '@mikro-orm/migrations';

export class Migration20260519050906 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "landing_config" ("id" serial primary key, "section_key" text check ("section_key" in ('hero', 'testimonials', 'chatbot', 'cta')) not null, "content" jsonb null, "position" int not null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "landing_testimonial" ("id" serial primary key, "name" varchar(255) not null, "user_title" varchar(255) not null, "content" text not null, "avatar_url" varchar(255) null, "position" int not null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "landing_config" cascade;`);

    this.addSql(`drop table if exists "landing_testimonial" cascade;`);
  }

}
