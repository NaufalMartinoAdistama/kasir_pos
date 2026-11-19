<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaksi extends Model
{
    protected $table = 'tbl_transaksi';
    protected $primaryKey = 'id_transaksi';
    public $timestamps = false;

    protected $fillable = [
        'tanggal',
        'id_pelanggan',
        'total_belanja',
        'metode_pembayaran',
        'bayar',
        'kembalian',
        'diskon',
        'no_hp_penerima',
        'alamat_pengiriman',
        'latitude',
        'longitude',
        'bukti_pembayaran',
        'status_pesanan',
        'sumber_transaksi',
        'merchant_order_id',
        'duitku_reference',
    ];

    protected $casts = [
        'tanggal' => 'datetime:Y-m-d H:i:s',
        'total_belanja' => 'float',
        'id_pelanggan' => 'integer',
        'bayar' => 'float',
        'kembalian' => 'float',
        'diskon' => 'float',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    protected $appends = ['bukti_pembayaran_url'];

    public function getBuktiPembayaranUrlAttribute(): ?string
    {
        return $this->bukti_pembayaran ? asset($this->bukti_pembayaran) : null;
    }

    public function pelanggan(): BelongsTo
    {
        return $this->belongsTo(Pelanggan::class, 'id_pelanggan', 'id_pelanggan');
    }

    public function details(): HasMany
    {
        return $this->hasMany(DetailTransaksi::class, 'id_transaksi', 'id_transaksi');
    }
}
