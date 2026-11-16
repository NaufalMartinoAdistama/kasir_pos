<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogPerubahanPelanggan extends Model
{
    protected $table = 'log_perubahan_pelanggan';
    protected $primaryKey = 'id_log';
    public $timestamps = false;

    protected $fillable = [
        'id_pelanggan',
        'nama_lama',
        'nama_baru',
        'waktu',
    ];

    protected $casts = [
        'waktu' => 'datetime',
    ];

    public function pelanggan(): BelongsTo
    {
        return $this->belongsTo(Pelanggan::class, 'id_pelanggan', 'id_pelanggan');
    }
}
