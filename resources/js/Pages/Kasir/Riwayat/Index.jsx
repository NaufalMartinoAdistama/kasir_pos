import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Pagination from '@/Components/Pagination';
import ModalDialog from '@/Components/ModalDialog';
import {
    IconSearch,
    IconReceipt,
    IconPrinter,
    IconTruck,
    IconPhone,
    IconMapPin,
    IconCheckCircle,
    IconCreditCard,
    IconCamera,
    IconExternalLink,
} from '@/Components/Icons';
import { formatRupiah, formatDate, getPaymentBadgeProps } from '@/Utils/format';

export default function KasirRiwayatIndex({ transaksi, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [dariTanggal, setDariTanggal] = useState(filters.dari_tanggal || '');
    const [sampaiTanggal, setSampaiTanggal] = useState(filters.sampai_tanggal || '');
    const [sumberTransaksi, setSumberTransaksi] = useState(filters.sumber_transaksi || 'Semua');
    const [statusPesanan, setStatusPesanan] = useState(filters.status_pesanan || 'Semua');

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedTrx, setSelectedTrx] = useState(null);
    const [selectedBukti, setSelectedBukti] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(
            route('kasir.riwayat'),
            {
                search,
                dari_tanggal: dariTanggal,
                sampai_tanggal: sampaiTanggal,
                sumber_transaksi: sumberTransaksi,
                status_pesanan: statusPesanan,
            },
            { preserveState: true }
        );
    };

    const handleTabChange = (sumber) => {
        setSumberTransaksi(sumber);
        router.get(
            route('kasir.riwayat'),
            {
                search,
                dari_tanggal: dariTanggal,
                sampai_tanggal: sampaiTanggal,
                sumber_transaksi: sumber,
                status_pesanan: statusPesanan,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setDariTanggal('');
        setSampaiTanggal('');
        setSumberTransaksi('Semua');
        setStatusPesanan('Semua');
        router.get(route('kasir.riwayat'));
    };

    const showDetail = (trx) => {
        setSelectedTrx(trx);
        setDetailModalOpen(true);
    };

    const updateStatus = (newStatus) => {
        if (!selectedTrx) return;
        setUpdatingStatus(true);
        router.patch(
            route('kasir.riwayat.update-status', selectedTrx.id_transaksi),
            { status_pesanan: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedTrx((prev) => ({ ...prev, status_pesanan: newStatus }));
                    setUpdatingStatus(false);
                },
                onError: () => setUpdatingStatus(false),
            }
        );
    };

    const cleanPhoneNumber = (phone) => {
        if (!phone) return '';
        let cleaned = phone.replace(/[^0-9]/g, '');
        if (cleaned.startsWith('0')) {
            cleaned = '62' + cleaned.substring(1);
        }
        return cleaned;
    };

    return (
        <AppLayout
            header={
                <div>
                    <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                        Riwayat Transaksi & Antar Pesanan Kasir
                    </h1>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        Kelola faktur penjualan POS dan proses pengantaran pesanan belanja online pelanggan.
                    </p>
                </div>
            }
        >
            <Head title="Riwayat Penjualan & Antar Pesanan - MARTIN MART" />

            {/* Top Navigation Tabs: Semua vs POS Kasir vs Pesanan Online */}
            <div className="flex items-center space-x-2 mb-4 bg-white p-1.5 rounded-2xl border-2 border-slate-200 shadow-2xs w-fit">
                <button
                    type="button"
                    onClick={() => handleTabChange('Semua')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        sumberTransaksi === 'Semua'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-950'
                    }`}
                >
                    Semua Transaksi
                </button>
                <button
                    type="button"
                    onClick={() => handleTabChange('POS Kasir')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        sumberTransaksi === 'POS Kasir'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-950'
                    }`}
                >
                    🏪 Transaksi POS Kasir
                </button>
                <button
                    type="button"
                    onClick={() => handleTabChange('Online Pelanggan')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                        sumberTransaksi === 'Online Pelanggan'
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-950'
                    }`}
                >
                    <IconTruck className="w-4 h-4" />
                    <span>🚚 Pesanan Online Pelanggan</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xs overflow-hidden">
                {/* Filter Toolbar */}
                <form onSubmit={handleFilter} className="p-5 border-b-2 border-slate-100 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari pelanggan / no HP / alamat / ID transaksi..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-950 placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                        />
                        <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                    </div>

                    {/* Filter Status Pesanan */}
                    <select
                        value={statusPesanan}
                        onChange={(e) => setStatusPesanan(e.target.value)}
                        className="py-2 px-3 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                    >
                        <option value="Semua">Semua Status</option>
                        <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Dikirim">Dikirim</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Dibatalkan">Dibatalkan</option>
                    </select>

                    <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                        <input
                            type="date"
                            value={dariTanggal}
                            onChange={(e) => setDariTanggal(e.target.value)}
                            className="py-2 px-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-950 focus:border-blue-600 shadow-2xs"
                        />
                        <span>s/d</span>
                        <input
                            type="date"
                            value={sampaiTanggal}
                            onChange={(e) => setSampaiTanggal(e.target.value)}
                            className="py-2 px-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-950 focus:border-blue-600 shadow-2xs"
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors"
                    >
                        Filter
                    </button>
                    {(search || dariTanggal || sampaiTanggal || sumberTransaksi !== 'Semua' || statusPesanan !== 'Semua') && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300"
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
                                <th className="px-5 py-3.5">Faktur</th>
                                <th className="px-5 py-3.5">Waktu</th>
                                <th className="px-5 py-3.5">Sumber & Status</th>
                                <th className="px-5 py-3.5">Pelanggan / Penerima</th>
                                <th className="px-5 py-3.5">Item Belanja</th>
                                <th className="px-5 py-3.5 text-right">Total Transaksi</th>
                                <th className="px-5 py-3.5 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {transaksi.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500 font-bold">
                                        Tidak ada transaksi yang cocok dengan kriteria pencarian.
                                    </td>
                                </tr>
                            ) : (
                                transaksi.data.map((item) => {
                                    const isOnline = item.sumber_transaksi === 'Online Pelanggan';

                                    return (
                                        <tr key={item.id_transaksi} className="hover:bg-blue-50/40 transition-colors">
                                            <td className="px-5 py-3.5 font-black text-blue-900 text-xs font-mono">
                                                #TRX-{String(item.id_transaksi).padStart(5, '0')}
                                            </td>
                                            <td className="px-5 py-3.5 text-xs font-bold text-slate-700 whitespace-nowrap">
                                                {formatDate(item.tanggal)}
                                            </td>
                                            <td className="px-5 py-3.5 text-xs">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                                            isOnline
                                                                ? 'bg-cyan-100 text-cyan-900 border border-cyan-300'
                                                                : 'bg-slate-100 text-slate-800 border border-slate-300'
                                                        }`}
                                                    >
                                                        {item.sumber_transaksi || 'POS Kasir'}
                                                    </span>

                                                    {isOnline && (
                                                        <span
                                                            className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                                                item.status_pesanan === 'Selesai'
                                                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                                                    : item.status_pesanan === 'Dikirim'
                                                                    ? 'bg-blue-100 text-blue-900 border-blue-300'
                                                                    : item.status_pesanan === 'Diproses'
                                                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                                                    : item.status_pesanan === 'Menunggu Pembayaran'
                                                                    ? 'bg-orange-100 text-orange-900 border-orange-300'
                                                                    : 'bg-rose-100 text-rose-900 border-rose-300'
                                                            }`}
                                                        >
                                                            ● {item.status_pesanan || 'Diproses'}
                                                        </span>
                                                    )}

                                                    {(() => {
                                                        const badge = getPaymentBadgeProps(item.metode_pembayaran);
                                                        return (
                                                            <span
                                                                className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${badge.className}`}
                                                            >
                                                                {badge.icon} {badge.label}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="text-xs">
                                                    <span className="font-black text-slate-950 block">
                                                        {item.pelanggan?.nama_pelanggan || 'Pelanggan Umum'}
                                                    </span>
                                                    {(item.no_hp_penerima || item.pelanggan?.no_hp) && (
                                                        <span className="text-[11px] font-bold text-blue-700 block">
                                                            📞 {item.no_hp_penerima || item.pelanggan?.no_hp}
                                                        </span>
                                                    )}
                                                    {item.alamat_pengiriman && (
                                                        <span className="text-[11px] text-slate-500 block truncate max-w-xs mt-0.5">
                                                            📍 {item.alamat_pengiriman}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs font-medium text-slate-700 max-w-xs truncate">
                                                {item.details?.map((d) => `${d.produk?.nama_produk || d.nama_produk || 'Produk'} (${d.jumlah}x)`).join(', ') || '-'}
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-black text-slate-950 text-sm whitespace-nowrap">
                                                {formatRupiah(item.total_belanja)}
                                            </td>
                                            <td className="px-5 py-3.5 text-center whitespace-nowrap space-x-1.5">
                                                <button
                                                    onClick={() => showDetail(item)}
                                                    className="px-3 py-1.5 text-xs font-black text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-300 shadow-2xs"
                                                >
                                                    {isOnline ? '🚚 Antar & Detail' : 'Rincian'}
                                                </button>
                                                <Link
                                                    href={route('transaksi.struk', item.id_transaksi)}
                                                    target="_blank"
                                                    className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-black text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-300 shadow-2xs"
                                                >
                                                    <IconPrinter className="w-3.5 h-3.5 text-blue-700" />
                                                    <span>Struk</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={transaksi.links} />
            </div>

            {/* Transaction Detail & Delivery Modal */}
            <ModalDialog
                show={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title={`Faktur #TRX-${String(selectedTrx?.id_transaksi || 0).padStart(5, '0')} (${selectedTrx?.sumber_transaksi || 'POS Kasir'})`}
                maxWidth="max-w-2xl"
            >
                {selectedTrx && (
                    <div className="space-y-4">
                        {/* Status Pesanan & Kontrol Update untuk Online Pelanggan */}
                        {selectedTrx.sumber_transaksi === 'Online Pelanggan' && (
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-blue-950 uppercase tracking-wider">
                                        📦 Status Pengiriman Pesanan Saat Ini:
                                    </span>
                                    <span className="px-3 py-0.5 rounded-full text-xs font-black bg-blue-600 text-white shadow-2xs">
                                        {selectedTrx.status_pesanan || 'Diproses'}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-blue-200">
                                    <span className="text-xs font-bold text-slate-700">Ubah Status:</span>
                                    <button
                                        type="button"
                                        disabled={updatingStatus || selectedTrx.status_pesanan === 'Diproses'}
                                        onClick={() => updateStatus('Diproses')}
                                        className="px-2.5 py-1 text-xs font-black rounded-lg bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors disabled:opacity-40"
                                    >
                                        Diproses
                                    </button>
                                    <button
                                        type="button"
                                        disabled={updatingStatus || selectedTrx.status_pesanan === 'Dikirim'}
                                        onClick={() => updateStatus('Dikirim')}
                                        className="px-2.5 py-1 text-xs font-black rounded-lg bg-blue-100 text-blue-900 border border-blue-300 hover:bg-blue-200 transition-colors disabled:opacity-40"
                                    >
                                        🚚 Sedang Dikirim
                                    </button>
                                    <button
                                        type="button"
                                        disabled={updatingStatus || selectedTrx.status_pesanan === 'Selesai'}
                                        onClick={() => updateStatus('Selesai')}
                                        className="px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200 transition-colors disabled:opacity-40"
                                    >
                                        ✅ Selesai Diterima
                                    </button>
                                    <button
                                        type="button"
                                        disabled={updatingStatus || selectedTrx.status_pesanan === 'Dibatalkan'}
                                        onClick={() => updateStatus('Dibatalkan')}
                                        className="px-2.5 py-1 text-xs font-black rounded-lg bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200 transition-colors disabled:opacity-40"
                                    >
                                        Batalkan
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Customer & Delivery Information with WhatsApp and Google Maps Button */}
                        {selectedTrx.sumber_transaksi === 'Online Pelanggan' && (
                            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 text-xs space-y-2.5">
                                <h4 className="font-black text-slate-900 flex items-center space-x-1.5">
                                    <IconTruck className="w-4 h-4 text-blue-600" />
                                    <span>Informasi Alamat & Antar Kurir</span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-800">
                                    <div>
                                        <p className="text-slate-500 font-semibold">Penerima:</p>
                                        <p className="font-black text-slate-950 text-sm">
                                            {selectedTrx.pelanggan?.nama_pelanggan || 'Pelanggan Umum'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-slate-500 font-semibold">WhatsApp / No. HP:</p>
                                        <div className="flex items-center space-x-2 mt-0.5">
                                            <span className="font-black text-slate-950 font-mono">
                                                {selectedTrx.no_hp_penerima || selectedTrx.pelanggan?.no_hp || '-'}
                                            </span>
                                            {(selectedTrx.no_hp_penerima || selectedTrx.pelanggan?.no_hp) && (
                                                <a
                                                    href={`https://wa.me/${cleanPhoneNumber(selectedTrx.no_hp_penerima || selectedTrx.pelanggan?.no_hp)}?text=${encodeURIComponent(
                                                        `Halo ${selectedTrx.pelanggan?.nama_pelanggan || 'Kak'}, pesanan online Anda #TRX-${String(selectedTrx.id_transaksi).padStart(5, '0')} dari MARTIN MART sedang disiapkan/diantar ke lokasi Anda.`
                                                    )}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10.5px] font-black shadow-2xs transition-colors"
                                                >
                                                    <IconPhone className="w-3 h-3" />
                                                    <span>Chat WhatsApp ↗</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-200">
                                    <p className="text-slate-500 font-semibold">Alamat Lengkap Pengiriman:</p>
                                    <p className="font-bold text-slate-900 mt-0.5 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200">
                                        {selectedTrx.alamat_pengiriman || 'Alamat tidak diinput'}
                                    </p>
                                </div>

                                {/* Google Maps GPS Navigation Button */}
                                {selectedTrx.latitude && selectedTrx.longitude && (
                                    <div className="pt-2 flex items-center justify-between bg-blue-50/70 p-2.5 rounded-xl border border-blue-200">
                                        <div className="flex items-center space-x-1.5 text-blue-950">
                                            <IconMapPin className="w-4 h-4 text-blue-700" />
                                            <span className="font-bold">
                                                Koordinat: {selectedTrx.latitude}, {selectedTrx.longitude}
                                            </span>
                                        </div>
                                        <a
                                            href={`https://www.google.com/maps?q=${selectedTrx.latitude},${selectedTrx.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black shadow-2xs transition-colors"
                                        >
                                            <IconExternalLink className="w-3.5 h-3.5" />
                                            <span>Buka di Google Maps ↗</span>
                                        </a>
                                    </div>
                                )}

                                {/* Bukti Pembayaran */}
                                {selectedTrx.bukti_pembayaran_url && (
                                    <div className="pt-2 border-t border-slate-200">
                                        <p className="text-slate-500 font-semibold mb-1">Bukti Pembayaran Non-Tunai:</p>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedBukti(selectedTrx.bukti_pembayaran_url)}
                                                className="w-20 h-14 rounded-lg overflow-hidden border-2 border-emerald-400 shadow-2xs hover:opacity-80 transition-opacity"
                                            >
                                                <img
                                                    src={selectedTrx.bukti_pembayaran_url}
                                                    alt="Bukti Transfer"
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedBukti(selectedTrx.bukti_pembayaran_url)}
                                                className="text-xs font-black text-blue-600 hover:underline"
                                            >
                                                Lihat Gambar Bukti Transfer Ukuran Penuh 🔍
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* General Transaction Details */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 text-xs border border-slate-100">
                            <div>
                                <p className="text-slate-400 font-bold">Waktu:</p>
                                <p className="font-black text-slate-800">{formatDate(selectedTrx.tanggal)}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 font-bold">Metode Bayar:</p>
                                {(() => {
                                    const badge = getPaymentBadgeProps(selectedTrx.metode_pembayaran);
                                    return (
                                        <span
                                            className={`inline-block px-2.5 py-0.5 mt-0.5 rounded-md text-xs font-black uppercase tracking-wider border ${badge.className}`}
                                        >
                                            {badge.icon} {badge.label}
                                        </span>
                                    );
                                })()}
                            </div>
                            <div>
                                <p className="text-slate-400 font-bold">Diskon:</p>
                                <p className="font-black text-slate-800">{selectedTrx.diskon ? `${selectedTrx.diskon}%` : '0%'}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 font-bold">Total Pembayaran:</p>
                                <p className="font-black text-blue-700 text-sm">{formatRupiah(selectedTrx.total_belanja)}</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div>
                            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2">
                                Daftar Produk yang Dibeli
                            </h4>
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <table className="min-w-full divide-y divide-slate-100 text-xs">
                                    <thead className="bg-slate-50 text-slate-700 font-bold">
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
                                                <td className="px-4 py-2 font-bold text-slate-900">
                                                    {detail.produk?.nama_produk || detail.nama_produk || 'Produk'}
                                                </td>
                                                <td className="px-4 py-2 text-right text-slate-600">
                                                    {formatRupiah(detail.produk?.harga || detail.harga || 0)}
                                                </td>
                                                <td className="px-4 py-2 text-center font-black text-slate-950">
                                                    {detail.jumlah}x
                                                </td>
                                                <td className="px-4 py-2 text-right font-black text-slate-950">
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
                                target="_blank"
                                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-black text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200"
                            >
                                <IconPrinter className="w-4 h-4" />
                                <span>Cetak Lembar Struk</span>
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

            {/* Modal Foto Bukti Pembayaran Full View */}
            <ModalDialog
                show={!!selectedBukti}
                onClose={() => setSelectedBukti(null)}
                title="Foto Bukti Pembayaran Non-Tunai"
            >
                {selectedBukti && (
                    <div className="p-2 text-center">
                        <img
                            src={selectedBukti}
                            alt="Bukti Transfer"
                            className="max-h-[70vh] mx-auto rounded-xl border border-slate-200 shadow-md object-contain"
                        />
                    </div>
                )}
            </ModalDialog>
        </AppLayout>
    );
}
