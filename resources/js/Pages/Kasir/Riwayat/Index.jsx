import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Pagination from '@/Components/Pagination';
import ModalDialog from '@/Components/ModalDialog';
import { IconSearch, IconPrinter } from '@/Components/Icons';
import { formatRupiah, formatDate } from '@/Utils/format';

export default function KasirRiwayatIndex({ transaksi, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [dariTanggal, setDariTanggal] = useState(filters.dari_tanggal || '');
    const [sampaiTanggal, setSampaiTanggal] = useState(filters.sampai_tanggal || '');
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedTrx, setSelectedTrx] = useState(null);

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(
            route('kasir.riwayat'),
            {
                search,
                dari_tanggal: dariTanggal,
                sampai_tanggal: sampaiTanggal,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setDariTanggal('');
        setSampaiTanggal('');
        router.get(route('kasir.riwayat'));
    };

    const showDetail = (trx) => {
        setSelectedTrx(trx);
        setDetailModalOpen(true);
    };

    return (
        <AppLayout
            header={
                <div>
                    <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                        Riwayat Transaksi Penjualan Kasir
                    </h1>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        Daftar faktur transaksi penjualan dan cetak ulang struk belanja
                    </p>
                </div>
            }
        >
            <Head title="Riwayat Kasir - NAUFAM MART" />

            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xs overflow-hidden">
                {/* Filter Toolbar */}
                <form onSubmit={handleFilter} className="p-6 border-b-2 border-slate-100 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari pelanggan / no faktur..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                        />
                        <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="date"
                            value={dariTanggal}
                            onChange={(e) => setDariTanggal(e.target.value)}
                            className="py-2.5 px-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                        />
                        <span className="text-xs font-black text-slate-500">s/d</span>
                        <input
                            type="date"
                            value={sampaiTanggal}
                            onChange={(e) => setSampaiTanggal(e.target.value)}
                            className="py-2.5 px-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors"
                    >
                        Filter
                    </button>
                    {(search || dariTanggal || sampaiTanggal) && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300"
                        >
                            Reset
                        </button>
                    )}
                </form>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y-2 divide-slate-100 text-left text-sm">
                        <thead className="bg-slate-100 text-slate-900 text-xs uppercase font-black border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3.5">No Faktur</th>
                                <th className="px-6 py-3.5">Tanggal</th>
                                <th className="px-6 py-3.5">Pelanggan</th>
                                <th className="px-6 py-3.5">Barang</th>
                                <th className="px-6 py-3.5 text-right">Total Belanja</th>
                                <th className="px-6 py-3.5 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {transaksi.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500 font-bold">
                                        Tidak ada transaksi yang cocok dengan kriteria pencarian.
                                    </td>
                                </tr>
                            ) : (
                                transaksi.data.map((item) => (
                                    <tr key={item.id_transaksi} className="hover:bg-blue-50/40 transition-colors">
                                        <td className="px-6 py-4 font-black text-blue-900">
                                            #TRX-{String(item.id_transaksi).padStart(5, '0')}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-700">
                                            {formatDate(item.tanggal)}
                                        </td>
                                        <td className="px-6 py-4 font-black text-slate-950">
                                            {item.pelanggan?.nama_pelanggan || 'Pelanggan Umum'}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-700 max-w-xs truncate">
                                            {item.details?.map((d) => `${d.produk?.nama_produk || 'Produk'} (${d.jumlah}x)`).join(', ') || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-slate-950 text-sm">
                                            {formatRupiah(item.total_belanja)}
                                        </td>
                                        <td className="px-6 py-4 text-center space-x-2">
                                            <button
                                                onClick={() => showDetail(item)}
                                                className="px-3 py-1 text-xs font-black text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-300"
                                            >
                                                Rincian
                                            </button>
                                            <Link
                                                href={route('transaksi.struk', item.id_transaksi)}
                                                target="_blank"
                                                className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-black text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
                                            >
                                                <IconPrinter className="w-3.5 h-3.5 text-blue-700" />
                                                <span>Struk</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={transaksi.links} />
            </div>

            {/* Transaction Detail Modal */}
            <ModalDialog
                show={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title={`Faktur #TRX-${String(selectedTrx?.id_transaksi || 0).padStart(5, '0')}`}
                maxWidth="max-w-xl"
            >
                {selectedTrx && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 text-xs border border-slate-100">
                            <div>
                                <p className="text-slate-400">Tanggal:</p>
                                <p className="font-bold text-slate-800">{formatDate(selectedTrx.tanggal)}</p>
                            </div>
                            <div>
                                <p className="text-slate-400">Pelanggan:</p>
                                <p className="font-bold text-slate-800">{selectedTrx.pelanggan?.nama_pelanggan || 'Umum'}</p>
                            </div>
                            <div>
                                <p className="text-slate-400">Metode Bayar:</p>
                                <p className="font-bold text-slate-800 uppercase">{selectedTrx.metode_pembayaran || 'Tunai'}</p>
                            </div>
                            <div>
                                <p className="text-slate-400">Total Bayar:</p>
                                <p className="font-extrabold text-blue-700 text-sm">{formatRupiah(selectedTrx.total_belanja)}</p>
                            </div>
                            <div>
                                <p className="text-slate-400">Uang Diterima:</p>
                                <p className="font-semibold text-slate-800">{formatRupiah(selectedTrx.bayar || selectedTrx.total_belanja)}</p>
                            </div>
                            <div>
                                <p className="text-slate-400">Kembalian:</p>
                                <p className="font-bold text-emerald-700">{formatRupiah(selectedTrx.kembalian || 0)}</p>
                            </div>
                            <div>
                                <p className="text-slate-400">Diskon:</p>
                                <p className="font-semibold text-slate-800">{selectedTrx.diskon ? `${selectedTrx.diskon}%` : '0%'}</p>
                            </div>
                            <div>
                                <p className="text-slate-400">Kota Pelanggan:</p>
                                <p className="font-bold text-slate-800">{selectedTrx.pelanggan?.kota || '-'}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                                Produk yang Dibeli
                            </h4>
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <table className="min-w-full divide-y divide-slate-100 text-xs">
                                    <thead className="bg-slate-50 text-slate-600 font-semibold">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Produk</th>
                                            <th className="px-4 py-2 text-right">Harga</th>
                                            <th className="px-4 py-2 text-center">Jumlah</th>
                                            <th className="px-4 py-2 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedTrx.details?.map((detail) => (
                                            <tr key={detail.id_detail}>
                                                <td className="px-4 py-2.5 font-medium text-slate-800">
                                                    {detail.produk?.nama_produk || 'Produk'}
                                                </td>
                                                <td className="px-4 py-2.5 text-right text-slate-600">
                                                    {formatRupiah(detail.produk?.harga || 0)}
                                                </td>
                                                <td className="px-4 py-2.5 text-center font-bold text-slate-700">
                                                    {detail.jumlah}x
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-extrabold text-slate-900">
                                                    {formatRupiah(detail.subtotal)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <Link
                                href={route('transaksi.struk', selectedTrx.id_transaksi)}
                                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                            >
                                <IconPrinter className="w-4 h-4" />
                                <span>Cetak Ulang Struk</span>
                            </Link>

                            <button
                                onClick={() => setDetailModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </ModalDialog>
        </AppLayout>
    );
}
