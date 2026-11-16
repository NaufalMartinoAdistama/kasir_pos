import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StatCard from '@/Components/StatCard';
import {
    IconReceipt,
    IconBox,
    IconUsers,
    IconChart,
    IconPos,
    IconExclamation,
} from '@/Components/Icons';
import { formatRupiah, formatDate } from '@/Utils/format';

export default function AdminDashboard({
    stats,
    produk_stok_menipis = [],
    transaksi_terbaru = [],
    grafik_penjualan = [],
}) {
    const maxSales = Math.max(...grafik_penjualan.map((g) => Number(g.total) || 0), 100000);

    return (
        <AppLayout
            header={
                <div>
                    <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                        Dashboard Administrator
                    </h1>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        Ringkasan performa penjualan, ketersediaan inventaris toko, dan aktivitas transaksi terkini
                    </p>
                </div>
            }
        >
            <Head title="Dashboard Admin - NAUFAM MART" />

            {/* Quick Action Shortcuts Banner */}
            <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-md">
                <div>
                    <h2 className="text-lg font-black tracking-tight">
                        Selamat Datang di Panel Manajemen Toko NAUFAM MART
                    </h2>
                    <p className="text-xs font-medium text-blue-100 mt-1">
                        Pantau inventaris stok secara real-time dan kelola transaksi operasional kasir dengan cepat & akurat.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                        href={route('kasir.pos')}
                        className="px-4 py-2.5 bg-white text-blue-800 rounded-xl font-black text-xs shadow-md hover:bg-blue-50 transition-all flex items-center space-x-1.5 active:scale-95"
                    >
                        <IconPos className="w-4 h-4 text-blue-700" />
                        <span>Buka Kasir (POS)</span>
                    </Link>
                    <Link
                        href={route('admin.produk.index')}
                        className="px-4 py-2.5 bg-blue-900/80 hover:bg-blue-900 text-white rounded-xl font-bold text-xs border border-white/30 transition-all"
                    >
                        Kelola Produk
                    </Link>
                </div>
            </div>

            {/* 4 Primary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard
                    title="Total Pendapatan"
                    value={formatRupiah(stats?.total_pendapatan || 0)}
                    subtitle="Akumulasi omset toko"
                    icon={<IconReceipt className="w-6 h-6" />}
                    color="blue"
                    trend="Semua Waktu"
                />
                <StatCard
                    title="Total Transaksi"
                    value={`${stats?.total_transaksi || 0} Trx`}
                    subtitle="Faktur berhasil diproses"
                    icon={<IconChart className="w-6 h-6" />}
                    color="indigo"
                    trend="Sukses"
                />
                <StatCard
                    title="Total Produk"
                    value={`${stats?.total_produk || 0} Item`}
                    subtitle="Katalog barang aktif"
                    icon={<IconBox className="w-6 h-6" />}
                    color="emerald"
                    trend="Aktif di POS"
                />
                <StatCard
                    title="Stok Menipis"
                    value={`${stats?.stok_menipis || 0} Produk`}
                    subtitle="Stok ≤ 10 unit tersisa"
                    icon={<IconExclamation className="w-6 h-6" />}
                    color={stats?.stok_menipis > 0 ? 'rose' : 'blue'}
                    trend={stats?.stok_menipis > 0 ? 'Perlu Restok Segera' : 'Stok Aman'}
                />
            </div>

            {/* Grid: 7-day Sales Chart & Low Stock Alert */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* 7 Days Sales Trend */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-black text-slate-950">
                                Tren Penjualan 7 Hari Terakhir
                            </h3>
                            <p className="text-xs font-semibold text-slate-600">
                                Grafik performa omset harian toko
                            </p>
                        </div>
                        <Link
                            href={route('admin.laporan.index')}
                            className="text-xs font-black text-blue-700 hover:text-blue-900"
                        >
                            Lihat Laporan Lengkap →
                        </Link>
                    </div>

                    {grafik_penjualan.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 font-bold text-sm">
                            Belum ada riwayat penjualan dalam 7 hari terakhir.
                        </div>
                    ) : (
                        <div className="h-56 flex items-end gap-3 pt-6 pb-2 px-2">
                            {grafik_penjualan.map((item, idx) => {
                                const heightPercent = Math.max(Math.round((Number(item.total) / maxSales) * 100), 10);
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold rounded px-2 py-0.5 whitespace-nowrap shadow-md mb-1">
                                            {formatRupiah(item.total)} ({item.jumlah_transaksi} Trx)
                                        </div>
                                        <div
                                            style={{ height: `${heightPercent}%` }}
                                            className="w-full max-w-[42px] bg-gradient-to-t from-blue-700 to-sky-400 rounded-t-lg group-hover:brightness-110 transition-all cursor-pointer relative shadow-xs"
                                        />
                                        <span className="text-[10.5px] font-bold text-slate-700 truncate w-full text-center">
                                            {formatDate(item.tgl).slice(0, 6)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Low Stock Watchlist */}
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <span className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
                                <IconExclamation className="w-4 h-4" />
                            </span>
                            <h3 className="text-base font-black text-slate-950">
                                Peringatan Stok Menipis
                            </h3>
                        </div>
                        <span className="text-xs font-black text-rose-950 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-300">
                            ≤ 10 Unit
                        </span>
                    </div>

                    {produk_stok_menipis.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 font-bold text-sm">
                            ✅ Semua stok barang saat ini dalam kondisi aman.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {produk_stok_menipis.map((item) => (
                                <div
                                    key={item.id_produk}
                                    className="p-3 rounded-xl border-2 border-rose-200 bg-rose-50/50 flex items-center justify-between"
                                >
                                    <div className="truncate pr-2">
                                        <p className="text-xs font-black text-slate-950 truncate">
                                            {item.nama_produk}
                                        </p>
                                        <p className="text-[11px] font-bold text-slate-600">
                                            {item.kategori?.nama_kategori || 'Tanpa Kategori'} • {formatRupiah(item.harga)}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-xs font-black px-2.5 py-1 rounded-md bg-rose-600 text-white shadow-2xs">
                                            {item.stok} unit
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                        <Link
                            href={route('admin.produk.index')}
                            className="text-xs font-black text-blue-700 hover:text-blue-900"
                        >
                            Kelola & Tambah Stok Produk →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xs overflow-hidden">
                <div className="p-6 border-b-2 border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-black text-slate-950">
                            Transaksi Terbaru
                        </h3>
                        <p className="text-xs font-semibold text-slate-600">
                            Daftar penjualan barang yang baru saja diproses oleh kasir
                        </p>
                    </div>
                    <Link
                        href={route('admin.transaksi.index')}
                        className="text-xs font-black text-blue-700 hover:text-blue-900"
                    >
                        Lihat Semua Transaksi →
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y-2 divide-slate-100 text-left text-sm">
                        <thead className="bg-slate-100 text-slate-900 text-xs uppercase font-black border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3.5">ID Faktur</th>
                                <th className="px-6 py-3.5">Tanggal</th>
                                <th className="px-6 py-3.5">Pelanggan</th>
                                <th className="px-6 py-3.5">Item Produk</th>
                                <th className="px-6 py-3.5 text-right">Total Bayar</th>
                                <th className="px-6 py-3.5 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {transaksi_terbaru.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500 font-bold">
                                        Belum ada riwayat transaksi yang tercatat.
                                    </td>
                                </tr>
                            ) : (
                                transaksi_terbaru.map((trx) => (
                                    <tr key={trx.id_transaksi} className="hover:bg-blue-50/40 transition-colors">
                                        <td className="px-6 py-4 font-black text-blue-900">
                                            #TRX-{String(trx.id_transaksi).padStart(5, '0')}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 text-xs font-bold">
                                            {formatDate(trx.tanggal)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-black text-slate-950 text-xs">
                                                {trx.pelanggan?.nama_pelanggan || 'Pelanggan Umum'}
                                            </p>
                                            <p className="text-[11px] font-bold text-slate-500">
                                                {trx.pelanggan?.kota || '-'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-700 max-w-xs truncate">
                                            {trx.details?.map((d) => `${d.produk?.nama_produk || 'Produk'} (${d.jumlah}x)`).join(', ') || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-slate-950 text-sm">
                                            {formatRupiah(trx.total_belanja)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link
                                                href={route('transaksi.struk', trx.id_transaksi)}
                                                className="inline-flex items-center px-3 py-1 text-xs font-black text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                                            >
                                                Struk
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
