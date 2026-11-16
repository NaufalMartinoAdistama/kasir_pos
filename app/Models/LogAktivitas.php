<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogAktivitas extends Model
{
    protected $table = 'tbl_log';
    protected $primaryKey = 'id_log';
    public $timestamps = false;

    protected $fillable = [
        'tabel_terkait',
        'aksi',
        'deskripsi',
        'waktu',
    ];

    protected $casts = [
        'waktu' => 'datetime',
    ];
}
