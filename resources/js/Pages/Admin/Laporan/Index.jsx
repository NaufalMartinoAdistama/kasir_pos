import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Pagination from '@/Components/Pagination';
import {
    IconChart,
    IconPrinter,
    IconDownload,
    IconSearch,
    IconReceipt,
    IconBox,
} from '@/Components/Icons';
import { formatRupiah, formatDate } from '@/Utils/format';

export default function LaporanIndex({
    laporan,
    summary = {},
    kategori_list = [],
    filters = {},
}) {
    const [dariTanggal, setDariTanggal] = useState(filters.dari_tanggal || '');
    const [sampaiTanggal, setSampaiTanggal] = useState(filters.sampai_tanggal || '');
    const [idKategori, setIdKategori] = useState(filters.id_kategori || '');
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(
            route('admin.laporan.index'),
            {
                dari_tanggal: dariTanggal,
                sampai_tanggal: sampaiTanggal,
                id_kategori: idKategori,
                search,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setDariTanggal('');
        setSampaiTanggal('');
        setIdKategori('');
        setSearch('');
        router.get(route('admin.laporan.index'));
    };

    const handleExportCsv = () => {
        const params = new URLSearchParams({
            dari_tanggal: dariTanggal,
            sampai_tanggal: sampaiTanggal,
            id_kategori: idKategori,
            search,
        }).toString();
        window.location.href = `${route('admin.laporan.export')}?${params}`;
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout
            header={
                <div>
                    <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                        Laporan Rekap Penjualan
                    </h1>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        Data diambil langsung dari Database View (view_laporan_penjualan)
                    </p>
                </div>
            }
        >
            <Head title="Laporan Penjualan - NAUFAM MART" />

            {/* Print Header (Only visible when printing) */}
            <div className="hidden print:block mb-6 text-center border-b-2 pb-4">
                <h1 className="text-2xl font-black">LAPORAN PENJUALAN TOKO NAUFAM MART</h1>
                <p className="text-xs font-bold text-slate-700 mt-1">
                    Periode:{' '}
                    {dariTanggal ? formatDate(dariTanggal) : 'Awal'} s/d{' '}
                    {sampaiTanggal ? formatDate(sampaiTanggal) : 'Sekarang'}
                </p>
            </div>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6 print:hidden">
                <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-xs">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                        Total Omset Penjualan
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-blue-900 tracking-tight">
                        {formatRupiah(summary.total_pendapatan || 0)}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 mt-1">Berdasarkan filter tanggal yang dipilih</p>
                </div>

                <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-xs">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                        Total Item Terjual
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-emerald-950 tracking-tight">
                        {summary.total_item || 0} Unit
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 mt-1">Akumulasi kuantitas produk keluar</p>
                </div>

                <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-xs">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                        Jumlah Transaksi
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-indigo-950 tracking-tight">
                        {summary.total_transaksi || 0} Faktur
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 mt-1">Transaksi unik berhasil diproses</p>
                </div>
            </div>

            {/* Filter & Action Toolbar */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xs overflow-hidden mb-6 print:hidden">
                <form onSubmit={handleFilter} className="p-6 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari pelanggan, produk, atau kota..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                        />
                        <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>

                    <div className="flex items-center space-x-2">
                        <label className="text-xs font-black text-slate-800">Dari:</label>
                        <input
                            type="date"
                            value={dariTanggal}
                            onChange={(e) => setDariTanggal(e.target.value)}
                            className="py-2.5 px-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <label className="text-xs font-black text-slate-800">Sampai:</label>
                        <input
                            type="date"
                            value={sampaiTanggal}
                            onChange={(e) => setSampaiTanggal(e.target.value)}
                            className="py-2.5 px-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                        />
                    </div>

                    <select
                        value={idKategori}
                        onChange={(e) => setIdKategori(e.target.value)}
                        className="py-2.5 px-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                    >
                        <option value="">Semua Kategori</option>
                        {kategori_list.map((kat) => (
                            <option key={kat.id_kategori} value={kat.id_kategori}>
                                {kat.nama_kategori}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors"
                    >
                        Filter Data
                    </button>

                    {(dariTanggal || sampaiTanggal || idKategori || search) && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300"
                        >
                            Reset
                        </button>
                    )}

                    <div className="ml-auto flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={handleExportCsv}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-xl text-xs font-black transition-colors"
                        >
                            <IconDownload className="w-4 h-4 text-emerald-700" />
                            <span>Export CSV</span>
                        </button>

                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-300 rounded-xl text-xs font-black transition-colors"
                        >
                            <IconPrinter className="w-4 h-4 text-blue-700" />
                            <span>Cetak Laporan</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Report Table */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y-2 divide-slate-100 text-left text-sm">
                        <thead className="bg-slate-100 text-slate-900 text-xs uppercase font-black border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3.5">No Faktur</th>
                                <th className="px-6 py-3.5">Tanggal</th>
                                <th className="px-6 py-3.5">Pelanggan</th>
                                <th className="px-6 py-3.5">Kota</th>
                                <th className="px-6 py-3.5">Kategori</th>
                                <th className="px-6 py-3.5">Produk</th>
                                <th className="px-6 py-3.5 text-right">Harga</th>
                                <th className="px-6 py-3.5 text-center">Jumlah</th>
                                <th className="px-6 py-3.5 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {laporan.data.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-8 text-center text-slate-500 font-bold">
                                        Tidak ada catatan laporan penjualan untuk periode ini.
                                    </td>
                                </tr>
                            ) : (
                                laporan.data.map((item, idx) => (
                                    <tr key={`${item.id_transaksi}-${item.id_detail || idx}`} className="hover:bg-blue-50/40 transition-colors">
                                        <td className="px-6 py-3.5 font-black text-blue-900 text-xs">
                                            #TRX-{String(item.id_transaksi).padStart(5, '0')}
                                        </td>
                                        <td className="px-6 py-3.5 text-xs font-bold text-slate-700">
                                            {formatDate(item.tanggal)}
                                        </td>
                                        <td className="px-6 py-3.5 font-black text-slate-950 text-xs">
                                            {item.nama_pelanggan}
                                        </td>
                                        <td className="px-6 py-3.5 text-xs font-bold text-slate-700">
                                            {item.kota}
                                        </td>
                                        <td className="px-6 py-3.5 text-xs text-slate-800">
                                            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-950 font-black text-[11px] border border-blue-200">
                                                {item.nama_kategori}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-xs font-black text-slate-950">
                                            {item.nama_produk}
                                        </td>
                                        <td className="px-6 py-3.5 text-right text-xs font-bold text-slate-700">
                                            {formatRupiah(item.harga)}
                                        </td>
                                        <td className="px-6 py-3.5 text-center font-black text-slate-950 text-xs">
                                            {item.jumlah}x
                                        </td>
                                        <td className="px-6 py-3.5 text-right font-black text-slate-950 text-sm">
                                            {formatRupiah(item.subtotal)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {laporan.data.length > 0 && (
                            <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                                <tr>
                                    <td colSpan="7" className="px-6 py-3.5 text-right text-xs uppercase tracking-wider text-slate-900 font-black">
                                        Total Halaman Ini:
                                    </td>
                                    <td className="px-6 py-3.5 text-center text-xs text-slate-950 font-black">
                                        {laporan.data.reduce((acc, row) => acc + (row.jumlah || 0), 0)}x
                                    </td>
                                    <td className="px-6 py-3.5 text-right text-base text-blue-900 font-black">
                                        {formatRupiah(laporan.data.reduce((acc, row) => acc + (row.subtotal || 0), 0))}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                <div className="print:hidden">
                    <Pagination links={laporan.links} />
                </div>
            </div>
        </AppLayout>
    );
}
