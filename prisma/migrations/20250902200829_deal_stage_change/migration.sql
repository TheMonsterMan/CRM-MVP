-- DropIndex
DROP INDEX "public"."Contact_accountId_idx";

-- DropIndex
DROP INDEX "public"."Deal_accountId_idx";

-- DropIndex
DROP INDEX "public"."Deal_contactId_idx";

-- DropIndex
DROP INDEX "public"."Deal_pipelineId_idx";

-- DropIndex
DROP INDEX "public"."Deal_stageId_idx";

-- CreateTable
CREATE TABLE "public"."DealStageChange" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "fromStageId" TEXT,
    "toStageId" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealStageChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DealStageChange_dealId_createdAt_idx" ON "public"."DealStageChange"("dealId", "createdAt");

-- CreateIndex
CREATE INDEX "DealStageChange_toStageId_createdAt_idx" ON "public"."DealStageChange"("toStageId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."DealStageChange" ADD CONSTRAINT "DealStageChange_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "public"."Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DealStageChange" ADD CONSTRAINT "DealStageChange_fromStageId_fkey" FOREIGN KEY ("fromStageId") REFERENCES "public"."Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DealStageChange" ADD CONSTRAINT "DealStageChange_toStageId_fkey" FOREIGN KEY ("toStageId") REFERENCES "public"."Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
