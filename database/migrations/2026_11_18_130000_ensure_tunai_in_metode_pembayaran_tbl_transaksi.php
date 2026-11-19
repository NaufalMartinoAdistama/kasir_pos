<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add 'Tunai' back into ENUM so Kasir POS can accept cash transactions
        DB::statement("ALTER TABLE tbl_transaksi MODIFY COLUMN metode_pembayaran ENUM('Tunai', 'QRIS', 'Transfer Bank', 'Kartu Debit') NOT NULL DEFAULT 'Tunai'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE tbl_transaksi MODIFY COLUMN metode_pembayaran ENUM('QRIS', 'Transfer Bank', 'Kartu Debit') NOT NULL DEFAULT 'QRIS'");
    }
};
