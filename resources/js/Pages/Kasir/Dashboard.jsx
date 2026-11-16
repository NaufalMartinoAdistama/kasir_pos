import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StatCard from '@/Components/StatCard';
import {
    IconPos,
    IconReceipt,
    IconBox,
    IconCheckCircle,
} from '@/Components/Icons';
import { formatRupiah, formatDate } from '@/Utils/format';

export default function KasirDashboard({
    stats = {},
    transaksi_terakhir = [],
    produk_populer = [],
}) {
    return (
        <AppLayout
            header={
                <div>
                    <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                        Dashboard Operasional Kasir
                    </h1>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        Pantau pencapaian penjualan hari ini dan buka mesin kasir POS
                    </p>
                </div>
            }
        >
            <Head title="Dashboard Kasir - NAUFAM MART" />

            {/* Big POS Action Banner */}
            <div className="mb-8 p-6 md:p-7 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <span className="text-xs font-black uppercase tracking-wider bg-white/20 text-blue-50 px-3.5 py-1 rounded-full border border-white/20">
                        ⚡ Mesin Kasir Siap Melayani
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black mt-3 tracking-tight">
                        Buka Mesin Transaksi Kasir (POS)
                    </h2>
                    <p className="text-sm font-medium text-blue-100 mt-1.5 max-w-xl leading-relaxed">
                        Mulai input transaksi penjualan, scan barcode / kamera, tap kartu RFID member, dan cetak struk belanja thermal secara instan.
                    </p>
                </div>
                <Link
                    href={route('kasir.pos')}
                    className="px-6 py-4 bg-white text-blue-800 hover:bg-blue-50 rounded-2xl font-black text-sm shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center space-x-2 shrink-0 border border-white"
                >
                    <IconPos className="w-5 h-5 text-blue-700" />
                    <span>MULAI TRANSAKSI KASIR</span>
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard
                    title="Transaksi Hari Ini"
                    value={`${stats.transaksi_hari_ini || 0} Faktur`}
                    subtitle="Penjualan hari ini"
                    icon={<IconReceipt className="w-6 h-6" />}
                    color="blue"
                    trend="Hari Ini"
                />
                <StatCard
                    title="Pendapatan Hari Ini"
                    value={formatRupiah(stats.pendapatan_hari_ini || 0)}
                    subtitle="Omset kasir terkumpul"
                    icon={<IconCheckCircle className="w-6 h-6" />}
                    color="emerald"
                    trend="Real-time"
                />
                <StatCard
                    title="Katalog Produk"
                    value={`${stats.total_produk || 0} Item`}
                    subtitle="Total jenis barang"
                    icon={<IconBox className="w-6 h-6" />}
                    color="indigo"
                    trend="Katalog"
                />
                <StatCard
                    title="Produk Siap Jual"
                    value={`${stats.stok_tersedia || 0} Item`}
                    subtitle="Stok masih tersedia"
                    icon={<IconPos className="w-6 h-6" />}
                    color="amber"
                    trend="Siap Jual"
                />
            </div>

            {/* 2 Column Layout: Today's Transactions & Top Selling */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Today's Transactions */}
                <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-6 border-b-2 border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-black text-slate-950">
                                Transaksi Penjualan Hari Ini
                            </h3>
                            <p className="text-xs font-semibold text-slate-600">
                                Faktur penjualan yang masuk pada tanggal hari ini
                            </p>
                        </div>
                        <Link
                            href={route('kasir.riwayat')}
                            className="text-xs font-black text-blue-700 hover:text-blue-900"
                        >
                            Lihat Semua →
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y-2 divide-slate-100 text-left text-sm">
                            <thead className="bg-slate-100 text-slate-900 text-xs uppercase font-black border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3.5">No Faktur</th>
                                    <th className="px-6 py-3.5">Pelanggan</th>
                                    <th className="px-6 py-3.5">Barang Dibeli</th>
                                    <th className="px-6 py-3.5 text-right">Total</th>
                                    <th className="px-6 py-3.5 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {transaksi_terakhir.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-bold">
                                            Belum ada transaksi penjualan yang diproses hari ini.
                                        </td>
                                    </tr>
                                ) : (
                                    transaksi_terakhir.map((trx) => (
                                        <tr key={trx.id_transaksi} className="hover:bg-blue-50/40 transition-colors">
                                            <td className="px-6 py-4 font-black text-blue-900 text-xs">
                                                #TRX-{String(trx.id_transaksi).padStart(5, '0')}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-950 text-xs">
                                                {trx.pelanggan?.nama_pelanggan || 'Pelanggan Umum'}
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
                                                    Cetak Struk
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Popular Products */}
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-xs">
                    <h3 className="text-base font-black text-slate-950 mb-1">
                        Produk Terlaris
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 mb-4">
                        Kuantitas produk yang paling banyak terjual
                    </p>

                    <div className="space-y-3">
                        {produk_populer.length === 0 ? (
                            <p className="text-xs text-slate-500 font-bold text-center py-6">
                                Belum ada data penjualan tercatat.
                            </p>
                        ) : (
                            produk_populer.map((item, idx) => (
                                <div
                                    key={item.id_produk}
                                    className="p-3 rounded-xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between"
                                >
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                                            {idx + 1}
                                        </div>
                                        <div className="truncate">
                                            <p className="text-xs font-black text-slate-950 truncate">
                                                {item.produk?.nama_produk || 'Produk'}
                                            </p>
                                            <p className="text-[11px] font-semibold text-slate-600">
                                                {item.produk?.kategori?.nama_kategori || 'Kategori'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-100 text-blue-950 border border-blue-300 shrink-0">
                                        {item.total_terjual} terjual
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t-2 border-slate-100 text-center">
                        <Link
                            href={route('kasir.pos')}
                            className="w-full inline-flex justify-center items-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors"
                        >
                            + Buka POS Sekarang
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
