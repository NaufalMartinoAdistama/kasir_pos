import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import ShoppingHeroIllustration from '@/Components/ShoppingHeroIllustration';
import InputError from '@/Components/InputError';
import {
    IconUser,
    IconPhone,
    IconMapPin,
    IconLock,
    IconMail,
    IconBuilding,
} from '@/Components/Icons';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        no_hp: '',
        kota: 'Bontang',
        alamat_lengkap: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center p-4 relative overflow-hidden font-sans py-8">
            <Head title="Create Account - MARTIN MART" />

            {/* Subtle Abstract Background Glow Ornaments */}
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sky-300/20 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-10 w-64 h-64 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />

            {/* Main Split-Card Container (Matching Reference Artwork) */}
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-white/25">
                {/* TOP HALF: Blue Gradient Header with Vector Illustration */}
                <div className="bg-gradient-to-b from-sky-400 via-sky-500 to-blue-600 p-6 text-white relative">
                    {/* Top Row: Brand Logo & Pill "Sign In" */}
                    <div className="flex items-center justify-between">
                        <ApplicationLogo variant="light" size="sm" />
                        <Link
                            href={route('login')}
                            className="bg-white text-blue-600 text-xs font-black px-4 py-1.5 rounded-full shadow-sm hover:bg-blue-50 transition active:scale-95"
                        >
                            Sign In
                        </Link>
                    </div>

                    {/* Center Vector Shopping Illustration */}
                    <div className="flex justify-center my-2">
                        <ShoppingHeroIllustration className="w-36 h-36 drop-shadow-md" />
                    </div>

                    {/* Short Caption */}
                    <p className="text-center text-[11px] font-medium text-sky-100 px-4 leading-relaxed">
                        Daftar Akun Belanja Online & Akses Portal Layanan Pelanggan
                    </p>
                </div>

                {/* BOTTOM HALF: White Form Area */}
                <div className="bg-white p-7 sm:p-8">
                    {/* Section Header */}
                    <h2 className="text-2xl font-black text-slate-800 text-center tracking-tight uppercase">
                        CREATE ACCOUNT
                    </h2>
                    <p className="text-blue-500 text-xs font-bold text-center mb-6">
                        Lengkapi data diri Anda untuk pendaftaran akun
                    </p>

                    <form onSubmit={submit} className="space-y-3.5">
                        {/* Nama Lengkap */}
                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500">
                                    <IconUser className="w-4 h-4" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    placeholder="Nama Lengkap"
                                    autoComplete="name"
                                    autoFocus
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-blue-50/70 border border-blue-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 shadow-2xs transition"
                                    required
                                />
                            </div>
                            <InputError message={errors.name} className="mt-1 text-xs font-bold" />
                        </div>

                        {/* Email */}
                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500">
                                    <IconMail className="w-4 h-4" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    placeholder="Alamat Email Aktif"
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-blue-50/70 border border-blue-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 shadow-2xs transition"
                                    required
                                />
                            </div>
                            <InputError message={errors.email} className="mt-1 text-xs font-bold" />
                        </div>

                        {/* No HP / WhatsApp & Kota */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500">
                                        <IconPhone className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="no_hp"
                                        type="tel"
                                        name="no_hp"
                                        value={data.no_hp}
                                        placeholder="No. WhatsApp / HP"
                                        onChange={(e) => setData('no_hp', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-blue-50/70 border border-blue-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 shadow-2xs transition"
                                        required
                                    />
                                </div>
                                <InputError message={errors.no_hp} className="mt-1 text-xs font-bold" />
                            </div>

                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500">
                                        <IconBuilding className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="kota"
                                        type="text"
                                        name="kota"
                                        value={data.kota}
                                        placeholder="Kota Domisili"
                                        onChange={(e) => setData('kota', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-blue-50/70 border border-blue-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 shadow-2xs transition"
                                        required
                                    />
                                </div>
                                <InputError message={errors.kota} className="mt-1 text-xs font-bold" />
                            </div>
                        </div>

                        {/* Alamat Lengkap */}
                        <div>
                            <div className="relative">
                                <div className="absolute top-2.5 left-3.5 pointer-events-none text-blue-500">
                                    <IconMapPin className="w-4 h-4" />
                                </div>
                                <textarea
                                    id="alamat_lengkap"
                                    name="alamat_lengkap"
                                    value={data.alamat_lengkap}
                                    rows="2"
                                    placeholder="Alamat Lengkap Pengiriman (Jalan, No. Rumah, RT/RW, Patokan)"
                                    onChange={(e) => setData('alamat_lengkap', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-blue-50/70 border border-blue-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 shadow-2xs transition resize-none"
                                    required
                                />
                            </div>
                            <InputError message={errors.alamat_lengkap} className="mt-1 text-xs font-bold" />
                        </div>

                        {/* Password & Konfirmasi */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500">
                                        <IconLock className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        placeholder="Password"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-blue-50/70 border border-blue-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 shadow-2xs transition"
                                        required
                                    />
                                </div>
                                <InputError message={errors.password} className="mt-1 text-xs font-bold" />
                            </div>

                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500">
                                        <IconLock className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        placeholder="Konfirmasi Password"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-blue-50/70 border border-blue-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 shadow-2xs transition"
                                        required
                                    />
                                </div>
                                <InputError message={errors.password_confirmation} className="mt-1 text-xs font-bold" />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                            >
                                {processing ? 'Mendaftar...' : 'REGISTER'}
                            </button>
                        </div>
                    </form>

                    {/* Bottom Link to Login */}
                    <div className="mt-5 pt-3 border-t border-slate-100 text-center">
                        <p className="text-xs font-bold text-slate-500">
                            Sudah memiliki akun toko?{' '}
                            <Link
                                href={route('login')}
                                className="text-blue-600 hover:text-blue-800 font-black hover:underline"
                            >
                                Masuk ke Sini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
