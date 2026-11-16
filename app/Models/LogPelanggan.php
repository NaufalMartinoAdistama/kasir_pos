<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogPelanggan extends Model
{
    protected $table = 'log_pelanggan';
    protected $primaryKey = 'id_log';
    public $timestamps = false;

    protected $fillable = [
        'aktivitas',
        'id_pelanggan',
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
