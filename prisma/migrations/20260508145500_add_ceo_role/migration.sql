-- AlterEnum
DO $$
BEGIN
  ALTER TYPE "UserRole" ADD VALUE 'ceo';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

