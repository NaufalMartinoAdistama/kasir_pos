<?php

namespace App\Http\Controllers;

use App\Exports\LaporanPenjualanExport;
use App\Models\Kategori;
use App\Models\ViewLaporanPenjualan;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class LaporanController extends Controller
{
    /**
     * Helper to resolve start & end date based on period filter.
     */
    protected function resolveDateRange(Request $request): array
    {
        $periode = $request->input('periode', 'bulanan'); // harian | mingguan | bulanan | tahunan | custom
        $tanggal = $request->input('tanggal', Carbon::today()->toDateString());
        $bulan = (int) $request->input('bulan', Carbon::now()->month);
        $tahun = (int) $request->input('tahun', Carbon::now()->year);

        $dariTanggal = $request->input('dari_tanggal');
        $sampaiTanggal = $request->input('sampai_tanggal');
        $periodeInfo = '';

        if ($periode === 'harian') {
            $parsed = Carbon::parse($tanggal);
            $dariTanggal = $parsed->toDateString();
            $sampaiTanggal = $parsed->toDateString();
            $periodeInfo = 'Harian (' . $parsed->translatedFormat('d F Y') . ')';
        } elseif ($periode === 'mingguan') {
            $parsed = Carbon::parse($tanggal);
            $dariTanggal = $parsed->copy()->subDays(6)->toDateString();
            $sampaiTanggal = $parsed->toDateString();
            $periodeInfo = 'Mingguan (' . Carbon::parse($dariTanggal)->translatedFormat('d M') . ' - ' . Carbon::parse($sampaiTanggal)->translatedFormat('d M Y') . ')';
        } elseif ($periode === 'tahunan') {
            $dariTanggal = Carbon::createFromDate($tahun, 1, 1)->toDateString();
            $sampaiTanggal = Carbon::createFromDate($tahun, 12, 31)->toDateString();
            $periodeInfo = 'Tahunan (Tahun ' . $tahun . ')';
        } elseif ($periode === 'bulanan') {
            $dariTanggal = Carbon::createFromDate($tahun, $bulan, 1)->startOfMonth()->toDateString();
            $sampaiTanggal = Carbon::createFromDate($tahun, $bulan, 1)->endOfMonth()->toDateString();
            $periodeInfo = 'Bulanan (' . Carbon::createFromDate($tahun, $bulan, 1)->translatedFormat('F Y') . ')';
        } else {
            // Custom
            $periode = 'custom';
            $periodeInfo = ($dariTanggal ?: 'Awal') . ' s/d ' . ($sampaiTanggal ?: 'Sekarang');
        }

        return [
            'periode' => $periode,
            'tanggal' => $tanggal,
            'bulan' => $bulan,
            'tahun' => $tahun,
            'dari_tanggal' => $dariTanggal,
            'sampai_tanggal' => $sampaiTanggal,
            'periode_info' => $periodeInfo,
        ];
    }

    /**
     * Display reports page with dynamic period filtering.
     */
    public function index(Request $request): Response
    {
        $range = $this->resolveDateRange($request);
        $kategoriId = $request->input('id_kategori');
        $search = $request->input('search');

        $query = ViewLaporanPenjualan::query()
            ->when($range['dari_tanggal'], fn ($q, $d) => $q->whereDate('tanggal', '>=', $d))
            ->when($range['sampai_tanggal'], fn ($q, $s) => $q->whereDate('tanggal', '<=', $s))
            ->when($kategoriId, fn ($q, $k) => $q->where('id_kategori', $k))
            ->when($search, function ($q, $s) {
                $q->where(function ($sub) use ($s) {
                    $sub->where('nama_pelanggan', 'like', "%{$s}%")
                        ->orWhere('nama_produk', 'like', "%{$s}%")
                        ->orWhere('kota', 'like', "%{$s}%");
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
            'filters' => array_merge($range, [
                'id_kategori' => $kategoriId,
                'search' => $search,
            ]),
        ]);
    }

    /**
     * Direct Download Export to Excel (.xlsx).
     */
    public function exportExcel(Request $request): BinaryFileResponse
    {
        $range = $this->resolveDateRange($request);
        $kategoriId = $request->input('id_kategori');
        $search = $request->input('search');

        $data = ViewLaporanPenjualan::query()
            ->when($range['dari_tanggal'], fn ($q, $d) => $q->whereDate('tanggal', '>=', $d))
            ->when($range['sampai_tanggal'], fn ($q, $s) => $q->whereDate('tanggal', '<=', $s))
            ->when($kategoriId, fn ($q, $k) => $q->where('id_kategori', $k))
            ->when($search, function ($q, $s) {
                $q->where(function ($sub) use ($s) {
                    $sub->where('nama_pelanggan', 'like', "%{$s}%")
                        ->orWhere('nama_produk', 'like', "%{$s}%");
                });
            })
            ->orderBy('tanggal', 'desc')
            ->get();

        $fileName = 'Laporan-Penjualan-Toko-Kita-' . date('Ymd_His') . '.xlsx';

        return Excel::download(new LaporanPenjualanExport($data, $range['periode_info']), $fileName);
    }

    /**
     * Direct Download Export to PDF (.pdf).
     */
    public function exportPdf(Request $request): HttpResponse
    {
        $range = $this->resolveDateRange($request);
        $kategoriId = $request->input('id_kategori');
        $search = $request->input('search');

        $query = ViewLaporanPenjualan::query()
            ->when($range['dari_tanggal'], fn ($q, $d) => $q->whereDate('tanggal', '>=', $d))
            ->when($range['sampai_tanggal'], fn ($q, $s) => $q->whereDate('tanggal', '<=', $s))
            ->when($kategoriId, fn ($q, $k) => $q->where('id_kategori', $k))
            ->when($search, function ($q, $s) {
                $q->where(function ($sub) use ($s) {
                    $sub->where('nama_pelanggan', 'like', "%{$s}%")
                        ->orWhere('nama_produk', 'like', "%{$s}%");
                });
            });

        $items = $query->orderBy('tanggal', 'desc')->get();
        $totalOmset = (float) $items->sum('subtotal');
        $totalItem = (int) $items->sum('jumlah');
        $totalTransaksi = $items->pluck('id_transaksi')->unique()->count();

        $pdf = Pdf::loadView('pdf.laporan-penjualan', [
            'items' => $items,
            'periode_info' => $range['periode_info'],
            'total_omset' => $totalOmset,
            'total_item' => $totalItem,
            'total_transaksi' => $totalTransaksi,
        ])->setPaper('a4', 'portrait');

        $fileName = 'Laporan-Penjualan-Toko-Kita-' . date('Ymd_His') . '.pdf';

        return $pdf->download($fileName);
    }
}
