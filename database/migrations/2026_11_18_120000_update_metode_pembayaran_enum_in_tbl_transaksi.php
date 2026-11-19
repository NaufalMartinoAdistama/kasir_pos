<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Normalisasi data lama agar kompatibel dengan enum baru
        DB::statement("UPDATE tbl_transaksi SET metode_pembayaran = 'Transfer Bank' WHERE metode_pembayaran = 'Transfer'");
        DB::statement("UPDATE tbl_transaksi SET metode_pembayaran = 'QRIS' WHERE metode_pembayaran = 'Tunai' OR metode_pembayaran NOT IN ('QRIS', 'Transfer Bank', 'Kartu Debit') OR metode_pembayaran IS NULL");

        // 2. Modifikasi kolom metode_pembayaran menjadi ENUM('QRIS', 'Transfer Bank', 'Kartu Debit')
        DB::statement("ALTER TABLE tbl_transaksi MODIFY COLUMN metode_pembayaran ENUM('QRIS', 'Transfer Bank', 'Kartu Debit') NOT NULL DEFAULT 'QRIS'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE tbl_transaksi MODIFY COLUMN metode_pembayaran VARCHAR(50) NULL DEFAULT 'QRIS'");
    }
};
