<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tbl_transaksi', function (Blueprint $table) {
            if (!Schema::hasColumn('tbl_transaksi', 'order_id_midtrans')) {
                $table->string('order_id_midtrans', 100)->nullable()->unique()->after('sumber_transaksi');
            }
            if (!Schema::hasColumn('tbl_transaksi', 'snap_token')) {
                $table->string('snap_token', 255)->nullable()->after('order_id_midtrans');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_transaksi', function (Blueprint $table) {
            if (Schema::hasColumn('tbl_transaksi', 'snap_token')) {
                $table->dropColumn('snap_token');
            }
            if (Schema::hasColumn('tbl_transaksi', 'order_id_midtrans')) {
                $table->dropColumn('order_id_midtrans');
            }
        });
    }
};
