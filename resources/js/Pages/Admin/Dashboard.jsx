import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    IconReceipt,
    IconBox,
    IconUsers,
    IconChart,
    IconPos,
    IconExclamation,
    IconBuilding,
    IconBarcode,
    IconTag,
} from '@/Components/Icons';
import { formatRupiah, formatDate, getPaymentBadgeProps } from '@/Utils/format';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';

export default function AdminDashboard({
    stats = {},
    produk_stok_menipis = [],
    produk_populer = [],
    transaksi_terbaru = [],
    grafik_penjualan = [],
    distribusi_kategori = [],
    top_produk_chart = [],
}) {
    const [chartMode, setChartMode] = useState('kategori'); // 'kategori' | 'produk'

    const BLUE_PALETTE = ['#2563EB', '#0EA5E9', '#38BDF8', '#6366F1', '#818CF8', '#0284C7'];

    // Donut Inventory Calculations
    const totalStokFisik = Number(stats.total_stok) || 100;
    const totalTerjualUnit = produk_populer.reduce((acc, curr) => acc + (Number(curr.total_terjual) || 0), 0) || 35;
    const totalInventoryBase = totalStokFisik + totalTerjualUnit;
    const soldPercentage = Math.min(Math.max(Math.round((totalTerjualUnit / (totalInventoryBase || 1)) * 100), 15), 85);
    const availablePercentage = 100 - soldPercentage;

    const donutData = [
        { name: 'Sold units', value: totalTerjualUnit, percentage: soldPercentage },
        { name: 'Total units', value: totalStokFisik, percentage: availablePercentage },
    ];
    const DONUT_COLORS = ['#38BDF8', '#334E68'];

    // Max sold for top products horizontal bars
    const maxTerjual = Math.max(...produk_populer.map(p => Number(p.total_terjual) || 0), 10);

    const formatShortRupiah = (val) => {
        if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}jt`;
        if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}k`;
        return `Rp ${val}`;
    };

    return (
        <AppLayout
            header={
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                        Inventory Management & POS Dashboard
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        Ringkasan operasional toko, status inventaris barang, dan performa penjualan real-time
                    </p>
                </div>
            }
        >
            <Head title="Inventory Management - MARTIN MART" />

            {/* SECTION 1: Over View (4 Bright Stat Cards) */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3.5">
                    <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                        <span>Over View</span>
                    </h2>
                    <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
                        ⚡ Real-time Analytics 2024
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Products */}
                    <div className="bg-white p-4.5 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-lg transition-all flex items-center space-x-4 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                            <IconBox className="w-6 h-6" />
                        </div>
                        <div className="truncate">
                            <h3 className="text-2xl font-black text-slate-950 tracking-tight leading-none">
                                {stats.total_produk || 0}
                            </h3>
                            <p className="text-xs font-bold text-slate-500 mt-1 truncate">
                                Total Products
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Orders */}
                    <div className="bg-white p-4.5 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-lg transition-all flex items-center space-x-4 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                            <IconReceipt className="w-6 h-6" />
                        </div>
                        <div className="truncate">
                            <h3 className="text-2xl font-black text-slate-950 tracking-tight leading-none">
                                {stats.total_transaksi || 0}
                            </h3>
                            <p className="text-xs font-bold text-slate-500 mt-1 truncate">
                                Orders
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Total Stock */}
                    <div className="bg-white p-4.5 rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-lg transition-all flex items-center space-x-4 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                            <IconChart className="w-6 h-6" />
                        </div>
                        <div className="truncate">
                            <h3 className="text-2xl font-black text-slate-950 tracking-tight leading-none">
                                {stats.total_stok || 0}
                            </h3>
                            <p className="text-xs font-bold text-slate-500 mt-1 truncate">
                                Total Stock
                            </p>
                        </div>
                    </div>

                    {/* Card 4: Out of Stock (Peach Box with (i) badge) */}
                    <div className="bg-gradient-to-br from-rose-50 via-orange-50/60 to-rose-50 border border-rose-300 p-4.5 rounded-2xl shadow-xs hover:shadow-lg transition-all flex items-center justify-between relative group">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/25 group-hover:scale-105 transition-transform">
                                <IconExclamation className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-rose-950 tracking-tight leading-none">
                                    {stats.stok_menipis || 0}
                                </h3>
                                <p className="text-xs font-bold text-rose-700 mt-1">
                                    Out of Stock
                                </p>
                            </div>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 border-rose-500 flex items-center justify-center text-[10px] font-black italic text-rose-600 bg-white shadow-2xs shrink-0">
                            i
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: INTERACTIVE RECHARTS (Grafik Tren Pendapatan & Distribusi Produk) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* GRAFIK 1: Tren Pendapatan Penjualan 7 Hari Terakhir (AreaChart Recharts) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                <span>Tren Pendapatan Penjualan</span>
                            </h3>
                            <p className="text-[11px] font-medium text-slate-500">
                                Akumulasi omset harian (7 hari terakhir)
                            </p>
                        </div>
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                            AreaChart Biru #2563EB
                        </span>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={grafik_penjualan} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }}
                                    axisLine={{ stroke: '#CBD5E1' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={formatShortRupiah}
                                />
                                <Tooltip
                                    formatter={(value) => [formatRupiah(value), 'Total Omset']}
                                    labelFormatter={(label) => `Tanggal: ${label}`}
                                    contentStyle={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        border: '1px solid #E2E8F0',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#2563EB"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorPendapatan)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>Total Akumulasi Periode:</span>
                        <span className="text-blue-700 font-black">
                            {formatRupiah(grafik_penjualan.reduce((a, c) => a + (Number(c.total) || 0), 0))}
                        </span>
                    </div>
                </div>

                {/* GRAFIK 2: Produk Terlaris & Distribusi Kategori (BarChart Recharts) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                                <span>Distribusi Penjualan Ritel</span>
                            </h3>
                            <p className="text-[11px] font-medium text-slate-500">
                                Perbandingan kuantitas per kategori / produk
                            </p>
                        </div>
                        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                            <button
                                type="button"
                                onClick={() => setChartMode('kategori')}
                                className={`px-2 py-0.5 rounded-md font-bold transition ${
                                    chartMode === 'kategori' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'
                                }`}
                            >
                                Kategori
                            </button>
                            <button
                                type="button"
                                onClick={() => setChartMode('produk')}
                                className={`px-2 py-0.5 rounded-md font-bold transition ${
                                    chartMode === 'produk' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'
                                }`}
                            >
                                Top 5 Produk
                            </button>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartMode === 'kategori' ? distribusi_kategori : top_produk_chart}
                                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    interval={0}
                                    angle={-15}
                                    textAnchor="end"
                                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
                                    axisLine={{ stroke: '#CBD5E1' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    formatter={(value, name) => [
                                        chartMode === 'kategori' ? `${value} Unit Terjual` : `${value} pcs`,
                                        'Kuantitas',
                                    ]}
                                    contentStyle={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        border: '1px solid #E2E8F0',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                    }}
                                />
                                <Bar
                                    dataKey={chartMode === 'kategori' ? 'total_unit' : 'terjual'}
                                    radius={[6, 6, 0, 0]}
                                >
                                    {(chartMode === 'kategori' ? distribusi_kategori : top_produk_chart).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={BLUE_PALETTE[index % BLUE_PALETTE.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>Klasifikasi:</span>
                        <span className="text-blue-700 font-black">
                            {chartMode === 'kategori' ? `${distribusi_kategori.length} Kategori Utama` : '5 Produk Terlaris'}
                        </span>
                    </div>
                </div>
            </div>

            {/* SECTION 3: WIDGET ROW (No of users + Inventory Values Donut + Top Produk Progress) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
                {/* Left (8 cols): No of users + Inventory Values */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-12 gap-5">
                    {/* Card: No of users */}
                    <div className="sm:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-900 tracking-tight">
                                No of users
                            </h3>
                            <span className="text-slate-400 text-xs font-black">⋮</span>
                        </div>

                        <div className="my-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center mb-3 shadow-md shadow-blue-500/20">
                                <IconUsers className="w-6 h-6" />
                            </div>
                            <h4 className="text-3xl font-black text-slate-950 tracking-tight leading-none">
                                {stats.total_pelanggan || 0}
                            </h4>
                            <p className="text-xs font-bold text-slate-500 mt-1">
                                Total Customers
                            </p>
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-semibold">Toko</span>
                            <span className="text-blue-700 font-black">MARTIN MART</span>
                        </div>
                    </div>

                    {/* Card: Inventory Values (Recharts Donut) */}
                    <div className="sm:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-900 tracking-tight">
                                Inventory Values
                            </h3>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Status Stok
                            </span>
                        </div>

                        <div className="my-2 flex items-center justify-around">
                            {/* Recharts Pie Donut */}
                            <div className="w-32 h-32 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={donutData}
                                            innerRadius={36}
                                            outerRadius={52}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {donutData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [`${value} unit`, 'Kuantitas']}
                                            contentStyle={{
                                                backgroundColor: '#FFFFFF',
                                                borderRadius: '8px',
                                                border: '1px solid #E2E8F0',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-xs font-black text-slate-800">
                                        {soldPercentage}%
                                    </span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="space-y-3 pl-2">
                                <div className="flex items-center space-x-2.5">
                                    <span className="w-3.5 h-3.5 rounded-md bg-[#38BDF8] shadow-xs shrink-0"></span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 leading-none">Sold units</p>
                                        <p className="text-[10.5px] font-semibold text-slate-500 mt-0.5">{totalTerjualUnit} pcs ({soldPercentage}%)</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2.5">
                                    <span className="w-3.5 h-3.5 rounded-md bg-[#334E68] shadow-xs shrink-0"></span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 leading-none">Total units</p>
                                        <p className="text-[10.5px] font-semibold text-slate-500 mt-0.5">{totalStokFisik} pcs ({availablePercentage}%)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Katalog Aktif</span>
                            <span className="font-bold text-blue-700">{stats.total_produk || 0} Item</span>
                        </div>
                    </div>
                </div>

                {/* Right (4 cols): Top Produk Terlaris list with progress bars */}
                <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-slate-900 tracking-tight">
                                Top Produk by sales
                            </h3>
                            <Link
                                href={route('admin.laporan.index')}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                            >
                                Lihat Semua
                            </Link>
                        </div>

                        {produk_populer.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 font-bold text-xs">
                                Belum ada riwayat penjualan produk.
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                {produk_populer.slice(0, 7).map((item, idx) => {
                                    const nama = item.produk?.nama_produk || `Produk #${item.id_produk}`;
                                    const count = Number(item.total_terjual) || 0;
                                    const widthPercent = Math.max(Math.round((count / maxTerjual) * 100), 12);

                                    return (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-slate-800 truncate max-w-[150px]">
                                                    {nama}
                                                </span>
                                                <span className="text-[11px] font-black text-blue-700 shrink-0">
                                                    {count} pcs
                                                </span>
                                            </div>
                                            <div className="w-full h-2.5 bg-blue-50 rounded-full overflow-hidden border border-blue-100">
                                                <div
                                                    style={{ width: `${widthPercent}%` }}
                                                    className="h-full bg-gradient-to-r from-[#2C485E] to-[#3E6582] rounded-full transition-all duration-500 ease-out shadow-xs"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 text-center">
                        <Link
                            href={route('admin.produk.index')}
                            className="text-xs font-black text-blue-700 hover:text-blue-900 inline-flex items-center space-x-1"
                        >
                            <span>Kelola Master Katalog Produk</span>
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* SECTION 4: Recent Transactions & Low Stock Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Recent Transactions (8 cols) */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                    <div className="p-4.5 border-b border-slate-100 flex items-center justify-between bg-blue-50/40">
                        <div>
                            <h3 className="text-sm font-black text-slate-900">
                                Transaksi Penjualan Terakhir
                            </h3>
                            <p className="text-[11px] font-semibold text-slate-500">
                                Faktur belanja terbaru yang berhasil diproses kasir
                            </p>
                        </div>
                        <Link
                            href={route('admin.transaksi.index')}
                            className="text-xs font-bold text-blue-600 hover:underline"
                        >
                            Lihat Semua →
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 text-xs">
                            <thead className="bg-slate-50 text-slate-700 font-black uppercase text-[10px]">
                                <tr>
                                    <th className="px-5 py-3 text-left">Faktur</th>
                                    <th className="px-5 py-3 text-left">Pelanggan</th>
                                    <th className="px-5 py-3 text-left">Item</th>
                                    <th className="px-5 py-3 text-right">Total</th>
                                    <th className="px-5 py-3 text-center">Metode</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {transaksi_terbaru.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-8 text-center text-slate-400 font-bold">
                                            Belum ada transaksi penjualan tercatat.
                                        </td>
                                    </tr>
                                ) : (
                                    transaksi_terbaru.map((t) => (
                                        <tr key={t.id_transaksi} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-5 py-3 font-mono font-black text-blue-900">
                                                #TRX-{String(t.id_transaksi).padStart(5, '0')}
                                            </td>
                                            <td className="px-5 py-3 font-bold text-slate-900">
                                                {t.pelanggan?.nama_pelanggan || 'Pelanggan Umum'}
                                            </td>
                                            <td className="px-5 py-3 text-slate-600 truncate max-w-xs">
                                                {t.details?.map(d => `${d.nama_produk} (${d.jumlah}x)`).join(', ') || '-'}
                                            </td>
                                            <td className="px-5 py-3 text-right font-black text-slate-950">
                                                {formatRupiah(t.total_belanja)}
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                {(() => {
                                                    const badge = getPaymentBadgeProps(t.metode_pembayaran);
                                                    return (
                                                        <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-black border ${badge.className}`}>
                                                            {badge.icon} {badge.label}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stock Warning (4 cols) */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                    <div className="p-4.5 border-b border-slate-100 flex items-center justify-between bg-rose-50/40">
                        <div>
                            <h3 className="text-sm font-black text-slate-900">
                                Peringatan Stok Menipis
                            </h3>
                            <p className="text-[11px] font-semibold text-slate-500">
                                Barang dengan stok ≤ 10 unit
                            </p>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                    </div>

                    <div className="p-4 space-y-3">
                        {produk_stok_menipis.length === 0 ? (
                            <div className="py-8 text-center text-emerald-700 font-bold text-xs bg-emerald-50 rounded-xl border border-emerald-200">
                                ✅ Seluruh stok barang berada dalam batas aman!
                            </div>
                        ) : (
                            produk_stok_menipis.map((p) => (
                                <div
                                    key={p.id_produk}
                                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                                >
                                    <div className="truncate pr-2">
                                        <p className="text-xs font-black text-slate-900 truncate">
                                            {p.nama_produk}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                                            {p.kategori?.nama_kategori || 'Umum'} • {formatRupiah(p.harga)}
                                        </p>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 border border-rose-300 font-black text-xs shrink-0">
                                        Sisa: {p.stok}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
