import { Migration } from '@mikro-orm/migrations';

export class Migration20260518095443 extends Migration {

  override async up(): Promise<void> {
    // Drop the old role table (different schema: uuid PK, description, is_super_admin, updated_at)
    // No FK dependencies since user_roles join table does not exist yet
    this.addSql(`drop table if exists "role" cascade;`);

    this.addSql(`create table "permission" ("id" varchar(255) not null, "key" varchar(255) not null, constraint "permission_pkey" primary key ("id"));`);
    this.addSql(`alter table "permission" add constraint "permission_key_unique" unique ("key");`);

    this.addSql(`create table "role" ("id" varchar(255) not null, "name" varchar(255) not null, "is_system" boolean not null default false, "created_at" timestamptz not null, constraint "role_pkey" primary key ("id"));`);
    this.addSql(`alter table "role" add constraint "role_name_unique" unique ("name");`);

    this.addSql(`create table "role_permissions" ("role_id" varchar(255) not null, "permission_id" varchar(255) not null, constraint "role_permissions_pkey" primary key ("role_id", "permission_id"));`);

    this.addSql(`create table "user_roles" ("user_id" varchar(255) not null, "role_id" varchar(255) not null, constraint "user_roles_pkey" primary key ("user_id", "role_id"));`);

    this.addSql(`alter table "role_permissions" add constraint "role_permissions_role_id_foreign" foreign key ("role_id") references "role" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "role_permissions" add constraint "role_permissions_permission_id_foreign" foreign key ("permission_id") references "permission" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "user_roles" add constraint "user_roles_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "user_roles" add constraint "user_roles_role_id_foreign" foreign key ("role_id") references "role" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "user" drop column "role";`);

    this.addSql(`alter table "user_onboarding" alter column "placement_test_completed_at" type varchar(255) using ("placement_test_completed_at"::varchar(255));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "role_permissions" drop constraint "role_permissions_permission_id_foreign";`);

    this.addSql(`alter table "role_permissions" drop constraint "role_permissions_role_id_foreign";`);

    this.addSql(`alter table "user_roles" drop constraint "user_roles_role_id_foreign";`);

    this.addSql(`drop table if exists "permission" cascade;`);

    this.addSql(`drop table if exists "role" cascade;`);

    this.addSql(`drop table if exists "role_permissions" cascade;`);

    this.addSql(`drop table if exists "user_roles" cascade;`);

    this.addSql(`alter table "user" add column "role" text check ("role" in ('USER', 'ADMIN')) not null default 'USER';`);

    this.addSql(`alter table "user_onboarding" alter column "placement_test_completed_at" type timestamptz using ("placement_test_completed_at"::timestamptz);`);
  }

}
