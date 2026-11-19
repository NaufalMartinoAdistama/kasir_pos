import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { formatRupiah, formatTanggal } from '@/Utils/format';
import { playRfidSuccessBeep } from '@/Utils/sound';
import { IconCheckCircle, IconPrinter, IconX } from '@/Components/Icons';

export default function DuitkuPopModal({
    show = false,
    onClose,
    transaksi,
    customerName = '',
    isKasir = false,
    onSuccess,
}) {
    if (!show || !transaksi) return null;

    const [activeView, setActiveView] = useState('menu'); // 'menu' | 'qris' | 'va' | 'ewallet' | 'success'
    const [selectedBank, setSelectedBank] = useState('BCA');
    const [showDetail, setShowDetail] = useState(false);
    const [showHowToPay, setShowHowToPay] = useState(false);
    const [copiedText, setCopiedText] = useState('');
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [secondsLeft, setSecondsLeft] = useState(60 * 60);

    const isLunas = activeView === 'success' || transaksi.status_pesanan === 'Selesai' || transaksi.status_pesanan === 'Diproses';

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

    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopiedText(label);
        setToastMsg(`✓ ${label} berhasil disalin!`);
        setTimeout(() => {
            setCopiedText('');
            setToastMsg('');
        }, 3000);
    };

    const bankList = [
        { key: 'BCA', name: 'BCA Virtual Account', va: `80777${String(transaksi.id_transaksi).padStart(6, '0')}`, color: 'bg-blue-600' },
        { key: 'BRI', name: 'BRI Virtual Account', va: `88880${String(transaksi.id_transaksi).padStart(6, '0')}`, color: 'bg-blue-800' },
        { key: 'Mandiri', name: 'Mandiri Virtual Account', va: `89999${String(transaksi.id_transaksi).padStart(6, '0')}`, color: 'bg-amber-600' },
        { key: 'BNI', name: 'BNI Virtual Account', va: `82770${String(transaksi.id_transaksi).padStart(6, '0')}`, color: 'bg-orange-600' },
        { key: 'Permata', name: 'Permata Virtual Account', va: `85220${String(transaksi.id_transaksi).padStart(6, '0')}`, color: 'bg-emerald-600' },
    ];

    const currentBank = bankList.find((b) => b.key === selectedBank) || bankList[0];
    const activeVaNumber = currentBank.va;

    // Nama metode pembayaran spesifik sesuai pilihan Duitku
    const getSelectedMethodName = () => {
        if (activeView === 'qris') return 'QRIS';
        if (activeView === 'va') return `${selectedBank} Virtual Account`;
        if (activeView === 'ewallet') return 'ShopeePay';
        return 'QRIS';
    };

    // Trigger update status on server
    const handleConfirmPayment = async (channelCode = null) => {
        const targetMethod = channelCode || getSelectedMethodName();
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
                    payment_code: targetMethod,
                    metode_pembayaran: targetMethod,
                }),
            });

            const data = await res.json();
            if (res.ok && data.status === 'success') {
                playRfidSuccessBeep();
                setActiveView('success');
                if (onSuccess) {
                    onSuccess(transaksi, targetMethod);
                }
            } else {
                alert(data.message || 'Gagal memproses pembayaran.');
            }
        } catch (err) {
            alert('Terjadi kesalahan koneksi saat verifikasi pembayaran.');
        } finally {
            setSimulating(false);
        }
    };

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
                if (data.is_lunas) {
                    playRfidSuccessBeep();
                    setActiveView('success');
                    if (onSuccess) {
                        onSuccess(transaksi, data.metode_pembayaran || getSelectedMethodName());
                    }
                } else {
                    setToastMsg('ℹ Status: Belum ada pembayaran masuk dari pelanggan.');
                    setTimeout(() => setToastMsg(''), 4000);
                }
            }
        } catch (err) {
            alert('Gagal mengecek status pembayaran.');
        } finally {
            setCheckingStatus(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
            {/* Toast Notification inside Modal */}
            {toastMsg && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 bg-slate-900 text-white text-xs font-bold py-2 px-5 rounded-full shadow-2xl border border-sky-400 animate-pulse">
                    <span>{toastMsg}</span>
                </div>
            )}

            {/* Duitku POP Official Style Modal Card Container */}
            <div className="relative w-full max-w-[430px] bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col border border-slate-200">
                {/* 1. Header Bar */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center space-x-2.5">
                        {activeView !== 'menu' && activeView !== 'success' && (
                            <button
                                type="button"
                                onClick={() => setActiveView('menu')}
                                className="p-1 -ml-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
                                title="Kembali ke Pilihan Metode"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        <div>
                            <div className="flex items-center space-x-1.5">
                                <h3 className="font-bold text-slate-800 text-sm tracking-tight leading-none">MARTIN MART</h3>
                                <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                                    Duitku POP
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">Payment Gateway Sandbox</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {activeView === 'qris' && (
                            <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">
                                ShopeePay / QRIS
                            </span>
                        )}
                        {activeView === 'va' && (
                            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                                VA {selectedBank}
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                            title="Tutup Popup"
                        >
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* 2. Amount & Detail Bar */}
                {activeView !== 'success' && (
                    <div className="bg-white px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-baseline space-x-1">
                            <span className="text-xs font-semibold text-slate-500">Rp</span>
                            <span className="text-2xl font-black text-slate-900 tracking-tight">
                                {formatRupiah(transaksi.total_belanja).replace('Rp\u00a0', '')}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowDetail(!showDetail)}
                            className="text-xs font-semibold text-slate-700 hover:text-sky-600 flex items-center space-x-1 transition select-none cursor-pointer"
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
                )}

                {/* Dropdown Order Details */}
                {showDetail && activeView !== 'success' && (
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 text-xs space-y-1.5 animate-fadeIn">
                        <div className="flex justify-between text-slate-500">
                            <span>No. Invoice:</span>
                            <span className="font-mono font-bold text-slate-800">{transaksi.merchant_order_id}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Pelanggan:</span>
                            <span className="font-semibold text-slate-800">{customerName || 'Pelanggan'}</span>
                        </div>
                        {transaksi.diskon > 0 && (
                            <div className="flex justify-between text-emerald-700 font-semibold">
                                <span>Diskon Member:</span>
                                <span>{transaksi.diskon}% Diterapkan</span>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. BODY VIEW CONTENT */}

                {/* VIEW A: CHANNEL SELECTION MENU (Exact official Duitku POP interface) */}
                {activeView === 'menu' && (
                    <div className="p-4 space-y-2.5 max-h-[460px] overflow-y-auto">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Pilih Metode Pembayaran:
                        </span>

                        {/* Option 1: QRIS */}
                        <div
                            onClick={() => setActiveView('qris')}
                            className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 cursor-pointer transition flex items-center justify-between group shadow-2xs"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-black text-xs">
                                    QR
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-xs group-hover:text-blue-700 transition">
                                        QRIS (ShopeePay / GoPay / OVO / Dana)
                                    </h4>
                                    <div className="flex items-center space-x-1.5 mt-1 text-[9px] font-bold text-slate-500">
                                        <span className="px-1 py-0.2 bg-slate-100 rounded">GoPay</span>
                                        <span className="px-1 py-0.2 bg-slate-100 rounded">OVO</span>
                                        <span className="px-1 py-0.2 bg-slate-100 rounded">DANA</span>
                                        <span className="px-1 py-0.2 bg-slate-100 rounded">BCA Mobile</span>
                                    </div>
                                </div>
                            </div>
                            <span className="text-slate-400 group-hover:text-blue-600 font-bold text-sm">›</span>
                        </div>

                        {/* Option 2: Virtual Account (Bank Transfer) */}
                        <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                            <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center space-x-2.5">
                                    <span className="text-sm">🏦</span>
                                    <span className="font-bold text-slate-900 text-xs">Virtual Account (Bank Transfer)</span>
                                </div>
                                <span className="text-[10px] text-slate-400">Verifikasi Otomatis</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {bankList.map((bank) => (
                                    <div
                                        key={bank.key}
                                        onClick={() => {
                                            setSelectedBank(bank.key);
                                            setActiveView('va');
                                        }}
                                        className="p-3 px-4 hover:bg-blue-50/40 cursor-pointer transition flex items-center justify-between group"
                                    >
                                        <div className="flex items-center space-x-2.5">
                                            <span className={`w-2 h-2 rounded-full ${bank.color}`} />
                                            <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">
                                                {bank.name}
                                            </span>
                                        </div>
                                        <span className="text-slate-400 group-hover:text-blue-600 font-bold text-sm">›</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Option 3: E-Wallet */}
                        <div
                            onClick={() => setActiveView('ewallet')}
                            className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 cursor-pointer transition flex items-center justify-between group shadow-2xs"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                                    EW
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-xs group-hover:text-purple-700 transition">
                                        E-Wallet (ShopeePay, OVO, LinkAja)
                                    </h4>
                                    <p className="text-[10px] text-slate-500">Scan QRIS dari aplikasi dompet digital Anda</p>
                                </div>
                            </div>
                            <span className="text-slate-400 group-hover:text-purple-600 font-bold text-sm">›</span>
                        </div>
                    </div>
                )}

                {/* VIEW B: QRIS SCREEN (Exact match to Duitku official screenshot) */}
                {activeView === 'qris' && (
                    <div className="px-5 py-3 flex flex-col items-center text-center">
                        {/* Official QRIS Logo */}
                        <div className="mb-1">
                            <div className="font-black text-2xl tracking-widest text-slate-900 font-mono flex items-center justify-center space-x-1">
                                <span className="border-b-4 border-red-600 pb-0.5">Q</span>
                                <span>R</span>
                                <span>I</span>
                                <span>S</span>
                            </div>
                            <p className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">
                                Quick Response Code Indonesian Standard
                            </p>
                        </div>

                        {/* Scannable QR Code */}
                        <div className="p-3 bg-white rounded-xl border-2 border-slate-200 shadow-sm my-1 flex items-center justify-center">
                            <QRCodeSVG
                                value={qrisString}
                                size={190}
                                level="M"
                                includeMargin={false}
                            />
                        </div>

                        {/* NMID */}
                        <div className="text-xs font-mono font-semibold text-slate-500 my-0.5">
                            NMID : ID102002381928
                        </div>

                        {/* Logos Grid (OVO, GoPay, DANA, BCA, Mandiri, dll) */}
                        <div className="w-full pt-2 pb-1 border-t border-slate-100 mt-1">
                            <div className="flex items-center justify-center flex-wrap gap-1.5 text-[9px] font-bold text-slate-600">
                                <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">OVO</span>
                                <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">gopay</span>
                                <span className="px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200">DANA</span>
                                <span className="px-1.5 py-0.2 rounded bg-red-50 text-red-700 border border-red-200">LinkAja!</span>
                                <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">BCA</span>
                                <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">mandiripay</span>
                                <span className="px-1.5 py-0.2 rounded bg-orange-50 text-orange-700 border border-orange-200">BNI</span>
                            </div>
                        </div>

                        {/* How to pay Accordion */}
                        <div className="w-full border-t border-slate-100 pt-2 text-left">
                            <button
                                type="button"
                                onClick={() => setShowHowToPay(!showHowToPay)}
                                className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 transition"
                            >
                                <span>How to pay</span>
                                <svg
                                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showHowToPay ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {showHowToPay && (
                                <div className="mt-1.5 text-[11px] text-slate-600 space-y-1 pl-2 border-l-2 border-sky-500">
                                    <p>1. Buka aplikasi e-wallet (Shopee, GoPay, OVO, Dana) atau Mobile Banking.</p>
                                    <p>2. Pilih menu <strong>Scan / Bayar</strong>.</p>
                                    <p>3. Arahkan kamera ke kode QRIS di atas.</p>
                                    <p>4. Konfirmasi pembayaran dan klik <strong>CHECK TRANSACTION</strong>.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* VIEW C: VIRTUAL ACCOUNT SCREEN */}
                {activeView === 'va' && (
                    <div className="p-5 space-y-3">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-semibold">{selectedBank} Virtual Account:</span>
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
                                <span>Nama Akun:</span>
                                <span className="font-bold text-slate-800">MARTIN MART - {customerName || 'Pelanggan'}</span>
                            </div>
                        </div>

                        {/* How to pay Accordion */}
                        <div className="border-t border-slate-100 pt-2 text-left">
                            <button
                                type="button"
                                onClick={() => setShowHowToPay(!showHowToPay)}
                                className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 transition"
                            >
                                <span>Petunjuk Transfer Bank</span>
                                <svg
                                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showHowToPay ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {showHowToPay && (
                                <div className="mt-1.5 text-[11px] text-slate-600 space-y-1 pl-2 border-l-2 border-blue-500">
                                    <p>1. Buka Mobile Banking atau kunjungi ATM {selectedBank}.</p>
                                    <p>2. Pilih menu <strong>Transfer &gt; Virtual Account</strong>.</p>
                                    <p>3. Masukkan nomor VA: <strong className="font-mono">{activeVaNumber}</strong>.</p>
                                    <p>4. Masukkan nominal tagihan dan konfirmasi transfer.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* VIEW D: E-WALLET SCREEN */}
                {activeView === 'ewallet' && (
                    <div className="p-5 space-y-3">
                        <p className="text-xs text-slate-600">
                            Pembayaran E-Wallet (ShopeePay, OVO, Dana) menggunakan scan kode QRIS terintegrasi.
                        </p>
                        <button
                            type="button"
                            onClick={() => setActiveView('qris')}
                            className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-xl text-xs font-black shadow-md transition flex items-center justify-center space-x-2"
                        >
                            <span>Buka Kode QRIS ShopeePay / E-Wallet →</span>
                        </button>
                    </div>
                )}

                {/* VIEW E: SUCCESS / LUNAS SCREEN */}
                {activeView === 'success' && (
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
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full py-3 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition"
                            >
                                {isKasir ? 'Transaksi Baru' : 'Tutup'}
                            </button>
                        </div>
                    </div>
                )}

                {/* 4. BOTTOM BAR: The Dark Navy #002f6c Button (CHECK TRANSACTION) */}
                {activeView !== 'success' && (
                    <div className="mt-auto border-t border-slate-100">
                        {activeView === 'menu' ? (
                            <div className="p-3 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                                <span>Pilih salah satu metode pembayaran di atas.</span>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="font-bold text-slate-700 hover:text-slate-900"
                                >
                                    Batal
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handleCheckTransaction}
                                    disabled={checkingStatus}
                                    className="w-full py-4 bg-[#002f6c] hover:bg-[#002352] text-white font-black text-sm tracking-widest uppercase text-center transition flex items-center justify-center space-x-2 disabled:opacity-75 cursor-pointer shadow-md"
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

                                {/* 1-Click Instant Sandbox Confirmation */}
                                <div className="bg-slate-100 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200">
                                    <span>Mode Sandbox</span>
                                    <button
                                        type="button"
                                        onClick={() => handleConfirmPayment(getSelectedMethodName())}
                                        disabled={simulating}
                                        className="font-bold text-sky-700 hover:text-sky-900 transition flex items-center space-x-1 cursor-pointer"
                                    >
                                        <span>⚡ {simulating ? 'Memproses...' : `Simulasi Lunas (${getSelectedMethodName()})`}</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
