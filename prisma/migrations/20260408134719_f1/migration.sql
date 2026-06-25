/*
  Warnings:

  - The primary key for the `google_drive_accounts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `google_drive_files` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `google_drive_folders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `google_drive_folders_trees` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `one_drive_accounts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `one_drive_files` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `mime_type` on the `one_drive_files` table. All the data in the column will be lost.
  - The primary key for the `one_drive_folders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `one_drive_folders_trees` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `otp_codes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `subscribed_users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `subscription_plans` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `scope` to the `one_drive_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `one_drive_files` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."google_drive_accounts" DROP CONSTRAINT "google_drive_accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."google_drive_files" DROP CONSTRAINT "google_drive_files_file_parents_fkey";

-- DropForeignKey
ALTER TABLE "public"."google_drive_files" DROP CONSTRAINT "google_drive_files_google_drive_account_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."google_drive_files" DROP CONSTRAINT "google_drive_files_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."google_drive_folders" DROP CONSTRAINT "google_drive_folders_google_drive_account_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."google_drive_folders" DROP CONSTRAINT "google_drive_folders_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."google_drive_folders_trees" DROP CONSTRAINT "google_drive_folders_trees_google_drive_account_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."google_drive_folders_trees" DROP CONSTRAINT "google_drive_folders_trees_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."one_drive_accounts" DROP CONSTRAINT "one_drive_accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."one_drive_files" DROP CONSTRAINT "one_drive_files_file_parents_fkey";

-- DropForeignKey
ALTER TABLE "public"."one_drive_files" DROP CONSTRAINT "one_drive_files_one_drive_account_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."one_drive_files" DROP CONSTRAINT "one_drive_files_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."one_drive_folders" DROP CONSTRAINT "one_drive_folders_one_drive_account_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."one_drive_folders" DROP CONSTRAINT "one_drive_folders_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."one_drive_folders_trees" DROP CONSTRAINT "one_drive_folders_trees_one_drive_account_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."one_drive_folders_trees" DROP CONSTRAINT "one_drive_folders_trees_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."otp_codes" DROP CONSTRAINT "otp_codes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscribed_users" DROP CONSTRAINT "subscribed_users_subscription_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscribed_users" DROP CONSTRAINT "subscribed_users_user_id_fkey";

-- AlterTable
ALTER TABLE "google_drive_accounts" DROP CONSTRAINT "google_drive_accounts_pkey",
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "gmail_account" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "refresh_token" SET DATA TYPE TEXT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "google_drive_accounts_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "google_drive_files" DROP CONSTRAINT "google_drive_files_pkey",
ADD COLUMN     "md5Checksum" VARCHAR(255),
ADD COLUMN     "thumbnail_link" TEXT,
ADD COLUMN     "viewed_by_me_time" TIMESTAMP(6),
ADD COLUMN     "web_view_link" TEXT,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "file_created_time" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "file_id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "file_name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "file_parents" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "google_drive_account_id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "mime_type" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "google_drive_files_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "google_drive_folders" DROP CONSTRAINT "google_drive_folders_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "folder_name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "folder_parents" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "folder_path" SET DATA TYPE TEXT,
ALTER COLUMN "google_drive_account_id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "google_drive_folders_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "google_drive_folders_trees" DROP CONSTRAINT "google_drive_folders_trees_pkey",
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "folder_tree" SET DATA TYPE JSON,
ALTER COLUMN "google_drive_account_id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "google_drive_folders_trees_pkey" PRIMARY KEY ("google_drive_account_id");

-- AlterTable
ALTER TABLE "one_drive_accounts" DROP CONSTRAINT "one_drive_accounts_pkey",
ADD COLUMN     "delta_link" TEXT,
ADD COLUMN     "scope" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "expires_in" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "onedrive_account" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "one_drive_accounts_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "one_drive_files" DROP CONSTRAINT "one_drive_files_pkey",
DROP COLUMN "mime_type",
ADD COLUMN     "last_modified_time" TIMESTAMP(6),
ADD COLUMN     "md5Checksum" VARCHAR(255),
ADD COLUMN     "mimeType" VARCHAR(255) NOT NULL,
ADD COLUMN     "webViewLink" TEXT,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "file_created_time" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "file_id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "file_name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "file_parents" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "one_drive_account_id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "one_drive_files_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "one_drive_folders" DROP CONSTRAINT "one_drive_folders_pkey",
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "folder_name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "folder_parents" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "folder_path" SET DATA TYPE TEXT,
ALTER COLUMN "one_drive_account_id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "one_drive_folders_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "one_drive_folders_trees" DROP CONSTRAINT "one_drive_folders_trees_pkey",
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "folder_tree" SET DATA TYPE JSON,
ALTER COLUMN "one_drive_account_id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "one_drive_folders_trees_pkey" PRIMARY KEY ("one_drive_account_id");

-- AlterTable
ALTER TABLE "otp_codes" DROP CONSTRAINT "otp_codes_pkey",
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "code" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "subscribed_users" DROP CONSTRAINT "subscribed_users_pkey",
ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid()::text,
ALTER COLUMN "uuid" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "paid_amount" SET DATA TYPE DECIMAL,
ALTER COLUMN "sub_end_time" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "sub_start_time" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "subscription_plan_id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "subscribed_users_pkey" PRIMARY KEY ("uuid");

-- AlterTable
ALTER TABLE "subscription_plans" DROP CONSTRAINT "subscription_plans_pkey",
ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid()::text,
ALTER COLUMN "uuid" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "package_name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "monthly_price" SET DATA TYPE DECIMAL,
ALTER COLUMN "yearly_price" SET DATA TYPE DECIMAL,
ALTER COLUMN "features" SET DATA TYPE JSON,
ALTER COLUMN "description" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("uuid");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "password" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" DROP NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "alembic_version" (
    "version_num" VARCHAR(32) NOT NULL,

    CONSTRAINT "alembic_version_pkc" PRIMARY KEY ("version_num")
);

-- CreateTable
CREATE TABLE "google_drive_document_embeddings" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "google_drive_account_id" VARCHAR(255) NOT NULL,
    "file_id" VARCHAR(255) NOT NULL,
    "text_content" TEXT NOT NULL,
    "text_preview" TEXT,
    "chroma_doc_id" VARCHAR(255) NOT NULL,
    "extraction_metadata" JSON,
    "word_count" INTEGER,
    "char_count" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "google_drive_document_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_drive_image_captions" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "google_drive_account_id" VARCHAR(255) NOT NULL,
    "file_id" VARCHAR(255) NOT NULL,
    "caption" TEXT NOT NULL,
    "chroma_doc_id" VARCHAR(255) NOT NULL,
    "file_metadata" JSON,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "google_drive_image_captions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "google_drive_document_embeddings_file_id_key" ON "google_drive_document_embeddings"("file_id");

-- CreateIndex
CREATE UNIQUE INDEX "google_drive_document_embeddings_chroma_doc_id_key" ON "google_drive_document_embeddings"("chroma_doc_id");

-- CreateIndex
CREATE INDEX "idx_document_embeddings_file_id" ON "google_drive_document_embeddings"("file_id");

-- CreateIndex
CREATE INDEX "idx_document_embeddings_user_account" ON "google_drive_document_embeddings"("user_id", "google_drive_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "google_drive_image_captions_file_id_key" ON "google_drive_image_captions"("file_id");

-- CreateIndex
CREATE UNIQUE INDEX "google_drive_image_captions_chroma_doc_id_key" ON "google_drive_image_captions"("chroma_doc_id");

-- CreateIndex
CREATE INDEX "idx_image_captions_file_id" ON "google_drive_image_captions"("file_id");

-- CreateIndex
CREATE INDEX "idx_image_captions_user_account" ON "google_drive_image_captions"("user_id", "google_drive_account_id");

-- AddForeignKey
ALTER TABLE "subscribed_users" ADD CONSTRAINT "subscribed_users_subscription_plan_id_fkey" FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plans"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscribed_users" ADD CONSTRAINT "subscribed_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "google_drive_accounts" ADD CONSTRAINT "google_drive_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "google_drive_folders_trees" ADD CONSTRAINT "google_drive_folders_trees_google_drive_account_id_fkey" FOREIGN KEY ("google_drive_account_id") REFERENCES "google_drive_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "google_drive_folders_trees" ADD CONSTRAINT "google_drive_folders_trees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "google_drive_folders" ADD CONSTRAINT "google_drive_folders_google_drive_account_id_fkey" FOREIGN KEY ("google_drive_account_id") REFERENCES "google_drive_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "google_drive_folders" ADD CONSTRAINT "google_drive_folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "google_drive_files" ADD CONSTRAINT "google_drive_files_file_parents_fkey" FOREIGN KEY ("file_parents") REFERENCES "google_drive_folders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "google_drive_files" ADD CONSTRAINT "google_drive_files_google_drive_account_id_fkey" FOREIGN KEY ("google_drive_account_id") REFERENCES "google_drive_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "google_drive_files" ADD CONSTRAINT "google_drive_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "one_drive_accounts" ADD CONSTRAINT "one_drive_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "one_drive_folders_trees" ADD CONSTRAINT "one_drive_folders_trees_one_drive_account_id_fkey" FOREIGN KEY ("one_drive_account_id") REFERENCES "one_drive_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "one_drive_folders_trees" ADD CONSTRAINT "one_drive_folders_trees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "one_drive_folders" ADD CONSTRAINT "one_drive_folders_one_drive_account_id_fkey" FOREIGN KEY ("one_drive_account_id") REFERENCES "one_drive_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "one_drive_folders" ADD CONSTRAINT "one_drive_folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "one_drive_files" ADD CONSTRAINT "one_drive_files_file_parents_fkey" FOREIGN KEY ("file_parents") REFERENCES "one_drive_folders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "one_drive_files" ADD CONSTRAINT "one_drive_files_one_drive_account_id_fkey" FOREIGN KEY ("one_drive_account_id") REFERENCES "one_drive_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "one_drive_files" ADD CONSTRAINT "one_drive_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "google_drive_document_embeddings" ADD CONSTRAINT "google_drive_document_embeddings_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "google_drive_files"("file_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "google_drive_document_embeddings" ADD CONSTRAINT "google_drive_document_embeddings_google_drive_account_id_fkey" FOREIGN KEY ("google_drive_account_id") REFERENCES "google_drive_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "google_drive_document_embeddings" ADD CONSTRAINT "google_drive_document_embeddings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "google_drive_image_captions" ADD CONSTRAINT "google_drive_image_captions_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "google_drive_files"("file_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "google_drive_image_captions" ADD CONSTRAINT "google_drive_image_captions_google_drive_account_id_fkey" FOREIGN KEY ("google_drive_account_id") REFERENCES "google_drive_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "google_drive_image_captions" ADD CONSTRAINT "google_drive_image_captions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- RenameIndex
ALTER INDEX "otp_codes_user_id_idx" RENAME TO "ix_otp_codes_user_id";

-- RenameIndex
ALTER INDEX "users_email_key" RENAME TO "ix_users_email";
