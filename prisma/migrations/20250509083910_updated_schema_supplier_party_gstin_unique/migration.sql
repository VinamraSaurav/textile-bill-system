/*
  Warnings:

  - A unique constraint covering the columns `[bill_number,bill_date]` on the table `Bill` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gstin]` on the table `Party` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gstin]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Bill_bill_number_bill_date_key" ON "Bill"("bill_number", "bill_date");

-- CreateIndex
CREATE UNIQUE INDEX "Party_gstin_key" ON "Party"("gstin");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_gstin_key" ON "Supplier"("gstin");
