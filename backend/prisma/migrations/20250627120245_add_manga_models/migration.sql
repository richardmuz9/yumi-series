-- CreateTable
CREATE TABLE "MangaProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "settings" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" DATETIME NOT NULL,
    "characters" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "MangaChapter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "writingSource" TEXT,
    CONSTRAINT "MangaChapter_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "MangaProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MangaPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageNumber" INTEGER NOT NULL,
    "layout" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "MangaPage_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "MangaChapter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Panel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "background" TEXT,
    "characters" TEXT NOT NULL,
    "dialogues" TEXT NOT NULL,
    "effects" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    CONSTRAINT "Panel_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "MangaPage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
