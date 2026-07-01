-- AlterTable tasks: add time tracking columns + update status default
ALTER TABLE "tasks" ADD COLUMN "estimatedHours" DOUBLE PRECISION;
ALTER TABLE "tasks" ADD COLUMN "actualHours" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'EM_PROGRESSO';

-- CreateTable time_entries
CREATE TABLE "time_entries" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable routines
CREATE TABLE "routines" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "frequency" TEXT NOT NULL DEFAULT 'DAILY',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "allowedRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable routine_completions
CREATE TABLE "routine_completions" (
    "id" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodKey" TEXT NOT NULL,

    CONSTRAINT "routine_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "time_entries_taskId_idx" ON "time_entries"("taskId");
CREATE INDEX "time_entries_userId_idx" ON "time_entries"("userId");
CREATE INDEX "routines_workspaceId_idx" ON "routines"("workspaceId");
CREATE UNIQUE INDEX "routine_completions_routineId_userId_periodKey_key" ON "routine_completions"("routineId", "userId", "periodKey");
CREATE INDEX "routine_completions_routineId_idx" ON "routine_completions"("routineId");

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "routines" ADD CONSTRAINT "routines_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "routine_completions" ADD CONSTRAINT "routine_completions_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "routine_completions" ADD CONSTRAINT "routine_completions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
