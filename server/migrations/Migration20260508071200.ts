import { Migration } from '@mikro-orm/migrations';

export class Migration20260508071200 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "daily_learn" drop constraint "daily_learn_user_id_status_unique";`);

    this.addSql(`alter table "daily_learn" add column "is_extra_batch" boolean not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "daily_learn" drop column "is_extra_batch";`);

    this.addSql(`alter table "daily_learn" add constraint "daily_learn_user_id_status_unique" unique ("user_id", "status");`);
  }

}
