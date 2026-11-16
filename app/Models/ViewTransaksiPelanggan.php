<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ViewTransaksiPelanggan extends Model
{
    protected $table = 'view_transaksi_pelanggan';
    protected $primaryKey = 'id_transaksi';
    public $incrementing = false;
    public $timestamps = false;

    protected $casts = [
        'id_transaksi' => 'integer',
        'tanggal' => 'date:Y-m-d',
        'total_belanja' => 'float',
    ];
}
