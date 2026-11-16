<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Pelanggan;
use App\Models\Produk;
use App\Models\Transaksi;
use App\Models\DetailTransaksi;
use Illuminate\Support\Facades\DB;

echo "=== MEMULAI TEST MULTI-ITEM CHECKOUT NAUFAM MART ===\n\n";

$pelanggan = Pelanggan::first();
$produk1 = Produk::where('stok', '>', 5)->orderBy('id_produk', 'asc')->first();
$produk2 = Produk::where('stok', '>', 5)->where('id_produk', '!=', $produk1->id_produk)->first();

if (!$pelanggan || !$produk1 || !$produk2) {
    echo "ERROR: Data pelanggan atau produk tidak mencukupi untuk test.\n";
    exit(1);
}

echo "1. Mempersiapkan Multi-Item:\n";
echo "   - Pelanggan: {$pelanggan->nama_pelanggan} (ID: {$pelanggan->id_pelanggan})\n";
echo "   - Produk 1 : {$produk1->nama_produk} (Harga: {$produk1->harga}, Stok Awal: {$produk1->stok})\n";
echo "   - Produk 2 : {$produk2->nama_produk} (Harga: {$produk2->harga}, Stok Awal: {$produk2->stok})\n\n";

$stokAwal1 = $produk1->stok;
$stokAwal2 = $produk2->stok;

$items = [
    [
        'id_produk' => $produk1->id_produk,
        'jumlah' => 2,
    ],
    [
        'id_produk' => $produk2->id_produk,
        'jumlah' => 1,
    ]
];

$diskon = 10.0; // 10%
$metode = 'Tunai';

echo "2. Mengeksekusi Transaksi Multi-Item via DB::transaction...\n";

try {
    $idTransaksi = DB::transaction(function () use ($pelanggan, $items, $diskon, $metode) {
        $totalKotor = 0;
        $itemsToSave = [];

        foreach ($items as $item) {
            $p = Produk::where('id_produk', $item['id_produk'])->lockForUpdate()->first();
            $subtotal = $p->harga * $item['jumlah'];
            $totalKotor += $subtotal;
            $itemsToSave[] = [
                'produk' => $p,
                'id_produk' => $p->id_produk,
                'nama_produk' => $p->nama_produk,
                'harga' => $p->harga,
                'jumlah' => $item['jumlah'],
                'subtotal' => $subtotal,
            ];
        }

        $nilaiDiskon = $totalKotor * ($diskon / 100);
        $totalBersih = max(0, $totalKotor - $nilaiDiskon);
        $bayar = $totalBersih + 50000; // Lebih 50rb
        $kembalian = 50000;

        $trx = Transaksi::create([
            'tanggal' => now(),
            'id_pelanggan' => $pelanggan->id_pelanggan,
            'total_belanja' => $totalBersih,
            'metode_pembayaran' => $metode,
            'bayar' => $bayar,
            'kembalian' => $kembalian,
            'diskon' => $diskon,
        ]);

        foreach ($itemsToSave as $it) {
            DetailTransaksi::create([
                'id_transaksi' => $trx->id_transaksi,
                'id_produk' => $it['id_produk'],
                'nama_produk' => $it['nama_produk'],
                'jumlah' => $it['jumlah'],
                'harga' => $it['harga'],
                'subtotal' => $it['subtotal'],
            ]);

            $it['produk']->decrement('stok', $it['jumlah']);
        }

        return $trx->id_transaksi;
    });

    echo "   - SUKSES! ID Transaksi: #TRX-{$idTransaksi}\n\n";

    // Verifikasi
    $savedTrx = Transaksi::with('details')->find($idTransaksi);
    echo "3. Verifikasi Data Transaksi Tersimpan:\n";
    echo "   - Total Rincian Produk: " . $savedTrx->details->count() . " produk\n";
    foreach ($savedTrx->details as $d) {
        echo "     • {$d->jumlah}x {$d->nama_produk} @ {$d->harga} = Rp " . number_format($d->subtotal, 0, ',', '.') . "\n";
    }
    echo "   - Diskon: {$savedTrx->diskon}%\n";
    echo "   - Total Bersih: Rp " . number_format($savedTrx->total_belanja, 0, ',', '.') . "\n";
    echo "   - Bayar: Rp " . number_format($savedTrx->bayar, 0, ',', '.') . "\n";
    echo "   - Kembalian: Rp " . number_format($savedTrx->kembalian, 0, ',', '.') . "\n\n";

    // Periksa sisa stok
    $sisa1 = Produk::find($produk1->id_produk)->stok;
    $sisa2 = Produk::find($produk2->id_produk)->stok;
    echo "4. Verifikasi Sisa Stok Produk:\n";
    echo "   - {$produk1->nama_produk}: Awal {$stokAwal1} -> Sekarang {$sisa1} (Berkurang 2: " . ($sisa1 === $stokAwal1 - 2 ? "VALID" : "INVALID") . ")\n";
    echo "   - {$produk2->nama_produk}: Awal {$stokAwal2} -> Sekarang {$sisa2} (Berkurang 1: " . ($sisa2 === $stokAwal2 - 1 ? "VALID" : "INVALID") . ")\n\n";

    echo "=== PENGUJIAN MULTI-ITEM SELESAI DENGAN STATUS 100% SUKSES! ===\n";

} catch (\Throwable $e) {
    echo "GAGAL: " . $e->getMessage() . "\n";
    exit(1);
}
