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
        Schema::table('tbl_pelanggan', function (Blueprint $table) {
            if (!Schema::hasColumn('tbl_pelanggan', 'kode_rfid')) {
                $table->string('kode_rfid', 50)->nullable()->unique()->after('kota');
            }
            if (!Schema::hasColumn('tbl_pelanggan', 'poin')) {
                $table->integer('poin')->default(0)->after('kode_rfid');
            }
            if (!Schema::hasColumn('tbl_pelanggan', 'status_member')) {
                $table->enum('status_member', ['Reguler', 'Member RFID'])->default('Reguler')->after('poin');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_pelanggan', function (Blueprint $table) {
            if (Schema::hasColumn('tbl_pelanggan', 'status_member')) {
                $table->dropColumn('status_member');
            }
            if (Schema::hasColumn('tbl_pelanggan', 'poin')) {
                $table->dropColumn('poin');
            }
            if (Schema::hasColumn('tbl_pelanggan', 'kode_rfid')) {
                $table->dropColumn('kode_rfid');
            }
        });
    }
};
