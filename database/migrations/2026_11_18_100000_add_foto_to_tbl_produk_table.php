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
        Schema::table('tbl_produk', function (Blueprint $table) {
            if (!Schema::hasColumn('tbl_produk', 'foto')) {
                $table->string('foto', 255)->nullable()->after('stok');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_produk', function (Blueprint $table) {
            if (Schema::hasColumn('tbl_produk', 'foto')) {
                $table->dropColumn('foto');
            }
        });
    }
};
