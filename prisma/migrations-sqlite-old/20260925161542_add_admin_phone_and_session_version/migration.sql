-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "phoneVerifiedAt" DATETIME,
    "sessionVersion" INTEGER NOT NULL DEFAULT 0,
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Admin" ("createdAt", "id", "passwordHash", "totpEnabled", "totpSecret", "updatedAt", "username") SELECT "createdAt", "id", "passwordHash", "totpEnabled", "totpSecret", "updatedAt", "username" FROM "Admin";
DROP TABLE "Admin";
ALTER TABLE "new_Admin" RENAME TO "Admin";
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
