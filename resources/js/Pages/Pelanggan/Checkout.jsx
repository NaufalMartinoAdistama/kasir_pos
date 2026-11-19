import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PelangganLayout from '@/Layouts/PelangganLayout';
import InteractiveMapPicker from '@/Components/InteractiveMapPicker';
import ModalDialog from '@/Components/ModalDialog';
import DuitkuPopModal from '@/Components/DuitkuPopModal';
import {
    IconCart,
    IconMapPin,
    IconPhone,
    IconCreditCard,
    IconCheckCircle,
    IconSparkles,
    IconX,
    IconBox,
} from '@/Components/Icons';
import { formatRupiah } from '@/Utils/format';

export default function Checkout({ customer_profile = {}, google_maps_api_key = '' }) {
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('martin_mart_cart') || localStorage.getItem('naufam_mart_cart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const [noHp, setNoHp] = useState(customer_profile.no_hp || '');
    const [alamat, setAlamat] = useState(customer_profile.alamat_lengkap || '');
    const [latitude, setLatitude] = useState(customer_profile.latitude || -0.1337);
    const [longitude, setLongitude] = useState(customer_profile.longitude || 117.4947);

    const [submitting, setSubmitting] = useState(false);
    const [duitkuLoading, setDuitkuLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [duitkuModalData, setDuitkuModalData] = useState(null);
    const [showDuitkuModal, setShowDuitkuModal] = useState(false);

    const totalItems = cart.reduce((sum, item) => sum + item.jumlah, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.harga * item.jumlah, 0);

    const handleMapChange = ({ latitude: newLat, longitude: newLng, address }) => {
        setLatitude(newLat);
        setLongitude(newLng);
        if (address && (!alamat || alamat.trim().length === 0)) {
            setAlamat(address);
        }
    };

    // Validasi input bersama sebelum pembayaran
    const validateForm = () => {
        setFormError('');

        if (cart.length === 0) {
            setFormError('Keranjang belanja Anda masih kosong. Silakan pilih produk terlebih dahulu.');
            return false;
        }

        if (!noHp.trim()) {
            setFormError('Nomor HP / WhatsApp penerima wajib diisi.');
            return false;
        }

        if (!alamat.trim()) {
            setFormError('Alamat pengiriman lengkap wajib diisi.');
            return false;
        }

        return true;
    };

    // -------------------------------------------------------------
    // INTEGRASI DUITKU POP (SANDBOX POPUP PAYMENT)
    // -------------------------------------------------------------
    const handleDuitkuSuccess = async (resData, paymentCode = 'QRIS') => {
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
                    merchant_order_id: resData.merchant_order_id,
                    id_transaksi: resData.id_transaksi,
                    reference: resData.reference,
                    payment_code: paymentCode || 'QRIS',
                    metode_pembayaran: paymentCode || 'QRIS',
                }),
            });

            // Bersihkan keranjang lokal
            localStorage.removeItem('martin_mart_cart');
            localStorage.removeItem('naufam_mart_cart');
            setCart([]);
            setShowDuitkuModal(false);

            alert('✓ Pembayaran Berhasil Dikonfirmasi! Pesanan Anda segera diproses.');
            router.visit(route('pelanggan.pesanan'));
        } catch (e) {
            localStorage.removeItem('martin_mart_cart');
            localStorage.removeItem('naufam_mart_cart');
            setCart([]);
            router.visit(route('pelanggan.pesanan'));
        }
    };

    const openDuitkuPopup = (resData) => {
        if (window.checkout && resData.reference && !resData.reference.startsWith('DS-')) {
            window.checkout.process(resData.reference, {
                defaultLanguage: 'id',
                successEvent: function (result) {
                    handleDuitkuSuccess(resData, result?.paymentCode || result?.paymentType || 'QRIS');
                },
                pendingEvent: function (result) {
                    localStorage.removeItem('martin_mart_cart');
                    localStorage.removeItem('naufam_mart_cart');
                    setCart([]);
                    alert('Pesanan tersimpan. Menunggu penyelesaian pembayaran.');
                    router.visit(route('pelanggan.pesanan'));
                },
                errorEvent: function (result) {
                    // Fallback ke modal popup in-app
                    setDuitkuModalData(resData);
                    setShowDuitkuModal(true);
                },
                closeEvent: function (result) {
                    // Popup ditutup pelanggan
                },
            });
        } else {
            // Popup modal internal interaktif
            setDuitkuModalData(resData);
            setShowDuitkuModal(true);
        }
    };

    const handleDuitkuPayment = async () => {
        if (!validateForm()) return;

        setDuitkuLoading(true);
        setFormError('');

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            // 1. Request Reference & Invoice ke backend Duitku
            const response = await fetch(route('duitku.create-invoice'), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    items: cart.map(i => ({
                        id_produk: i.id_produk,
                        jumlah: i.jumlah,
                    })),
                    no_hp_penerima: noHp,
                    alamat_pengiriman: alamat,
                    latitude: latitude,
                    longitude: longitude,
                    sumber_transaksi: 'Online Pelanggan',
                }),
            });

            const data = await response.json();
            setDuitkuLoading(false);

            if (!response.ok || data.status !== 'success' || !data.merchant_order_id) {
                setFormError(data.message || 'Gagal membuat invoice transaksi Duitku');
                return;
            }

            // Buka Pop-up Pembayaran Duitku POP
            openDuitkuPopup(data);
        } catch (err) {
            setFormError(err.message || 'Terjadi kesalahan saat menghubungi server Duitku.');
            setDuitkuLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <PelangganLayout cartCount={0}>
                <Head title="Checkout Belanja - MARTIN MART" />
                <div className="max-w-2xl mx-auto bg-white rounded-3xl p-10 text-center border-2 border-slate-200 shadow-sm mt-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl">
                        🛒
                    </div>
                    <h2 className="text-xl font-black text-slate-900">
                        Keranjang Belanja Masih Kosong
                    </h2>
                    <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
                        Anda belum memilih barang untuk dipesan. Silakan lihat katalog produk kami dan tambahkan barang yang ingin dibeli.
                    </p>
                    <Link
                        href={route('pelanggan.katalog')}
                        className="mt-6 inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/25 transition-all"
                    >
                        <span>Lihat Katalog Produk Sekarang →</span>
                    </Link>
                </div>
            </PelangganLayout>
        );
    }

    return (
        <PelangganLayout cartCount={totalItems}>
            <Head title="Checkout & Konfirmasi Pesanan - MARTIN MART" />

            <div className="mb-6">
                <Link
                    href={route('pelanggan.katalog')}
                    className="inline-flex items-center space-x-1.5 text-xs font-black text-blue-700 hover:text-blue-900 mb-2"
                >
                    <span>← Kembali ke Katalog Belanja</span>
                </Link>
                <h1 className="text-2xl font-black text-slate-950">
                    Pengiriman & Pembayaran Pesanan
                </h1>
                <p className="text-xs font-semibold text-slate-500">
                    Lengkapi alamat pengiriman dan pilih metode pembayaran online (Duitku POP Sandbox) atau simulasi non-tunai.
                </p>
            </div>

            {formError && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 text-xs font-bold shadow-xs">
                    ⚠️ {formError}
                </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleDuitkuPayment(); }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Form Pengiriman & Peta (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Data Penerima */}
                    <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-xs space-y-4">
                        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                👤
                            </div>
                            <h2 className="text-sm font-black text-slate-950">
                                1. Data Kontak Penerima
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-900 mb-1">
                                    Nama Penerima
                                </label>
                                <input
                                    type="text"
                                    value={customer_profile.nama || ''}
                                    disabled
                                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-bold text-slate-700"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-900 mb-1">
                                    No. WhatsApp / HP Aktif <span className="text-rose-600">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={noHp}
                                        onChange={(e) => setNoHp(e.target.value)}
                                        placeholder="081234567890"
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-slate-950 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                                        required
                                    />
                                    <IconPhone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                </div>
                                <span className="text-[10.5px] text-slate-500 mt-1 block">
                                    Kurir akan menghubungi nomor ini saat mengantar barang.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Pemilihan Lokasi di Peta Interaktif */}
                    <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-xs space-y-4">
                        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                                📍
                            </div>
                            <h2 className="text-sm font-black text-slate-950">
                                2. Titik Pengiriman di Peta (GPS)
                            </h2>
                        </div>

                        {/* Interactive Map Component (Leaflet + OpenStreetMap) */}
                        <InteractiveMapPicker
                            latitude={latitude}
                            longitude={longitude}
                            onChange={handleMapChange}
                            googleMapsApiKey={google_maps_api_key}
                        />

                        {/* Detail Alamat Textarea */}
                        <div>
                            <label className="block text-xs font-black text-slate-900 mb-1">
                                Detail Alamat Pengiriman Lengkap <span className="text-rose-600">*</span>
                            </label>
                            <textarea
                                rows={3}
                                value={alamat}
                                onChange={(e) => setAlamat(e.target.value)}
                                placeholder="Jalan, No. Rumah, RT/RW, Kelurahan, Patokan atau petunjuk lokasi..."
                                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-slate-950 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs leading-relaxed"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Ringkasan Keranjang & Tombol Pembayaran Duitku POP (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-xs sticky top-24 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center space-x-2">
                                <IconCart className="w-5 h-5 text-blue-600" />
                                <h3 className="text-sm font-black text-slate-950">
                                    Ringkasan Pesanan ({totalItems} item)
                                </h3>
                            </div>
                            <Link
                                href={route('pelanggan.katalog')}
                                className="text-xs font-black text-blue-600 hover:underline"
                            >
                                Ubah Item
                            </Link>
                        </div>

                        {/* Items List */}
                        <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 divide-y divide-slate-100">
                            {cart.map((item) => (
                                <div key={item.id_produk} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <span className="font-bold text-slate-900 block truncate">
                                            {item.nama_produk}
                                        </span>
                                        <span className="text-[11px] text-slate-500">
                                            {item.jumlah}x @ {formatRupiah(item.harga)}
                                        </span>
                                    </div>
                                    <span className="font-black text-slate-900 shrink-0">
                                        {formatRupiah(item.harga * item.jumlah)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Price Details */}
                        <div className="pt-3 border-t-2 border-slate-100 space-y-2 text-xs">
                            <div className="flex items-center justify-between text-slate-600 font-semibold">
                                <span>Subtotal Belanja:</span>
                                <span>{formatRupiah(totalPrice)}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-600 font-semibold">
                                <span>Biaya Pengantaran:</span>
                                <span className="text-emerald-700 font-black">GRATIS (Promo)</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-950 text-base font-black pt-2 border-t border-slate-200">
                                <span>Total Pembayaran:</span>
                                <span className="text-blue-700 text-lg">
                                    {formatRupiah(totalPrice)}
                                </span>
                            </div>
                        </div>

                        {/* TOMBOL UTAMA: Bayar via Gateway Duitku POP */}
                        <div className="pt-2 space-y-2.5">
                            <button
                                type="submit"
                                disabled={duitkuLoading || submitting || cart.length === 0}
                                className="w-full py-4 px-4 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 hover:from-blue-800 hover:to-sky-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center space-x-2.5 active:scale-98 disabled:opacity-50 cursor-pointer"
                            >
                                <span className="text-lg">💳</span>
                                <span>
                                    {duitkuLoading
                                        ? 'Menyiapkan Duitku POP...'
                                        : 'Bayar Sekarang via Duitku POP (QRIS / VA / Kartu) →'}
                                </span>
                            </button>

                            {/* Badge Saluran Pembayaran Duitku */}
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                                    Metode Resmi Gateway Duitku:
                                </span>
                                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-extrabold text-slate-700">
                                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">QRIS</span>
                                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">BCA VA</span>
                                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">BRI VA</span>
                                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">Mandiri VA</span>
                                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">BNI VA</span>
                                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">Permata VA</span>
                                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">CIMB VA</span>
                                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">ShopeePay</span>
                                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">OVO</span>
                                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">Kartu Debit</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-[11px] text-blue-900 flex items-start space-x-2">
                            <IconCheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <span>
                                Stok barang otomatis diamankan di sistem inventaris toko saat pesanan dibuat.
                            </span>
                        </div>
                    </div>
                </div>
            </form>
            {/* Modal Pop-up Duitku POP Sandbox (Official Style Dialog) */}
            <DuitkuPopModal
                show={showDuitkuModal}
                onClose={() => setShowDuitkuModal(false)}
                transaksi={duitkuModalData}
                customerName={customer_profile.nama || 'Pelanggan'}
                isKasir={false}
                onSuccess={(trx, paymentCode) => {
                    handleDuitkuSuccess(trx, paymentCode);
                }}
            />
        </PelangganLayout>
    );
}
