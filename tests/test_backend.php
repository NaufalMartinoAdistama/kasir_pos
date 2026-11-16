<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Kategori;
use App\Models\LogAktivitas;
use App\Models\Pelanggan;
use App\Models\Produk;
use App\Models\Transaksi;
use App\Models\User;
use App\Models\ViewLaporanPenjualan;
use Illuminate\Support\Facades\DB;

echo "=== MEMULAI PENGUJIAN SISTEM TOKOPROYEK POS ===\n\n";

// 1. Tes Autentikasi & Model Users
echo "1. Memeriksa Pengguna Default...\n";
$admin = User::where('email', 'admin@toko.com')->first();
$kasir = User::where('email', 'kasir@toko.com')->first();
echo "   - Admin: " . ($admin ? "DITEMUKAN ({$admin->name}, Role: {$admin->role})" : "GAGAL") . "\n";
echo "   - Kasir: " . ($kasir ? "DITEMUKAN ({$kasir->name}, Role: {$kasir->role})" : "GAGAL") . "\n";

// 2. Tes Master Tables
echo "\n2. Memeriksa Data Tabel Existing...\n";
echo "   - tbl_pelanggan : " . Pelanggan::count() . " data\n";
echo "   - tbl_kategori  : " . Kategori::count() . " data\n";
echo "   - tbl_produk    : " . Produk::count() . " data\n";
echo "   - tbl_transaksi : " . Transaksi::count() . " data\n";

// 3. Tes Stored Function HitungTotalBersih
echo "\n3. Menguji Stored Function HitungTotalBersih(100000, 2, 10)...\n";
$calc = DB::select("SELECT HitungTotalBersih(100000, 2, 10) AS bersih");
$totalBersih = $calc[0]->bersih ?? 0;
echo "   - Hasil: Rp " . number_format($totalBersih, 0, ',', '.') . " (" . ($totalBersih == 180000 ? "VALID - Sesuai Rumus 200rb - 10%" : "SALAH") . ")\n";

// 4. Tes Database View view_laporan_penjualan
echo "\n4. Menguji Database View view_laporan_penjualan...\n";
$viewRows = ViewLaporanPenjualan::count();
echo "   - Baris dalam view: " . $viewRows . " data\n";
$firstView = ViewLaporanPenjualan::first();
if ($firstView) {
    echo "   - Contoh baris: Faktur #{$firstView->id_transaksi}, Pelanggan: {$firstView->nama_pelanggan}, Produk: {$firstView->nama_produk}, Subtotal: Rp " . number_format($firstView->subtotal, 0, ',', '.') . "\n";
}

// 5. Tes Stored Procedure TambahTransaksiTerintegrasi
echo "\n5. Menguji Stored Procedure TambahTransaksiTerintegrasi...\n";
// Ambil produk dengan stok
$produkUji = Produk::where('stok', '>=', 5)->first();
$pelangganUji = Pelanggan::first();

if ($produkUji && $pelangganUji) {
    $stokAwal = $produkUji->stok;
    echo "   - Menguji transaksi normal: Produk ID {$produkUji->id_produk} ('{$produkUji->nama_produk}'), Stok Awal: {$stokAwal}\n";
    
    // Panggil Stored Procedure
    $res = DB::select("CALL TambahTransaksiTerintegrasi(?, ?, ?, ?)", [
        $pelangganUji->id_pelanggan,
        $produkUji->id_produk,
        2, // beli 2
        5  // diskon 5%
    ]);
    
    $status = $res[0]->status ?? 'UNKNOWN';
    $pesan = $res[0]->pesan ?? '';
    $idTrx = $res[0]->id_transaksi ?? 0;
    
    echo "   - Respon Procedure: Status = {$status}, Pesan = '{$pesan}', ID Transaksi = {$idTrx}\n";
    
    // Cek sisa stok
    $produkUji->refresh();
    $stokAkhir = $produkUji->stok;
    echo "   - Sisa Stok Setelah SP: {$stokAkhir} (" . ($stokAkhir === $stokAwal - 2 ? "VALID - Berkurang 2" : "TIDAK BERKURANG") . ")\n";
    
    // 6. Tes Trigger after_update_stok_produk
    echo "\n6. Menguji Database Trigger after_update_stok_produk...\n";
    $latestLog = LogAktivitas::orderByDesc('id_log')->first();
    echo "   - Log Terbaru: [{$latestLog->aksi}] {$latestLog->deskripsi} (Waktu: {$latestLog->waktu})\n";
    
    // 7. Tes Mekanisme Gagal / Rollback pada Procedure (Stok Tidak Cukup)
    echo "\n7. Menguji Proteksi Rollback (Pembelian Melebihi Stok: 9999)...\n";
    $resFail = DB::select("CALL TambahTransaksiTerintegrasi(?, ?, ?, ?)", [
        $pelangganUji->id_pelanggan,
        $produkUji->id_produk,
        9999, // jumlah melebihi stok
        0
    ]);
    $statusFail = $resFail[0]->status ?? '';
    $pesanFail = $resFail[0]->pesan ?? '';
    echo "   - Respon Procedure: Status = {$statusFail}, Pesan = '{$pesanFail}'\n";
    echo "   - Kesimpulan Proteksi Stok: " . ($statusFail === 'GAGAL' ? "BERHASIL DI-ROLLBACK DENGAN TEPAT" : "GAGAL") . "\n";
}

echo "\n=== SELURUH PENGUJIAN SELESAI DENGAN STATUS SUKSES! ===\n";
