/*
  Warnings:

  - You are about to drop the column `accessToken` on the `google_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `google_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `expiresIn` on the `google_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `gmailAccount` on the `google_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `google_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `google_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `google_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `fileCreatedTime` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `fileId` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `fileParents` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `googleDriveAccountId` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `google_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `google_drive_folders` table. All the data in the column will be lost.
  - You are about to drop the column `folderName` on the `google_drive_folders` table. All the data in the column will be lost.
  - You are about to drop the column `folderParents` on the `google_drive_folders` table. All the data in the column will be lost.
  - You are about to drop the column `folderPath` on the `google_drive_folders` table. All the data in the column will be lost.
  - You are about to drop the column `googleDriveAccountId` on the `google_drive_folders` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `google_drive_folders` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `google_drive_folders` table. All the data in the column will be lost.
  - The primary key for the `google_drive_folders_trees` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `google_drive_folders_trees` table. All the data in the column will be lost.
  - You are about to drop the column `folderTree` on the `google_drive_folders_trees` table. All the data in the column will be lost.
  - You are about to drop the column `googleDriveAccountId` on the `google_drive_folders_trees` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `google_drive_folders_trees` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `google_drive_folders_trees` table. All the data in the column will be lost.
  - You are about to drop the column `accessToken` on the `one_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `one_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `expiresIn` on the `one_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `onedriveAccount` on the `one_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `one_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `one_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `one_drive_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `one_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `fileCreatedTime` on the `one_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `fileId` on the `one_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `one_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `fileParents` on the `one_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `one_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `one_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `one_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `oneDriveAccountId` on the `one_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `one_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `one_drive_files` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `one_drive_folders` table. All the data in the column will be lost.
  - You are about to drop the column `folderName` on the `one_drive_folders` table. All the data in the column will be lost.
  - You are about to drop the column `folderParents` on the `one_drive_folders` table. All the data in the column will be lost.
  - You are about to drop the column `folderPath` on the `one_drive_folders` table. All the data in the column will be lost.
  - You are about to drop the column `oneDriveAccountId` on the `one_drive_folders` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `one_drive_folders` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `one_drive_folders` table. All the data in the column will be lost.
  - The primary key for the `one_drive_folders_trees` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `one_drive_folders_trees` table. All the data in the column will be lost.
  - You are about to drop the column `folderTree` on the `one_drive_folders_trees` table. All the data in the column will be lost.
  - You are about to drop the column `oneDriveAccountId` on the `one_drive_folders_trees` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `one_drive_folders_trees` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `one_drive_folders_trees` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `otp_codes` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `otp_codes` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `otp_codes` table. All the data in the column will be lost.
  - You are about to drop the column `connectedAccounts` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `connectedCloudAccounts` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `connectedEmailAccounts` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `connectedSocialAccounts` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `paidAmount` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `subEndTime` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `subStartTime` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionPlanId` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `subscribed_users` table. All the data in the column will be lost.
  - You are about to drop the column `actionLimit` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `maxConnectedDrives` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `subscription_plans` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gmail_account]` on the table `google_drive_accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[file_id]` on the table `google_drive_files` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[onedrive_account]` on the table `one_drive_accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[file_id]` on the table `one_drive_files` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `subscribed_users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `access_token` to the `google_drive_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_in` to the `google_drive_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gmail_account` to the `google_drive_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refresh_token` to the `google_drive_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `google_drive_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_created_time` to the `google_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_id` to the `google_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_name` to the `google_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_parents` to the `google_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_path` to the `google_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `google_drive_account_id` to the `google_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mime_type` to the `google_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `google_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folder_name` to the `google_drive_folders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folder_parents` to the `google_drive_folders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folder_path` to the `google_drive_folders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `google_drive_account_id` to the `google_drive_folders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `google_drive_folders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folder_tree` to the `google_drive_folders_trees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `google_drive_account_id` to the `google_drive_folders_trees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `google_drive_folders_trees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `access_token` to the `one_drive_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_in` to the `one_drive_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `onedrive_account` to the `one_drive_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refresh_token` to the `one_drive_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `one_drive_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_created_time` to the `one_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_id` to the `one_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_name` to the `one_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_parents` to the `one_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_path` to the `one_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mime_type` to the `one_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `one_drive_account_id` to the `one_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `one_drive_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folder_name` to the `one_drive_folders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folder_parents` to the `one_drive_folders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folder_path` to the `one_drive_folders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `one_drive_account_id` to the `one_drive_folders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `one_drive_folders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folder_tree` to the `one_drive_folders_trees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `one_drive_account_id` to the `one_drive_folders_trees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `one_drive_folders_trees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `otp_codes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `otp_codes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `connected_accounts` to the `subscribed_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subscription_plan_id` to the `subscribed_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `subscribed_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `subscribed_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `action_limit` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_connected_drives` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.

*/

TRUNCATE TABLE "google_drive_files" CASCADE;
TRUNCATE TABLE "google_drive_folders" CASCADE;
TRUNCATE TABLE "google_drive_folders_trees" CASCADE;
TRUNCATE TABLE "google_drive_accounts" CASCADE;
TRUNCATE TABLE "otp_codes" CASCADE;
TRUNCATE TABLE "subscribed_users" CASCADE;
TRUNCATE TABLE "subscription_plans" CASCADE;
-- DropForeignKey
ALTER TABLE "public"."google_drive_accounts" DROP CONSTRAINT "google_drive_accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."google_drive_files" DROP CONSTRAINT "google_drive_files_fileParents_fkey";

-- DropForeignKey
ALTER TABLE "public"."google_drive_files" DROP CONSTRAINT "google_drive_files_googleDriveAccountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."google_drive_files" DROP CONSTRAINT "google_drive_files_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."google_drive_folders" DROP CONSTRAINT "google_drive_folders_googleDriveAccountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."google_drive_folders" DROP CONSTRAINT "google_drive_folders_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."google_drive_folders_trees" DROP CONSTRAINT "google_drive_folders_trees_googleDriveAccountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."google_drive_folders_trees" DROP CONSTRAINT "google_drive_folders_trees_userId_fkey";

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
ALTER TABLE "public"."otp_codes" DROP CONSTRAINT "otp_codes_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscribed_users" DROP CONSTRAINT "subscribed_users_subscriptionPlanId_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscribed_users" DROP CONSTRAINT "subscribed_users_userId_fkey";

-- DropIndex
DROP INDEX "public"."google_drive_accounts_gmailAccount_key";

-- DropIndex
DROP INDEX "public"."google_drive_files_fileId_key";

-- DropIndex
DROP INDEX "public"."one_drive_accounts_onedriveAccount_key";

-- DropIndex
DROP INDEX "public"."one_drive_files_fileId_key";

-- DropIndex
DROP INDEX "public"."otp_codes_userId_idx";

-- DropIndex
DROP INDEX "public"."subscribed_users_userId_key";

-- AlterTable
ALTER TABLE "google_drive_accounts" DROP COLUMN "accessToken",
DROP COLUMN "createdAt",
DROP COLUMN "expiresIn",
DROP COLUMN "gmailAccount",
DROP COLUMN "refreshToken",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "access_token" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_in" BIGINT NOT NULL,
ADD COLUMN     "gmail_account" TEXT NOT NULL,
ADD COLUMN     "refresh_token" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "google_drive_files" DROP COLUMN "createdAt",
DROP COLUMN "fileCreatedTime",
DROP COLUMN "fileId",
DROP COLUMN "fileName",
DROP COLUMN "fileParents",
DROP COLUMN "filePath",
DROP COLUMN "fileSize",
DROP COLUMN "googleDriveAccountId",
DROP COLUMN "mimeType",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "file_created_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "file_id" TEXT NOT NULL,
ADD COLUMN     "file_name" TEXT NOT NULL,
ADD COLUMN     "file_parents" TEXT NOT NULL,
ADD COLUMN     "file_path" TEXT NOT NULL,
ADD COLUMN     "file_size" BIGINT,
ADD COLUMN     "google_drive_account_id" TEXT NOT NULL,
ADD COLUMN     "mime_type" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "google_drive_folders" DROP COLUMN "createdAt",
DROP COLUMN "folderName",
DROP COLUMN "folderParents",
DROP COLUMN "folderPath",
DROP COLUMN "googleDriveAccountId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "folder_name" TEXT NOT NULL,
ADD COLUMN     "folder_parents" TEXT NOT NULL,
ADD COLUMN     "folder_path" TEXT NOT NULL,
ADD COLUMN     "google_drive_account_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "google_drive_folders_trees" DROP CONSTRAINT "google_drive_folders_trees_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "folderTree",
DROP COLUMN "googleDriveAccountId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "folder_tree" JSONB NOT NULL,
ADD COLUMN     "google_drive_account_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD CONSTRAINT "google_drive_folders_trees_pkey" PRIMARY KEY ("google_drive_account_id");

-- AlterTable
ALTER TABLE "one_drive_accounts" DROP COLUMN "accessToken",
DROP COLUMN "createdAt",
DROP COLUMN "expiresIn",
DROP COLUMN "onedriveAccount",
DROP COLUMN "refreshToken",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "access_token" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_in" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "onedrive_account" TEXT NOT NULL,
ADD COLUMN     "refresh_token" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "one_drive_files" DROP COLUMN "createdAt",
DROP COLUMN "fileCreatedTime",
DROP COLUMN "fileId",
DROP COLUMN "fileName",
DROP COLUMN "fileParents",
DROP COLUMN "filePath",
DROP COLUMN "fileSize",
DROP COLUMN "mimeType",
DROP COLUMN "oneDriveAccountId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "file_created_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "file_id" TEXT NOT NULL,
ADD COLUMN     "file_name" TEXT NOT NULL,
ADD COLUMN     "file_parents" TEXT NOT NULL,
ADD COLUMN     "file_path" TEXT NOT NULL,
ADD COLUMN     "file_size" BIGINT,
ADD COLUMN     "mime_type" TEXT NOT NULL,
ADD COLUMN     "one_drive_account_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "one_drive_folders" DROP COLUMN "createdAt",
DROP COLUMN "folderName",
DROP COLUMN "folderParents",
DROP COLUMN "folderPath",
DROP COLUMN "oneDriveAccountId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "folder_name" TEXT NOT NULL,
ADD COLUMN     "folder_parents" TEXT NOT NULL,
ADD COLUMN     "folder_path" TEXT NOT NULL,
ADD COLUMN     "one_drive_account_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "one_drive_folders_trees" DROP CONSTRAINT "one_drive_folders_trees_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "folderTree",
DROP COLUMN "oneDriveAccountId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "folder_tree" JSONB NOT NULL,
ADD COLUMN     "one_drive_account_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD CONSTRAINT "one_drive_folders_trees_pkey" PRIMARY KEY ("one_drive_account_id");

-- AlterTable
ALTER TABLE "otp_codes" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "subscribed_users" DROP COLUMN "connectedAccounts",
DROP COLUMN "connectedCloudAccounts",
DROP COLUMN "connectedEmailAccounts",
DROP COLUMN "connectedSocialAccounts",
DROP COLUMN "createdAt",
DROP COLUMN "paidAmount",
DROP COLUMN "subEndTime",
DROP COLUMN "subStartTime",
DROP COLUMN "subscriptionPlanId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "connected_accounts" INTEGER NOT NULL,
ADD COLUMN     "connected_cloud_accounts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "connected_email_accounts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "connected_social_accounts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "paid_amount" DECIMAL(65,30),
ADD COLUMN     "sub_end_time" TIMESTAMP(3),
ADD COLUMN     "sub_start_time" TIMESTAMP(3),
ADD COLUMN     "subscription_plan_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "subscription_plans" DROP COLUMN "actionLimit",
DROP COLUMN "createdAt",
DROP COLUMN "maxConnectedDrives",
DROP COLUMN "updatedAt",
ADD COLUMN     "action_limit" BOOLEAN NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "max_connected_drives" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- CreateIndex
CREATE UNIQUE INDEX "google_drive_accounts_gmail_account_key" ON "google_drive_accounts"("gmail_account");

-- CreateIndex
CREATE UNIQUE INDEX "google_drive_files_file_id_key" ON "google_drive_files"("file_id");

-- CreateIndex
CREATE UNIQUE INDEX "one_drive_accounts_onedrive_account_key" ON "one_drive_accounts"("onedrive_account");

-- CreateIndex
CREATE UNIQUE INDEX "one_drive_files_file_id_key" ON "one_drive_files"("file_id");

-- CreateIndex
CREATE INDEX "otp_codes_user_id_idx" ON "otp_codes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscribed_users_user_id_key" ON "subscribed_users"("user_id");

-- AddForeignKey
ALTER TABLE "subscribed_users" ADD CONSTRAINT "subscribed_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscribed_users" ADD CONSTRAINT "subscribed_users_subscription_plan_id_fkey" FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plans"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_drive_accounts" ADD CONSTRAINT "google_drive_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_drive_folders_trees" ADD CONSTRAINT "google_drive_folders_trees_google_drive_account_id_fkey" FOREIGN KEY ("google_drive_account_id") REFERENCES "google_drive_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_drive_folders_trees" ADD CONSTRAINT "google_drive_folders_trees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_drive_folders" ADD CONSTRAINT "google_drive_folders_google_drive_account_id_fkey" FOREIGN KEY ("google_drive_account_id") REFERENCES "google_drive_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_drive_folders" ADD CONSTRAINT "google_drive_folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_drive_files" ADD CONSTRAINT "google_drive_files_google_drive_account_id_fkey" FOREIGN KEY ("google_drive_account_id") REFERENCES "google_drive_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_drive_files" ADD CONSTRAINT "google_drive_files_file_parents_fkey" FOREIGN KEY ("file_parents") REFERENCES "google_drive_folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_drive_files" ADD CONSTRAINT "google_drive_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_drive_accounts" ADD CONSTRAINT "one_drive_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_drive_folders_trees" ADD CONSTRAINT "one_drive_folders_trees_one_drive_account_id_fkey" FOREIGN KEY ("one_drive_account_id") REFERENCES "one_drive_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_drive_folders_trees" ADD CONSTRAINT "one_drive_folders_trees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_drive_folders" ADD CONSTRAINT "one_drive_folders_one_drive_account_id_fkey" FOREIGN KEY ("one_drive_account_id") REFERENCES "one_drive_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_drive_folders" ADD CONSTRAINT "one_drive_folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_drive_files" ADD CONSTRAINT "one_drive_files_one_drive_account_id_fkey" FOREIGN KEY ("one_drive_account_id") REFERENCES "one_drive_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_drive_files" ADD CONSTRAINT "one_drive_files_file_parents_fkey" FOREIGN KEY ("file_parents") REFERENCES "one_drive_folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_drive_files" ADD CONSTRAINT "one_drive_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
