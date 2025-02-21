-- CreateTable
CREATE TABLE "key_value_mappings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "key_value_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens" (
    "id" TEXT NOT NULL,
    "mint" VARCHAR(50) NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "image_uri" TEXT NOT NULL,
    "twitter" TEXT NOT NULL DEFAULT '',
    "telegram" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "desc" TEXT NOT NULL DEFAULT '',
    "creator" VARCHAR(50) NOT NULL,
    "sol_amount" BIGINT NOT NULL DEFAULT 0,
    "sell_token_amount" BIGINT NOT NULL DEFAULT 0,
    "is_withdraw" BOOLEAN NOT NULL DEFAULT false,
    "is_launched" BOOLEAN NOT NULL DEFAULT false,
    "is_burn" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_histories" (
    "id" TEXT NOT NULL,
    "buyer" TEXT NOT NULL,
    "token_id" TEXT NOT NULL,
    "sol_in_amount" BIGINT NOT NULL,
    "token_output_amount" BIGINT NOT NULL,
    "hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buyers" (
    "id" TEXT NOT NULL,
    "buyer" TEXT NOT NULL,
    "token_id" TEXT NOT NULL,
    "token_amount" BIGINT NOT NULL DEFAULT 0,
    "sol_amount" BIGINT NOT NULL DEFAULT 0,
    "recovered_sol_amount" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "buyers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "key_value_mappings_key_key" ON "key_value_mappings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_mint_key" ON "tokens"("mint");

-- CreateIndex
CREATE UNIQUE INDEX "buyers_token_id_buyer_key" ON "buyers"("token_id", "buyer");

-- AddForeignKey
ALTER TABLE "purchase_histories" ADD CONSTRAINT "purchase_histories_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "tokens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyers" ADD CONSTRAINT "buyers_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "tokens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
