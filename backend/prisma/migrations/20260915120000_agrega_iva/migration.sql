-- IVA del producto, en centavos. Las transacciones anteriores quedan en 0
-- porque se cobraron antes de que existiera el impuesto en el desglose.
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "vatCents" INTEGER NOT NULL DEFAULT 0;
