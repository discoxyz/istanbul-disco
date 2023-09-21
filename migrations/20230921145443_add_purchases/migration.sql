-- CreateTable
CREATE TABLE "Purchase" (
    "id" SERIAL NOT NULL,
    "stripeId" TEXT NOT NULL,
    "dropId" INTEGER NOT NULL,
    "userAddress" TEXT NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_stripeId_key" ON "Purchase"("stripeId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_dropId_key" ON "Purchase"("dropId");

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "Drop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userAddress_fkey" FOREIGN KEY ("userAddress") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
