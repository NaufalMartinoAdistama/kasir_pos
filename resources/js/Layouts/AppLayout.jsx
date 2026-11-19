import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
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
    IconSearch,
    IconBell,
    IconMoon,
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
        { name: 'Laporan Penjualan', href: route('kasir.laporan.index'), icon: <IconChart />, routeName: 'kasir.laporan.*' },
    ];

    const pelangganNavItems = [
        { name: 'Katalog Belanja', href: route('pelanggan.katalog'), icon: <IconTag />, routeName: 'pelanggan.katalog*' },
        { name: 'Pesanan Saya', href: route('pelanggan.pesanan'), icon: <IconReceipt />, routeName: 'pelanggan.pesanan*' },
    ];

    const navItems = isAdmin ? adminNavItems : user.role === 'kasir' ? kasirNavItems : pelangganNavItems;

    return (
        <div className="min-h-screen bg-[#EEF4F8] flex flex-col md:flex-row font-sans text-slate-900">
            {/* Mobile Top Header */}
            <div className="md:hidden flex items-center justify-between bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 text-white px-4 py-3 shadow-md sticky top-0 z-40">
                <ApplicationLogo variant="light" size="sm" />
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-xl text-white hover:bg-white/15 focus:outline-hidden transition-colors"
                >
                    {mobileMenuOpen ? <IconX className="w-6 h-6" /> : <IconMenu className="w-6 h-6" />}
                </button>
            </div>

            {/* Reference Theme Sidebar Navigation (Deep Slate-Navy with High Contrast) */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-[#1C3243] via-[#1E374A] to-[#152634] text-white border-r border-[#13222E] flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen md:sticky md:top-0 shadow-2xl ${
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex flex-col flex-1 overflow-hidden">
                    {/* Top User Profile Header (Matching Screenshot Avatar & Info) */}
                    <div className="px-5 pt-6 pb-4 border-b border-white/10 flex flex-col items-center text-center">
                        {/* Circular Avatar */}
                        <div className="relative mb-2.5">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-200 to-blue-500 text-[#1B3244] border-2 border-white/60 flex items-center justify-center text-lg font-black shadow-lg">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#1C3243] shadow-xs"></span>
                        </div>

                        {/* User Full Name & Email */}
                        <h3 className="text-sm font-black text-white tracking-tight leading-tight truncate max-w-[210px]">
                            {user.name || 'User Toko'}
                        </h3>
                        <p className="text-[11px] font-medium text-slate-300 truncate max-w-[210px] mt-0.5">
                            {user.email || 'user@martinmart.com'}
                        </p>

                        {/* Store & Role Badge */}
                        <div className="mt-2.5 flex items-center space-x-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-white/15 text-cyan-300 px-3 py-0.5 rounded-full border border-white/20 shadow-2xs">
                                {isAdmin ? 'ADMINISTRATOR' : user.role === 'kasir' ? 'KASIR POS' : 'MEMBER PELANGGAN'}
                            </span>
                        </div>
                    </div>

                    {/* Brand Banner */}
                    <div className="px-5 py-3 bg-black/20 flex items-center justify-between border-b border-white/10">
                        <ApplicationLogo variant="light" size="sm" />
                        <span className="text-[10px] font-black text-sky-200 bg-white/15 px-2 py-0.5 rounded-full">
                            PRO
                        </span>
                    </div>

                    {/* Navigation Menu List */}
                    <nav className="p-3.5 space-y-1.5 overflow-y-auto flex-1 custom-scrollbar">
                        {navItems.map((item) => {
                            const isActive = route().current(item.routeName);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 group ${
                                        isActive
                                            ? 'bg-[#EBF2F7] text-[#1B3244] font-black shadow-md shadow-black/10'
                                            : item.highlight
                                            ? 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 border border-emerald-400/40 font-bold'
                                            : 'text-slate-300 hover:text-white hover:bg-white/10 font-bold'
                                    }`}
                                >
                                    <span
                                        className={`${
                                            isActive
                                                ? 'text-[#1B3244]'
                                                : item.highlight
                                                ? 'text-emerald-300'
                                                : 'text-slate-400 group-hover:text-white'
                                        }`}
                                    >
                                        {item.icon}
                                    </span>
                                    <span className="tracking-tight truncate">{item.name}</span>
                                    {item.highlight && (
                                        <span className="ml-auto text-[9.5px] bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full font-black tracking-wider shadow-2xs">
                                            LIVE
                                        </span>
                                    )}
                                </Link>
                            );
                        })}

                        {/* Quick POS Shortcut for Admin */}
                        {isAdmin && (
                            <div className="pt-3 mt-3 border-t border-white/10">
                                <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                                    Operasional Kasir
                                </p>
                                <Link
                                    href={route('kasir.pos')}
                                    className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-400 to-blue-500 text-[#1B3244] hover:brightness-110 shadow-md transition-all"
                                >
                                    <IconPos className="w-4 h-4 text-[#1B3244]" />
                                    <span>Buka Terminal Kasir</span>
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>

                {/* Bottom Logout Button */}
                <div className="p-3.5 border-t border-white/10 bg-black/20">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        title="Keluar dari Sistem"
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-rose-600 transition-all border border-white/10"
                    >
                        <IconLogout className="w-4 h-4 text-slate-400 group-hover:text-white" />
                        <span>Logout</span>
                    </Link>
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
                <header className="hidden md:flex items-center justify-between h-18 bg-white/90 backdrop-blur-md border-b border-blue-100 px-8 sticky top-0 z-20 shadow-xs">
                    <div>
                        {header ? (
                            header
                        ) : (
                            <div className="flex items-center space-x-2">
                                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                                    Welcome {user.name ? user.name.split(' ')[0] : 'Admin'} !
                                </h1>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-3.5">
                        {/* Search Pill Input (Matching Reference Screenshot) */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search"
                                readOnly
                                className="w-48 pl-3.5 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 shadow-2xs focus:outline-hidden cursor-default"
                            />
                            <IconSearch className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                        </div>

                        {/* Reference status icons pill (Day/Night toggle + Notification Bell) */}
                        <div className="hidden lg:flex items-center space-x-1 bg-slate-100 p-1 rounded-full border border-slate-200 shadow-2xs">
                            <span className="p-1 rounded-full bg-[#1C3243] text-cyan-300 shadow-xs cursor-pointer" title="Mode Tampilan">
                                <IconMoon className="w-3.5 h-3.5" />
                            </span>
                            <span className="p-1 rounded-full text-slate-600 hover:text-slate-900 cursor-pointer" title="Notifikasi Toko">
                                <IconBell className="w-3.5 h-3.5" />
                            </span>
                        </div>

                        {/* Realtime Clock (WIB) */}
                        <RealtimeClock />

                        {/* POS Quick Button */}
                        <Link
                            href={route('kasir.pos')}
                            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-xs font-black rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95"
                        >
                            <IconPos className="w-3.5 h-3.5 text-white" />
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

                {/* Main Page Content */}
                <main className="p-6 md:p-8 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
