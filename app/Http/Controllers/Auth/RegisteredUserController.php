<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Pelanggan;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'no_hp' => 'required|string|max:20',
            'kota' => 'nullable|string|max:50',
            'alamat_lengkap' => 'required|string|max:500',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.unique' => 'Email ini sudah terdaftar.',
            'no_hp.required' => 'Nomor HP / WhatsApp wajib diisi untuk konfirmasi pesanan.',
            'alamat_lengkap.required' => 'Alamat pengiriman lengkap wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        $user = DB::transaction(function () use ($request) {
            $pelanggan = Pelanggan::create([
                'nama_pelanggan' => $request->name,
                'kota' => $request->kota ?: 'Bontang',
                'no_hp' => $request->no_hp,
                'alamat_lengkap' => $request->alamat_lengkap,
                'status_member' => 'Reguler',
                'poin' => 0,
            ]);

            return User::create([
                'name' => $request->name,
                'email' => $request->email,
                'role' => 'pelanggan',
                'id_pelanggan' => $pelanggan->id_pelanggan,
                'password' => Hash::make($request->password),
            ]);
        });

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('pelanggan.katalog')->with('success', 'Selamat datang! Akun belanja Anda berhasil didaftarkan.');
    }
}
