import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    IconPos,
    IconBox,
    IconChart,
    IconUserShield,
    IconClipboardList,
    IconReceipt,
} from '@/Components/Icons';

export default function Welcome({ auth }) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            <Head title="NAUFAM MART - Sistem Informasi Penjualan & Inventaris" />

            {/* Navigation Bar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xl shadow-xs">
                            🏪
                        </div>
                        <div>
                            <span className="font-extrabold text-lg text-slate-900 leading-tight block">
                                NAUFAM MART
                            </span>
                            <span className="text-[11px] font-semibold text-blue-600 tracking-wider uppercase block">
                                Sistem Informasi Penjualan & Stok
                            </span>
                        </div>
                    </div>

                    <nav className="flex items-center space-x-3">
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-2"
                            >
                                <span>Buka Dashboard ({auth.user.role.toUpperCase()})</span>
                                <span>→</span>
                            </Link>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    href={route('login')}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                                >
                                    Masuk ke Aplikasi (Login)
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1">
                <section className="bg-linear-to-b from-blue-700 via-blue-600 to-sky-600 text-white py-16 lg:py-24 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
                    <div className="max-w-4xl mx-auto relative z-10">
                        <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-white/20 text-blue-50 border border-white/20 mb-4 tracking-wider uppercase">
                            Tech Stack Modern: Laravel 12 + Inertia.js + React + Tailwind CSS
                        </span>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                            Sistem Informasi Penjualan Toko Terintegrasi
                        </h1>
                        <p className="mt-4 text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                            Aplikasi Point of Sale (POS) & Manajemen Stok Inventaris dengan dukungan fitur SQL Lanjutan: Stored Procedure, Stored Function, Database Trigger, View, dan Transaction Control.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            <Link
                                href={route('login')}
                                className="px-6 py-3.5 bg-white text-blue-700 hover:bg-blue-50 rounded-2xl font-black text-sm shadow-xl transition-all transform hover:scale-105"
                            >
                                Masuk ke Sistem (Admin / Kasir) →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Database Architecture Highlights */}
                <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                            Arsitektur Basis Data Lanjutan
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                            Fitur SQL Tingkat Lanjut yang Diimplementasikan
                        </h2>
                        <p className="text-sm text-slate-500 mt-2">
                            Seluruh operasi bisnis terikat langsung dengan integritas dan otomasi objek SQL pada database MySQL / MariaDB.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                                <IconPos className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900">
                                Stored Procedure
                            </h3>
                            <p className="font-mono text-xs text-blue-600 mt-1 font-semibold">
                                TambahTransaksiTerintegrasi
                            </p>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                Memproses transaksi penjualan terpadu dengan mekanisme START TRANSACTION, COMMIT, dan ROLLBACK untuk menjamin atomisitas data.
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                                <IconReceipt className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900">
                                Stored Function
                            </h3>
                            <p className="font-mono text-xs text-emerald-600 mt-1 font-semibold">
                                HitungTotalBersih(...)
                            </p>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                Menghitung nilai subtotal bersih dari harga satuan, kuantitas pembelian, dan persentase potongan diskon secara terpusat di server database.
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                                <IconClipboardList className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900">
                                Database Trigger
                            </h3>
                            <p className="font-mono text-xs text-amber-600 mt-1 font-semibold">
                                after_update_stok_produk
                            </p>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                Otomatis mencatat perubahan sisa stok produk secara real-time ke tabel audit log (tbl_log) setiap kali terjadi mutasi stok barang.
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                                <IconChart className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900">
                                Database View
                            </h3>
                            <p className="font-mono text-xs text-indigo-600 mt-1 font-semibold">
                                view_laporan_penjualan
                            </p>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                Menggabungkan tabel master pelanggan, transaksi, produk, dan kategori dalam satu entitas laporan yang efisien dan siap cetak/ekspor.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 2 Roles Comparison */}
                <section className="py-12 bg-white border-y border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-10">
                            <h2 className="text-2xl font-extrabold text-slate-900">
                                Pembagian Hak Akses (Role Based Access)
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Diproteksi dengan Middleware Laravel pada rute web.php
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {/* Role 1: Admin */}
                            <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-200 shadow-2xs">
                                <div className="flex items-center space-x-3 mb-4">
                                    <span className="p-2.5 bg-blue-600 text-white rounded-xl">
                                        <IconUserShield className="w-5 h-5" />
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900">
                                            Role 1: ADMINISTRATOR
                                        </h3>
                                        <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                            Akses Penuh
                                        </span>
                                    </div>
                                </div>
                                <ul className="space-y-2 text-xs text-slate-700">
                                    <li className="flex items-center space-x-2">
                                        <span className="text-blue-600 font-bold">✓</span>
                                        <span>Dashboard statistik ringkas & grafik omset 7 hari</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <span className="text-blue-600 font-bold">✓</span>
                                        <span>CRUD Master Kategori, Produk, dan Pelanggan</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <span className="text-blue-600 font-bold">✓</span>
                                        <span>Laporan Penjualan (View Laporan) + Filter + Export CSV + Cetak</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <span className="text-blue-600 font-bold">✓</span>
                                        <span>Audit Log Stok dari Trigger database (read-only)</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <span className="text-blue-600 font-bold">✓</span>
                                        <span>Manajemen akun pengguna (Admin & Kasir)</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Role 2: Kasir */}
                            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200 shadow-2xs">
                                <div className="flex items-center space-x-3 mb-4">
                                    <span className="p-2.5 bg-emerald-600 text-white rounded-xl">
                                        <IconPos className="w-5 h-5" />
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900">
                                            Role 2: KASIR
                                        </h3>
                                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                            Fokus Operasional Penjualan
                                        </span>
                                    </div>
                                </div>
                                <ul className="space-y-2 text-xs text-slate-700">
                                    <li className="flex items-center space-x-2">
                                        <span className="text-emerald-600 font-bold">✓</span>
                                        <span>Dashboard kasir dengan ringkasan penjualan hari ini</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <span className="text-emerald-600 font-bold">✓</span>
                                        <span>Terminal Kasir POS (Pilih Pelanggan, Produk, Diskon)</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <span className="text-emerald-600 font-bold">✓</span>
                                        <span>Eksekusi Stored Procedure transaksi terintegrasi</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <span className="text-emerald-600 font-bold">✓</span>
                                        <span>Cetak lembar struk / nota belanja pelanggan</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <span className="text-emerald-600 font-bold">✓</span>
                                        <span>Melihat dan mendaftarkan data pelanggan baru</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-8 px-4 sm:px-6 lg:px-8 text-xs text-center border-t border-slate-800">
                <p className="font-semibold text-slate-300">
                    NAUFAM MART POS & Inventory Management System
                </p>
                <p className="mt-1 text-slate-500">
                    Dibuat dengan Laravel 12, Inertia.js, React, Tailwind CSS, dan MySQL/MariaDB
                </p>
            </footer>
        </div>
    );
}
