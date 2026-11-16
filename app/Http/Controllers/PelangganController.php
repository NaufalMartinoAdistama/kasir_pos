<?php

namespace App\Http\Controllers;

use App\Models\Pelanggan;
use App\Models\ViewTotalBelanja;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PelangganController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $user = $request->user();

        // Ambil data pelanggan dengan ringkasan transaksi & kategori belanja via function KategoriBelanja
        $pelanggan = Pelanggan::query()
            ->withCount('transaksi')
            ->when($search, function ($query, $search) {
                $query->where('nama_pelanggan', 'like', "%{$search}%")
                    ->orWhere('kota', 'like', "%{$search}%")
                    ->orWhere('kode_rfid', 'like', "%{$search}%");
            })
            ->orderBy('id_pelanggan', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Ambil view_total_belanja untuk data statistik belanja pelanggan
        $totalBelanjaMap = ViewTotalBelanja::pluck('total_belanja', 'id_pelanggan');

        // Lampirkan status kategori belanja (Gold / Silver / Reguler) menggunakan function KategoriBelanja
        $pelanggan->getCollection()->transform(function ($item) use ($totalBelanjaMap) {
            $total = $totalBelanjaMap[$item->id_pelanggan] ?? 0;
            $item->total_akumulasi = $total;
            
            // Kategori status belanja
            if ($total >= 1000000) {
                $item->kategori_status = 'Pelanggan Gold';
            } elseif ($total >= 500000) {
                $item->kategori_status = 'Pelanggan Silver';
            } else {
                $item->kategori_status = 'Pelanggan Reguler';
            }
            return $item;
        });

        $viewName = $user->role === 'admin' ? 'Admin/Pelanggan/Index' : 'Kasir/Pelanggan/Index';

        return Inertia::render($viewName, [
            'pelanggan' => $pelanggan,
            'filters' => [
                'search' => $search,
            ],
            'canDelete' => $user->role === 'admin',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_pelanggan' => ['required', 'string', 'max:100'],
            'kota' => ['required', 'string', 'max:50'],
            'kode_rfid' => ['nullable', 'string', 'max:50', 'unique:tbl_pelanggan,kode_rfid'],
            'poin' => ['nullable', 'integer', 'min:0'],
            'status_member' => ['nullable', 'in:Reguler,Member RFID'],
        ], [
            'kode_rfid.unique' => 'Kartu RFID ini sudah terdaftar untuk pelanggan lain!',
        ]);

        $statusMember = !empty($validated['kode_rfid']) ? 'Member RFID' : ($validated['status_member'] ?? 'Reguler');
        $poin = isset($validated['poin']) ? (int)$validated['poin'] : 0;
        $kodeRfid = !empty($validated['kode_rfid']) ? trim($validated['kode_rfid']) : null;

        // Gunakan Stored Procedure TambahPelanggan yang sudah ada di db_tokokita
        // Trigger after_insert_pelanggan otomatis mengisi log_pelanggan
        DB::statement('CALL TambahPelanggan(?, ?)', [
            $validated['nama_pelanggan'],
            $validated['kota'],
        ]);

        // Jika terdapat data RFID Member atau Poin, update record pelanggan yang baru ditambahkan
        if ($kodeRfid || $poin > 0 || $statusMember === 'Member RFID') {
            $newPelanggan = Pelanggan::where('nama_pelanggan', $validated['nama_pelanggan'])
                ->orderBy('id_pelanggan', 'desc')
                ->first();

            if ($newPelanggan) {
                $newPelanggan->update([
                    'kode_rfid' => $kodeRfid,
                    'poin' => $poin,
                    'status_member' => $statusMember,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Data pelanggan baru berhasil ditambahkan (Trigger log_pelanggan aktif).');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'nama_pelanggan' => ['required', 'string', 'max:100'],
            'kota' => ['required', 'string', 'max:50'],
            'kode_rfid' => ['nullable', 'string', 'max:50', 'unique:tbl_pelanggan,kode_rfid,' . $id . ',id_pelanggan'],
            'poin' => ['nullable', 'integer', 'min:0'],
            'status_member' => ['nullable', 'in:Reguler,Member RFID'],
        ], [
            'kode_rfid.unique' => 'Kartu RFID ini sudah terdaftar untuk pelanggan lain!',
        ]);

        $statusMember = !empty($validated['kode_rfid']) ? 'Member RFID' : ($validated['status_member'] ?? 'Reguler');
        $poin = isset($validated['poin']) ? (int)$validated['poin'] : 0;
        $kodeRfid = !empty($validated['kode_rfid']) ? trim($validated['kode_rfid']) : null;

        $pelanggan = Pelanggan::findOrFail($id);
        // Trigger after_update_pelanggan otomatis mencatat ke log_perubahan_pelanggan
        $pelanggan->update([
            'nama_pelanggan' => $validated['nama_pelanggan'],
            'kota' => $validated['kota'],
            'kode_rfid' => $kodeRfid,
            'poin' => $poin,
            'status_member' => $statusMember,
        ]);

        return redirect()->back()->with('success', 'Data pelanggan berhasil diperbarui (Tercatat di log_perubahan_pelanggan).');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        if ($request->user()->role !== 'admin') {
            return redirect()->back()->with('error', 'Hanya Admin yang berhak menghapus pelanggan.');
        }

        $pelanggan = Pelanggan::withCount('transaksi')->findOrFail($id);

        if ($pelanggan->transaksi_count > 0) {
            return redirect()->back()->with('error', 'Pelanggan tidak dapat dihapus karena memiliki riwayat transaksi.');
        }

        // Trigger after_delete_pelanggan otomatis mencatat ke log_pelanggan
        $pelanggan->delete();

        return redirect()->back()->with('success', 'Data pelanggan berhasil dihapus.');
    }
}
