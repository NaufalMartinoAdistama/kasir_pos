<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ViewTotalBelanja extends Model
{
    protected $table = 'view_total_belanja';
    protected $primaryKey = 'id_pelanggan';
    public $incrementing = false;
    public $timestamps = false;

    protected $casts = [
        'id_pelanggan' => 'integer',
        'total_transaksi' => 'integer',
        'total_belanja' => 'float',
    ];
}
