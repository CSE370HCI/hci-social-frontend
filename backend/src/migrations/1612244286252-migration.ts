import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1612244286252 implements MigrationInterface {
    name = 'migration1612244286252'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_post" ("post_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "post_created" datetime NOT NULL DEFAULT (datetime('now')), "post_updated" datetime NOT NULL DEFAULT (datetime('now')), "post_type" varchar NOT NULL, "post_content" varchar NOT NULL, "post_thumbnail" varchar NOT NULL, "post_author_id" integer NOT NULL, "post_parent_id" integer, CONSTRAINT "FK_0963adb4683d7297b487bff8d3d" FOREIGN KEY ("post_author_id") REFERENCES "user" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_post"("post_id", "post_created", "post_updated", "post_type", "post_content", "post_thumbnail", "post_author_id", "post_parent_id") SELECT "post_id", "post_created", "post_updated", "post_type", "post_content", "post_thumbnail", "post_author_id", "post_parent_id" FROM "post"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`ALTER TABLE "temporary_post" RENAME TO "post"`);
        await queryRunner.query(`CREATE TABLE "temporary_post" ("post_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "post_created" datetime NOT NULL DEFAULT (datetime('now')), "post_updated" datetime NOT NULL DEFAULT (datetime('now')), "post_type" varchar NOT NULL, "post_content" varchar NOT NULL, "post_thumbnail" varchar NOT NULL, "post_author_id" integer NOT NULL, "post_parent_id" integer, CONSTRAINT "FK_0963adb4683d7297b487bff8d3d" FOREIGN KEY ("post_author_id") REFERENCES "user" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_e8bbc13578792bdaca8cfdf8314" FOREIGN KEY ("post_parent_id") REFERENCES "post" ("post_id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_post"("post_id", "post_created", "post_updated", "post_type", "post_content", "post_thumbnail", "post_author_id", "post_parent_id") SELECT "post_id", "post_created", "post_updated", "post_type", "post_content", "post_thumbnail", "post_author_id", "post_parent_id" FROM "post"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`ALTER TABLE "temporary_post" RENAME TO "post"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" RENAME TO "temporary_post"`);
        await queryRunner.query(`CREATE TABLE "post" ("post_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "post_created" datetime NOT NULL DEFAULT (datetime('now')), "post_updated" datetime NOT NULL DEFAULT (datetime('now')), "post_type" varchar NOT NULL, "post_content" varchar NOT NULL, "post_thumbnail" varchar NOT NULL, "post_author_id" integer NOT NULL, "post_parent_id" integer, CONSTRAINT "FK_0963adb4683d7297b487bff8d3d" FOREIGN KEY ("post_author_id") REFERENCES "user" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "post"("post_id", "post_created", "post_updated", "post_type", "post_content", "post_thumbnail", "post_author_id", "post_parent_id") SELECT "post_id", "post_created", "post_updated", "post_type", "post_content", "post_thumbnail", "post_author_id", "post_parent_id" FROM "temporary_post"`);
        await queryRunner.query(`DROP TABLE "temporary_post"`);
        await queryRunner.query(`ALTER TABLE "post" RENAME TO "temporary_post"`);
        await queryRunner.query(`CREATE TABLE "post" ("post_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "post_created" datetime NOT NULL DEFAULT (datetime('now')), "post_updated" datetime NOT NULL DEFAULT (datetime('now')), "post_type" varchar NOT NULL, "post_content" varchar NOT NULL, "post_thumbnail" varchar NOT NULL, "post_author_id" integer NOT NULL, "post_parent_id" integer, CONSTRAINT "FK_e8bbc13578792bdaca8cfdf8314" FOREIGN KEY ("post_parent_id") REFERENCES "post" ("post_id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_0963adb4683d7297b487bff8d3d" FOREIGN KEY ("post_author_id") REFERENCES "user" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "post"("post_id", "post_created", "post_updated", "post_type", "post_content", "post_thumbnail", "post_author_id", "post_parent_id") SELECT "post_id", "post_created", "post_updated", "post_type", "post_content", "post_thumbnail", "post_author_id", "post_parent_id" FROM "temporary_post"`);
        await queryRunner.query(`DROP TABLE "temporary_post"`);
    }

}
