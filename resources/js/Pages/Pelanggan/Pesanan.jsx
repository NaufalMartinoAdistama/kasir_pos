import React, { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PelangganLayout from '@/Layouts/PelangganLayout';
import ModalDialog from '@/Components/ModalDialog';
import DuitkuPopModal from '@/Components/DuitkuPopModal';
import {
    IconReceipt,
    IconCheckCircle,
    IconExclamation,
    IconClock,
    IconTruck,
    IconTag,
    IconCreditCard,
    IconCamera,
    IconX,
    IconSparkles,
} from '@/Components/Icons';
import { formatRupiah, formatTanggal, getPaymentBadgeProps } from '@/Utils/format';

export default function Pesanan({ pesanan_list = [] }) {
    const [selectedBukti, setSelectedBukti] = useState(null);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploadOrderId, setUploadOrderId] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadPreview, setUploadPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [selectedOrderDuitku, setSelectedOrderDuitku] = useState(null);
    const [showDuitkuModal, setShowDuitkuModal] = useState(false);

    const fileInputRef = useRef(null);

    const handleUploadFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadFile(file);
            setUploadPreview(URL.createObjectURL(file));
        }
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        if (!uploadFile || !uploadOrderId) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('bukti_pembayaran', uploadFile);

        router.post(route('pelanggan.pesanan.bukti', uploadOrderId), formData, {
            forceFormData: true,
            onSuccess: () => {
                setUploadModalOpen(false);
                setUploadFile(null);
                setUploadPreview(null);
                setUploadOrderId(null);
            },
            onFinish: () => setUploading(false),
        });
    };

    const handleKonfirmasiSelesai = (orderId) => {
        if (confirm('Konfirmasi bahwa barang pesanan Anda telah diterima dengan baik?')) {
            router.post(route('pelanggan.pesanan.selesai', orderId));
        }
    };

    const handleLanjutkanPembayaran = (order) => {
        if (window.checkout && order.duitku_reference && !order.duitku_reference.startsWith('DS-')) {
            window.checkout.process(order.duitku_reference, {
                defaultLanguage: 'id',
                successEvent: async function (result) {
                    try {
                        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                        await fetch(route('duitku.update-status'), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrfToken || '',
                                'Accept': 'application/json',
                            },
                            body: JSON.stringify({
                                merchant_order_id: order.merchant_order_id,
                                id_transaksi: order.id_transaksi,
                                reference: order.duitku_reference,
                                payment_code: result?.paymentCode || result?.paymentType || 'QRIS',
                            }),
                        });
                        alert('✓ Pembayaran Berhasil Dikonfirmasi!');
                        router.reload();
                    } catch (e) {
                        router.reload();
                    }
                },
                pendingEvent: function (result) {
                    alert('Status pesanan: Menunggu pembayaran.');
                },
                errorEvent: function (result) {
                    setSelectedOrderDuitku(order);
                    setShowDuitkuModal(true);
                },
                closeEvent: function (result) {
                    // Popup ditutup
                },
            });
        } else {
            setSelectedOrderDuitku(order);
            setShowDuitkuModal(true);
        }
    };

    const getStatusStepIndex = (status) => {
        switch (status) {
            case 'Menunggu Pembayaran':
                return 0;
            case 'Diproses':
                return 1;
            case 'Dikirim':
                return 2;
            case 'Selesai':
                return 3;
            case 'Dibatalkan':
                return -1;
            default:
                return 1;
        }
    };

    return (
        <PelangganLayout>
            <Head title="Pesanan Saya & Pelacakan - MARTIN MART" />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black text-slate-950">
                        Riwayat & Pelacakan Pesanan Saya
                    </h1>
                    <p className="text-xs font-semibold text-slate-500">
                        Pantau status pesanan dan konfirmasi penerimaan barang belanjaan Anda.
                    </p>
                </div>

                <Link
                    href={route('pelanggan.katalog')}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
                >
                    <span>+ Belanja Lagi</span>
                </Link>
            </div>

            {pesanan_list.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border-2 border-slate-200 shadow-sm max-w-lg mx-auto">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl">
                        📦
                    </div>
                    <h3 className="text-base font-black text-slate-900">
                        Belum Ada Riwayat Pesanan
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Anda belum pernah membuat pesanan belanja online. Mulai belanja sekarang untuk menikmati pengantaran cepat ke rumah Anda!
                    </p>
                    <Link
                        href={route('pelanggan.katalog')}
                        className="mt-6 inline-flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 shadow-md shadow-blue-500/20"
                    >
                        <span>Mulai Belanja di Katalog →</span>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {pesanan_list.map((order) => {
                        const stepIndex = getStatusStepIndex(order.status_pesanan);
                        const isCancelled = order.status_pesanan === 'Dibatalkan';
                        const isCompleted = order.status_pesanan === 'Selesai';
                        const isDelivering = order.status_pesanan === 'Dikirim';

                        const steps = [
                            { label: 'Menunggu Bayar', icon: '💳' },
                            { label: 'Diproses Toko', icon: '📦' },
                            { label: 'Dalam Pengiriman', icon: '🚚' },
                            { label: 'Pesanan Selesai', icon: '✅' },
                        ];

                        return (
                            <div
                                key={order.id_transaksi}
                                className="bg-white rounded-3xl border-2 border-slate-200 shadow-xs overflow-hidden"
                            >
                                {/* Order Header */}
                                <div className="p-5 border-b-2 border-slate-100 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20">
                                            #{String(order.id_transaksi).padStart(4, '0')}
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-slate-500 block">
                                                Waktu Pesanan: {formatTanggal(order.tanggal)}
                                            </span>
                                            <div className="flex items-center space-x-2 mt-1">
                                                {(() => {
                                                    const badge = getPaymentBadgeProps(order.metode_pembayaran);
                                                    return (
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-black border ${badge.className}`}
                                                        >
                                                            {badge.icon} {badge.label}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex items-center space-x-2 self-start md:self-auto">
                                        <span
                                            className={`px-3.5 py-1 rounded-full text-xs font-black border ${
                                                order.status_pesanan === 'Selesai'
                                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                                    : order.status_pesanan === 'Dikirim'
                                                    ? 'bg-blue-100 text-blue-900 border-blue-300 animate-pulse'
                                                    : order.status_pesanan === 'Diproses'
                                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                                    : order.status_pesanan === 'Menunggu Pembayaran'
                                                    ? 'bg-orange-100 text-orange-900 border-orange-300'
                                                    : 'bg-rose-100 text-rose-900 border-rose-300'
                                            }`}
                                        >
                                            ● {order.status_pesanan || 'Diproses'}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Tracking Stepper */}
                                {!isCancelled ? (
                                    <div className="px-6 py-5 bg-gradient-to-r from-blue-50/50 via-white to-cyan-50/50 border-b-2 border-slate-100">
                                        <div className="grid grid-cols-4 gap-2 relative">
                                            {steps.map((st, i) => {
                                                const isActive = stepIndex >= i;
                                                const isCurrent = stepIndex === i;

                                                return (
                                                    <div key={st.label} className="flex flex-col items-center text-center">
                                                        <div
                                                            className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-black transition-all mb-1.5 shadow-2xs ${
                                                                isActive
                                                                    ? 'bg-blue-600 text-white shadow-blue-500/25 ring-4 ring-blue-100'
                                                                    : 'bg-slate-200 text-slate-500'
                                                            }`}
                                                        >
                                                            {st.icon}
                                                        </div>
                                                        <span
                                                            className={`text-[10px] md:text-xs font-black ${
                                                                isCurrent
                                                                    ? 'text-blue-700'
                                                                    : isActive
                                                                    ? 'text-slate-800'
                                                                    : 'text-slate-400'
                                                            }`}
                                                        >
                                                            {st.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-rose-50 text-rose-800 text-xs font-bold text-center border-b border-rose-200">
                                        ❌ Pesanan ini telah dibatalkan.
                                    </div>
                                )}

                                {/* Order Details & Items */}
                                <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6">
                                    {/* Left: Product Items (7 cols) */}
                                    <div className="md:col-span-7 space-y-3">
                                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                                            Rincian Produk Belanja:
                                        </h4>
                                        <div className="divide-y divide-slate-100">
                                            {order.details?.map((dt) => (
                                                <div
                                                    key={dt.id_detail || dt.id_produk}
                                                    className="py-2.5 first:pt-0 flex items-center justify-between text-xs"
                                                >
                                                    <div>
                                                        <span className="font-black text-slate-900 block">
                                                            {dt.nama_produk}
                                                        </span>
                                                        <span className="text-[11px] text-slate-500">
                                                            {dt.jumlah} x {formatRupiah(dt.harga)}
                                                        </span>
                                                    </div>
                                                    <span className="font-black text-slate-950">
                                                        {formatRupiah(dt.subtotal)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-3 border-t-2 border-slate-100 flex items-center justify-between text-xs">
                                            <span className="font-black text-slate-600">Total Belanja:</span>
                                            <span className="text-base font-black text-blue-700">
                                                {formatRupiah(order.total_belanja)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right: Delivery Info & Actions (5 cols) */}
                                    <div className="md:col-span-5 bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
                                        <h4 className="font-black text-slate-900 flex items-center space-x-1.5">
                                            <span>📍 Lokasi & Kontak Pengiriman</span>
                                        </h4>

                                        <div className="space-y-1 text-slate-700">
                                            <p className="font-bold">
                                                No. HP / WA:{' '}
                                                <span className="text-slate-950 font-black">
                                                    {order.no_hp_penerima || '-'}
                                                </span>
                                            </p>
                                            <p className="leading-relaxed">
                                                <strong>Alamat:</strong>{' '}
                                                {order.alamat_pengiriman || 'Alamat tidak dicantumkan'}
                                            </p>
                                            {order.latitude && order.longitude && (
                                                <div className="pt-1">
                                                    <a
                                                        href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[11px] text-blue-600 hover:underline font-black inline-flex items-center space-x-1"
                                                    >
                                                        <span>🗺️ Buka Koordinat di Google Maps ↗</span>
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {/* Bukti Pembayaran preview */}
                                        <div className="pt-2 border-t border-slate-200">
                                            <span className="font-bold text-slate-700 block mb-1">
                                                Bukti Pembayaran:
                                            </span>
                                            {order.bukti_pembayaran_url ? (
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedBukti(order.bukti_pembayaran_url)}
                                                        className="h-12 w-20 rounded-lg overflow-hidden border border-slate-300 hover:opacity-80 transition-opacity"
                                                    >
                                                        <img
                                                            src={order.bukti_pembayaran_url}
                                                            alt="Bukti Transfer"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </button>
                                                    <span className="text-[11px] text-emerald-700 font-bold">
                                                        ✓ Bukti terverifikasi
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] text-amber-700 font-bold">
                                                        Belum upload bukti transfer
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setUploadOrderId(order.id_transaksi);
                                                            setUploadModalOpen(true);
                                                        }}
                                                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black"
                                                    >
                                                        + Upload Bukti
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
                                            {/* Tombol Lanjutkan Pembayaran via Duitku POP */}
                                            {order.status_pesanan === 'Menunggu Pembayaran' && order.duitku_reference && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleLanjutkanPembayaran(order)}
                                                    className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 hover:from-blue-800 hover:to-sky-600 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer"
                                                >
                                                    <span className="text-sm">💳</span>
                                                    <span>Lanjutkan Pembayaran (Duitku POP)</span>
                                                    <span>→</span>
                                                </button>
                                            )}

                                            {isDelivering && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleKonfirmasiSelesai(order.id_transaksi)}
                                                    className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-500/25 flex items-center justify-center space-x-1.5 animate-bounce"
                                                >
                                                    <IconCheckCircle className="w-4 h-4" />
                                                    <span>Konfirmasi: Pesanan Diterima ✅</span>
                                                </button>
                                            )}

                                            <a
                                                href={route('transaksi.struk', order.id_transaksi)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 text-center flex items-center justify-center space-x-1"
                                            >
                                                <IconReceipt className="w-3.5 h-3.5 text-blue-600" />
                                                <span>Lihat & Cetak Nota Struk ↗</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Bukti Pembayaran Large View */}
            <ModalDialog
                show={!!selectedBukti}
                onClose={() => setSelectedBukti(null)}
                title="Foto Bukti Pembayaran"
            >
                {selectedBukti && (
                    <div className="p-2 text-center">
                        <img
                            src={selectedBukti}
                            alt="Bukti Transfer Penuh"
                            className="max-h-[70vh] mx-auto rounded-xl border border-slate-200 shadow-md object-contain"
                        />
                    </div>
                )}
            </ModalDialog>

            {/* Modal Upload Bukti Susulan */}
            <ModalDialog
                show={uploadModalOpen}
                onClose={() => {
                    setUploadModalOpen(false);
                    setUploadFile(null);
                    setUploadPreview(null);
                }}
                title={`Upload Bukti Pembayaran Pesanan #${String(uploadOrderId || '').padStart(4, '0')}`}
            >
                <form onSubmit={handleUploadSubmit} className="space-y-4 p-2">
                    <p className="text-xs text-slate-600 font-semibold">
                        Pilih foto atau screenshot bukti transfer bank atau pembayaran QRIS Anda.
                    </p>

                    {uploadPreview ? (
                        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border-2 border-emerald-400 bg-slate-100">
                            <img src={uploadPreview} alt="Preview" className="w-full h-full object-contain" />
                            <button
                                type="button"
                                onClick={() => {
                                    setUploadFile(null);
                                    setUploadPreview(null);
                                }}
                                className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-lg"
                            >
                                <IconX className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full p-8 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50/50 hover:bg-blue-50 text-center cursor-pointer"
                        >
                            <IconCamera className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <span className="text-xs font-black text-blue-900 block">
                                Klik untuk memilih file foto bukti pembayaran
                            </span>
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUploadFileChange}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden"
                    />

                    <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setUploadModalOpen(false)}
                            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || !uploadFile}
                            className="px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50"
                        >
                            {uploading ? 'Mengunggah...' : 'Kirim Bukti Pembayaran'}
                        </button>
                    </div>
                </form>
            </ModalDialog>

            {/* Duitku POP Official Style Modal Popup */}
            <DuitkuPopModal
                show={showDuitkuModal}
                onClose={() => setShowDuitkuModal(false)}
                transaksi={selectedOrderDuitku}
                customerName="Pelanggan"
                isKasir={false}
                onSuccess={() => {
                    alert('✓ Pembayaran Berhasil Dikonfirmasi!');
                    router.reload();
                }}
            />
        </PelangganLayout>
    );
}
