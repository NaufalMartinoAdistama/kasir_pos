import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import ShoppingHeroIllustration from '@/Components/ShoppingHeroIllustration';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import {
    IconRfid,
    IconUserShield,
    IconPos,
    IconCart,
    IconCheckCircle,
} from '@/Components/Icons';

export default function Login({ status, canResetPassword }) {
    const [loginTab, setLoginTab] = useState('email'); // 'email' | 'rfid'

    // Form regular email
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Form RFID Tap
    const rfidForm = useForm({
        kode_rfid: '',
    });

    const rfidInputRef = useRef(null);

    useEffect(() => {
        if (loginTab === 'rfid') {
            rfidInputRef.current?.focus();
        }
    }, [loginTab]);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const submitRfid = (e) => {
        e.preventDefault();
        if (!rfidForm.data.kode_rfid.trim()) return;

        rfidForm.post(route('login.rfid'), {
            onFinish: () => {
                rfidInputRef.current?.focus();
            },
        });
    };

    const handleRfidKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitRfid(e);
        }
    };

    const fillCredentials = (email, password) => {
        setLoginTab('email');
        setData((prev) => ({
            ...prev,
            email,
            password,
        }));
    };

    const testTapRfid = (kode) => {
        setLoginTab('rfid');
        rfidForm.setData('kode_rfid', kode);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            <Head title="User Login - MARTIN MART" />

            {/* Subtle Abstract Background Glow Ornaments */}
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sky-300/20 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-10 w-64 h-64 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />

            {/* Main Split-Card Container (Matching Reference Artwork) */}
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-white/25">
                {/* TOP HALF: Blue Gradient Header with Vector Illustration */}
                <div className="bg-gradient-to-b from-sky-400 via-sky-500 to-blue-600 p-6 text-white relative">
                    {/* Top Row: Brand Logo & Pill "Create Account" */}
                    <div className="flex items-center justify-between">
                        <ApplicationLogo variant="light" size="sm" />
                        <Link
                            href={route('register')}
                            className="bg-white text-blue-600 text-xs font-black px-4 py-1.5 rounded-full shadow-sm hover:bg-blue-50 transition active:scale-95"
                        >
                            Create Account
                        </Link>
                    </div>

                    {/* Center Vector Shopping Illustration */}
                    <div className="flex justify-center my-2">
                        <ShoppingHeroIllustration className="w-40 h-40 drop-shadow-md" />
                    </div>

                    {/* Short Caption */}
                    <p className="text-center text-[11px] font-medium text-sky-100 px-4 leading-relaxed">
                        Sistem Penjualan Toko & POS Kasir Modern Terintegrasi
                    </p>
                </div>

                {/* BOTTOM HALF: White Form Area */}
                <div className="bg-white p-7 sm:p-8">
                    {/* Section Header */}
                    <h2 className="text-2xl font-black text-slate-800 text-center tracking-tight uppercase">
                        USER LOGIN
                    </h2>
                    <p className="text-blue-500 text-xs font-bold text-center mb-5">
                        Welcome back
                    </p>

                    {status && (
                        <div className="mb-4 text-xs font-bold text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                            {status}
                        </div>
                    )}

                    {/* Login Method Tab Switcher */}
                    <div className="flex rounded-xl bg-blue-50/80 p-1 mb-5 border border-blue-200">
                        <button
                            type="button"
                            onClick={() => setLoginTab('email')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                                loginTab === 'email'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-blue-700'
                            }`}
                        >
                            Email & Password
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginTab('rfid')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center space-x-1 ${
                                loginTab === 'rfid'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-blue-700'
                            }`}
                        >
                            <IconRfid className="w-3.5 h-3.5" />
                            <span>Tap RFID Member</span>
                        </button>
                    </div>

                    {/* TAB 1: REGULAR EMAIL/PASSWORD */}
                    {loginTab === 'email' ? (
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        placeholder="Email or Username"
                                        autoComplete="username"
                                        autoFocus
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-blue-50/70 border border-blue-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 shadow-2xs transition"
                                        required
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-1.5 text-xs font-bold" />
                            </div>

                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        placeholder="Password"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-blue-50/70 border border-blue-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 shadow-2xs transition"
                                        required
                                    />
                                </div>
                                <InputError message={errors.password} className="mt-1.5 text-xs font-bold" />
                            </div>

                            {/* Remember & Forgot Password */}
                            <div className="flex items-center justify-between text-xs font-bold pt-1">
                                <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded-md border-blue-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>Remember</span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-slate-500 hover:text-blue-700 font-semibold"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>

                            {/* Prominent Login Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? 'Logging in...' : 'LOGIN'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* TAB 2: RFID CARD TAP */
                        <form onSubmit={submitRfid} className="space-y-4">
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-sky-50 border-2 border-dashed border-blue-300 text-center">
                                <div className="w-12 h-12 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center mb-2 shadow-md shadow-blue-500/20 animate-pulse">
                                    <IconRfid className="w-6 h-6" />
                                </div>
                                <h4 className="text-xs font-black text-slate-900 mb-0.5">
                                    Tempelkan Kartu Member ke Reader
                                </h4>
                                <p className="text-[11px] font-medium text-slate-500">
                                    USB Reader otomatis mengisi UID dan login seketika
                                </p>

                                <div className="mt-3">
                                    <input
                                        ref={rfidInputRef}
                                        type="text"
                                        value={rfidForm.data.kode_rfid}
                                        onChange={(e) => rfidForm.setData('kode_rfid', e.target.value)}
                                        onKeyDown={handleRfidKeyDown}
                                        placeholder="UID Kartu RFID..."
                                        className="w-full text-center py-2 px-3 bg-white border-2 border-blue-400 rounded-xl text-xs font-mono font-black text-blue-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                                    />
                                </div>
                                <InputError message={rfidForm.errors.kode_rfid} className="mt-1.5 text-xs font-bold" />
                            </div>

                            <button
                                type="submit"
                                disabled={rfidForm.processing}
                                className="w-full py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {rfidForm.processing ? 'Memverifikasi...' : 'VERIFIKASI KARTU RFID'}
                            </button>

                            {/* Demo Simulation Taps */}
                            <div className="pt-1 text-center">
                                <p className="text-[10px] font-bold text-slate-400 mb-1.5">
                                    Simulasi Tap Kartu Demo:
                                </p>
                                <div className="flex justify-center space-x-1.5">
                                    <button
                                        type="button"
                                        onClick={() => testTapRfid('RFID-MBR-001')}
                                        className="text-[10px] font-black text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200"
                                    >
                                        💳 Member 1
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => testTapRfid('RFID-MBR-002')}
                                        className="text-[10px] font-black text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200"
                                    >
                                        💳 Member 2
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Quick Demo Credentials Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Demo Quick Login:
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => fillCredentials('admin@toko.com', 'password')}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold transition-all"
                            >
                                🛡️ Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => fillCredentials('kasir@toko.com', 'password')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition-all"
                            >
                                🛒 Kasir
                            </button>
                            <button
                                type="button"
                                onClick={() => fillCredentials('pelanggan@toko.com', 'password')}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[11px] font-bold transition-all"
                            >
                                🛍️ Pelanggan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
