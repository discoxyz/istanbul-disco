-- CreateTable
CREATE TABLE "Drop" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "schema" TEXT NOT NULL,
    "subjectData" TEXT NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "visible" BOOLEAN,
    "limit" INTEGER,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Drop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "Address" TEXT,
    "Did3" TEXT,
    "name" TEXT,
    "bio" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" SERIAL NOT NULL,
    "claimed" BOOLEAN,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DropToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ClaimToDrop" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ClaimToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Drop_path_key" ON "Drop"("path");

-- CreateIndex
CREATE UNIQUE INDEX "User_Address_key" ON "User"("Address");

-- CreateIndex
CREATE UNIQUE INDEX "User_Did3_key" ON "User"("Did3");

-- CreateIndex
CREATE UNIQUE INDEX "_DropToUser_AB_unique" ON "_DropToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_DropToUser_B_index" ON "_DropToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ClaimToDrop_AB_unique" ON "_ClaimToDrop"("A", "B");

-- CreateIndex
CREATE INDEX "_ClaimToDrop_B_index" ON "_ClaimToDrop"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ClaimToUser_AB_unique" ON "_ClaimToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ClaimToUser_B_index" ON "_ClaimToUser"("B");

-- AddForeignKey
ALTER TABLE "_DropToUser" ADD CONSTRAINT "_DropToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Drop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DropToUser" ADD CONSTRAINT "_DropToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClaimToDrop" ADD CONSTRAINT "_ClaimToDrop_A_fkey" FOREIGN KEY ("A") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClaimToDrop" ADD CONSTRAINT "_ClaimToDrop_B_fkey" FOREIGN KEY ("B") REFERENCES "Drop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClaimToUser" ADD CONSTRAINT "_ClaimToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClaimToUser" ADD CONSTRAINT "_ClaimToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
