import { Migration } from '@mikro-orm/migrations';

export class Migration20260515044842 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "chat_session" ("id" varchar(255) not null, "user_id" varchar(255) not null, "title" varchar(60) not null default '', "last_mode" text check ("last_mode" in ('free', 'explain-word', 'grammar-check', 'conversation', 'translate')) not null default 'free', "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "chat_session_pkey" primary key ("id"));`);
    this.addSql(`create index "chat_session_user_id_created_at_index" on "chat_session" ("user_id", "created_at");`);

    this.addSql(`create table "chat_message" ("id" varchar(255) not null, "session_id" varchar(255) not null, "role" text check ("role" in ('user', 'assistant')) not null, "content" text not null, "mode" text check ("mode" in ('free', 'explain-word', 'grammar-check', 'conversation', 'translate')) not null, "is_voice" boolean not null default false, "created_at" timestamptz not null, constraint "chat_message_pkey" primary key ("id"));`);
    this.addSql(`create index "chat_message_session_id_created_at_index" on "chat_message" ("session_id", "created_at");`);

    this.addSql(`alter table "chat_session" add constraint "chat_session_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "chat_message" add constraint "chat_message_session_id_foreign" foreign key ("session_id") references "chat_session" ("id") on update cascade on delete cascade;`);

    this.addSql(`CREATE INDEX idx_chat_session_user_created ON chat_session (user_id, created_at DESC);`);
    this.addSql(`CREATE INDEX idx_chat_message_session_created ON chat_message (session_id, created_at DESC);`);
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS idx_chat_session_user_created;`);
    this.addSql(`DROP INDEX IF EXISTS idx_chat_message_session_created;`);

    this.addSql(`alter table "chat_message" drop constraint "chat_message_session_id_foreign";`);

    this.addSql(`drop table if exists "chat_session" cascade;`);

    this.addSql(`drop table if exists "chat_message" cascade;`);
  }

}
