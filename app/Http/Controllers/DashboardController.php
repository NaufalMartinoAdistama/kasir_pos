<?php

namespace App\Http\Controllers;

use App\Models\DetailTransaksi;
use App\Models\Kategori;
use App\Models\Pelanggan;
use App\Models\Produk;
use App\Models\Transaksi;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Dispatch user to respective dashboard based on role.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        if ($user->role === 'pelanggan') {
            return redirect()->route('pelanggan.katalog');
        }

        return redirect()->route('kasir.dashboard');
    }

    /**
     * Admin Dashboard with rich store statistics and Recharts visualization data.
     */
    public function adminDashboard(): Response
    {
        $totalPendapatan = (float) Transaksi::sum('total_belanja');
        $totalTransaksi = Transaksi::count();
        $totalProduk = Produk::count();
        $totalPelanggan = Pelanggan::count();

        // Stok menipis (<= 10)
        $stokMenipisCount = Produk::where('stok', '<=', 10)->count();
        $produkStokMenipis = Produk::with('kategori')
            ->where('stok', '<=', 10)
            ->orderBy('stok', 'asc')
            ->take(5)
            ->get();

        // Transaksi terbaru
        $transaksiTerbaru = Transaksi::with(['pelanggan', 'details.produk'])
            ->orderByDesc('id_transaksi')
            ->take(6)
            ->get();

        // Tren Penjualan 7 hari terakhir (Lengkap dengan default 7 hari)
        $penjualan7Hari = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->toDateString();
            $label = Carbon::now()->subDays($i)->locale('id')->isoFormat('D MMM');
            $row = Transaksi::whereDate('tanggal', $date)
                ->selectRaw('COALESCE(SUM(total_belanja), 0) as total, COUNT(id_transaksi) as count')
                ->first();

            $penjualan7Hari[] = [
                'tgl' => $date,
                'label' => $label,
                'total' => (float) ($row->total ?? 0),
                'transaksi' => (int) ($row->count ?? 0),
            ];
        }

        // Total akumulasi unit stok fisik
        $totalStok = (int) Produk::sum('stok');

        // Produk terpopuler / penjualan tertinggi
        $produkPopuler = DetailTransaksi::select('id_produk', DB::raw('SUM(jumlah) as total_terjual'), DB::raw('SUM(subtotal) as total_omset'))
            ->with('produk.kategori')
            ->groupBy('id_produk')
            ->orderByDesc('total_terjual')
            ->take(8)
            ->get();

        // Distribusi Kategori Penjualan
        $distribusiKategori = DB::table('tbl_detail_transaksi')
            ->join('tbl_produk', 'tbl_detail_transaksi.id_produk', '=', 'tbl_produk.id_produk')
            ->join('tbl_kategori', 'tbl_produk.id_kategori', '=', 'tbl_kategori.id_kategori')
            ->select(
                'tbl_kategori.nama_kategori as name',
                DB::raw('SUM(tbl_detail_transaksi.jumlah) as total_unit'),
                DB::raw('SUM(tbl_detail_transaksi.subtotal) as total_omset')
            )
            ->groupBy('tbl_kategori.id_kategori', 'tbl_kategori.nama_kategori')
            ->orderByDesc('total_unit')
            ->take(6)
            ->get();

        // Fallback jika belum ada transaksi di kategori
        if ($distribusiKategori->isEmpty()) {
            $kategoriList = Kategori::withCount('produk')->take(5)->get();
            $distribusiKategori = $kategoriList->map(function ($k) {
                return [
                    'name' => $k->nama_kategori,
                    'total_unit' => $k->produk_count ?: 5,
                    'total_omset' => $k->produk_count * 50000 ?: 250000,
                ];
            });
        }

        // Top 5 Produk untuk BarChart Recharts
        $top5ProdukChart = $produkPopuler->take(5)->map(function ($item) {
            return [
                'name' => $item->produk?->nama_produk ?: "Produk #{$item->id_produk}",
                'terjual' => (int) $item->total_terjual,
                'omset' => (float) $item->total_omset,
            ];
        });

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_pendapatan' => $totalPendapatan,
                'total_transaksi' => $totalTransaksi,
                'total_produk' => $totalProduk,
                'total_pelanggan' => $totalPelanggan,
                'total_stok' => $totalStok,
                'stok_menipis' => $stokMenipisCount,
            ],
            'produk_stok_menipis' => $produkStokMenipis,
            'produk_populer' => $produkPopuler,
            'transaksi_terbaru' => $transaksiTerbaru,
            'grafik_penjualan' => $penjualan7Hari,
            'distribusi_kategori' => $distribusiKategori,
            'top_produk_chart' => $top5ProdukChart,
        ]);
    }

    /**
     * Kasir Dashboard focused on today's sales and active transactions.
     */
    public function kasirDashboard(): Response
    {
        $today = Carbon::today()->toDateString();

        $transaksiHariIni = Transaksi::whereDate('tanggal', $today)->count();
        $pendapatanHariIni = (float) Transaksi::whereDate('tanggal', $today)->sum('total_belanja');
        $totalProduk = Produk::count();
        $stokTersedia = Produk::where('stok', '>', 0)->count();
        $stokMenipisCount = Produk::where('stok', '<=', 10)->count();
        $totalStok = (int) Produk::sum('stok');

        $transaksiTerakhir = Transaksi::with(['pelanggan', 'details.produk'])
            ->whereDate('tanggal', $today)
            ->orderByDesc('id_transaksi')
            ->take(8)
            ->get();

        $produkPopuler = DetailTransaksi::select('id_produk', DB::raw('SUM(jumlah) as total_terjual'), DB::raw('SUM(subtotal) as total_omset'))
            ->with('produk.kategori')
            ->groupBy('id_produk')
            ->orderByDesc('total_terjual')
            ->take(8)
            ->get();

        // Grafik Penjualan Per Jam Hari Ini (atau per rentang jam: 08-11, 11-14, 14-17, 17-20, 20-23)
        $jamSlots = [
            ['label' => '08:00 - 10:59', 'from' => '08:00:00', 'to' => '10:59:59'],
            ['label' => '11:00 - 13:59', 'from' => '11:00:00', 'to' => '13:59:59'],
            ['label' => '14:00 - 16:59', 'from' => '14:00:00', 'to' => '16:59:59'],
            ['label' => '17:00 - 19:59', 'from' => '17:00:00', 'to' => '19:59:59'],
            ['label' => '20:00 - 22:59', 'from' => '20:00:00', 'to' => '22:59:59'],
        ];

        $penjualanPerJam = [];
        foreach ($jamSlots as $slot) {
            $row = Transaksi::whereDate('tanggal', $today)
                ->whereTime('tanggal', '>=', $slot['from'])
                ->whereTime('tanggal', '<=', $slot['to'])
                ->selectRaw('COALESCE(SUM(total_belanja), 0) as total, COUNT(id_transaksi) as count')
                ->first();

            $penjualanPerJam[] = [
                'jam' => $slot['label'],
                'total' => (float) ($row->total ?? 0),
                'transaksi' => (int) ($row->count ?? 0),
            ];
        }

        // Komposisi Metode Pembayaran Kasir (Tunai, QRIS, Transfer Bank, Kartu Debit)
        $metodeList = ['Tunai', 'QRIS', 'Transfer Bank', 'Kartu Debit'];
        $komposisiPembayaran = [];
        $totalMetodeCount = 0;

        foreach ($metodeList as $metode) {
            $count = Transaksi::where('metode_pembayaran', $metode)->count();
            $omset = (float) Transaksi::where('metode_pembayaran', $metode)->sum('total_belanja');
            $totalMetodeCount += $count;
            $komposisiPembayaran[] = [
                'name' => $metode,
                'count' => $count,
                'total' => $omset,
            ];
        }

        // Jika data transaksi masih kosong, berikan estimasi representatif
        if ($totalMetodeCount === 0) {
            $komposisiPembayaran = [
                ['name' => 'Tunai', 'count' => 15, 'total' => 750000],
                ['name' => 'QRIS', 'count' => 10, 'total' => 450000],
                ['name' => 'Transfer Bank', 'count' => 5, 'total' => 300000],
                ['name' => 'Kartu Debit', 'count' => 4, 'total' => 200000],
            ];
        }

        return Inertia::render('Kasir/Dashboard', [
            'stats' => [
                'transaksi_hari_ini' => $transaksiHariIni,
                'pendapatan_hari_ini' => $pendapatanHariIni,
                'total_produk' => $totalProduk,
                'stok_tersedia' => $stokTersedia,
                'stok_menipis' => $stokMenipisCount,
                'total_stok' => $totalStok,
            ],
            'transaksi_terakhir' => $transaksiTerakhir,
            'produk_populer' => $produkPopuler,
            'penjualan_per_jam' => $penjualanPerJam,
            'komposisi_pembayaran' => $komposisiPembayaran,
        ]);
    }
}
