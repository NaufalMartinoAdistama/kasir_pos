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
        Schema::table('tbl_transaksi', function (Blueprint $table) {
            if (!Schema::hasColumn('tbl_transaksi', 'merchant_order_id')) {
                $table->string('merchant_order_id', 100)->nullable()->unique()->after('sumber_transaksi');
            }
            if (!Schema::hasColumn('tbl_transaksi', 'duitku_reference')) {
                $table->string('duitku_reference', 100)->nullable()->after('merchant_order_id');
            }
        });

        // Ubah kolom metode_pembayaran menjadi VARCHAR(50) default 'Tunai'
        try {
            DB::statement("ALTER TABLE tbl_transaksi MODIFY COLUMN metode_pembayaran VARCHAR(50) NOT NULL DEFAULT 'Tunai'");
        } catch (\Throwable $e) {
            // Abaikan jika sudah VARCHAR(50)
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_transaksi', function (Blueprint $table) {
            if (Schema::hasColumn('tbl_transaksi', 'duitku_reference')) {
                $table->dropColumn('duitku_reference');
            }
            if (Schema::hasColumn('tbl_transaksi', 'merchant_order_id')) {
                $table->dropColumn('merchant_order_id');
            }
        });
    }
};
