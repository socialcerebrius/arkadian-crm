-- CreateEnum
CREATE TYPE "CallLogDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- AlterTable
ALTER TABLE "leads" ADD COLUMN "last_call_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "call_logs" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "vapi_call_id" TEXT,
    "direction" "CallLogDirection" NOT NULL,
    "status" VARCHAR(100) NOT NULL DEFAULT 'pending',
    "outcome" VARCHAR(500),
    "summary" TEXT,
    "transcript" TEXT,
    "recording_url" TEXT,
    "transferred" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "call_logs_vapi_call_id_key" ON "call_logs"("vapi_call_id");

-- CreateIndex
CREATE INDEX "call_logs_lead_id_started_at_idx" ON "call_logs"("lead_id", "started_at" DESC);

-- CreateIndex
CREATE INDEX "call_logs_lead_id_created_at_idx" ON "call_logs"("lead_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
