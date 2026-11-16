<?php

require __DIR__ . '/../../vendor/autoload.php';

$app = require_once __DIR__ . '/../../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Produk;
use App\Models\Pelanggan;

echo "=== MENGISI DATA AWAL BARCODE PRODUK & RFID MEMBER ===\n\n";

// 1. Inisialisasi Barcode untuk seluruh produk yang belum memiliki barcode
$barcodePresets = [
    1 => 'PRD-8991001-01', // Mouse Wireless
    2 => 'PRD-8991002-02', // Keyboard Mechanical
    3 => 'PRD-8991003-03', // Mousepad Gaming
    4 => 'PRD-8991004-04', // Headset Gaming
    5 => 'PRD-8991005-05', // Flashdisk 64GB
    6 => 'PRD-8991006-06', // Monitor LED 24 Inch
    7 => 'PRD-8991007-07', // Kertas HVS A4
    8 => 'PRD-8991008-08', // Kopi Arabika
    9 => 'PRD-8991009-09', // Webcam Full HD
    10 => 'PRD-8991010-10', // Speaker Bluetooth
];

foreach ($barcodePresets as $id => $code) {
    $produk = Produk::find($id);
    if ($produk) {
        $produk->update(['kode_barcode' => $code]);
        echo "Produk #{$id} [{$produk->nama_produk}] => Barcode: {$code}\n";
    }
}

// 2. Inisialisasi RFID Member & Poin untuk beberapa pelanggan contoh
$rfidPresets = [
    1 => ['rfid' => 'RFID-8823901', 'poin' => 150, 'status' => 'Member RFID'], // Pelanggan Andi
    2 => ['rfid' => 'RFID-4410294', 'poin' => 280, 'status' => 'Member RFID'], // Pelanggan kedua
];

foreach ($rfidPresets as $id => $data) {
    $pelanggan = Pelanggan::find($id);
    if ($pelanggan) {
        $pelanggan->update([
            'kode_rfid' => $data['rfid'],
            'poin' => $data['poin'],
            'status_member' => $data['status'],
        ]);
        echo "Pelanggan #{$id} [{$pelanggan->nama_pelanggan}] => RFID: {$data['rfid']} (⭐ {$data['poin']} Poin, {$data['status']})\n";
    }
}

echo "\nData Barcode & RFID Berhasil Dikonfigurasi!\n";
