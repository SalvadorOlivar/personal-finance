-- CreateTable
CREATE TABLE "PendingExpense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "amount" REAL,
    "notes" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
