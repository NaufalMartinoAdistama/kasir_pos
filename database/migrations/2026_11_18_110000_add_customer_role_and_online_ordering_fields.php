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
        // 1. Relasi users ke tbl_pelanggan
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'id_pelanggan')) {
                $table->integer('id_pelanggan')->nullable()->after('role')->index();
            }
        });

        // 2. Kolom tambahan pada tbl_pelanggan
        Schema::table('tbl_pelanggan', function (Blueprint $table) {
            if (!Schema::hasColumn('tbl_pelanggan', 'no_hp')) {
                $table->string('no_hp', 20)->nullable()->after('kota');
            }
            if (!Schema::hasColumn('tbl_pelanggan', 'alamat_lengkap')) {
                $table->text('alamat_lengkap')->nullable()->after('no_hp');
            }
            if (!Schema::hasColumn('tbl_pelanggan', 'latitude')) {
                $table->decimal('latitude', 10, 8)->nullable()->after('alamat_lengkap');
            }
            if (!Schema::hasColumn('tbl_pelanggan', 'longitude')) {
                $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            }
        });

        // 3. Kolom tambahan pada tbl_transaksi
        Schema::table('tbl_transaksi', function (Blueprint $table) {
            if (!Schema::hasColumn('tbl_transaksi', 'no_hp_penerima')) {
                $table->string('no_hp_penerima', 20)->nullable()->after('diskon');
            }
            if (!Schema::hasColumn('tbl_transaksi', 'alamat_pengiriman')) {
                $table->text('alamat_pengiriman')->nullable()->after('no_hp_penerima');
            }
            if (!Schema::hasColumn('tbl_transaksi', 'latitude')) {
                $table->decimal('latitude', 10, 8)->nullable()->after('alamat_pengiriman');
            }
            if (!Schema::hasColumn('tbl_transaksi', 'longitude')) {
                $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            }
            if (!Schema::hasColumn('tbl_transaksi', 'bukti_pembayaran')) {
                $table->string('bukti_pembayaran', 255)->nullable()->after('longitude');
            }
            if (!Schema::hasColumn('tbl_transaksi', 'status_pesanan')) {
                $table->enum('status_pesanan', [
                    'Menunggu Pembayaran',
                    'Diproses',
                    'Dikirim',
                    'Selesai',
                    'Dibatalkan'
                ])->default('Diproses')->after('bukti_pembayaran');
            }
            if (!Schema::hasColumn('tbl_transaksi', 'sumber_transaksi')) {
                $table->enum('sumber_transaksi', [
                    'POS Kasir',
                    'Online Pelanggan'
                ])->default('POS Kasir')->after('status_pesanan');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_transaksi', function (Blueprint $table) {
            $cols = ['sumber_transaksi', 'status_pesanan', 'bukti_pembayaran', 'longitude', 'latitude', 'alamat_pengiriman', 'no_hp_penerima'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('tbl_transaksi', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        Schema::table('tbl_pelanggan', function (Blueprint $table) {
            $cols = ['longitude', 'latitude', 'alamat_lengkap', 'no_hp'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('tbl_pelanggan', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'id_pelanggan')) {
                $table->dropColumn('id_pelanggan');
            }
        });
    }
};
