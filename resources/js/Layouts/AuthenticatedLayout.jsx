import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user || {};
    const role = user.role || 'pelanggan';

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const getDashboardRoute = () => {
        if (role === 'admin') return 'admin.dashboard';
        if (role === 'kasir') return 'kasir.dashboard';
        return 'pelanggan.katalog';
    };

    return (
        <div className="min-h-screen bg-[#EEF4F8] font-sans text-slate-900">
            <nav className="border-b border-blue-100 bg-white/95 backdrop-blur-md shadow-xs sticky top-0 z-40">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center space-x-6">
                            {/* Brand Logo */}
                            <ApplicationLogo href={route(getDashboardRoute())} size="sm" />

                            {/* Role Navigation Items */}
                            <div className="hidden space-x-2 sm:flex">
                                {role === 'admin' && (
                                    <>
                                        <NavLink
                                            href={route('admin.dashboard')}
                                            active={route().current('admin.dashboard')}
                                            className="text-xs font-bold"
                                        >
                                            Dashboard
                                        </NavLink>
                                        <NavLink
                                            href={route('admin.produk.index')}
                                            active={route().current('admin.produk.*')}
                                            className="text-xs font-bold"
                                        >
                                            Produk
                                        </NavLink>
                                        <NavLink
                                            href={route('admin.laporan.index')}
                                            active={route().current('admin.laporan.*')}
                                            className="text-xs font-bold"
                                        >
                                            Laporan
                                        </NavLink>
                                        <NavLink
                                            href={route('kasir.pos')}
                                            className="text-xs font-bold text-blue-600"
                                        >
                                            Terminal Kasir ⚡
                                        </NavLink>
                                    </>
                                )}

                                {role === 'kasir' && (
                                    <>
                                        <NavLink
                                            href={route('kasir.dashboard')}
                                            active={route().current('kasir.dashboard')}
                                            className="text-xs font-bold"
                                        >
                                            Dashboard
                                        </NavLink>
                                        <NavLink
                                            href={route('kasir.pos')}
                                            active={route().current('kasir.pos*')}
                                            className="text-xs font-bold text-blue-600"
                                        >
                                            Kasir POS ⚡
                                        </NavLink>
                                        <NavLink
                                            href={route('kasir.riwayat')}
                                            active={route().current('kasir.riwayat*')}
                                            className="text-xs font-bold"
                                        >
                                            Riwayat
                                        </NavLink>
                                    </>
                                )}

                                {role === 'pelanggan' && (
                                    <>
                                        <NavLink
                                            href={route('pelanggan.katalog')}
                                            active={route().current('pelanggan.katalog')}
                                            className="text-xs font-bold"
                                        >
                                            Katalog Belanja
                                        </NavLink>
                                        <NavLink
                                            href={route('pelanggan.pesanan')}
                                            active={route().current('pelanggan.pesanan')}
                                            className="text-xs font-bold"
                                        >
                                            Pesanan Saya
                                        </NavLink>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* User Profile Dropdown */}
                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-xl">
                                            <button
                                                type="button"
                                                className="inline-flex items-center space-x-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden transition shadow-2xs"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <span>{user.name}</span>
                                                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                                                    {role}
                                                </span>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Profil Akun
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="text-rose-600 hover:text-rose-800"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Mobile Hamburger Button */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-hidden transition"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Slide-down Menu */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden border-t border-slate-200 bg-white'}>
                    <div className="space-y-1 pb-3 pt-2 px-3">
                        {role === 'admin' && (
                            <>
                                <ResponsiveNavLink href={route('admin.dashboard')} active={route().current('admin.dashboard')}>
                                    Dashboard Admin
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('admin.produk.index')} active={route().current('admin.produk.*')}>
                                    Master Produk
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('admin.laporan.index')} active={route().current('admin.laporan.*')}>
                                    Laporan Penjualan
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('kasir.pos')}>
                                    Terminal Kasir POS ⚡
                                </ResponsiveNavLink>
                            </>
                        )}

                        {role === 'kasir' && (
                            <>
                                <ResponsiveNavLink href={route('kasir.dashboard')} active={route().current('kasir.dashboard')}>
                                    Dashboard Kasir
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('kasir.pos')} active={route().current('kasir.pos*')}>
                                    Terminal Kasir POS ⚡
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('kasir.riwayat')} active={route().current('kasir.riwayat*')}>
                                    Riwayat Transaksi
                                </ResponsiveNavLink>
                            </>
                        )}

                        {role === 'pelanggan' && (
                            <>
                                <ResponsiveNavLink href={route('pelanggan.katalog')} active={route().current('pelanggan.katalog')}>
                                    Katalog Belanja
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('pelanggan.pesanan')} active={route().current('pelanggan.pesanan')}>
                                    Pesanan Saya
                                </ResponsiveNavLink>
                            </>
                        )}
                    </div>

                    <div className="border-t border-slate-100 pb-3 pt-3 px-4 bg-slate-50">
                        <div className="text-xs font-black text-slate-800">{user.name}</div>
                        <div className="text-[11px] font-semibold text-slate-500">{user.email}</div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profil Akun</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white/80 backdrop-blur-xs border-b border-blue-100 py-4 px-6 md:px-8 shadow-2xs">
                    <div className="max-w-7xl mx-auto">{header}</div>
                </header>
            )}

            <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">{children}</main>
        </div>
    );
}
