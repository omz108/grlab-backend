/*
  Warnings:

  - A unique constraint covering the columns `[mobileNumber]` on the table `OTP` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OTP_mobileNumber_key" ON "OTP"("mobileNumber");
