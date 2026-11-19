import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import RealtimeClock from '@/Components/RealtimeClock';
import {
    IconCart,
    IconReceipt,
    IconTag,
    IconLogout,
    IconCheckCircle,
    IconExclamation,
    IconUser,
    IconCreditCard,
    IconSparkles,
} from '@/Components/Icons';

export default function PelangganLayout({ children, cartCount = 0, onOpenCart }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user || {};
    const pelanggan = user?.pelanggan || {};
    const [dismissFlash, setDismissFlash] = useState(false);

    return (
        <div className="min-h-screen bg-[#F0F6FF] flex flex-col font-sans text-slate-900 pb-16 md:pb-0">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-slate-200/80 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center space-x-4">
                        <ApplicationLogo href={route('pelanggan.katalog')} size="md" />
                    </div>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center space-x-2">
                        <Link
                            href={route('pelanggan.katalog')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                                route().current('pelanggan.katalog') || route().current('pelanggan.checkout')
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                                    : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700'
                            }`}
                        >
                            <IconTag className="w-4 h-4" />
                            <span>Katalog Belanja</span>
                        </Link>

                        <Link
                            href={route('pelanggan.pesanan')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                                route().current('pelanggan.pesanan')
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                                    : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700'
                            }`}
                        >
                            <IconReceipt className="w-4 h-4" />
                            <span>Pesanan Saya</span>
                        </Link>
                    </nav>

                    {/* Right User & Cart Area */}
                    <div className="flex items-center space-x-3">
                        <div className="hidden lg:block">
                            <RealtimeClock />
                        </div>

                        {/* Cart Button */}
                        {onOpenCart && (
                            <button
                                type="button"
                                onClick={onOpenCart}
                                className="relative p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-2xl border-2 border-blue-200 transition-all shadow-2xs group cursor-pointer"
                                title="Buka Keranjang Belanja"
                            >
                                <IconCart className="w-5 h-5 text-blue-700 group-hover:scale-110 transition-transform" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-md animate-bounce">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* Member Profile Badge */}
                        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <span className="block text-xs font-black text-slate-900 truncate max-w-[120px]">
                                    {pelanggan.nama_pelanggan || user.name}
                                </span>
                                <div className="flex items-center justify-end space-x-1">
                                    {pelanggan.status_member === 'Member RFID' ? (
                                        <span className="inline-flex items-center space-x-0.5 text-[9.5px] font-black text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                            <IconCreditCard className="w-2.5 h-2.5 text-emerald-600" />
                                            <span>Member RFID</span>
                                        </span>
                                    ) : (
                                        <span className="text-[9.5px] font-bold text-slate-500">
                                            Pelanggan
                                        </span>
                                    )}
                                    {pelanggan.poin > 0 && (
                                        <span className="text-[9.5px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                            ⭐ {pelanggan.poin} Poin
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Link
                                method="post"
                                href={route('logout')}
                                as="button"
                                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                title="Keluar Akun"
                            >
                                <IconLogout className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Flash Notifications */}
            {!dismissFlash && flash?.success && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-950 px-4 py-3 rounded-2xl flex items-center justify-between text-xs shadow-xs">
                        <div className="flex items-center space-x-2.5">
                            <IconCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                            <span className="font-bold">{flash.success}</span>
                        </div>
                        <button
                            onClick={() => setDismissFlash(true)}
                            className="font-black text-emerald-800 hover:text-emerald-950 ml-4 px-2 py-1 rounded-lg hover:bg-emerald-100"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {!dismissFlash && flash?.error && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="bg-rose-50 border-2 border-rose-300 text-rose-950 px-4 py-3 rounded-2xl flex items-center justify-between text-xs shadow-xs">
                        <div className="flex items-center space-x-2.5">
                            <IconExclamation className="w-5 h-5 text-rose-600 shrink-0" />
                            <span className="font-bold">{flash.error}</span>
                        </div>
                        <button
                            onClick={() => setDismissFlash(true)}
                            className="font-black text-rose-800 hover:text-rose-950 ml-4 px-2 py-1 rounded-lg hover:bg-rose-100"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t-2 border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="font-black text-slate-800">
                        NAUFAM MART — Belanja Mudah, Cepat, dan Terpercaya
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                        Pemesanan Online • Pembayaran Non-Tunai (QRIS / Bank / E-Wallet) • Pengantaran ke Lokasi Anda
                    </p>
                </div>
            </footer>

            {/* Mobile Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 px-4 py-2 flex items-center justify-around shadow-lg">
                <Link
                    href={route('pelanggan.katalog')}
                    className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-black ${
                        route().current('pelanggan.katalog') || route().current('pelanggan.checkout')
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-slate-600'
                    }`}
                >
                    <IconTag className="w-5 h-5 mb-0.5" />
                    <span>Katalog</span>
                </Link>

                {onOpenCart && (
                    <button
                        type="button"
                        onClick={onOpenCart}
                        className="flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-black text-slate-600 relative"
                    >
                        <IconCart className="w-5 h-5 mb-0.5 text-blue-600" />
                        <span>Keranjang</span>
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-3 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </button>
                )}

                <Link
                    href={route('pelanggan.pesanan')}
                    className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-black ${
                        route().current('pelanggan.pesanan')
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-slate-600'
                    }`}
                >
                    <IconReceipt className="w-5 h-5 mb-0.5" />
                    <span>Pesanan</span>
                </Link>

                <Link
                    method="post"
                    href={route('logout')}
                    as="button"
                    className="flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-black text-rose-600"
                >
                    <IconLogout className="w-5 h-5 mb-0.5" />
                    <span>Keluar</span>
                </Link>
            </div>
        </div>
    );
}
