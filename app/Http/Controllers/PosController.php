<?php

namespace App\Http\Controllers;

use App\Models\DetailTransaksi;
use App\Models\Pelanggan;
use App\Models\Produk;
use App\Models\Transaksi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    /**
     * Point of Sale (POS) transaction checkout page.
     */
    public function index(): Response
    {
        $pelangganList = Pelanggan::orderBy('nama_pelanggan', 'asc')->get([
            'id_pelanggan',
            'nama_pelanggan',
            'kota',
            'kode_rfid',
            'poin',
            'status_member',
        ]);
        $produkList = Produk::with('kategori')
            ->orderBy('nama_produk', 'asc')
            ->get(['id_produk', 'id_kategori', 'nama_produk', 'kode_barcode', 'harga', 'stok', 'foto']);

        return Inertia::render('Kasir/Pos/Index', [
            'pelanggan_list' => $pelangganList,
            'produk_list' => $produkList,
            'last_transaksi_id' => session('last_transaksi_id'),
        ]);
    }

    /**
     * Process transaction using Stored Procedure TambahTransaksiTerintegrasi.
     * Contains START TRANSACTION, COMMIT, ROLLBACK, and automatic stock deduction.
     */
    public function prosesTransaksi(Request $request): RedirectResponse
    {
        // 1. Dukungan Transaksi Multi-Item (Lebih dari 1 Produk)
        if ($request->has('items') && is_array($request->input('items')) && count($request->input('items')) > 0) {
            $validated = $request->validate([
                'id_pelanggan' => ['required', 'exists:tbl_pelanggan,id_pelanggan'],
                'items' => ['required', 'array', 'min:1'],
                'items.*.id_produk' => ['required', 'exists:tbl_produk,id_produk'],
                'items.*.jumlah' => ['required', 'integer', 'min:1'],
                'diskon' => ['nullable', 'numeric', 'min:0', 'max:100'],
                'metode_pembayaran' => ['nullable', 'string', 'max:50'],
                'bayar' => ['nullable', 'numeric', 'min:0'],
            ], [
                'id_pelanggan.required' => 'Pilih pelanggan terlebih dahulu.',
                'items.required' => 'Keranjang belanja minimal berisi 1 produk.',
                'items.min' => 'Keranjang belanja minimal berisi 1 produk.',
                'diskon.max' => 'Diskon maksimal 100%.',
            ]);

            $idPelanggan = (int) $validated['id_pelanggan'];
            $items = $validated['items'];
            $diskon = isset($validated['diskon']) ? (float) $validated['diskon'] : 0.0;
            $metode = in_array($validated['metode_pembayaran'] ?? '', ['Tunai', 'QRIS', 'Transfer Bank', 'Kartu Debit'])
                ? $validated['metode_pembayaran']
                : 'Tunai';
            $inputBayar = $validated['bayar'] ?? null;

            try {
                $idTransaksi = DB::transaction(function () use ($idPelanggan, $items, $diskon, $metode, $inputBayar) {
                    $totalKotor = 0;
                    $itemsToSave = [];

                    // Lock and validate stock for each product
                    foreach ($items as $item) {
                        $idProduk = (int) $item['id_produk'];
                        $qty = max(1, (int) $item['jumlah']);

                        $produk = Produk::where('id_produk', $idProduk)->lockForUpdate()->first();
                        if (!$produk) {
                            throw new \Exception("Produk ID #{$idProduk} tidak ditemukan.");
                        }

                        if ($produk->stok < $qty) {
                            throw new \Exception("Stok \"{$produk->nama_produk}\" tidak mencukupi! Sisa: {$produk->stok}, diminta: {$qty}.");
                        }

                        $subtotal = (float) $produk->harga * $qty;
                        $totalKotor += $subtotal;

                        $itemsToSave[] = [
                            'produk' => $produk,
                            'id_produk' => $idProduk,
                            'nama_produk' => $produk->nama_produk,
                            'harga' => (float) $produk->harga,
                            'jumlah' => $qty,
                            'subtotal' => $subtotal,
                        ];
                    }

                    // Hitung potongan diskon & total bersih
                    $nilaiDiskon = $totalKotor * ($diskon / 100);
                    $totalBersih = max(0, $totalKotor - $nilaiDiskon);

                    $nominalBayar = $inputBayar !== null && $inputBayar !== '' && (float) $inputBayar > 0
                        ? (float) $inputBayar
                        : $totalBersih;
                    $kembalian = max(0, $nominalBayar - $totalBersih);

                    // Simpan master transaksi
                    $transaksi = Transaksi::create([
                        'tanggal' => now(),
                        'id_pelanggan' => $idPelanggan,
                        'total_belanja' => $totalBersih,
                        'metode_pembayaran' => $metode,
                        'bayar' => $nominalBayar,
                        'kembalian' => $kembalian,
                        'diskon' => $diskon,
                    ]);

                    // Simpan setiap item rincian & kurangi stok (Trigger after_update_stok_produk otomatis mencatat ke tbl_log)
                    foreach ($itemsToSave as $itemData) {
                        DetailTransaksi::create([
                            'id_transaksi' => $transaksi->id_transaksi,
                            'id_produk' => $itemData['id_produk'],
                            'nama_produk' => $itemData['nama_produk'],
                            'jumlah' => $itemData['jumlah'],
                            'harga' => $itemData['harga'],
                            'subtotal' => $itemData['subtotal'],
                        ]);

                        $itemData['produk']->decrement('stok', $itemData['jumlah']);
                    }

                    return $transaksi->id_transaksi;
                });

                return redirect()->route('kasir.pos')
                    ->with('success', 'Transaksi berhasil diproses dengan ' . count($items) . ' produk!')
                    ->with('last_transaksi_id', $idTransaksi);

            } catch (\Throwable $e) {
                return redirect()->route('kasir.pos')
                    ->with('error', $e->getMessage());
            }
        }

        // 2. Fallback Transaksi Single-Item via Stored Procedure TambahTransaksiTerintegrasi
        $validated = $request->validate([
            'id_pelanggan' => ['required', 'exists:tbl_pelanggan,id_pelanggan'],
            'id_produk' => ['required', 'exists:tbl_produk,id_produk'],
            'jumlah' => ['required', 'integer', 'min:1'],
            'diskon' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'metode_pembayaran' => ['nullable', 'string', 'max:50'],
            'bayar' => ['nullable', 'numeric', 'min:0'],
        ], [
            'id_pelanggan.required' => 'Pilih pelanggan terlebih dahulu.',
            'id_produk.required' => 'Pilih produk yang dibeli.',
            'jumlah.min' => 'Jumlah beli minimal 1.',
            'diskon.max' => 'Diskon maksimal 100%.',
        ]);

        $idPelanggan = (int) $validated['id_pelanggan'];
        $idProduk = (int) $validated['id_produk'];
        $jumlah = (int) $validated['jumlah'];
        $diskon = isset($validated['diskon']) ? (float) $validated['diskon'] : 0.0;
        $metode = in_array($validated['metode_pembayaran'] ?? '', ['QRIS', 'Transfer Bank', 'Kartu Debit'])
            ? $validated['metode_pembayaran']
            : 'QRIS';

        try {
            $result = DB::select('CALL TambahTransaksiTerintegrasi(?, ?, ?, ?)', [
                $idPelanggan,
                $idProduk,
                $jumlah,
                $diskon,
            ]);

            $status = $result[0]->status ?? 'GAGAL';
            $pesan = $result[0]->pesan ?? 'Terjadi kesalahan sistem.';
            $idTransaksi = isset($result[0]->id_transaksi) ? (int) $result[0]->id_transaksi : 0;

            if ($status === 'SUKSES') {
                if ($idTransaksi > 0) {
                    $trx = Transaksi::find($idTransaksi);
                    if ($trx) {
                        $nominalBayar = isset($validated['bayar']) && $validated['bayar'] > 0
                            ? (float) $validated['bayar']
                            : (float) $trx->total_belanja;
                        $kembalian = max(0, $nominalBayar - (float) $trx->total_belanja);

                        $trx->update([
                            'metode_pembayaran' => $metode,
                            'bayar' => $nominalBayar,
                            'kembalian' => $kembalian,
                            'diskon' => $diskon,
                        ]);
                    }
                }

                return redirect()->route('kasir.pos')
                    ->with('success', $pesan)
                    ->with('last_transaksi_id', $idTransaksi);
            }

            return redirect()->route('kasir.pos')
                ->with('error', $pesan);
        } catch (\Throwable $e) {
            return redirect()->route('kasir.pos')
                ->with('error', 'Gagal memproses transaksi: ' . $e->getMessage());
        }
    }

    /**
     * Transaction history view for Kasir & Admin.
     */
    public function riwayat(Request $request): Response
    {
        $search = $request->input('search');
        $dariTanggal = $request->input('dari_tanggal');
        $sampaiTanggal = $request->input('sampai_tanggal');
        $sumber = $request->input('sumber_transaksi'); // 'Semua', 'POS Kasir', 'Online Pelanggan'
        $statusPesanan = $request->input('status_pesanan');

        $transaksi = Transaksi::with(['pelanggan', 'details.produk.kategori'])
            ->when($search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->whereHas('pelanggan', function ($sub) use ($search) {
                        $sub->where('nama_pelanggan', 'like', "%{$search}%")
                            ->orWhere('no_hp', 'like', "%{$search}%");
                    })
                    ->orWhere('no_hp_penerima', 'like', "%{$search}%")
                    ->orWhere('alamat_pengiriman', 'like', "%{$search}%")
                    ->orWhere('id_transaksi', $search);
                });
            })
            ->when($sumber && $sumber !== 'Semua', fn ($q) => $q->where('sumber_transaksi', $sumber))
            ->when($statusPesanan && $statusPesanan !== 'Semua', fn ($q) => $q->where('status_pesanan', $statusPesanan))
            ->when($dariTanggal, fn ($q) => $q->whereDate('tanggal', '>=', $dariTanggal))
            ->when($sampaiTanggal, fn ($q) => $q->whereDate('tanggal', '<=', $sampaiTanggal))
            ->orderBy('id_transaksi', 'desc')
            ->paginate(12)
            ->withQueryString();

        $user = $request->user();
        $viewName = $user->role === 'admin' ? 'Admin/Transaksi/Index' : 'Kasir/Riwayat/Index';

        return Inertia::render($viewName, [
            'transaksi' => $transaksi,
            'filters' => [
                'search' => $search,
                'dari_tanggal' => $dariTanggal,
                'sampai_tanggal' => $sampaiTanggal,
                'sumber_transaksi' => $sumber ?: 'Semua',
                'status_pesanan' => $statusPesanan ?: 'Semua',
            ],
        ]);
    }

    /**
     * Update status pesanan online oleh Admin / Kasir
     */
    public function updateStatusPesanan(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'status_pesanan' => ['required', 'in:Menunggu Pembayaran,Diproses,Dikirim,Selesai,Dibatalkan'],
        ]);

        $trx = Transaksi::findOrFail($id);
        $trx->update([
            'status_pesanan' => $validated['status_pesanan'],
        ]);

        return redirect()->back()->with('success', 'Status pesanan #' . str_pad($id, 5, '0', STR_PAD_LEFT) . ' berhasil diperbarui menjadi "' . $validated['status_pesanan'] . '".');
    }

    /**
     * Struk / Receipt view for printing.
     */
    public function cetakStruk(Request $request, int $id): Response
    {
        $transaksi = Transaksi::with(['pelanggan', 'details.produk.kategori'])->findOrFail($id);

        return Inertia::render('Kasir/Pos/Struk', [
            'transaksi' => $transaksi,
            'kasir_name' => $request->user()?->name ?? 'Kasir Operasional',
        ]);
    }
}
