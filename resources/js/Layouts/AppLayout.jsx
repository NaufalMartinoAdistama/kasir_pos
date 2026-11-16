import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import RealtimeClock from '@/Components/RealtimeClock';
import {
    IconDashboard,
    IconPos,
    IconBox,
    IconTag,
    IconUsers,
    IconReceipt,
    IconChart,
    IconClipboardList,
    IconUserShield,
    IconMenu,
    IconX,
    IconLogout,
    IconCheckCircle,
    IconExclamation,
    IconBuilding,
    IconBarcode,
} from '@/Components/Icons';

export default function AppLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user || {};
    const isAdmin = user.role === 'admin';

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dismissFlash, setDismissFlash] = useState(false);

    const adminNavItems = [
        { name: 'Dashboard Admin', href: route('admin.dashboard'), icon: <IconDashboard />, routeName: 'admin.dashboard' },
        { name: 'Master Cabang', href: route('admin.cabang.index'), icon: <IconBuilding />, routeName: 'admin.cabang.*' },
        { name: 'Master Kategori', href: route('admin.kategori.index'), icon: <IconTag />, routeName: 'admin.kategori.*' },
        { name: 'Master Produk', href: route('admin.produk.index'), icon: <IconBox />, routeName: 'admin.produk.index' },
        { name: 'Cetak Label Barcode', href: route('admin.produk.cetak-label'), icon: <IconBarcode />, routeName: 'admin.produk.cetak-label' },
        { name: 'Master Pelanggan', href: route('admin.pelanggan.index'), icon: <IconUsers />, routeName: 'admin.pelanggan.*' },
        { name: 'Riwayat Transaksi', href: route('admin.transaksi.index'), icon: <IconReceipt />, routeName: 'admin.transaksi.*' },
        { name: 'Laporan Penjualan', href: route('admin.laporan.index'), icon: <IconChart />, routeName: 'admin.laporan.*' },
        { name: 'Audit Log Stok', href: route('admin.log.index'), icon: <IconClipboardList />, routeName: 'admin.log.*' },
        { name: 'Manajemen User', href: route('admin.user.index'), icon: <IconUserShield />, routeName: 'admin.user.*' },
    ];

    const kasirNavItems = [
        { name: 'Dashboard Kasir', href: route('kasir.dashboard'), icon: <IconDashboard />, routeName: 'kasir.dashboard' },
        { name: 'Kasir POS (Jual)', href: route('kasir.pos'), icon: <IconPos />, routeName: 'kasir.pos*', highlight: true },
        { name: 'Riwayat Transaksi', href: route('kasir.riwayat'), icon: <IconReceipt />, routeName: 'kasir.riwayat' },
        { name: 'Data Pelanggan', href: route('kasir.pelanggan.index'), icon: <IconUsers />, routeName: 'kasir.pelanggan.*' },
    ];

    const navItems = isAdmin ? adminNavItems : kasirNavItems;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between bg-blue-700 text-white px-4 py-3 shadow-md sticky top-0 z-40">
                <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white text-blue-700 flex items-center justify-center font-black text-base shadow-xs">
                        N
                    </div>
                    <div>
                        <span className="font-black text-base tracking-tight block leading-tight">NAUFAM MART</span>
                        <span className="text-[10px] text-blue-100 font-bold uppercase tracking-wider block">POS & Inventory</span>
                    </div>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-xl text-white hover:bg-blue-600 focus:outline-hidden transition-colors"
                >
                    {mobileMenuOpen ? <IconX className="w-6 h-6" /> : <IconMenu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar Navigation */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-68 bg-white text-slate-800 border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen md:sticky md:top-0 shadow-xs ${
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div>
                    {/* Brand / Logo */}
                    <div className="h-17 flex items-center px-6 border-b border-slate-200 bg-white">
                        <Link href={isAdmin ? route('admin.dashboard') : route('kasir.dashboard')} className="flex items-center space-x-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                🏪
                            </div>
                            <div>
                                <span className="font-black text-base text-slate-950 tracking-tight leading-none block">
                                    NAUFAM MART
                                </span>
                                <span className="text-[11px] font-extrabold text-blue-700 tracking-wider uppercase block mt-0.5">
                                    POS & Retail System
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Role Badge Pill */}
                    <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-700 font-bold">Hak Akses:</span>
                            <span
                                className={`text-[11px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-2xs ${
                                    isAdmin
                                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                }`}
                            >
                                {user.role ? `● ${user.role}` : '● GUEST'}
                            </span>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="p-3.5 space-y-1 overflow-y-auto max-h-[calc(100vh-215px)]">
                        {navItems.map((item) => {
                            const isActive = route().current(item.routeName);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group ${
                                        isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/25'
                                            : item.highlight
                                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 border border-blue-300 hover:bg-blue-100/90 shadow-2xs'
                                            : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/80'
                                    }`}
                                >
                                    <span className={`${isActive ? 'text-white' : item.highlight ? 'text-blue-700' : 'text-slate-500 group-hover:text-blue-600'}`}>
                                        {item.icon}
                                    </span>
                                    <span className="tracking-tight">{item.name}</span>
                                    {item.highlight && (
                                        <span className="ml-auto text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black tracking-wider shadow-xs">
                                            LIVE
                                        </span>
                                    )}
                                </Link>
                            );
                        })}

                        {/* Kasir Quick shortcut for Admin */}
                        {isAdmin && (
                            <div className="pt-3 mt-3 border-t border-slate-200">
                                <p className="px-3 text-[10.5px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                                    Operasional Kasir
                                </p>
                                <Link
                                    href={route('kasir.pos')}
                                    className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-300 shadow-2xs transition-all"
                                >
                                    <IconPos className="w-4 h-4 text-emerald-700" />
                                    <span>Buka Terminal Kasir (POS)</span>
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>

                {/* User Info & Logout */}
                <div className="p-3.5 border-t border-slate-200 bg-white">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="truncate">
                                <p className="text-xs font-black text-slate-900 truncate">
                                    {user.name}
                                </p>
                                <p className="text-[11px] text-slate-600 font-semibold truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            title="Keluar dari Sistem"
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-colors shrink-0"
                        >
                            <IconLogout className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Mobile backdrop */}
            {mobileMenuOpen && (
                <div
                    onClick={() => setMobileMenuOpen(false)}
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-20 md:hidden"
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Top Desktop Navigation Bar */}
                <header className="hidden md:flex items-center justify-between h-17 bg-white/95 backdrop-blur-md border-b border-slate-200 px-8 sticky top-0 z-20 shadow-2xs">
                    <div>
                        {header ? (
                            header
                        ) : (
                            <h1 className="text-base font-black text-slate-900">
                                Sistem Informasi Penjualan Toko NAUFAM MART
                            </h1>
                        )}
                    </div>
                    <div className="flex items-center space-x-3.5">
                        <RealtimeClock />
                        <Link
                            href={route('kasir.pos')}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                        >
                            <IconPos className="w-4 h-4" />
                            <span>Terminal Kasir</span>
                        </Link>
                    </div>
                </header>

                {/* Notifications & Flash Messages */}
                {!dismissFlash && flash?.success && (
                    <div className="mx-6 md:mx-8 mt-5 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex items-start justify-between shadow-xs animate-fadeIn">
                        <div className="flex items-center space-x-3">
                            <IconCheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
                            <p className="text-xs font-bold">{flash.success}</p>
                        </div>
                        <button
                            onClick={() => setDismissFlash(true)}
                            className="text-emerald-700 hover:text-emerald-950 p-1 font-bold"
                        >
                            <IconX className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {!dismissFlash && flash?.error && (
                    <div className="mx-6 md:mx-8 mt-5 p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex items-start justify-between shadow-xs animate-fadeIn">
                        <div className="flex items-center space-x-3">
                            <IconExclamation className="w-5 h-5 text-rose-700 shrink-0" />
                            <p className="text-xs font-bold">{flash.error}</p>
                        </div>
                        <button
                            onClick={() => setDismissFlash(true)}
                            className="text-rose-700 hover:text-rose-950 p-1 font-bold"
                        >
                            <IconX className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Main page content */}
                <main className="p-6 md:p-8 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
