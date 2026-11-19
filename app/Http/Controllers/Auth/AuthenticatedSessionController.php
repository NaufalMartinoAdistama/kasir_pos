<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Pelanggan;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();
        if ($user && $user->role === 'pelanggan') {
            return redirect()->intended(route('pelanggan.katalog', absolute: false));
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Login cepat dengan tap Kartu Member RFID
     */
    public function loginRfid(Request $request): RedirectResponse
    {
        $request->validate([
            'kode_rfid' => ['required', 'string', 'max:100'],
        ], [
            'kode_rfid.required' => 'Tempelkan atau scan kartu RFID member Anda ke reader.',
        ]);

        $kodeRfid = trim($request->kode_rfid);
        $pelanggan = Pelanggan::where('kode_rfid', $kodeRfid)->first();

        if (!$pelanggan) {
            return back()->withErrors([
                'kode_rfid' => 'Kartu RFID (' . $kodeRfid . ') tidak dikenali, silakan daftar terlebih dahulu atau hubungi kasir/admin.',
            ]);
        }

        // Cari user yang sudah terhubung dengan pelanggan ini
        $user = User::where('id_pelanggan', $pelanggan->id_pelanggan)->first();

        if (!$user) {
            // Jika belum ada user di tabel users, buatkan akun user otomatis secara instan
            $cleanRfid = preg_replace('/[^a-zA-Z0-9]/', '', $kodeRfid);
            $email = 'member_' . ($cleanRfid ?: $pelanggan->id_pelanggan) . '@martinmart.local';

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $pelanggan->nama_pelanggan ?: 'Member ' . $kodeRfid,
                    'role' => 'pelanggan',
                    'id_pelanggan' => $pelanggan->id_pelanggan,
                    'password' => Hash::make(Str::random(24)),
                ]
            );

            if ($user->id_pelanggan !== $pelanggan->id_pelanggan) {
                $user->update(['id_pelanggan' => $pelanggan->id_pelanggan]);
            }
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->route('pelanggan.katalog')
            ->with('success', 'Halo ' . $pelanggan->nama_pelanggan . '! Anda berhasil login otomatis dengan Kartu Member RFID.');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
