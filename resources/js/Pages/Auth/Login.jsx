import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { IconCart, IconUserShield, IconPos } from '@/Components/Icons';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const fillCredentials = (email, password) => {
        setData((prev) => ({
            ...prev,
            email,
            password,
        }));
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-700 via-blue-600 to-sky-600 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Masuk ke Sistem Toko" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="mx-auto w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl mb-4 border-2 border-blue-100">
                    🏪
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                    NAUFAM MART
                </h2>
                <p className="mt-2 text-sm text-blue-100">
                    Sistem Informasi Penjualan & Manajemen Inventaris
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
                    <div className="mb-6 pb-4 border-b border-slate-100 text-center">
                        <h3 className="text-lg font-bold text-slate-800">
                            Masuk ke Akun Anda
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Pilih hak akses Admin atau Kasir untuk melanjutkan
                        </p>
                    </div>

                    {status && (
                        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-700">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="email" value="Alamat Email" className="text-slate-700 font-semibold" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full rounded-xl border-slate-300 focus:border-blue-600 focus:ring-blue-600 shadow-2xs text-sm"
                                autoComplete="username"
                                isFocused={true}
                                placeholder="nama@toko.com"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Kata Sandi (Password)" className="text-slate-700 font-semibold" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full rounded-xl border-slate-300 focus:border-blue-600 focus:ring-blue-600 shadow-2xs text-sm"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-sm text-slate-600">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ms-2">Ingat saya</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                        >
                            {processing ? 'Memproses...' : 'Masuk ke Aplikasi'}
                        </button>
                    </form>

                    {/* Quick Demo Credentials for Fast Testing */}
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
                            ⚡ Klik Akun Demo Pengujian:
                        </p>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => fillCredentials('admin@toko.com', 'password')}
                                className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200 transition-colors"
                            >
                                <IconUserShield className="w-4 h-4" />
                                <span>Login Admin</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => fillCredentials('kasir@toko.com', 'password')}
                                className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors"
                            >
                                <IconPos className="w-4 h-4" />
                                <span>Login Kasir</span>
                            </button>
                        </div>
                        <p className="text-[11px] text-center text-slate-400 mt-2">
                            Password default: <code className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded">password</code>
                        </p>
                    </div>
                </div>

                <p className="mt-4 text-center text-xs text-blue-100">
                    © 2026 NAUFAM MART • Laravel 12 + Inertia + React + Tailwind
                </p>
            </div>
        </div>
    );
}
