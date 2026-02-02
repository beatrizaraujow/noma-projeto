-- CreateTable
CREATE TABLE "triggers" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "event" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "triggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_templates" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "tasks" JSONB NOT NULL,
    "settings" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_tasks" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "frequency" TEXT NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "daysOfWeek" JSONB,
    "dayOfMonth" INTEGER,
    "monthOfYear" INTEGER,
    "taskTemplate" JSONB NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "lastRun" TIMESTAMP(3),
    "nextRun" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_assign_rules" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "conditions" JSONB NOT NULL,
    "strategy" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "lastUsed" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auto_assign_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "triggers_workspaceId_idx" ON "triggers"("workspaceId");

-- CreateIndex
CREATE INDEX "triggers_event_idx" ON "triggers"("event");

-- CreateIndex
CREATE INDEX "triggers_active_idx" ON "triggers"("active");

-- CreateIndex
CREATE INDEX "project_templates_workspaceId_idx" ON "project_templates"("workspaceId");

-- CreateIndex
CREATE INDEX "project_templates_category_idx" ON "project_templates"("category");

-- CreateIndex
CREATE INDEX "project_templates_isPublic_idx" ON "project_templates"("isPublic");

-- CreateIndex
CREATE INDEX "recurring_tasks_workspaceId_idx" ON "recurring_tasks"("workspaceId");

-- CreateIndex
CREATE INDEX "recurring_tasks_projectId_idx" ON "recurring_tasks"("projectId");

-- CreateIndex
CREATE INDEX "recurring_tasks_nextRun_idx" ON "recurring_tasks"("nextRun");

-- CreateIndex
CREATE INDEX "recurring_tasks_active_idx" ON "recurring_tasks"("active");

-- CreateIndex
CREATE INDEX "auto_assign_rules_workspaceId_idx" ON "auto_assign_rules"("workspaceId");

-- CreateIndex
CREATE INDEX "auto_assign_rules_projectId_idx" ON "auto_assign_rules"("projectId");

-- CreateIndex
CREATE INDEX "auto_assign_rules_active_idx" ON "auto_assign_rules"("active");

-- CreateIndex
CREATE INDEX "auto_assign_rules_priority_idx" ON "auto_assign_rules"("priority");
