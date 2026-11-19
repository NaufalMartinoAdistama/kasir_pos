import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    IconPos,
    IconReceipt,
    IconBox,
    IconChart,
    IconExclamation,
    IconRfid,
    IconBarcode,
} from '@/Components/Icons';
import { formatRupiah, formatDate, getPaymentBadgeProps } from '@/Utils/format';
import {
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

export default function KasirDashboard({
    stats = {},
    transaksi_terakhir = [],
    produk_populer = [],
    penjualan_per_jam = [],
    komposisi_pembayaran = [],
}) {
    // Colors for payment methods
    const METHOD_COLORS = {
        'Tunai': '#10B981',        // Emerald
        'QRIS': '#06B6D4',         // Cyan
        'Transfer Bank': '#2563EB', // Blue
        'Kartu Debit': '#8B5CF6',  // Purple
    };

    const maxTerjual = Math.max(...produk_populer.map(p => Number(p.total_terjual) || 0), 10);

    const totalMetodeCount = komposisi_pembayaran.reduce((a, c) => a + (Number(c.count) || 0), 0);

    return (
        <AppLayout
            header={
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                        Kasir POS & Sales Terminal
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        Operasional kasir MARTIN MART • Scan Barcode, Tap RFID Member & Cetak Struk
                    </p>
                </div>
            }
        >
            <Head title="Dashboard Kasir - MARTIN MART" />

            {/* Quick Action POS Hero Banner */}
            <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 border border-blue-400/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-1.5 relative z-10">
                    <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-yellow-300 px-3 py-0.5 rounded-full border border-white/30 shadow-xs">
                            ⚡ MESIN KASIR SIAP
                        </span>
                        <span className="text-xs text-blue-100 font-bold">
                            Keyboard Wedge RFID, Barcode & Tunai/Non-Tunai Aktif
                        </span>
                    </div>
                    <h2 className="text-xl md:text-3xl font-black tracking-tight text-white leading-tight">
                        Buka Terminal Transaksi Kasir (POS)
                    </h2>
                    <p className="text-xs font-medium text-blue-100 max-w-xl leading-relaxed">
                        Input transaksi penjualan barang multi-item, scan barcode scanner USB / webcam, tap kartu RFID pelanggan, proses pembayaran Tunai & Non-Tunai, serta cetak struk belanja thermal.
                    </p>
                </div>
                <Link
                    href={route('kasir.pos')}
                    className="px-6 py-3.5 bg-white hover:bg-blue-50 text-blue-800 rounded-xl font-black text-xs shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center space-x-2 shrink-0 tracking-wider uppercase border border-white/80 relative z-10"
                >
                    <IconPos className="w-5 h-5 text-blue-600" />
                    <span>BUKA MESIN KASIR</span>
                </Link>
            </div>

            {/* SECTION 1: Over View (4 Stat Cards) */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3.5">
                    <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                        <span>Over View</span>
                    </h2>
                    <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
                        Shift Kasir Aktif
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

                    {/* Card 2: Orders Hari Ini */}
                    <div className="bg-white p-4.5 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-lg transition-all flex items-center space-x-4 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                            <IconReceipt className="w-6 h-6" />
                        </div>
                        <div className="truncate">
                            <h3 className="text-2xl font-black text-slate-950 tracking-tight leading-none">
                                {stats.transaksi_hari_ini || 0}
                            </h3>
                            <p className="text-xs font-bold text-slate-500 mt-1 truncate">
                                Orders Hari Ini
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Omset Kasir Hari Ini */}
                    <div className="bg-white p-4.5 rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-lg transition-all flex items-center space-x-4 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                            <IconChart className="w-6 h-6" />
                        </div>
                        <div className="truncate">
                            <h3 className="text-xl md:text-2xl font-black text-slate-950 tracking-tight leading-none">
                                {formatRupiah(stats.pendapatan_hari_ini || 0)}
                            </h3>
                            <p className="text-xs font-bold text-slate-500 mt-1 truncate">
                                Total Omset Hari Ini
                            </p>
                        </div>
                    </div>

                    {/* Card 4: Out of Stock */}
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

            {/* SECTION 2: INTERACTIVE RECHARTS KASIR (Penjualan Per Jam & Komposisi Metode Bayar) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* GRAFIK 1: Performa Penjualan Per Jam Hari Ini */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                <span>Aktivitas Penjualan Hari Ini</span>
                            </h3>
                            <p className="text-[11px] font-medium text-slate-500">
                                Distribusi nominal transaksi per rentang jam
                            </p>
                        </div>
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                            BarChart Shift Kasir
                        </span>
                    </div>

                    <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={penjualan_per_jam} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="jam"
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
                                    formatter={(value, name, props) => [
                                        `${formatRupiah(value)} (${props.payload.transaksi} trx)`,
                                        'Nominal',
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
                                <Bar dataKey="total" fill="#2563EB" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>Total Transaksi Shift:</span>
                        <span className="text-blue-700 font-black">
                            {penjualan_per_jam.reduce((a, c) => a + (Number(c.transaksi) || 0), 0)} Faktur
                        </span>
                    </div>
                </div>

                {/* GRAFIK 2: Komposisi Metode Pembayaran (PieChart Donut) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                                <span>Komposisi Metode Pembayaran</span>
                            </h3>
                            <p className="text-[11px] font-medium text-slate-500">
                                Tunai vs Non-Tunai (QRIS, VA, Kartu Debit)
                            </p>
                        </div>
                        <span className="text-[11px] font-bold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-md border border-cyan-200">
                            Cash & Cashless
                        </span>
                    </div>

                    <div className="h-60 w-full flex items-center justify-around">
                        <div className="w-44 h-44 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={komposisi_pembayaran}
                                        innerRadius={42}
                                        outerRadius={68}
                                        paddingAngle={4}
                                        dataKey="count"
                                    >
                                        {komposisi_pembayaran.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={METHOD_COLORS[entry.name] || '#2563EB'}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name, props) => [
                                            `${value} transaksi (${formatRupiah(props.payload.total)})`,
                                            props.payload.name,
                                        ]}
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
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
                                <span className="text-xs font-black text-slate-900">{totalMetodeCount} Trx</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="space-y-2 pl-2">
                            {komposisi_pembayaran.map((item) => (
                                <div key={item.name} className="flex items-center space-x-2">
                                    <span
                                        className="w-3 h-3 rounded-md shrink-0 shadow-2xs"
                                        style={{ backgroundColor: METHOD_COLORS[item.name] || '#2563EB' }}
                                    ></span>
                                    <div className="text-xs">
                                        <p className="font-bold text-slate-800 leading-none">{item.name}</p>
                                        <p className="text-[10.5px] font-semibold text-slate-500 mt-0.5">
                                            {item.count} trx ({totalMetodeCount > 0 ? Math.round((item.count / totalMetodeCount) * 100) : 0}%)
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>Pilihan Utama:</span>
                        <span className="text-emerald-700 font-black">
                            💵 Tunai Tetap Tersedia di Kasir POS
                        </span>
                    </div>
                </div>
            </div>

            {/* SECTION 3: 2 Column Layout (Today's Transactions & Top Selling Products) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Today's Transactions (8 cols) */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="p-4.5 border-b border-slate-100 flex items-center justify-between bg-blue-50/40">
                            <div>
                                <h3 className="text-sm font-black text-slate-900">
                                    Transaksi Penjualan Hari Ini
                                </h3>
                                <p className="text-[11px] font-semibold text-slate-500">
                                    Daftar struk belanja yang diproses pada shift ini
                                </p>
                            </div>
                            <Link
                                href={route('kasir.riwayat')}
                                className="text-xs font-bold text-blue-600 hover:underline"
                            >
                                Riwayat Lengkap →
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                                <thead className="bg-[#F8FAFC] text-slate-700 font-black uppercase text-[10.5px]">
                                    <tr>
                                        <th className="px-5 py-3">No Faktur</th>
                                        <th className="px-5 py-3">Pelanggan</th>
                                        <th className="px-5 py-3">Barang Dibeli</th>
                                        <th className="px-5 py-3 text-right">Total Bayar</th>
                                        <th className="px-5 py-3 text-center">Metode</th>
                                        <th className="px-5 py-3 text-center">Struk</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {transaksi_terakhir.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-5 py-8 text-center text-slate-400 font-bold">
                                                Belum ada transaksi penjualan yang diproses hari ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        transaksi_terakhir.map((trx) => (
                                            <tr key={trx.id_transaksi} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-5 py-3.5 font-black text-blue-700 font-mono">
                                                    #TRX-{String(trx.id_transaksi).padStart(5, '0')}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <p className="font-bold text-slate-900">
                                                        {trx.pelanggan?.nama_pelanggan || 'Pelanggan Umum'}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400">
                                                        {trx.pelanggan?.kota || '-'}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                                                    {trx.details?.map(d => `${d.produk?.nama_produk || 'Produk'} (${d.jumlah}x)`).join(', ') || '-'}
                                                </td>
                                                <td className="px-5 py-3.5 text-right font-black text-slate-950">
                                                    {formatRupiah(trx.total_belanja)}
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    {(() => {
                                                        const badge = getPaymentBadgeProps(trx.metode_pembayaran);
                                                        return (
                                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${badge.className}`}>
                                                                {badge.icon} {badge.label}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <Link
                                                        href={route('transaksi.struk', trx.id_transaksi)}
                                                        className="inline-flex items-center px-3 py-1 text-[11px] font-black text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                                                    >
                                                        Cetak
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50/30 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">
                            Butuh input transaksi pelanggan baru?
                        </span>
                        <Link
                            href={route('kasir.pos')}
                            className="font-black text-blue-700 hover:text-blue-900 flex items-center space-x-1"
                        >
                            <span>+ Transaksi Baru di Mesin Kasir</span>
                            <span>→</span>
                        </Link>
                    </div>
                </div>

                {/* Right: Top Produk by Sales */}
                <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-slate-900 tracking-tight">
                                Top Produk by sales
                            </h3>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Paling Laris
                            </span>
                        </div>

                        {produk_populer.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 font-bold text-xs">
                                Belum ada produk terjual hari ini.
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
                                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500 ease-out shadow-xs"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Hardware integration quick status */}
                    <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                            <div className="flex items-center space-x-1.5">
                                <IconRfid className="w-4 h-4 text-blue-600" />
                                <span>RFID Member Reader:</span>
                            </div>
                            <span className="font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                                ● Siap Tap
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                            <div className="flex items-center space-x-1.5">
                                <IconBarcode className="w-4 h-4 text-cyan-600" />
                                <span>Barcode Scanner / WebCam:</span>
                            </div>
                            <span className="font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                                ● Aktif
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
