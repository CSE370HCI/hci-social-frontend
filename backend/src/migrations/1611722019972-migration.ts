import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1611722019972 implements MigrationInterface {
    name = 'migration1611722019972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("user_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "user_email" varchar NOT NULL, "user_password" varchar NOT NULL, "user_username" varchar NOT NULL, "user_first_name" varchar NOT NULL, "user_last_name" varchar NOT NULL, "user_status" varchar NOT NULL, "user_role" varchar NOT NULL, CONSTRAINT "UQ_65d72a4b8a5fcdad6edee8563b0" UNIQUE ("user_email"))`);
        await queryRunner.query(`CREATE TABLE "sessions" ("id" varchar(44) PRIMARY KEY NOT NULL, "user_id" integer, "content" text NOT NULL, "flash" text NOT NULL, "updated_at" integer NOT NULL, "created_at" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "connection" ("conn_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "conn_type" varchar NOT NULL, "conn_status" varchar NOT NULL, "conn_user_id" integer NOT NULL, "connected_user_id" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "group" ("group_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "group_name" varchar NOT NULL, "group_type" varchar, "group_owner_id" integer)`);
        await queryRunner.query(`CREATE TABLE "group_member" ("gm_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "gm_type" varchar NOT NULL, "gm_user_id" integer NOT NULL, "gm_group_id" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "message" ("msg_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "msg_content" varchar NOT NULL, "msg_author_id" integer NOT NULL, "msg_recip_user_id" integer, "msg_recip_group_id" integer)`);
        await queryRunner.query(`CREATE TABLE "post" ("post_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "post_created" datetime NOT NULL DEFAULT (datetime('now')), "post_updated" datetime NOT NULL DEFAULT (datetime('now')), "post_type" varchar NOT NULL, "post_content" varchar NOT NULL, "post_thumbnail" varchar NOT NULL, "commentCount" integer NOT NULL, "post_author_id" integer NOT NULL, "post_parent_id" integer)`);
        await queryRunner.query(`CREATE TABLE "post_tag" ("pt_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "pt_name" varchar NOT NULL, "pt_type" varchar NOT NULL, "pt_post_id" integer NOT NULL, "pt_user_id" integer)`);
        await queryRunner.query(`CREATE TABLE "user_artifact" ("ua_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "ua_type" varchar NOT NULL, "ua_url" varchar NOT NULL, "ua_category" varchar NOT NULL, "ua_owner_id" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "user_preference" ("up_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "up_name" varchar NOT NULL, "up_value" varchar NOT NULL, "up_user_id" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "temporary_connection" ("conn_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "conn_type" varchar NOT NULL, "conn_status" varchar NOT NULL, "conn_user_id" integer NOT NULL, "connected_user_id" integer NOT NULL, CONSTRAINT "FK_c1728cf51fd744374a91901797f" FOREIGN KEY ("conn_user_id") REFERENCES "user" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_3a591d0c29434e224e17c5e4fcc" FOREIGN KEY ("connected_user_id") REFERENCES "user" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_connection"("conn_id", "conn_type", "conn_status", "conn_user_id", "connected_user_id") SELECT "conn_id", "conn_type", "conn_status", "conn_user_id", "connected_user_id" FROM "connection"`);
        await queryRunner.query(`DROP TABLE "connection"`);
        await queryRunner.query(`ALTER TABLE "temporary_connection" RENAME TO "connection"`);
        await queryRunner.query(`CREATE TABLE "temporary_group" ("group_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "group_name" varchar NOT NULL, "group_type" varchar, "group_owner_id" integer, CONSTRAINT "FK_3b15f6e81469a8cc10d3123197c" FOREIGN KEY ("group_owner_id") REFERENCES "user" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_group"("group_id", "group_name", "group_type", "group_owner_id") SELECT "group_id", "group_name", "group_type", "group_owner_id" FROM "group"`);
        await queryRunner.query(`DROP TABLE "group"`);
        await queryRunner.query(`ALTER TABLE "temporary_group" RENAME TO "group"`);
        await queryRunner.query(`CREATE TABLE "temporary_group_member" ("gm_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "gm_type" varchar NOT NULL, "gm_user_id" integer NOT NULL, "gm_group_id" integer NOT NULL, CONSTRAINT "FK_5a47ecb58e6849c023256be0821" FOREIGN KEY ("gm_user_id") REFERENCES "user" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_d75451899e5328f0fc87705d318" FOREIGN KEY ("gm_group_id") REFERENCES "group" ("group_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_group_member"("gm_id", "gm_type", "gm_user_id", "gm_group_id") SELECT "gm_id", "gm_type", "gm_user_id", "gm_group_id" FROM "group_member"`);
        await queryRunner.query(`DROP TABLE "group_member"`);
        await queryRunner.query(`ALTER TABLE "temporary_group_member" RENAME TO "group_member"`);
        await queryRunner.query(`CREATE TABLE "temporary_message" ("msg_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "msg_content" varchar NOT NULL, "msg_author_id" integer NOT NULL, "msg_recip_user_id" integer, "msg_recip_group_id" integer, CONSTRAINT "FK_1d5be66ee82ce345e36c1b15551" FOREIGN KEY ("msg_author_id") REFERENCES "user" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_3ecf8521757e942eb3a052b4734" FOREIGN KEY ("msg_recip_user_id") REFERENCES "user" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_eea8564edd83add460bb7324e46" FOREIGN KEY ("msg_recip_group_id") REFERENCES "group" ("group_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_message"("msg_id", "msg_content", "msg_author_id", "msg_recip_user_id", "msg_recip_group_id") SELECT "msg_id", "msg_content", "msg_author_id", "msg_recip_user_id", "msg_recip_group_id" FROM "message"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`ALTER TABLE "temporary_message" RENAME TO "message"`);
        await queryRunner.query(`CREATE TABLE "temporary_post" ("post_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "post_created" datetime NOT NULL DEFAULT (datetime('now')), "post_updated" datetime NOT NULL DEFAULT (datetime('now')), "post_type" varchar NOT NULL, "post_content" varchar NOT NULL, "post_thumbnail" varchar NOT NULL, "commentCount" integer NOT NULL, "post_author_id" integer NOT NULL, "post_parent_id" integer, CONSTRAINT "FK_0963adb4683d7297b487bff8d3d" FOREIGN KEY ("post_author_id") REFERENCES "user" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_e8bbc13578792bdaca8cfdf8314" FOREIGN KEY ("post_parent_id") REFERENCES "post" ("post_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_post"("post_id", "post_created", "post_updated", "post_type", "post_content", "post_thumbnail", "commentCount", "post_author_id", "post_parent_id") SELECT "post_id", "post_created", "post_updated", "post_type", "post_content", "post_thumbnail", "commentCount", "post_author_id", "post_parent_id" FROM "post"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`ALTER TABLE "temporary_post" RENAME TO "post"`);
        await queryRunner.query(`CREATE TABLE "temporary_post_tag" ("pt_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "pt_name" varchar NOT NULL, "pt_type" varchar NOT NULL, "pt_post_id" integer NOT NULL, "pt_user_id" integer, CONSTRAINT "FK_b8ebdf560bb4425e2c7862342a6" FOREIGN KEY ("pt_post_id") REFERENCES "post" ("post_id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_99bea5c62f1493a23116a97f76f" FOREIGN KEY ("pt_user_id") REFERENCES "user" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_post_tag"("pt_id", "pt_name", "pt_type", "pt_post_id", "pt_user_id") SELECT "pt_id", "pt_name", "pt_type", "pt_post_id", "pt_user_id" FROM "post_tag"`);
        await queryRunner.query(`DROP TABLE "post_tag"`);
        await queryRunner.query(`ALTER TABLE "temporary_post_tag" RENAME TO "post_tag"`);
        await queryRunner.query(`CREATE TABLE "temporary_user_artifact" ("ua_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "ua_type" varchar NOT NULL, "ua_url" varchar NOT NULL, "ua_category" varchar NOT NULL, "ua_owner_id" integer NOT NULL, CONSTRAINT "FK_4bf7e83b96790bec0fcb3eac37a" FOREIGN KEY ("ua_owner_id") REFERENCES "user" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_user_artifact"("ua_id", "ua_type", "ua_url", "ua_category", "ua_owner_id") SELECT "ua_id", "ua_type", "ua_url", "ua_category", "ua_owner_id" FROM "user_artifact"`);
        await queryRunner.query(`DROP TABLE "user_artifact"`);
        await queryRunner.query(`ALTER TABLE "temporary_user_artifact" RENAME TO "user_artifact"`);
        await queryRunner.query(`CREATE TABLE "temporary_user_preference" ("up_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "up_name" varchar NOT NULL, "up_value" varchar NOT NULL, "up_user_id" integer NOT NULL, CONSTRAINT "FK_3e668e19de69b6a28bddace7386" FOREIGN KEY ("up_user_id") REFERENCES "user" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_user_preference"("up_id", "up_name", "up_value", "up_user_id") SELECT "up_id", "up_name", "up_value", "up_user_id" FROM "user_preference"`);
        await queryRunner.query(`DROP TABLE "user_preference"`);
        await queryRunner.query(`ALTER TABLE "temporary_user_preference" RENAME TO "user_preference"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_preference" RENAME TO "temporary_user_preference"`);
        await queryRunner.query(`CREATE TABLE "user_preference" ("up_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "up_name" varchar NOT NULL, "up_value" varchar NOT NULL, "up_user_id" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "user_preference"("up_id", "up_name", "up_value", "up_user_id") SELECT "up_id", "up_name", "up_value", "up_user_id" FROM "temporary_user_preference"`);
        await queryRunner.query(`DROP TABLE "temporary_user_preference"`);
        await queryRunner.query(`ALTER TABLE "user_artifact" RENAME TO "temporary_user_artifact"`);
        await queryRunner.query(`CREATE TABLE "user_artifact" ("ua_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "ua_type" varchar NOT NULL, "ua_url" varchar NOT NULL, "ua_category" varchar NOT NULL, "ua_owner_id" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "user_artifact"("ua_id", "ua_type", "ua_url", "ua_category", "ua_owner_id") SELECT "ua_id", "ua_type", "ua_url", "ua_category", "ua_owner_id" FROM "temporary_user_artifact"`);
        await queryRunner.query(`DROP TABLE "temporary_user_artifact"`);
        await queryRunner.query(`ALTER TABLE "post_tag" RENAME TO "temporary_post_tag"`);
        await queryRunner.query(`CREATE TABLE "post_tag" ("pt_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "pt_name" varchar NOT NULL, "pt_type" varchar NOT NULL, "pt_post_id" integer NOT NULL, "pt_user_id" integer)`);
        await queryRunner.query(`INSERT INTO "post_tag"("pt_id", "pt_name", "pt_type", "pt_post_id", "pt_user_id") SELECT "pt_id", "pt_name", "pt_type", "pt_post_id", "pt_user_id" FROM "temporary_post_tag"`);
        await queryRunner.query(`DROP TABLE "temporary_post_tag"`);
        await queryRunner.query(`ALTER TABLE "post" RENAME TO "temporary_post"`);
        await queryRunner.query(`CREATE TABLE "post" ("post_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "post_created" datetime NOT NULL DEFAULT (datetime('now')), "post_updated" datetime NOT NULL DEFAULT (datetime('now')), "post_type" varchar NOT NULL, "post_content" varchar NOT NULL, "post_thumbnail" varchar NOT NULL, "commentCount" integer NOT NULL, "post_author_id" integer NOT NULL, "post_parent_id" integer)`);
        await queryRunner.query(`INSERT INTO "post"("post_id", "post_created", "post_updated", "post_type", "post_content", "post_thumbnail", "commentCount", "post_author_id", "post_parent_id") SELECT "post_id", "post_created", "post_updated", "post_type", "post_content", "post_thumbnail", "commentCount", "post_author_id", "post_parent_id" FROM "temporary_post"`);
        await queryRunner.query(`DROP TABLE "temporary_post"`);
        await queryRunner.query(`ALTER TABLE "message" RENAME TO "temporary_message"`);
        await queryRunner.query(`CREATE TABLE "message" ("msg_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "msg_content" varchar NOT NULL, "msg_author_id" integer NOT NULL, "msg_recip_user_id" integer, "msg_recip_group_id" integer)`);
        await queryRunner.query(`INSERT INTO "message"("msg_id", "msg_content", "msg_author_id", "msg_recip_user_id", "msg_recip_group_id") SELECT "msg_id", "msg_content", "msg_author_id", "msg_recip_user_id", "msg_recip_group_id" FROM "temporary_message"`);
        await queryRunner.query(`DROP TABLE "temporary_message"`);
        await queryRunner.query(`ALTER TABLE "group_member" RENAME TO "temporary_group_member"`);
        await queryRunner.query(`CREATE TABLE "group_member" ("gm_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "gm_type" varchar NOT NULL, "gm_user_id" integer NOT NULL, "gm_group_id" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "group_member"("gm_id", "gm_type", "gm_user_id", "gm_group_id") SELECT "gm_id", "gm_type", "gm_user_id", "gm_group_id" FROM "temporary_group_member"`);
        await queryRunner.query(`DROP TABLE "temporary_group_member"`);
        await queryRunner.query(`ALTER TABLE "group" RENAME TO "temporary_group"`);
        await queryRunner.query(`CREATE TABLE "group" ("group_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "group_name" varchar NOT NULL, "group_type" varchar, "group_owner_id" integer)`);
        await queryRunner.query(`INSERT INTO "group"("group_id", "group_name", "group_type", "group_owner_id") SELECT "group_id", "group_name", "group_type", "group_owner_id" FROM "temporary_group"`);
        await queryRunner.query(`DROP TABLE "temporary_group"`);
        await queryRunner.query(`ALTER TABLE "connection" RENAME TO "temporary_connection"`);
        await queryRunner.query(`CREATE TABLE "connection" ("conn_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "conn_type" varchar NOT NULL, "conn_status" varchar NOT NULL, "conn_user_id" integer NOT NULL, "connected_user_id" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "connection"("conn_id", "conn_type", "conn_status", "conn_user_id", "connected_user_id") SELECT "conn_id", "conn_type", "conn_status", "conn_user_id", "connected_user_id" FROM "temporary_connection"`);
        await queryRunner.query(`DROP TABLE "temporary_connection"`);
        await queryRunner.query(`DROP TABLE "user_preference"`);
        await queryRunner.query(`DROP TABLE "user_artifact"`);
        await queryRunner.query(`DROP TABLE "post_tag"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TABLE "group_member"`);
        await queryRunner.query(`DROP TABLE "group"`);
        await queryRunner.query(`DROP TABLE "connection"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
