-- AlterEnum
DO $$
BEGIN
  CREATE TYPE "CallLogDirection" AS ENUM ('INBOUND', 'OUTBOUND');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "CallLogDirection" ADD VALUE IF NOT EXISTS 'BROWSER_TEST';

-- AlterTable
DO $$
BEGIN
  IF to_regclass('public.call_logs') IS NOT NULL THEN
    ALTER TABLE "call_logs" ADD COLUMN IF NOT EXISTS "duration_seconds" INTEGER;
  END IF;
END $$;
