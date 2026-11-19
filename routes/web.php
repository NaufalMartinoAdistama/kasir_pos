<?php

use App\Http\Controllers\CabangController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DuitkuController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\LogAktivitasController;
use App\Http\Controllers\PelangganController;
use App\Http\Controllers\PelangganPortalController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProdukController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Root: Halaman Welcome Publik Modern
Route::get('/', function () {
    $stats = [
        'total_produk' => \App\Models\Produk::count(),
        'total_transaksi' => \App\Models\Transaksi::count(),
        'total_pelanggan' => \App\Models\Pelanggan::count(),
    ];

    $produkList = \App\Models\Produk::with('kategori')
        ->orderBy('id_produk', 'asc')
        ->get();

    return \Inertia\Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'stats' => $stats,
        'produk_list' => $produkList,
    ]);
})->name('welcome');

// Common authenticated dashboard router
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth'])
    ->name('dashboard');

// Shared / Struk view accessible by both roles
Route::get('/transaksi/struk/{id}', [PosController::class, 'cetakStruk'])
    ->middleware(['auth'])
    ->name('transaksi.struk');

// -------------------------------------------------------------------------
// ROLE: ADMIN (Akses Penuh)
// -------------------------------------------------------------------------
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'adminDashboard'])->name('dashboard');

    // Master Cabang (db_tokokita)
    Route::resource('cabang', CabangController::class)->only(['index', 'store', 'update', 'destroy']);

    // Master Kategori
    Route::resource('kategori', KategoriController::class)->only(['index', 'store', 'update', 'destroy']);

    // Cetak Label Barcode & QR Produk
    Route::get('/produk/cetak-label', [ProdukController::class, 'cetakLabel'])->name('produk.cetak-label');

    // Master Produk
    Route::resource('produk', ProdukController::class)->only(['index', 'store', 'update', 'destroy']);

    // Master Pelanggan
    Route::resource('pelanggan', PelangganController::class)->only(['index', 'store', 'update', 'destroy']);

    // Riwayat Transaksi Admin
    Route::get('/transaksi', [PosController::class, 'riwayat'])->name('transaksi.index');
    Route::patch('/transaksi/{id}/status', [PosController::class, 'updateStatusPesanan'])->name('transaksi.update-status');

    // Laporan Penjualan (View Laporan & Direct Export)
    Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');
    Route::get('/laporan/export-csv', [LaporanController::class, 'exportCsv'])->name('laporan.export');
    Route::get('/laporan/export-excel', [LaporanController::class, 'exportExcel'])->name('laporan.export.excel');
    Route::get('/laporan/export-pdf', [LaporanController::class, 'exportPdf'])->name('laporan.export.pdf');

    // Audit Log Aktivitas (Trigger Database Monitor)
    Route::get('/log', [LogAktivitasController::class, 'index'])->name('log.index');

    // Manajemen Pengguna (Admin & Kasir)
    Route::resource('user', UserController::class)->only(['index', 'store', 'update', 'destroy']);
});

// -------------------------------------------------------------------------
// ROLE: KASIR (Operasional Penjualan)
// -------------------------------------------------------------------------
Route::middleware(['auth', 'role:kasir,admin'])->prefix('kasir')->name('kasir.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'kasirDashboard'])->name('dashboard');

    // POS / Transaksi
    Route::get('/pos', [PosController::class, 'index'])->name('pos');
    Route::post('/pos/proses', [PosController::class, 'prosesTransaksi'])->name('pos.proses');

    // Riwayat Transaksi Kasir
    Route::get('/riwayat', [PosController::class, 'riwayat'])->name('riwayat');
    Route::patch('/riwayat/{id}/status', [PosController::class, 'updateStatusPesanan'])->name('riwayat.update-status');

    // Data Pelanggan Kasir (View & Tambah)
    Route::get('/pelanggan', [PelangganController::class, 'index'])->name('pelanggan.index');
    Route::post('/pelanggan', [PelangganController::class, 'store'])->name('pelanggan.store');
    Route::put('/pelanggan/{id}', [PelangganController::class, 'update'])->name('pelanggan.update');

    // Laporan Penjualan Kasir
    Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');
    Route::get('/laporan/export-excel', [LaporanController::class, 'exportExcel'])->name('laporan.export.excel');
    Route::get('/laporan/export-pdf', [LaporanController::class, 'exportPdf'])->name('laporan.export.pdf');
});

// -------------------------------------------------------------------------
// ROLE: PELANGGAN (Portal Belanja Online & Pelacakan Pesanan)
// -------------------------------------------------------------------------
Route::middleware(['auth', 'role:pelanggan'])->prefix('pelanggan')->name('pelanggan.')->group(function () {
    Route::get('/katalog', [PelangganPortalController::class, 'katalog'])->name('katalog');
    Route::get('/checkout', [PelangganPortalController::class, 'checkout'])->name('checkout');
    Route::post('/checkout', [PelangganPortalController::class, 'prosesCheckout'])->name('checkout.proses');
    Route::get('/pesanan', [PelangganPortalController::class, 'pesanan'])->name('pesanan');
    Route::post('/pesanan/{id}/selesai', [PelangganPortalController::class, 'konfirmasiSelesai'])->name('pesanan.selesai');
    Route::post('/pesanan/{id}/bukti', [PelangganPortalController::class, 'uploadBukti'])->name('pesanan.bukti');
});

// -------------------------------------------------------------------------
// DUITKU PAYMENT GATEWAY
// -------------------------------------------------------------------------
Route::post('/duitku/callback', [DuitkuController::class, 'callback'])->name('duitku.callback');

// Halaman Pembayaran Khusus (Dedicated Payment Page) Duitku & Status Check
Route::get('/pembayaran/{merchant_order_id}', [DuitkuController::class, 'showPaymentPage'])->name('duitku.payment-page');
Route::post('/duitku/check-status', [DuitkuController::class, 'checkStatus'])->name('duitku.check-status');

Route::middleware('auth')->group(function () {
    Route::post('/duitku/create-invoice', [DuitkuController::class, 'createInvoice'])->name('duitku.create-invoice');
    Route::post('/duitku/update-status', [DuitkuController::class, 'updateStatus'])->name('duitku.update-status');
});

// Profile Management
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
