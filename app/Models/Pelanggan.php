<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Pelanggan extends Model
{
    protected $table = 'tbl_pelanggan';
    protected $primaryKey = 'id_pelanggan';
    public $timestamps = false;

    protected $fillable = [
        'nama_pelanggan',
        'kota',
        'no_hp',
        'alamat_lengkap',
        'latitude',
        'longitude',
        'kode_rfid',
        'poin',
        'status_member',
    ];

    protected $casts = [
        'poin' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'id_pelanggan', 'id_pelanggan');
    }

    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class, 'id_pelanggan', 'id_pelanggan');
    }
}
