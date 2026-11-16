<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use App\Models\ViewLaporanPenjualan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LaporanController extends Controller
{
    public function index(Request $request): Response
    {
        $dariTanggal = $request->input('dari_tanggal');
        $sampaiTanggal = $request->input('sampai_tanggal');
        $kategoriId = $request->input('id_kategori');
        $search = $request->input('search');

        $query = ViewLaporanPenjualan::query()
            ->when($dariTanggal, function ($q, $dariTanggal) {
                $q->whereDate('tanggal', '>=', $dariTanggal);
            })
            ->when($sampaiTanggal, function ($q, $sampaiTanggal) {
                $q->whereDate('tanggal', '<=', $sampaiTanggal);
            })
            ->when($kategoriId, function ($q, $kategoriId) {
                $q->where('id_kategori', $kategoriId);
            })
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('nama_pelanggan', 'like', "%{$search}%")
                        ->orWhere('nama_produk', 'like', "%{$search}%")
                        ->orWhere('kota', 'like', "%{$search}%");
                });
            });

        // Summary calculations
        $totalPendapatan = (float) (clone $query)->sum('subtotal');
        $totalItemTerjual = (int) (clone $query)->sum('jumlah');
        $totalTransaksiUnik = (clone $query)->distinct('id_transaksi')->count('id_transaksi');

        $laporan = $query->orderBy('tanggal', 'desc')
            ->orderBy('id_transaksi', 'desc')
            ->paginate(15)
            ->withQueryString();

        $kategoriList = Kategori::orderBy('nama_kategori')->get(['id_kategori', 'nama_kategori']);

        return Inertia::render('Admin/Laporan/Index', [
            'laporan' => $laporan,
            'summary' => [
                'total_pendapatan' => $totalPendapatan,
                'total_item' => $totalItemTerjual,
                'total_transaksi' => $totalTransaksiUnik,
            ],
            'kategori_list' => $kategoriList,
            'filters' => [
                'dari_tanggal' => $dariTanggal,
                'sampai_tanggal' => $sampaiTanggal,
                'id_kategori' => $kategoriId,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Export report data as CSV file.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $dariTanggal = $request->input('dari_tanggal');
        $sampaiTanggal = $request->input('sampai_tanggal');
        $kategoriId = $request->input('id_kategori');
        $search = $request->input('search');

        $data = ViewLaporanPenjualan::query()
            ->when($dariTanggal, fn ($q) => $q->whereDate('tanggal', '>=', $dariTanggal))
            ->when($sampaiTanggal, fn ($q) => $q->whereDate('tanggal', '<=', $sampaiTanggal))
            ->when($kategoriId, fn ($q) => $q->where('id_kategori', $kategoriId))
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('nama_pelanggan', 'like', "%{$search}%")
                        ->orWhere('nama_produk', 'like', "%{$search}%");
                });
            })
            ->orderBy('tanggal', 'desc')
            ->get();

        $fileName = 'laporan-penjualan-' . date('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$fileName\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($data) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['No Transaksi', 'Tanggal', 'Pelanggan', 'Kota', 'Kategori', 'Produk', 'Harga', 'Jumlah', 'Subtotal']);

            foreach ($data as $row) {
                fputcsv($handle, [
                    '#TRX-' . str_pad($row->id_transaksi, 5, '0', STR_PAD_LEFT),
                    $row->tanggal?->format('Y-m-d') ?? $row->tanggal,
                    $row->nama_pelanggan,
                    $row->kota,
                    $row->nama_kategori,
                    $row->nama_produk,
                    $row->harga,
                    $row->jumlah,
                    $row->subtotal,
                ]);
            }
            fclose($handle);
        }, 200, $headers);
    }
}
