import {Migration} from '@mikro-orm/migrations'


export class Migration20260515131500_add_chat_session_is_favorite extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "chat_session" add column "is_favorite" boolean not null default false;`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "chat_session" drop column "is_favorite";`)
  }
}
