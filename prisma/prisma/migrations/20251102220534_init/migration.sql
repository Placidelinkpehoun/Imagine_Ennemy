-- CreateTable
CREATE TABLE "attribute_specificities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "posX" REAL,
    "posY" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "attribute_specificities_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "entities" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attribute_specificities_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "attributes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "attribute_specificities_entityId_attributeId_key" ON "attribute_specificities"("entityId", "attributeId");
