-- CreateTable
CREATE TABLE "attributes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "game_classes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "game_classes_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "game_classes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "entities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "positionX" REAL,
    "positionY" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "connections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "connections_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "entities" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "connections_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "entities" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "game_class_attributes" (
    "gameClassId" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("gameClassId", "attributeId"),
    CONSTRAINT "game_class_attributes_gameClassId_fkey" FOREIGN KEY ("gameClassId") REFERENCES "game_classes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "game_class_attributes_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "attributes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "entity_attributes" (
    "entityId" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("entityId", "attributeId"),
    CONSTRAINT "entity_attributes_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "entities" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "entity_attributes_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "attributes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "attributes_name_key" ON "attributes"("name");
