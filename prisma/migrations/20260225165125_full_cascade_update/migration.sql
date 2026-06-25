/*
  Warnings:

  - You are about to drop the column `access_token` on the `google_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `google_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `expires_in` on the `google_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `gmail_account` on the `google_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `google_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `google_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `google_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `file_created_time` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `file_id` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `file_name` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `file_parents` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `file_path` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `file_size` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `google_drive_account_id` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `md5Checksum` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `mime_type` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail_link` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `viewed_by_me_time` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `web_view_link` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `google_drive_folders` table. All the data in the column will be lost.
  - You are about to drop the column `folder_name` on the `google_drive_folders` table. All the data in the column will be lost.
  - You are about to drop the column `folder_parents` on the `google_drive_folders` table. All the data in the column will be lost.
  - You are about to drop the column `folder_path` on the `google_drive_folders` table. All the data in the column will be lost.
  - You are about to drop the column `google_drive_account_id` on the `google_drive_folders` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `google_drive_folders` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `google_drive_folders` table. All the data in the column will be lost.
  - The primary key for the `google_drive_folders_trees` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `google_drive_folders_trees` table. All the data in the column will be lost.
  - You are about to drop the column `folder_tree` on the `google_drive_folders_trees` table. All the data in the column will be lost.
  - You are about to drop the column `google_drive_account_id` on the `google_drive_folders_trees` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `google_drive_folders_trees` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `google_drive_folders_trees` table. All the data in the column will be lost.
  - You are about to drop the column `deltaLink` on the `one_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `scope` on the `one_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `lastModifiedTime` on the `one_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `md5Checksum` on the `one_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `webViewLink` on the `one_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `otp_codes` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `otp_codes` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `otp_codes` table. All the data in the column will be lost.
  - You are about to drop the column `cloud_deletion_usage` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `connected_cloud_accounts` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `connected_email_accounts` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `connected_social_accounts` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `email_deletion_usage` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `paid_amount` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `social_deletion_usage` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `sub_end_time` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `sub_start_time` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_plan_id` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `action_limit` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `max_connected_drives` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `subscription_plans` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gmailAccount]` on the table `google_drive_accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fileId]` on the table `google_drive_files` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `subscribed_users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accessToken` to the `google_drive_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresIn` to the `google_drive_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gmailAccount` to the `google_drive_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshToken` to the `google_drive_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `google_drive_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileCreatedTime` to the `google_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileId` to the `google_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileName` to the `google_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileParents` to the `google_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filePath` to the `google_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `googleDriveAccountId` to the `google_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `google_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `google_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folderName` to the `google_drive_folders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folderParents` to the `google_drive_folders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folderPath` to the `google_drive_folders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `googleDriveAccountId` to the `google_drive_folders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `google_drive_folders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folderTree` to the `google_drive_folders_trees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `googleDriveAccountId` to the `google_drive_folders_trees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `google_drive_folders_trees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `otp_codes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `otp_codes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subscriptionPlanId` to the `subscribed_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `subscribed_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `subscribed_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actionLimit` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxConnectedDrives` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.
*/

TRUNCATE TABLE "google_drive_files" CASCADE;
TRUNCATE TABLE "google_drive_folders" CASCADE;
TRUNCATE TABLE "google_drive_folders_trees" CASCADE;
TRUNCATE TABLE "google_drive_accounts" CASCADE;
TRUNCATE TABLE "otp_codes" CASCADE;
TRUNCATE TABLE "subscribed_users" CASCADE;
TRUNCATE TABLE "subscription_plans" CASCADE;
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
ALTER TABLE "public"."one_drive_accounts" DROP CONSTRAINT "one_drive_accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."one_drive_files" DROP CONSTRAINT "one_drive_files_fileParents_fkey";

-- DropForeignKey
ALTER TABLE "public"."one_drive_files" DROP CONSTRAINT "one_drive_files_oneDriveAccountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."one_drive_files" DROP CONSTRAINT "one_drive_files_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."one_drive_folders" DROP CONSTRAINT "one_drive_folders_oneDriveAccountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."one_drive_folders" DROP CONSTRAINT "one_drive_folders_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."one_drive_folders_trees" DROP CONSTRAINT "one_drive_folders_trees_oneDriveAccountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."one_drive_folders_trees" DROP CONSTRAINT "one_drive_folders_trees_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."otp_codes" DROP CONSTRAINT "otp_codes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscribed_users" DROP CONSTRAINT "subscribed_users_subscription_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscribed_users" DROP CONSTRAINT "subscribed_users_user_id_fkey";

-- DropIndex
DROP INDEX "public"."google_drive_accounts_gmail_account_key";

-- DropIndex
DROP INDEX "public"."google_drive_files_file_id_key";

-- DropIndex
DROP INDEX "public"."otp_codes_code_idx";

-- DropIndex
DROP INDEX "public"."otp_codes_user_id_idx";

-- DropIndex
DROP INDEX "public"."subscribed_users_user_id_key";

-- AlterTable
ALTER TABLE "google_drive_accounts" DROP COLUMN "access_token",
DROP COLUMN "created_at",
DROP COLUMN "expires_in",
DROP COLUMN "gmail_account",
DROP COLUMN "refresh_token",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "accessToken" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresIn" BIGINT NOT NULL,
ADD COLUMN     "gmailAccount" TEXT NOT NULL,
ADD COLUMN     "refreshToken" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "google_drive_files" DROP COLUMN "created_at",
DROP COLUMN "file_created_time",
DROP COLUMN "file_id",
DROP COLUMN "file_name",
DROP COLUMN "file_parents",
DROP COLUMN "file_path",
DROP COLUMN "file_size",
DROP COLUMN "google_drive_account_id",
DROP COLUMN "md5Checksum",
DROP COLUMN "mime_type",
DROP COLUMN "thumbnail_link",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
DROP COLUMN "viewed_by_me_time",
DROP COLUMN "web_view_link",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fileCreatedTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fileId" TEXT NOT NULL,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "fileParents" TEXT NOT NULL,
ADD COLUMN     "filePath" TEXT NOT NULL,
ADD COLUMN     "fileSize" BIGINT,
ADD COLUMN     "googleDriveAccountId" TEXT NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "google_drive_folders" DROP COLUMN "created_at",
DROP COLUMN "folder_name",
DROP COLUMN "folder_parents",
DROP COLUMN "folder_path",
DROP COLUMN "google_drive_account_id",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "folderName" TEXT NOT NULL,
ADD COLUMN     "folderParents" TEXT NOT NULL,
ADD COLUMN     "folderPath" TEXT NOT NULL,
ADD COLUMN     "googleDriveAccountId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "google_drive_folders_trees" DROP CONSTRAINT "google_drive_folders_trees_pkey",
DROP COLUMN "created_at",
DROP COLUMN "folder_tree",
DROP COLUMN "google_drive_account_id",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "folderTree" JSONB NOT NULL,
ADD COLUMN     "googleDriveAccountId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "google_drive_folders_trees_pkey" PRIMARY KEY ("googleDriveAccountId");

-- AlterTable
ALTER TABLE "one_drive_accounts" DROP COLUMN "deltaLink",
DROP COLUMN "scope",
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "one_drive_files" DROP COLUMN "lastModifiedTime",
DROP COLUMN "md5Checksum",
DROP COLUMN "webViewLink",
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "one_drive_folders" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "otp_codes" DROP COLUMN "created_at",
DROP COLUMN "expires_at",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "subscribed_users" DROP COLUMN "cloud_deletion_usage",
DROP COLUMN "connected_cloud_accounts",
DROP COLUMN "connected_email_accounts",
DROP COLUMN "connected_social_accounts",
DROP COLUMN "created_at",
DROP COLUMN "email_deletion_usage",
DROP COLUMN "notes",
DROP COLUMN "paid_amount",
DROP COLUMN "social_deletion_usage",
DROP COLUMN "sub_end_time",
DROP COLUMN "sub_start_time",
DROP COLUMN "subscription_plan_id",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "connectedCloudAccounts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "connectedEmailAccounts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "connectedSocialAccounts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "paidAmount" DECIMAL(65,30),
ADD COLUMN     "subEndTime" TIMESTAMP(3),
ADD COLUMN     "subStartTime" TIMESTAMP(3),
ADD COLUMN     "subscriptionPlanId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "subscription_plans" DROP COLUMN "action_limit",
DROP COLUMN "created_at",
DROP COLUMN "max_connected_drives",
DROP COLUMN "updated_at",
ADD COLUMN     "actionLimit" BOOLEAN NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "maxConnectedDrives" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- CreateIndex
CREATE UNIQUE INDEX "google_drive_accounts_gmailAccount_key" ON "google_drive_accounts"("gmailAccount");

-- CreateIndex
CREATE UNIQUE INDEX "google_drive_files_fileId_key" ON "google_drive_files"("fileId");

-- CreateIndex
CREATE INDEX "otp_codes_userId_idx" ON "otp_codes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscribed_users_userId_key" ON "subscribed_users"("userId");

-- AddForeignKey
ALTER TABLE "subscribed_users" ADD CONSTRAINT "subscribed_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscribed_users" ADD CONSTRAINT "subscribed_users_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plans"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_drive_accounts" ADD CONSTRAINT "google_drive_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_drive_folders_trees" ADD CONSTRAINT "google_drive_folders_trees_googleDriveAccountId_fkey" FOREIGN KEY ("googleDriveAccountId") REFERENCES "google_drive_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_drive_folders_trees" ADD CONSTRAINT "google_drive_folders_trees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_drive_folders" ADD CONSTRAINT "google_drive_folders_googleDriveAccountId_fkey" FOREIGN KEY ("googleDriveAccountId") REFERENCES "google_drive_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_drive_folders" ADD CONSTRAINT "google_drive_folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_drive_files" ADD CONSTRAINT "google_drive_files_googleDriveAccountId_fkey" FOREIGN KEY ("googleDriveAccountId") REFERENCES "google_drive_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_drive_files" ADD CONSTRAINT "google_drive_files_fileParents_fkey" FOREIGN KEY ("fileParents") REFERENCES "google_drive_folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_drive_files" ADD CONSTRAINT "google_drive_files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_drive_accounts" ADD CONSTRAINT "one_drive_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_drive_folders_trees" ADD CONSTRAINT "one_drive_folders_trees_oneDriveAccountId_fkey" FOREIGN KEY ("oneDriveAccountId") REFERENCES "one_drive_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_drive_folders_trees" ADD CONSTRAINT "one_drive_folders_trees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_drive_folders" ADD CONSTRAINT "one_drive_folders_oneDriveAccountId_fkey" FOREIGN KEY ("oneDriveAccountId") REFERENCES "one_drive_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_drive_folders" ADD CONSTRAINT "one_drive_folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_drive_files" ADD CONSTRAINT "one_drive_files_oneDriveAccountId_fkey" FOREIGN KEY ("oneDriveAccountId") REFERENCES "one_drive_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_drive_files" ADD CONSTRAINT "one_drive_files_fileParents_fkey" FOREIGN KEY ("fileParents") REFERENCES "one_drive_folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_drive_files" ADD CONSTRAINT "one_drive_files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
