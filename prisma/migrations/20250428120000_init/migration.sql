-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('website_voice', 'website_form', 'website_game', 'phone', 'referral', 'broker', 'walk_in', 'social_media');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new', 'contacted', 'viewing_booked', 'negotiating', 'closed_won', 'closed_lost');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('two_bed', 'three_bed', 'three_bed_large', 'four_bed_duplex', 'penthouse');

-- CreateEnum
CREATE TYPE "ViewPreference" AS ENUM ('sea', 'golf', 'city', 'dual');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('low', 'medium', 'high', 'immediate');

-- CreateEnum
CREATE TYPE "CallDirection" AS ENUM ('inbound', 'outbound');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('positive', 'neutral', 'negative');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('task', 'call', 'email', 'whatsapp', 'viewing', 'meeting', 'note', 'follow_up');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'manager', 'sales_rep', 'viewer');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "AIOutputType" AS ENUM ('summary', 'score', 'follow_up_whatsapp', 'follow_up_email', 'recommendation', 'call_analysis');

-- CreateEnum
CREATE TYPE "Lifestyle" AS ENUM ('family', 'professional', 'investor', 'retiree', 'luxury_seeker');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "avatar_url" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "source" "LeadSource" NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'new',
    "budget_min" BIGINT,
    "budget_max" BIGINT,
    "preferred_unit" "UnitType",
    "preferred_view" "ViewPreference",
    "preferred_tower" VARCHAR(10),
    "urgency" "Urgency" NOT NULL DEFAULT 'medium',
    "language" VARCHAR(10) NOT NULL DEFAULT 'en',
    "score" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "lost_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "owner_id" TEXT,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calls" (
    "id" TEXT NOT NULL,
    "vapi_call_id" TEXT,
    "direction" "CallDirection" NOT NULL DEFAULT 'inbound',
    "transcript" TEXT,
    "summary" TEXT,
    "sentiment" "Sentiment",
    "duration_seconds" INTEGER,
    "recording_url" TEXT,
    "caller_phone" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lead_id" TEXT NOT NULL,

    CONSTRAINT "calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "due_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "status" "ActivityStatus" NOT NULL DEFAULT 'pending',
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "lead_id" TEXT NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_sessions" (
    "id" TEXT NOT NULL,
    "visitor_name" TEXT,
    "visitor_phone" TEXT,
    "visitor_email" TEXT,
    "lifestyle" "Lifestyle",
    "unit_type" "UnitType",
    "view_preference" "ViewPreference",
    "budget_range" VARCHAR(100),
    "amenity_priorities" JSONB NOT NULL DEFAULT '[]',
    "ai_recommendation" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lead_id" TEXT,

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_outputs" (
    "id" TEXT NOT NULL,
    "type" "AIOutputType" NOT NULL,
    "prompt_version" VARCHAR(50),
    "input_context" JSONB,
    "output" TEXT NOT NULL,
    "model" VARCHAR(100) NOT NULL DEFAULT 'claude-sonnet-4-20250514',
    "tokens_used" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lead_id" TEXT NOT NULL,

    CONSTRAINT "ai_outputs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_score_idx" ON "leads"("score" DESC);

-- CreateIndex
CREATE INDEX "leads_owner_id_idx" ON "leads"("owner_id");

-- CreateIndex
CREATE INDEX "leads_created_at_idx" ON "leads"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "calls_vapi_call_id_key" ON "calls"("vapi_call_id");

-- CreateIndex
CREATE INDEX "calls_lead_id_created_at_idx" ON "calls"("lead_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "activities_lead_id_due_at_idx" ON "activities"("lead_id", "due_at");

-- CreateIndex
CREATE INDEX "activities_user_id_due_at_idx" ON "activities"("user_id", "due_at");

-- CreateIndex
CREATE INDEX "game_sessions_lead_id_idx" ON "game_sessions"("lead_id");

-- CreateIndex
CREATE INDEX "ai_outputs_lead_id_type_created_at_idx" ON "ai_outputs"("lead_id", "type", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_outputs" ADD CONSTRAINT "ai_outputs_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
