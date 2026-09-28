/*
  Warnings:

  - You are about to drop the `AdminSmsVerification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `phoneNumber` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `phoneVerifiedAt` on the `Admin` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AdminSmsVerification_expiresAt_idx";

-- DropIndex
DROP INDEX "AdminSmsVerification_adminId_purpose_usedAt_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AdminSmsVerification";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "sessionVersion" INTEGER NOT NULL DEFAULT 0,
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Admin" ("createdAt", "id", "passwordHash", "sessionVersion", "totpEnabled", "totpSecret", "updatedAt", "username") SELECT "createdAt", "id", "passwordHash", "sessionVersion", "totpEnabled", "totpSecret", "updatedAt", "username" FROM "Admin";
DROP TABLE "Admin";
ALTER TABLE "new_Admin" RENAME TO "Admin";
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
