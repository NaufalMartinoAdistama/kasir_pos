<?php

namespace App\Http\Controllers;

use App\Models\DetailTransaksi;
use App\Models\Kategori;
use App\Models\Pelanggan;
use App\Models\Produk;
use App\Models\Transaksi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PelangganPortalController extends Controller
{
    /**
     * Halaman Katalog Belanja Pelanggan
     */
    public function katalog(Request $request): Response
    {
        $search = $request->input('search');
        $kategoriId = $request->input('id_kategori');

        $produkList = Produk::with('kategori')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama_produk', 'like', "%{$search}%")
                        ->orWhere('kode_barcode', 'like', "%{$search}%");
                });
            })
            ->when($kategoriId, function ($query, $kategoriId) {
                $query->where('id_kategori', $kategoriId);
            })
            ->orderByRaw('CASE WHEN stok > 0 THEN 0 ELSE 1 END')
            ->orderBy('nama_produk', 'asc')
            ->get();

        $kategoriList = Kategori::orderBy('nama_kategori')->get(['id_kategori', 'nama_kategori']);

        return Inertia::render('Pelanggan/Katalog', [
            'produk_list' => $produkList,
            'kategori_list' => $kategoriList,
            'filters' => [
                'search' => $search,
                'id_kategori' => $kategoriId,
            ],
        ]);
    }

    /**
     * Halaman Form Checkout Belanja Online
     */
    public function checkout(Request $request): Response
    {
        $user = $request->user();
        $pelanggan = $user->id_pelanggan ? Pelanggan::find($user->id_pelanggan) : null;

        return Inertia::render('Pelanggan/Checkout', [
            'customer_profile' => [
                'nama' => $pelanggan ? $pelanggan->nama_pelanggan : $user->name,
                'no_hp' => $pelanggan ? $pelanggan->no_hp : '',
                'alamat_lengkap' => $pelanggan ? $pelanggan->alamat_lengkap : '',
                'latitude' => $pelanggan && $pelanggan->latitude ? (float) $pelanggan->latitude : -0.1337,
                'longitude' => $pelanggan && $pelanggan->longitude ? (float) $pelanggan->longitude : 117.4947,
                'poin' => $pelanggan ? $pelanggan->poin : 0,
                'status_member' => $pelanggan ? $pelanggan->status_member : 'Reguler',
            ],
            'google_maps_api_key' => env('VITE_GOOGLE_MAPS_API_KEY', ''),
        ]);
    }

    /**
     * Proses Simpan Pesanan Online Pelanggan
     */
    public function prosesCheckout(Request $request): RedirectResponse
    {
        $user = $request->user();

        // Pastikan akun memiliki id_pelanggan
        $pelanggan = null;
        if ($user->id_pelanggan) {
            $pelanggan = Pelanggan::find($user->id_pelanggan);
        }

        if (!$pelanggan) {
            $pelanggan = Pelanggan::create([
                'nama_pelanggan' => $user->name,
                'kota' => 'Bontang',
                'no_hp' => $request->input('no_hp_penerima', ''),
                'alamat_lengkap' => $request->input('alamat_pengiriman', ''),
                'status_member' => 'Reguler',
                'poin' => 0,
            ]);
            $user->update(['id_pelanggan' => $pelanggan->id_pelanggan]);
        }

        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id_produk' => ['required', 'integer', 'exists:tbl_produk,id_produk'],
            'items.*.jumlah' => ['required', 'integer', 'min:1'],
            'no_hp_penerima' => ['required', 'string', 'max:20'],
            'alamat_pengiriman' => ['required', 'string', 'max:500'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            // KHUSUS PELANGGAN: TIDAK BOLEH TUNAI! HANYA NON-TUNAI: QRIS, Transfer Bank, Kartu Debit
            'metode_pembayaran' => ['required', 'string', 'in:QRIS,Transfer Bank,Kartu Debit'],
            'bukti_pembayaran' => ['nullable'],
            'is_simulasi_lunas' => ['nullable'],
        ], [
            'items.required' => 'Keranjang belanja Anda masih kosong.',
            'items.min' => 'Pilih minimal 1 produk untuk checkout.',
            'no_hp_penerima.required' => 'Nomor HP / WhatsApp penerima wajib diisi.',
            'alamat_pengiriman.required' => 'Alamat pengiriman wajib diisi.',
            'metode_pembayaran.required' => 'Pilih metode pembayaran non-tunai.',
            'metode_pembayaran.in' => 'Metode pembayaran pesanan online hanya mendukung QRIS, Transfer Bank, atau Kartu Debit (tidak boleh Tunai/COD).',
            'bukti_pembayaran.max' => 'Ukuran foto bukti pembayaran maksimal 4MB.',
        ]);

        $buktiPath = null;
        if ($request->hasFile('bukti_pembayaran')) {
            $file = $request->file('bukti_pembayaran');
            $filename = 'bukti_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $destination = public_path('uploads/bukti_bayar');
            if (!file_exists($destination)) {
                mkdir($destination, 0755, true);
            }
            $file->move($destination, $filename);
            $buktiPath = 'uploads/bukti_bayar/' . $filename;
        } elseif ($request->filled('is_simulasi_lunas')) {
            $buktiPath = 'uploads/bukti_bayar/simulasi_lunas.png';
        }

        try {
            $transaksiId = DB::transaction(function () use ($pelanggan, $validated, $buktiPath) {
                $totalKotor = 0;
                $itemsToSave = [];

                foreach ($validated['items'] as $item) {
                    $idProduk = (int) $item['id_produk'];
                    $qty = max(1, (int) $item['jumlah']);

                    $produk = Produk::where('id_produk', $idProduk)->lockForUpdate()->first();
                    if (!$produk) {
                        throw new \Exception("Produk ID #{$idProduk} tidak ditemukan.");
                    }

                    if ($produk->stok < $qty) {
                        throw new \Exception("Maaf, stok barang \"{$produk->nama_produk}\" tidak mencukupi! Sisa stok: {$produk->stok}, Anda memesan: {$qty}.");
                    }

                    // Gunakan Function database HitungTotalBersih jika ada, atau fallback kalkulasi PHP
                    try {
                        $hitung = DB::selectOne("SELECT HitungTotalBersih(?, ?, ?) AS total", [$produk->harga, $qty, 0]);
                        $subtotal = $hitung ? (float) $hitung->total : (float) $produk->harga * $qty;
                    } catch (\Throwable $e) {
                        $subtotal = (float) $produk->harga * $qty;
                    }

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

                // Status pesanan: Jika ada bukti pembayaran langsung 'Diproses', jika belum 'Menunggu Pembayaran'
                $statusPesanan = $buktiPath ? 'Diproses' : 'Menunggu Pembayaran';

                // Simpan transaksi
                $transaksi = Transaksi::create([
                    'tanggal' => now(),
                    'id_pelanggan' => $pelanggan->id_pelanggan,
                    'total_belanja' => $totalKotor,
                    'metode_pembayaran' => $validated['metode_pembayaran'],
                    'bayar' => $totalKotor,
                    'kembalian' => 0,
                    'diskon' => 0,
                    'no_hp_penerima' => $validated['no_hp_penerima'],
                    'alamat_pengiriman' => $validated['alamat_pengiriman'],
                    'latitude' => $validated['latitude'] ?? null,
                    'longitude' => $validated['longitude'] ?? null,
                    'bukti_pembayaran' => $buktiPath,
                    'status_pesanan' => $statusPesanan,
                    'sumber_transaksi' => 'Online Pelanggan',
                ]);

                // Simpan rincian & kurangi stok (Trigger after_update_stok_produk otomatis tercatat di tbl_log)
                foreach ($itemsToSave as $it) {
                    DetailTransaksi::create([
                        'id_transaksi' => $transaksi->id_transaksi,
                        'id_produk' => $it['id_produk'],
                        'nama_produk' => $it['nama_produk'],
                        'jumlah' => $it['jumlah'],
                        'harga' => $it['harga'],
                        'subtotal' => $it['subtotal'],
                    ]);

                    $it['produk']->decrement('stok', $it['jumlah']);
                }

                // Update profil pelanggan agar tersimpan otomatis untuk pembelian selanjutnya
                $pelanggan->update([
                    'no_hp' => $validated['no_hp_penerima'],
                    'alamat_lengkap' => $validated['alamat_pengiriman'],
                    'latitude' => $validated['latitude'] ?? $pelanggan->latitude,
                    'longitude' => $validated['longitude'] ?? $pelanggan->longitude,
                ]);

                return $transaksi->id_transaksi;
            });

            return redirect()->route('pelanggan.pesanan')
                ->with('success', 'Pesanan online #' . str_pad($transaksiId, 5, '0', STR_PAD_LEFT) . ' berhasil dibuat! Tim kami akan segera menyiapkan pesanan Anda.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Halaman Riwayat & Pelacakan Status Pesanan Pelanggan
     */
    public function pesanan(Request $request): Response
    {
        $user = $request->user();
        $idPelanggan = $user->id_pelanggan;

        $pesananList = Transaksi::with(['details.produk', 'pelanggan'])
            ->where('id_pelanggan', $idPelanggan)
            ->orderBy('id_transaksi', 'desc')
            ->get();

        return Inertia::render('Pelanggan/Pesanan', [
            'pesanan_list' => $pesananList,
        ]);
    }

    /**
     * Pelanggan konfirmasi bahwa pesanan telah diterima (ubah status ke 'Selesai')
     */
    public function konfirmasiSelesai(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();
        $transaksi = Transaksi::where('id_transaksi', $id)
            ->where('id_pelanggan', $user->id_pelanggan)
            ->firstOrFail();

        if ($transaksi->status_pesanan === 'Selesai') {
            return redirect()->back()->with('error', 'Pesanan ini sudah berstatus Selesai.');
        }

        $transaksi->update([
            'status_pesanan' => 'Selesai',
        ]);

        return redirect()->back()->with('success', 'Terima kasih telah berbelanja di MARTIN MART! Pesanan #' . str_pad($id, 5, '0', STR_PAD_LEFT) . ' telah ditandai Selesai.');
    }

    /**
     * Upload / Perbarui Bukti Pembayaran untuk Pesanan Tertentu
     */
    public function uploadBukti(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();
        $transaksi = Transaksi::where('id_transaksi', $id)
            ->where('id_pelanggan', $user->id_pelanggan)
            ->firstOrFail();

        $request->validate([
            'bukti_pembayaran' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
        ], [
            'bukti_pembayaran.required' => 'Pilih file bukti transfer/QRIS Anda.',
            'bukti_pembayaran.image' => 'File harus berupa gambar.',
        ]);

        $file = $request->file('bukti_pembayaran');
        $filename = 'bukti_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $destination = public_path('uploads/bukti_bayar');
        if (!file_exists($destination)) {
            mkdir($destination, 0755, true);
        }
        $file->move($destination, $filename);

        if ($transaksi->bukti_pembayaran && file_exists(public_path($transaksi->bukti_pembayaran))) {
            @unlink(public_path($transaksi->bukti_pembayaran));
        }

        $transaksi->update([
            'bukti_pembayaran' => 'uploads/bukti_bayar/' . $filename,
            'status_pesanan' => $transaksi->status_pesanan === 'Menunggu Pembayaran' ? 'Diproses' : $transaksi->status_pesanan,
        ]);

        return redirect()->back()->with('success', 'Bukti pembayaran berhasil diunggah! Status pesanan kini Diproses.');
    }
}
