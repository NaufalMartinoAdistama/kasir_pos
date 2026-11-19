import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { formatRupiah, formatTanggal } from '@/Utils/format';
import { playRfidSuccessBeep } from '@/Utils/sound';
import { IconCheckCircle, IconPrinter } from '@/Components/Icons';

export default function DuitkuPaymentPage({
    transaksi,
    pelanggan,
    details = [],
    vaNumbers = {},
    duitkuConfig = {},
    paymentUrl = null,
    isKasir = false,
}) {
    const [selectedChannel, setSelectedChannel] = useState('qris'); // 'qris' | 'va' | 'ewallet'
    const [selectedBank, setSelectedBank] = useState('BCA');
    const [showDetail, setShowDetail] = useState(false);
    const [showHowToPay, setShowHowToPay] = useState(false);
    const [statusPesanan, setStatusPesanan] = useState(transaksi.status_pesanan);
    const [copiedText, setCopiedText] = useState('');
    const [simulating, setSimulating] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [secondsLeft, setSecondsLeft] = useState(60 * 60); // 60 menit

    const isLunas = statusPesanan === 'Selesai' || statusPesanan === 'Diproses';

    // Countdown timer 60 menit
    useEffect(() => {
        if (isLunas) return;
        const timer = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [isLunas]);

    const formatTimer = (totalSec) => {
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // Salin nomor / teks
    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopiedText(label);
        setToastMsg(`✓ ${label} berhasil disalin!`);
        setTimeout(() => {
            setCopiedText('');
            setToastMsg('');
        }, 3000);
    };

    // Auto-polling status setiap 5 detik jika belum lunas
    useEffect(() => {
        if (isLunas) return;

        const interval = setInterval(async () => {
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                const res = await fetch(route('duitku.check-status'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken || '',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        merchant_order_id: transaksi.merchant_order_id,
                        id_transaksi: transaksi.id_transaksi,
                    }),
                });
                const data = await res.json();
                if (data.status === 'success' && data.is_lunas) {
                    setStatusPesanan(data.status_pesanan);
                    playRfidSuccessBeep();
                }
            } catch (err) {
                // Ignore polling network blip
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [isLunas, transaksi.merchant_order_id, transaksi.id_transaksi]);

    // CHECK TRANSACTION button click
    const handleCheckTransaction = async () => {
        setCheckingStatus(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(route('duitku.check-status'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    merchant_order_id: transaksi.merchant_order_id,
                    id_transaksi: transaksi.id_transaksi,
                }),
            });
            const data = await res.json();
            if (data.status === 'success') {
                setStatusPesanan(data.status_pesanan);
                if (data.is_lunas) {
                    playRfidSuccessBeep();
                    setToastMsg('✓ Pembayaran DIVERIFIKASI LUNAS!');
                } else {
                    setToastMsg('ℹ Status: Belum ada pembayaran masuk. Silakan bayar terlebih dahulu.');
                }
                setTimeout(() => setToastMsg(''), 4000);
            }
        } catch (err) {
            alert('Gagal mengecek status pembayaran.');
        } finally {
            setCheckingStatus(false);
        }
    };

    // Simulasi Sandbox Instant Confirmation
    const handleSimulasiLunas = async () => {
        setSimulating(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(route('duitku.update-status'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    merchant_order_id: transaksi.merchant_order_id,
                    id_transaksi: transaksi.id_transaksi,
                    reference: transaksi.duitku_reference,
                    payment_code: selectedChannel.toUpperCase(),
                }),
            });

            const data = await res.json();
            if (res.ok && data.status === 'success') {
                setStatusPesanan(isKasir ? 'Selesai' : 'Diproses');
                playRfidSuccessBeep();
                setToastMsg('✓ Pembayaran Berhasil Dikonfirmasi (Simulasi Sandbox)!');
                setTimeout(() => setToastMsg(''), 4000);
            } else {
                alert(data.message || 'Gagal memproses simulasi pembayaran.');
            }
        } catch (err) {
            alert('Terjadi kesalahan koneksi.');
        } finally {
            setSimulating(false);
        }
    };

    const cleanOrderId = transaksi.merchant_order_id || `INV-${transaksi.id_transaksi}`;
    const qrisString = `00020101021226680016ID.CO.QRIS.WWW01189360099900000000010215ID10200238192805204541153033605802ID5911MARTIN MART6007JAKARTA62070703A016304${cleanOrderId}`;
    const activeVaNumber = vaNumbers[selectedBank] || `80777${String(transaksi.id_transaksi).padStart(6, '0')}`;

    const bankOptions = [
        { key: 'BCA', name: 'BCA Virtual Account', code: '014', color: 'text-blue-800' },
        { key: 'BRI', name: 'BRI Virtual Account', code: '002', color: 'text-blue-900' },
        { key: 'Mandiri', name: 'Mandiri Virtual Account', code: '008', color: 'text-amber-800' },
        { key: 'BNI', name: 'BNI Virtual Account', code: '009', color: 'text-orange-800' },
        { key: 'Permata', name: 'Permata Virtual Account', code: '013', color: 'text-emerald-800' },
    ];

    return (
        <div className="min-h-screen relative flex items-center justify-center p-3 sm:p-6 font-sans overflow-x-hidden bg-[#063347]">
            <Head title={`Pembayaran Duitku - ${transaksi.merchant_order_id}`} />

            {/* Background Graphic: Deep Blue/Teal Gradient with Subtle World Map Mesh */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at 50% 45%, #0f5b7a 0%, #093c54 50%, #042433 100%)',
                }}
            />

            {/* Subtle World Map SVG Overlay */}
            <svg
                className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-20"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1000 500"
                preserveAspectRatio="xMidYMid slice"
            >
                <path
                    fill="#38bdf8"
                    d="M150,120 Q180,100 220,130 T280,180 Q250,220 200,210 T140,160 Z M190,260 Q230,250 250,290 T240,360 Q210,400 170,350 T180,280 Z M460,90 Q510,80 540,110 T530,160 Q490,170 470,140 Z M490,190 Q540,180 560,220 T540,300 Q500,340 470,280 T480,210 Z M660,110 Q740,90 800,140 T780,220 Q700,240 670,180 Z M760,280 Q820,270 840,310 T810,360 Q750,370 740,320 Z"
                />
                <circle cx="210" cy="140" r="2" fill="#bae6fd" />
                <circle cx="510" cy="120" r="2" fill="#bae6fd" />
                <circle cx="510" cy="240" r="2" fill="#bae6fd" />
                <circle cx="720" cy="160" r="2" fill="#bae6fd" />
                <circle cx="780" cy="310" r="2" fill="#bae6fd" />
            </svg>

            {/* Toast Alert */}
            {toastMsg && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-bold py-2.5 px-5 rounded-full shadow-2xl border border-sky-400 flex items-center space-x-2 animate-pulse">
                    <span>{toastMsg}</span>
                </div>
            )}

            {/* Central Payment Card (Identical layout to Duitku Official Gateway) */}
            <div className="relative z-10 w-full max-w-[440px] bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col transition-all">
                {/* 1. Header Bar: < [Nama Merchant] [Channel Badge] */}
                <div className="bg-white px-4 py-3.5 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={isKasir ? route('kasir.pos') : route('pelanggan.pesanan')}
                            className="p-1.5 -ml-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
                            title="Kembali"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h2 className="font-bold text-slate-800 text-sm tracking-tight leading-none">MARTIN MART</h2>
                            <span className="text-[10px] text-slate-400 font-medium">Merchant Resmi</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                        {selectedChannel === 'qris' && (
                            <div className="flex items-center space-x-1 bg-red-50 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded border border-red-200">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                <span>ShopeePay / QRIS</span>
                            </div>
                        )}
                        {selectedChannel === 'va' && (
                            <div className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded border border-blue-200">
                                <span>VA {selectedBank}</span>
                            </div>
                        )}
                        {selectedChannel === 'ewallet' && (
                            <div className="bg-purple-50 text-purple-700 text-[11px] font-bold px-2 py-0.5 rounded border border-purple-200">
                                <span>E-Wallet</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Amount & Detail Bar: Rp X.XXX.XXX + Show Detail */}
                <div className="bg-white px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-baseline space-x-1">
                        <span className="text-xs font-semibold text-slate-500">Rp</span>
                        <span className="text-2xl font-bold text-slate-900 tracking-tight">
                            {formatRupiah(transaksi.total_belanja).replace('Rp\u00a0', '')}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowDetail(!showDetail)}
                        className="text-xs font-semibold text-slate-700 hover:text-sky-600 flex items-center space-x-1 transition select-none"
                    >
                        <span>Show Detail</span>
                        <svg
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showDetail ? 'rotate-90' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Dropdown Detail Pesanan (Expandable) */}
                {showDetail && (
                    <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 text-xs space-y-2 animate-fadeIn">
                        <div className="flex justify-between text-slate-500">
                            <span>No. Invoice:</span>
                            <span className="font-mono font-bold text-slate-800">{transaksi.merchant_order_id}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Pelanggan:</span>
                            <span className="font-semibold text-slate-800">
                                {pelanggan ? pelanggan.nama_pelanggan : 'Pelanggan Umum'}
                            </span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Waktu:</span>
                            <span className="text-slate-700">{formatTanggal(transaksi.tanggal)}</span>
                        </div>

                        <div className="pt-2 border-t border-slate-200">
                            <span className="font-bold text-slate-700 block mb-1.5">Rincian Barang:</span>
                            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                                {details.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-slate-600">
                                        <span className="truncate max-w-[240px]">
                                            {item.produk ? item.produk.nama_produk : item.nama_produk || 'Produk'} ({item.jumlah}x)
                                        </span>
                                        <span className="font-semibold text-slate-800 shrink-0">
                                            {formatRupiah(item.subtotal || item.harga * item.jumlah)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {transaksi.diskon > 0 && (
                            <div className="flex justify-between text-emerald-700 pt-1 font-semibold">
                                <span>Diskon Member ({transaksi.diskon}%):</span>
                                <span>- Diskon Diterapkan</span>
                            </div>
                        )}
                    </div>
                )}

                {/* SUCCESS / LUNAS STATE */}
                {isLunas ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center space-y-4 animate-fadeIn">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50">
                            <IconCheckCircle className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Pembayaran Berhasil!</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                                Tagihan sebesar <strong className="text-slate-800">{formatRupiah(transaksi.total_belanja)}</strong> telah berhasil dilunasi.
                            </p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3 w-full text-xs text-left space-y-1.5 border border-slate-200 font-mono">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Order ID:</span>
                                <span className="font-bold text-slate-700">{transaksi.merchant_order_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Metode:</span>
                                <span className="font-bold text-emerald-700">{selectedChannel.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Status:</span>
                                <span className="font-bold text-emerald-600">LUNAS / SELESAI</span>
                            </div>
                        </div>

                        <div className="flex flex-col w-full space-y-2 pt-2">
                            {isKasir && (
                                <a
                                    href={route('transaksi.struk', transaksi.id_transaksi)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-3 bg-gradient-to-r from-blue-700 to-sky-600 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 hover:opacity-95 transition"
                                >
                                    <IconPrinter className="w-4 h-4" />
                                    <span>Cetak Struk Transaksi POS</span>
                                </a>
                            )}
                            <Link
                                href={isKasir ? route('kasir.pos') : route('pelanggan.pesanan')}
                                className="w-full py-3 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition"
                            >
                                {isKasir ? 'Kembali ke POS Kasir' : 'Lihat Pesanan Saya'}
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* UNPAID / ACTIVE PAYMENT VIEW */
                    <div className="flex flex-col flex-1">
                        {/* Channel Selector Pills: QRIS | Transfer Bank | E-Wallet */}
                        <div className="px-5 pt-3 pb-1 bg-white">
                            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                                <button
                                    type="button"
                                    onClick={() => setSelectedChannel('qris')}
                                    className={`py-2 rounded-lg transition text-center ${
                                        selectedChannel === 'qris'
                                            ? 'bg-white text-slate-900 shadow-xs font-black'
                                            : 'hover:text-slate-900'
                                    }`}
                                >
                                    QRIS
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedChannel('va')}
                                    className={`py-2 rounded-lg transition text-center ${
                                        selectedChannel === 'va'
                                            ? 'bg-white text-slate-900 shadow-xs font-black'
                                            : 'hover:text-slate-900'
                                    }`}
                                >
                                    Transfer Bank
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedChannel('ewallet')}
                                    className={`py-2 rounded-lg transition text-center ${
                                        selectedChannel === 'ewallet'
                                            ? 'bg-white text-slate-900 shadow-xs font-black'
                                            : 'hover:text-slate-900'
                                    }`}
                                >
                                    E-Wallet
                                </button>
                            </div>
                        </div>

                        {/* --- TAB 1: QRIS VIEW (Exact 1:1 match to Duitku screenshot) --- */}
                        {selectedChannel === 'qris' && (
                            <div className="px-6 py-4 flex flex-col items-center text-center">
                                {/* Official QRIS Brand Header */}
                                <div className="mb-2">
                                    <div className="font-black text-2xl tracking-widest text-slate-900 font-mono flex items-center justify-center space-x-1">
                                        <span className="border-b-4 border-red-600 pb-0.5">Q</span>
                                        <span>R</span>
                                        <span>I</span>
                                        <span>S</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                                        Quick Response Code Indonesian Standard
                                    </p>
                                </div>

                                {/* Scannable QR Code */}
                                <div className="p-3 bg-white rounded-xl border-2 border-slate-200 shadow-sm my-2 flex items-center justify-center">
                                    <QRCodeSVG
                                        value={qrisString}
                                        size={210}
                                        level="M"
                                        includeMargin={false}
                                    />
                                </div>

                                {/* NMID */}
                                <div className="text-xs font-mono font-semibold text-slate-500 my-1">
                                    NMID : ID102002381928
                                </div>

                                {/* E-Wallet & Bank Logos Grid (as seen in Duitku screenshot) */}
                                <div className="w-full pt-3 pb-2 border-t border-slate-100 mt-2">
                                    <div className="flex items-center justify-center flex-wrap gap-2.5 text-[10px] font-bold text-slate-600">
                                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">OVO</span>
                                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">gopay</span>
                                        <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">DANA</span>
                                        <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">LinkAja!</span>
                                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">BCA</span>
                                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">mandiripay</span>
                                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">CIMBBANK</span>
                                        <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">BNI</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB 2: TRANSFER BANK / VIRTUAL ACCOUNT VIEW --- */}
                        {selectedChannel === 'va' && (
                            <div className="px-6 py-4 flex flex-col space-y-3.5">
                                {/* Bank Selection Pills */}
                                <div>
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                        Pilih Bank Pembayaran:
                                    </span>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {bankOptions.map((bank) => (
                                            <button
                                                key={bank.key}
                                                type="button"
                                                onClick={() => setSelectedBank(bank.key)}
                                                className={`py-2 px-2 text-xs font-bold rounded-lg border transition text-center ${
                                                    selectedBank === bank.key
                                                        ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-xs'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                {bank.key}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Virtual Account Number Box */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium">Nomor Virtual Account ({selectedBank}):</span>
                                        <span className="font-mono text-red-600 font-bold">⏱ {formatTimer(secondsLeft)}</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-300">
                                        <span className="font-mono font-black text-slate-900 text-lg tracking-wider">
                                            {activeVaNumber}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(activeVaNumber, `Nomor VA ${selectedBank}`)}
                                            className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-md transition shadow-xs"
                                        >
                                            {copiedText === `Nomor VA ${selectedBank}` ? 'Disalin!' : 'Salin'}
                                        </button>
                                    </div>
                                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                                        <span>Nama Rekening:</span>
                                        <span className="font-bold text-slate-800 truncate max-w-[200px]">
                                            MARTIN MART - {pelanggan ? pelanggan.nama_pelanggan : 'Pelanggan'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB 3: E-WALLET VIEW --- */}
                        {selectedChannel === 'ewallet' && (
                            <div className="px-6 py-4 flex flex-col space-y-3">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                    Pilih Layanan E-Wallet:
                                </span>
                                <div className="space-y-2">
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center space-x-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-red-500 text-white font-black text-xs flex items-center justify-center">
                                                SP
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-xs">ShopeePay</h4>
                                                <p className="text-[10px] text-slate-500">Scan QRIS menggunakan aplikasi Shopee</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedChannel('qris')}
                                            className="text-xs font-bold text-sky-600 hover:underline"
                                        >
                                            Buka QRIS →
                                        </button>
                                    </div>

                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center space-x-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                                                OVO
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-xs">OVO & Dana</h4>
                                                <p className="text-[10px] text-slate-500">Scan QRIS dari menu bayar aplikasi</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedChannel('qris')}
                                            className="text-xs font-bold text-sky-600 hover:underline"
                                        >
                                            Buka QRIS →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Accordion: How to pay ∨ */}
                        <div className="border-t border-slate-100 px-6 py-3 bg-white">
                            <button
                                type="button"
                                onClick={() => setShowHowToPay(!showHowToPay)}
                                className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 transition"
                            >
                                <span>How to pay</span>
                                <svg
                                    className={`w-4 h-4 text-slate-400 transition-transform ${showHowToPay ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showHowToPay && (
                                <div className="mt-2 text-xs text-slate-600 space-y-1.5 pl-2 border-l-2 border-sky-400">
                                    {selectedChannel === 'qris' && (
                                        <>
                                            <p>1. Buka aplikasi e-wallet (ShopeePay, GoPay, OVO, Dana) atau Mobile Banking.</p>
                                            <p>2. Pilih menu <strong>Scan / Bayar</strong> lalu arahkan kamera ke kode QR di atas.</p>
                                            <p>3. Pastikan nama penerima <strong>MARTIN MART</strong> dan nominal sesuai.</p>
                                            <p>4. Masukkan PIN Anda dan klik <strong>CHECK TRANSACTION</strong> di bawah.</p>
                                        </>
                                    )}
                                    {selectedChannel === 'va' && (
                                        <>
                                            <p>1. Buka Mobile Banking / ATM bank yang Anda pilih.</p>
                                            <p>2. Pilih menu <strong>Transfer &gt; Virtual Account</strong>.</p>
                                            <p>3. Masukkan nomor VA: <strong className="font-mono text-slate-800">{activeVaNumber}</strong>.</p>
                                            <p>4. Masukkan nominal tagihan dan konfirmasi pembayaran.</p>
                                        </>
                                    )}
                                    {selectedChannel === 'ewallet' && (
                                        <>
                                            <p>1. Pastikan saldo e-wallet Anda mencukupi.</p>
                                            <p>2. Gunakan fitur scan QRIS pada aplikasi ShopeePay / OVO / Dana.</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 3. Bottom Button: CHECK TRANSACTION (Identical Dark Navy #002f6c Button) */}
                        <div className="mt-auto">
                            <button
                                type="button"
                                onClick={handleCheckTransaction}
                                disabled={checkingStatus}
                                className="w-full py-4 bg-[#002f6c] hover:bg-[#002352] text-white font-black text-sm tracking-widest uppercase text-center transition flex items-center justify-center space-x-2 disabled:opacity-75 cursor-pointer shadow-lg"
                            >
                                {checkingStatus ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        <span>CHECKING...</span>
                                    </>
                                ) : (
                                    <span>CHECK TRANSACTION</span>
                                )}
                            </button>

                            {/* Secondary Sandbox Helper (Effortless 1-Click Test Simulation) */}
                            <div className="bg-slate-100/90 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200">
                                <span>Mode Sandbox</span>
                                <button
                                    type="button"
                                    onClick={handleSimulasiLunas}
                                    disabled={simulating}
                                    className="font-bold text-sky-700 hover:text-sky-900 transition flex items-center space-x-1"
                                >
                                    <span>⚡ {simulating ? 'Memproses...' : 'Simulasi Lunas Instan'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
