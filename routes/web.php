<?php

use App\Http\Controllers\CabangController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\LogAktivitasController;
use App\Http\Controllers\PelangganController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProdukController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Root redirect
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

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

    // Laporan Penjualan (View Laporan)
    Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');
    Route::get('/laporan/export-csv', [LaporanController::class, 'exportCsv'])->name('laporan.export');

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

    // Data Pelanggan Kasir (View & Tambah)
    Route::get('/pelanggan', [PelangganController::class, 'index'])->name('pelanggan.index');
    Route::post('/pelanggan', [PelangganController::class, 'store'])->name('pelanggan.store');
    Route::put('/pelanggan/{id}', [PelangganController::class, 'update'])->name('pelanggan.update');
});

// Profile Management
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
