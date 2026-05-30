/*
  Warnings:

  - A unique constraint covering the columns `[TB_Device_ID]` on the table `DEVICE` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `TB_Device_ID` to the `DEVICE` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DEVICE" ADD COLUMN     "TB_Device_ID" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DEVICE_TB_Device_ID_key" ON "DEVICE"("TB_Device_ID");
