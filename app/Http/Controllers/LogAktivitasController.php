<?php

namespace App\Http\Controllers;

use App\Models\LogAktivitas;
use App\Models\LogPelanggan;
use App\Models\LogPerubahanPelanggan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LogAktivitasController extends Controller
{
    public function index(Request $request): Response
    {
        $tab = $request->input('tab', 'stok'); // 'stok', 'pelanggan', 'perubahan_nama'
        $search = $request->input('search');
        $aksi = $request->input('aksi');

        // 1. Logs stok inventaris (tbl_log via after_update_stok_produk)
        $logs = LogAktivitas::query()
            ->when($search, function ($query, $search) {
                $query->where('deskripsi', 'like', "%{$search}%")
                    ->orWhere('tabel_terkait', 'like', "%{$search}%");
            })
            ->when($aksi, function ($query, $aksi) {
                $query->where('aksi', $aksi);
            })
            ->orderBy('id_log', 'desc')
            ->paginate(15, ['*'], 'page_stok')
            ->withQueryString();

        // 2. Logs mutasi pelanggan (log_pelanggan via after_insert_pelanggan & after_delete_pelanggan)
        $logPelanggan = LogPelanggan::with('pelanggan')
            ->orderBy('id_log', 'desc')
            ->paginate(15, ['*'], 'page_pelanggan')
            ->withQueryString();

        // 3. Logs perubahan nama pelanggan (log_perubahan_pelanggan via after_update_pelanggan)
        $logPerubahanNama = LogPerubahanPelanggan::with('pelanggan')
            ->orderBy('id_log', 'desc')
            ->paginate(15, ['*'], 'page_perubahan')
            ->withQueryString();

        $aksiList = LogAktivitas::select('aksi')->distinct()->pluck('aksi');

        return Inertia::render('Admin/Log/Index', [
            'logs' => $logs,
            'log_pelanggan' => $logPelanggan,
            'log_perubahan_nama' => $logPerubahanNama,
            'active_tab' => $tab,
            'aksi_list' => $aksiList,
            'filters' => [
                'search' => $search,
                'aksi' => $aksi,
                'tab' => $tab,
            ],
        ]);
    }
}
