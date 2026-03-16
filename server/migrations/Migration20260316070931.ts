import { Migration } from '@mikro-orm/migrations';

export class Migration20260316070931 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "user_onboarding" ("id" varchar(255) not null, "level" text check ("level" in ('ZERO', 'N5', 'N4', 'N3', 'N2', 'N1')) not null, "study_pace" text check ("study_pace" in ('RELAX', 'DETERMINED', 'RIGOROUS')) not null, "study_preference" text check ("study_preference" in ('GRAMMAR', 'VOCABULARY', 'BOTH')) not null, "user_id" varchar(255) not null, constraint "user_onboarding_pkey" primary key ("id"));`);
    this.addSql(`alter table "user_onboarding" add constraint "user_onboarding_user_id_unique" unique ("user_id");`);

    this.addSql(`alter table "user_onboarding" add constraint "user_onboarding_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "user_onboarding" cascade;`);
  }

}
