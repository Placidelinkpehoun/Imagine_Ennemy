/*
  Warnings:

  - You are about to drop the `attribute_specificities` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "attribute_specificities";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "specificities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "posX" REAL,
    "posY" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "specificity_attributes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "specificityId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "specificity_attributes_specificityId_fkey" FOREIGN KEY ("specificityId") REFERENCES "specificities" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "specificity_attributes_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "entities" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "specificity_attributes_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "attributes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "specificity_attributes_specificityId_entityId_attributeId_key" ON "specificity_attributes"("specificityId", "entityId", "attributeId");
