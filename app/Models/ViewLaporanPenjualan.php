<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ViewLaporanPenjualan extends Model
{
    protected $table = 'view_laporan_penjualan';
    protected $primaryKey = 'id_detail';
    public $incrementing = false;
    public $timestamps = false;

    protected $casts = [
        'id_transaksi' => 'integer',
        'id_pelanggan' => 'integer',
        'id_kategori' => 'integer',
        'id_produk' => 'integer',
        'id_detail' => 'integer',
        'jumlah' => 'integer',
        'harga' => 'float',
        'subtotal' => 'float',
        'total_belanja' => 'float',
        'tanggal' => 'date:Y-m-d',
    ];
}
