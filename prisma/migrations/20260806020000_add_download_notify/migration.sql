-- AlterTable
ALTER TABLE "File" ADD COLUMN "notifyOnDownload" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "File" ADD COLUMN "downloadNotifiedAt" TIMESTAMP(3);
