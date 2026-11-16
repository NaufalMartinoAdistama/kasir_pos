<?php

namespace App\Http\Controllers;

use App\Models\DetailTransaksi;
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

        return redirect()->route('kasir.dashboard');
    }

    /**
     * Admin Dashboard with rich store statistics.
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

        // Penjualan 7 hari terakhir
        $penjualan7Hari = Transaksi::select(
            DB::raw('DATE(tanggal) as tgl'),
            DB::raw('SUM(total_belanja) as total'),
            DB::raw('COUNT(id_transaksi) as jumlah_transaksi')
        )
            ->where('tanggal', '>=', Carbon::now()->subDays(6)->toDateString())
            ->groupBy('tgl')
            ->orderBy('tgl', 'asc')
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_pendapatan' => $totalPendapatan,
                'total_transaksi' => $totalTransaksi,
                'total_produk' => $totalProduk,
                'total_pelanggan' => $totalPelanggan,
                'stok_menipis' => $stokMenipisCount,
            ],
            'produk_stok_menipis' => $produkStokMenipis,
            'transaksi_terbaru' => $transaksiTerbaru,
            'grafik_penjualan' => $penjualan7Hari,
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

        $transaksiTerakhir = Transaksi::with(['pelanggan', 'details.produk'])
            ->whereDate('tanggal', $today)
            ->orderByDesc('id_transaksi')
            ->take(8)
            ->get();

        $produkPopuler = DetailTransaksi::select('id_produk', DB::raw('SUM(jumlah) as total_terjual'))
            ->with('produk.kategori')
            ->groupBy('id_produk')
            ->orderByDesc('total_terjual')
            ->take(5)
            ->get();

        return Inertia::render('Kasir/Dashboard', [
            'stats' => [
                'transaksi_hari_ini' => $transaksiHariIni,
                'pendapatan_hari_ini' => $pendapatanHariIni,
                'total_produk' => $totalProduk,
                'stok_tersedia' => $stokTersedia,
            ],
            'transaksi_terakhir' => $transaksiTerakhir,
            'produk_populer' => $produkPopuler,
        ]);
    }
}
