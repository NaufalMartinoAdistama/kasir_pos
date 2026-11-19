import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Pagination from '@/Components/Pagination';
import {
    IconChart,
    IconPrinter,
    IconDownload,
    IconSearch,
    IconReceipt,
    IconBox,
    IconTag,
} from '@/Components/Icons';
import { formatRupiah, formatDate } from '@/Utils/format';

export default function LaporanIndex({
    laporan,
    summary = {},
    kategori_list = [],
    filters = {},
}) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.role === 'admin';
    const baseExportRoute = isAdmin ? 'admin.laporan' : 'kasir.laporan';

    // State Filter
    const [periode, setPeriode] = useState(filters.periode || 'bulanan');
    const [tanggal, setTanggal] = useState(filters.tanggal || new Date().toISOString().slice(0, 10));
    const [bulan, setBulan] = useState(filters.bulan || String(new Date().getMonth() + 1));
    const [tahun, setTahun] = useState(filters.tahun || String(new Date().getFullYear()));
    const [dariTanggal, setDariTanggal] = useState(filters.dari_tanggal || '');
    const [sampaiTanggal, setSampaiTanggal] = useState(filters.sampai_tanggal || '');
    const [idKategori, setIdKategori] = useState(filters.id_kategori || '');
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(
            route(isAdmin ? 'admin.laporan.index' : 'kasir.laporan.index'),
            {
                periode,
                tanggal,
                bulan,
                tahun,
                dari_tanggal: dariTanggal,
                sampai_tanggal: sampaiTanggal,
                id_kategori: idKategori,
                search,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setPeriode('bulanan');
        setTanggal(new Date().toISOString().slice(0, 10));
        setBulan(String(new Date().getMonth() + 1));
        setTahun(String(new Date().getFullYear()));
        setDariTanggal('');
        setSampaiTanggal('');
        setIdKategori('');
        setSearch('');
        router.get(route(isAdmin ? 'admin.laporan.index' : 'kasir.laporan.index'));
    };

    // Build URL Query Params for Direct Downloads
    const getDownloadQuery = () => {
        return new URLSearchParams({
            periode,
            tanggal,
            bulan,
            tahun,
            dari_tanggal: dariTanggal,
            sampai_tanggal: sampaiTanggal,
            id_kategori: idKategori,
            search,
        }).toString();
    };

    const excelDownloadUrl = `${route(baseExportRoute + '.export.excel')}?${getDownloadQuery()}`;
    const pdfDownloadUrl = `${route(baseExportRoute + '.export.pdf')}?${getDownloadQuery()}`;

    const handlePrint = () => {
        window.print();
    };

    const bulanOptions = [
        { val: '1', label: 'Januari' },
        { val: '2', label: 'Februari' },
        { val: '3', label: 'Maret' },
        { val: '4', label: 'April' },
        { val: '5', label: 'Mei' },
        { val: '6', label: 'Juni' },
        { val: '7', label: 'Juli' },
        { val: '8', label: 'Agustus' },
        { val: '9', label: 'September' },
        { val: '10', label: 'Oktober' },
        { val: '11', label: 'November' },
        { val: '12', label: 'Desember' },
    ];

    const tahunOptions = ['2024', '2025', '2026', '2027'];

    return (
        <AppLayout
            header={
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                        Laporan Rekap Penjualan
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        Filter periode harian, mingguan, bulanan, tahunan & export langsung ke Excel dan PDF
                    </p>
                </div>
            }
        >
            <Head title="Laporan Penjualan - MARTIN MART" />

            {/* Print Header (Hanya tampil saat print browser) */}
            <div className="hidden print:block mb-6 text-center border-b-2 pb-4">
                <h1 className="text-2xl font-black">LAPORAN PENJUALAN MARTIN MART</h1>
                <p className="text-xs font-bold text-slate-700 mt-1">
                    Periode: {filters.periode_info || 'Semua Periode'}
                </p>
            </div>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6 print:hidden">
                <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-wider">
                            Total Omset Penjualan
                        </p>
                        <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                            <IconChart className="w-5 h-5" />
                        </span>
                    </div>
                    <h3 className="mt-2 text-2xl font-black text-blue-900 tracking-tight">
                        {formatRupiah(summary.total_pendapatan || 0)}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">
                        {filters.periode_info || 'Berdasarkan filter periode aktif'}
                    </p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-wider">
                            Total Item Terjual
                        </p>
                        <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                            <IconBox className="w-5 h-5" />
                        </span>
                    </div>
                    <h3 className="mt-2 text-2xl font-black text-emerald-950 tracking-tight">
                        {summary.total_item || 0} Unit
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">
                        Akumulasi kuantitas produk keluar
                    </p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-wider">
                            Jumlah Faktur Unik
                        </p>
                        <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                            <IconReceipt className="w-5 h-5" />
                        </span>
                    </div>
                    <h3 className="mt-2 text-2xl font-black text-indigo-950 tracking-tight">
                        {summary.total_transaksi || 0} Faktur
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">
                        Transaksi selesai diproses
                    </p>
                </div>
            </div>

            {/* Filter Periode & Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden mb-6 print:hidden">
                {/* 1. Tab Pilihan Periode Laporan */}
                <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                        <span className="text-xs font-black text-slate-700 mr-2 shrink-0">
                            Pilih Periode:
                        </span>
                        {[
                            { key: 'harian', label: '📅 Harian' },
                            { key: 'mingguan', label: '📊 Mingguan (7 Hari)' },
                            { key: 'bulanan', label: '🗓️ Bulanan' },
                            { key: 'tahunan', label: '📈 Tahunan' },
                            { key: 'custom', label: '⚙️ Rentang Kustom' },
                        ].map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => setPeriode(item.key)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                                    periode === item.key
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Badge Info Periode Terpilih */}
                    <div className="text-[11px] font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                        📌 {filters.periode_info || 'Periode Terpilih'}
                    </div>
                </div>

                {/* 2. Filter Form Controls & Export Buttons */}
                <form onSubmit={handleFilter} className="p-5 flex flex-wrap items-center gap-3">
                    {/* Kondisional Input Berdasarkan Tab Periode */}
                    {periode === 'harian' && (
                        <div className="flex items-center space-x-2">
                            <label className="text-xs font-black text-slate-700">Tanggal:</label>
                            <input
                                type="date"
                                value={tanggal}
                                onChange={(e) => setTanggal(e.target.value)}
                                className="py-2 px-3 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 focus:border-blue-600 shadow-2xs"
                            />
                        </div>
                    )}

                    {periode === 'mingguan' && (
                        <div className="flex items-center space-x-2">
                            <label className="text-xs font-black text-slate-700">Sampai Tanggal:</label>
                            <input
                                type="date"
                                value={tanggal}
                                onChange={(e) => setTanggal(e.target.value)}
                                className="py-2 px-3 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 focus:border-blue-600 shadow-2xs"
                            />
                        </div>
                    )}

                    {periode === 'bulanan' && (
                        <div className="flex items-center space-x-2">
                            <label className="text-xs font-black text-slate-700">Bulan & Tahun:</label>
                            <select
                                value={bulan}
                                onChange={(e) => setBulan(e.target.value)}
                                className="py-2 px-3 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 focus:border-blue-600 shadow-2xs"
                            >
                                {bulanOptions.map((b) => (
                                    <option key={b.val} value={b.val}>
                                        {b.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={tahun}
                                onChange={(e) => setTahun(e.target.value)}
                                className="py-2 px-3 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 focus:border-blue-600 shadow-2xs"
                            >
                                {tahunOptions.map((th) => (
                                    <option key={th} value={th}>
                                        {th}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {periode === 'tahunan' && (
                        <div className="flex items-center space-x-2">
                            <label className="text-xs font-black text-slate-700">Tahun:</label>
                            <select
                                value={tahun}
                                onChange={(e) => setTahun(e.target.value)}
                                className="py-2 px-3 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 focus:border-blue-600 shadow-2xs"
                            >
                                {tahunOptions.map((th) => (
                                    <option key={th} value={th}>
                                        {th}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {periode === 'custom' && (
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center space-x-1.5">
                                <label className="text-xs font-black text-slate-700">Dari:</label>
                                <input
                                    type="date"
                                    value={dariTanggal}
                                    onChange={(e) => setDariTanggal(e.target.value)}
                                    className="py-2 px-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 focus:border-blue-600 shadow-2xs"
                                />
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <label className="text-xs font-black text-slate-700">Sampai:</label>
                                <input
                                    type="date"
                                    value={sampaiTanggal}
                                    onChange={(e) => setSampaiTanggal(e.target.value)}
                                    className="py-2 px-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 focus:border-blue-600 shadow-2xs"
                                />
                            </div>
                        </div>
                    )}

                    {/* Kategori Filter */}
                    <select
                        value={idKategori}
                        onChange={(e) => setIdKategori(e.target.value)}
                        className="py-2 px-3 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 focus:border-blue-600 shadow-2xs"
                    >
                        <option value="">Semua Kategori</option>
                        {kategori_list.map((kat) => (
                            <option key={kat.id_kategori} value={kat.id_kategori}>
                                {kat.nama_kategori}
                            </option>
                        ))}
                    </select>

                    {/* Search Field */}
                    <div className="relative flex-1 min-w-[170px]">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari pelanggan / produk..."
                            className="w-full pl-8 pr-3 py-2 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 shadow-2xs"
                        />
                        <IconSearch className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition-all active:scale-95"
                    >
                        Filter Data
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition"
                    >
                        Reset
                    </button>

                    {/* Direct Download Action Buttons (Excel & PDF) */}
                    <div className="ml-auto flex items-center space-x-2 pt-2 sm:pt-0 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-100">
                        {/* Direct Download Excel */}
                        <a
                            href={excelDownloadUrl}
                            target="_self"
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition-all active:scale-95 hover:shadow-md"
                            title="Unduh Laporan Format Excel (.xlsx)"
                        >
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Export Excel (.xlsx)</span>
                        </a>

                        {/* Direct Download PDF */}
                        <a
                            href={pdfDownloadUrl}
                            target="_self"
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-xs transition-all active:scale-95 hover:shadow-md"
                            title="Unduh Laporan Format Dokumen PDF (.pdf)"
                        >
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span>Export PDF (.pdf)</span>
                        </a>

                        {/* Print Button */}
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-black transition"
                        >
                            <IconPrinter className="w-3.5 h-3.5 text-slate-600" />
                            <span>Cetak</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Report Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                        <thead className="bg-[#F8FAFC] text-slate-800 font-black uppercase text-[10px] border-b border-slate-200">
                            <tr>
                                <th className="px-5 py-3.5">No Faktur</th>
                                <th className="px-5 py-3.5">Tanggal</th>
                                <th className="px-5 py-3.5">Pelanggan</th>
                                <th className="px-5 py-3.5">Kota</th>
                                <th className="px-5 py-3.5">Kategori</th>
                                <th className="px-5 py-3.5">Produk</th>
                                <th className="px-5 py-3.5 text-right">Harga</th>
                                <th className="px-5 py-3.5 text-center">Jumlah</th>
                                <th className="px-5 py-3.5 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {laporan.data.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-10 text-center text-slate-400 font-bold">
                                        Tidak ada catatan transaksi penjualan untuk filter periode ini.
                                    </td>
                                </tr>
                            ) : (
                                laporan.data.map((item, idx) => (
                                    <tr key={`${item.id_transaksi}-${item.id_detail || idx}`} className="hover:bg-blue-50/40 transition-colors">
                                        <td className="px-5 py-3 font-mono font-black text-blue-900">
                                            #TRX-{String(item.id_transaksi).padStart(5, '0')}
                                        </td>
                                        <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                                            {formatDate(item.tanggal)}
                                        </td>
                                        <td className="px-5 py-3 font-bold text-slate-900">
                                            {item.nama_pelanggan || 'Pelanggan Umum'}
                                        </td>
                                        <td className="px-5 py-3 text-slate-500">
                                            {item.kota || '-'}
                                        </td>
                                        <td className="px-5 py-3 text-slate-700">
                                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 font-black text-[10px] border border-blue-200">
                                                {item.nama_kategori}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 font-bold text-slate-900">
                                            {item.nama_produk}
                                        </td>
                                        <td className="px-5 py-3 text-right text-slate-700">
                                            {formatRupiah(item.harga)}
                                        </td>
                                        <td className="px-5 py-3 text-center font-black text-slate-900">
                                            {item.jumlah}x
                                        </td>
                                        <td className="px-5 py-3 text-right font-black text-slate-950">
                                            {formatRupiah(item.subtotal)}
                                        </td>
                                    </tr>
                                ))
                            )}

                            {/* Summary Footer Row */}
                            {laporan.data.length > 0 && (
                                <tr className="bg-blue-50/80 font-black text-blue-950 border-t-2 border-blue-200">
                                    <td colSpan="7" className="px-5 py-3 text-right uppercase text-xs tracking-wider">
                                        TOTAL KESELURUHAN PERIODE INI:
                                    </td>
                                    <td className="px-5 py-3 text-center text-xs">
                                        {summary.total_item || 0} Unit
                                    </td>
                                    <td className="px-5 py-3 text-right text-sm text-blue-900 font-black">
                                        {formatRupiah(summary.total_pendapatan || 0)}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                        Menampilkan {laporan.data.length} dari total transaksi terfilter
                    </span>
                    <Pagination links={laporan.links} />
                </div>
            </div>
        </AppLayout>
    );
}
