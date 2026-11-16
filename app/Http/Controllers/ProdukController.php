<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use App\Models\Produk;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProdukController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $kategoriId = $request->input('id_kategori');

        $produk = Produk::with('kategori')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama_produk', 'like', "%{$search}%")
                        ->orWhere('kode_barcode', 'like', "%{$search}%");
                });
            })
            ->when($kategoriId, function ($query, $kategoriId) {
                $query->where('id_kategori', $kategoriId);
            })
            ->orderBy('id_produk', 'desc')
            ->paginate(10)
            ->withQueryString();

        $kategoriList = Kategori::orderBy('nama_kategori')->get(['id_kategori', 'nama_kategori']);

        return Inertia::render('Admin/Produk/Index', [
            'produk' => $produk,
            'kategori_list' => $kategoriList,
            'filters' => [
                'search' => $search,
                'id_kategori' => $kategoriId,
            ],
        ]);
    }

    /**
     * Halaman khusus cetak label barcode & QR produk
     */
    public function cetakLabel(Request $request): Response
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
            ->orderBy('nama_produk', 'asc')
            ->get(['id_produk', 'id_kategori', 'nama_produk', 'kode_barcode', 'harga', 'stok']);

        $kategoriList = Kategori::orderBy('nama_kategori')->get(['id_kategori', 'nama_kategori']);

        return Inertia::render('Admin/Produk/CetakLabel', [
            'produk_list' => $produkList,
            'kategori_list' => $kategoriList,
            'filters' => [
                'search' => $search,
                'id_kategori' => $kategoriId,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id_kategori' => ['required', 'exists:tbl_kategori,id_kategori'],
            'nama_produk' => ['required', 'string', 'max:150'],
            'kode_barcode' => ['nullable', 'string', 'max:100', 'unique:tbl_produk,kode_barcode'],
            'harga' => ['required', 'numeric', 'min:0'],
            'stok' => ['required', 'integer', 'min:0'],
        ], [
            'kode_barcode.unique' => 'Kode barcode ini sudah digunakan oleh produk lain!',
        ]);

        $validated['kode_barcode'] = !empty($validated['kode_barcode']) ? trim($validated['kode_barcode']) : null;

        Produk::create($validated);

        return redirect()->back()->with('success', 'Produk baru berhasil ditambahkan.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'id_kategori' => ['required', 'exists:tbl_kategori,id_kategori'],
            'nama_produk' => ['required', 'string', 'max:150'],
            'kode_barcode' => ['nullable', 'string', 'max:100', 'unique:tbl_produk,kode_barcode,' . $id . ',id_produk'],
            'harga' => ['required', 'numeric', 'min:0'],
            'stok' => ['required', 'integer', 'min:0'],
        ], [
            'kode_barcode.unique' => 'Kode barcode ini sudah digunakan oleh produk lain!',
        ]);

        $validated['kode_barcode'] = !empty($validated['kode_barcode']) ? trim($validated['kode_barcode']) : null;

        $produk = Produk::findOrFail($id);
        $produk->update($validated);

        return redirect()->back()->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $produk = Produk::withCount('detailTransaksi')->findOrFail($id);

        if ($produk->detail_transaksi_count > 0) {
            return redirect()->back()->with('error', 'Produk tidak dapat dihapus karena sudah memiliki riwayat transaksi.');
        }

        $produk->delete();

        return redirect()->back()->with('success', 'Produk berhasil dihapus.');
    }
}
