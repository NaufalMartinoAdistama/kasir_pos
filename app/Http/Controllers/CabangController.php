<?php

namespace App\Http\Controllers;

use App\Models\Cabang;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CabangController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $cabang = Cabang::query()
            ->when($search, function ($query, $search) {
                $query->where('nama_cabang', 'like', "%{$search}%")
                    ->orWhere('kota', 'like', "%{$search}%");
            })
            ->orderBy('id_cabang', 'asc')
            ->get();

        return Inertia::render('Admin/Cabang/Index', [
            'cabang' => $cabang,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_cabang' => ['required', 'string', 'max:50'],
            'kota' => ['required', 'string', 'max:50'],
        ]);

        Cabang::create($validated);

        return redirect()->back()->with('success', 'Cabang baru berhasil ditambahkan.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'nama_cabang' => ['required', 'string', 'max:50'],
            'kota' => ['required', 'string', 'max:50'],
        ]);

        $cabang = Cabang::findOrFail($id);
        $cabang->update($validated);

        return redirect()->back()->with('success', 'Data cabang berhasil diperbarui.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $cabang = Cabang::findOrFail($id);
        $cabang->delete();

        return redirect()->back()->with('success', 'Cabang berhasil dihapus.');
    }
}
