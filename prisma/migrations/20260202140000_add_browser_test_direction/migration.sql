-- AlterEnum
ALTER TYPE "CallLogDirection" ADD VALUE 'BROWSER_TEST';

-- AlterTable
ALTER TABLE "call_logs" ADD COLUMN "duration_seconds" INTEGER;
