import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { formatRupiah } from '@/Utils/format';
import {
    IconCheckCircle,
    IconSparkles,
    IconCreditCard,
    IconClock,
} from '@/Components/Icons';

export default function DummyPaymentSimulator({
    metodePembayaran = 'QRIS',
    totalBelanja = 0,
    onPaymentVerified,
    isVerified = false,
}) {
    // --- QRIS STATE ---
    const qrisPayload = `00020101021226580016ID.CO.QRIS.WWW01189360000000000000005204541153033605802ID5914TOKO KITA POS6008PONOROGO6304ABCD-TOTAL-${totalBelanja}`;

    // --- TRANSFER BANK STATE ---
    const bankList = [
        { id: 'bca', name: 'Bank BCA', code: '014', va: '8801 0812 3456 7890', color: 'border-blue-600 bg-blue-50/50' },
        { id: 'bri', name: 'Bank BRI', code: '002', va: '1280 0812 3456 7890', color: 'border-blue-700 bg-blue-50/50' },
        { id: 'mandiri', name: 'Bank Mandiri', code: '008', va: '8950 0812 3456 7890', color: 'border-amber-600 bg-amber-50/50' },
        { id: 'bni', name: 'Bank BNI', code: '009', va: '9880 0812 3456 7890', color: 'border-orange-600 bg-orange-50/50' },
    ];
    const [selectedBank, setSelectedBank] = useState(bankList[0]);
    const [copiedVA, setCopiedVA] = useState(false);
    const [copiedNominal, setCopiedNominal] = useState(false);

    // 15-minute countdown timer dummy
    const [secondsLeft, setSecondsLeft] = useState(15 * 60);

    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTimer = (totalSec) => {
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const copyToClipboard = (text, type) => {
        const clean = text.replace(/\s+/g, '');
        if (navigator.clipboard) {
            navigator.clipboard.writeText(clean);
        }
        if (type === 'va') {
            setCopiedVA(true);
            setTimeout(() => setCopiedVA(false), 2000);
        } else {
            setCopiedNominal(true);
            setTimeout(() => setCopiedNominal(false), 2000);
        }
    };

    // --- KARTU DEBIT STATE ---
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');

    const handleCardNumberChange = (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16);
        let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 3) {
            val = `${val.substring(0, 2)}/${val.substring(2, 4)}`;
        }
        setCardExpiry(val);
    };

    const getCardBrand = (num) => {
        const clean = num.replace(/\s+/g, '');
        if (clean.startsWith('4')) return 'VISA';
        if (clean.startsWith('5')) return 'Mastercard';
        return 'GPN DEBIT';
    };

    // Sound effect generator using Web Audio API
    const playSuccessChime = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, now); // D5
            osc.frequency.setValueAtTime(880, now + 0.12); // A5

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.45);
        } catch (e) {}
    };

    // Trigger simulation completion
    const handleSimulatePayment = (methodName, info = '') => {
        playSuccessChime();
        if (onPaymentVerified) {
            onPaymentVerified({
                method: methodName,
                info,
                nominal: totalBelanja,
                time: new Date().toLocaleTimeString('id-ID'),
            });
        }
    };

    const fillDemoDebit = () => {
        setCardNumber('4532 8819 2039 1234');
        setCardName('MUHAMMAD BUDI');
        setCardExpiry('12/28');
        setCardCvv('883');
    };

    return (
        <div className="space-y-4">
            {/* Success Notification Banner if Verified */}
            {isVerified && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md flex items-center justify-between animate-fadeIn">
                    <div className="flex items-center space-x-2.5">
                        <IconCheckCircle className="w-6 h-6 text-white shrink-0" />
                        <div>
                            <p className="font-black text-sm">
                                Pembayaran Berhasil Disimulasikan!
                            </p>
                            <p className="text-xs text-emerald-100 font-medium">
                                Tagihan {formatRupiah(totalBelanja)} telah lunas via {metodePembayaran}. Anda dapat langsung menyelesaikan checkout.
                            </p>
                        </div>
                    </div>
                    <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
                        LUNAS
                    </span>
                </div>
            )}

            {/* ========================================================================= */}
            {/* 1. DUMMY QRIS NATIONAL PAYMENT PANEL */}
            {/* ========================================================================= */}
            {metodePembayaran === 'QRIS' && (
                <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
                    {/* QRIS Header Sticker Style */}
                    <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="font-black text-lg tracking-widest text-white">
                                QR<span className="text-rose-500">IS</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-300 border-l border-slate-700 pl-2">
                                Pembayaran Digital Nasional
                            </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-black uppercase tracking-wider">
                            GPN
                        </span>
                    </div>

                    <div className="p-6 text-center space-y-4">
                        <div>
                            <h3 className="text-base font-black text-slate-950">
                                TOKO KITA OFFICIAL
                            </h3>
                            <p className="text-[11px] font-mono text-slate-500 font-bold">
                                NMID: ID1020261118991 • A01
                            </p>
                        </div>

                        {/* QR Code Container with Frame */}
                        <div className="relative inline-block p-4 bg-white rounded-2xl border-2 border-slate-300 shadow-md">
                            <QRCodeSVG
                                value={qrisPayload}
                                size={190}
                                level="M"
                                includeMargin={false}
                                className="mx-auto"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-9 h-9 rounded-xl bg-white p-1 shadow-md border border-slate-200 flex items-center justify-center font-black text-xs text-blue-700">
                                    🏪
                                </div>
                            </div>
                        </div>

                        {/* Nominal Tagihan */}
                        <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 max-w-sm mx-auto">
                            <span className="text-xs font-bold text-slate-600 block">Total Nominal Tagihan:</span>
                            <span className="text-2xl font-black text-blue-800 tracking-tight">
                                {formatRupiah(totalBelanja)}
                            </span>
                            <p className="text-[10.5px] text-slate-500 mt-0.5">
                                Bebas biaya admin • Berlaku untuk semua aplikasi e-wallet & m-banking
                            </p>
                        </div>

                        {/* Action: Simulasi Scan & Bayar Berhasil */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => handleSimulatePayment('QRIS', 'Scan QRIS Berhasil')}
                                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 mx-auto active:scale-95"
                            >
                                <IconSparkles className="w-4 h-4 text-cyan-200" />
                                <span>⚡ Klik: Simulasi Scan & Bayar Berhasil</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* 2. DUMMY TRANSFER BANK (VIRTUAL ACCOUNT) PANEL */}
            {/* ========================================================================= */}
            {metodePembayaran === 'Transfer Bank' && (
                <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                        <div>
                            <h3 className="text-sm font-black text-slate-950">
                                Virtual Account / Transfer Bank
                            </h3>
                            <p className="text-xs text-slate-500">
                                Pilih bank dan transfer sesuai nomor rekening virtual di bawah.
                            </p>
                        </div>

                        {/* Countdown Timer */}
                        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-black shrink-0 self-start sm:self-auto">
                            <IconClock className="w-3.5 h-3.5 text-amber-700" />
                            <span>Batas Waktu: {formatTimer(secondsLeft)}</span>
                        </div>
                    </div>

                    {/* Bank Selection Pills */}
                    <div>
                        <label className="block text-xs font-black text-slate-700 mb-2">
                            Pilih Bank Tujuan:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {bankList.map((b) => (
                                <button
                                    key={b.id}
                                    type="button"
                                    onClick={() => setSelectedBank(b)}
                                    className={`p-3 rounded-2xl border-2 text-center transition-all ${
                                        selectedBank.id === b.id
                                            ? 'border-blue-600 bg-blue-50 text-blue-950 font-black shadow-xs ring-2 ring-blue-500/20'
                                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold'
                                    }`}
                                >
                                    <span className="block text-xs">{b.name}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">Kode {b.code}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* VA Account Box */}
                    <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <span className="text-[11px] font-bold text-slate-500 block">
                                    Nomor Virtual Account ({selectedBank.name}):
                                </span>
                                <span className="text-xl sm:text-2xl font-black font-mono text-slate-950 tracking-wider">
                                    {selectedBank.va}
                                </span>
                                <span className="text-xs text-slate-600 block mt-0.5">
                                    a.n. <strong>PT TOKO KITA SEJAHTERA</strong>
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => copyToClipboard(selectedBank.va, 'va')}
                                className="px-4 py-2 bg-white hover:bg-slate-100 text-blue-800 text-xs font-black rounded-xl border-2 border-blue-200 shadow-2xs transition-all self-start sm:self-auto shrink-0"
                            >
                                {copiedVA ? 'Tersalin! ✅' : '📋 Salin Nomor'}
                            </button>
                        </div>

                        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-600">Total Nominal Ditransfer:</span>
                            <div className="flex items-center space-x-2">
                                <span className="font-black text-blue-800 text-base">
                                    {formatRupiah(totalBelanja)}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(String(totalBelanja), 'nominal')}
                                    className="text-[10px] font-bold text-blue-600 hover:underline"
                                >
                                    {copiedNominal ? 'Tersalin!' : 'Salin'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Simulation Button */}
                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={() => handleSimulatePayment('Transfer Bank', `Transfer via ${selectedBank.name}`)}
                            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 mx-auto active:scale-95"
                        >
                            <IconSparkles className="w-4 h-4 text-cyan-200" />
                            <span>⚡ Klik: Simulasi Transfer Berhasil & Cek Otomatis</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* 3. DUMMY KARTU DEBIT (VIRTUAL CARD & EDC SIMULATION) PANEL */}
            {/* ========================================================================= */}
            {metodePembayaran === 'Kartu Debit' && (
                <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="text-sm font-black text-slate-950">
                                Pembayaran Kartu Debit Online (Simulasi EDC)
                            </h3>
                            <p className="text-xs text-slate-500">
                                Masukkan rincian kartu debit Anda untuk simulasi otorisasi online.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={fillDemoDebit}
                            className="text-[11px] font-black text-blue-700 hover:underline bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
                        >
                            Isi Otomatis Kartu Demo
                        </button>
                    </div>

                    {/* Virtual Debit Card 3D-Like Graphic */}
                    <div className="max-w-sm mx-auto aspect-[1.586] w-full rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 text-white p-5 shadow-xl shadow-blue-900/20 flex flex-col justify-between border-2 border-blue-400/30 relative overflow-hidden">
                        {/* Card Glow Texture */}
                        <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />

                        {/* Top Card Bar */}
                        <div className="flex items-center justify-between relative z-10">
                            <span className="font-black text-xs tracking-wider text-blue-200 uppercase">
                                TOKO KITA DEBIT
                            </span>
                            <span className="font-mono text-xs font-bold text-white/80">
                                ONLINE EDC
                            </span>
                        </div>

                        {/* Chip & Contactless */}
                        <div className="flex items-center space-x-3 my-1 relative z-10">
                            <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-400 to-yellow-200 border border-amber-500/50 shadow-inner flex flex-col justify-around p-1">
                                <div className="h-0.5 bg-amber-600/60 rounded" />
                                <div className="h-0.5 bg-amber-600/60 rounded" />
                            </div>
                            <span className="text-base text-white/60 font-mono">📡</span>
                        </div>

                        {/* Live Card Number */}
                        <div className="relative z-10">
                            <p className="font-mono text-lg sm:text-xl font-black tracking-widest text-white drop-shadow-sm">
                                {cardNumber || '•••• •••• •••• ••••'}
                            </p>
                        </div>

                        {/* Bottom Card Info: Name, Expiry, Brand */}
                        <div className="flex items-end justify-between relative z-10 text-xs">
                            <div>
                                <span className="text-[9px] text-blue-200 uppercase font-semibold block">CARDHOLDER</span>
                                <span className="font-black tracking-wider uppercase truncate block max-w-[170px]">
                                    {cardName || 'NAMA PEMILIK'}
                                </span>
                            </div>

                            <div>
                                <span className="text-[9px] text-blue-200 uppercase font-semibold block">EXPIRES</span>
                                <span className="font-mono font-bold">
                                    {cardExpiry || 'MM/YY'}
                                </span>
                            </div>

                            <span className="font-black text-sm tracking-wider bg-white/10 px-2 py-0.5 rounded-md border border-white/20">
                                {getCardBrand(cardNumber)}
                            </span>
                        </div>
                    </div>

                    {/* Debit Card Form Inputs */}
                    <div className="space-y-3 pt-2">
                        <div>
                            <label className="block text-xs font-black text-slate-900 mb-1">
                                Nomor Kartu Debit (16 Digit)
                            </label>
                            <input
                                type="text"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                placeholder="4532 8819 2039 1234"
                                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-mono text-sm font-black text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                                maxLength={19}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-900 mb-1">
                                Nama Lengkap Pemilik Kartu
                            </label>
                            <input
                                type="text"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                placeholder="Contoh: MUHAMMAD BUDI"
                                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs uppercase"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-900 mb-1">
                                    Masa Berlaku (MM/YY)
                                </label>
                                <input
                                    type="text"
                                    value={cardExpiry}
                                    onChange={handleExpiryChange}
                                    placeholder="12/28"
                                    maxLength={5}
                                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-mono text-sm font-black text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-900 mb-1">
                                    Kode CVV (3 Digit)
                                </label>
                                <input
                                    type="password"
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                    placeholder="•••"
                                    maxLength={3}
                                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-mono text-sm font-black text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                                />
                            </div>
                        </div>

                        <div className="text-center pt-3">
                            <button
                                type="button"
                                onClick={() => handleSimulatePayment('Kartu Debit', `Debit ${getCardBrand(cardNumber)} (${cardNumber.slice(-4)})`)}
                                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 mx-auto active:scale-95"
                            >
                                <IconCreditCard className="w-4 h-4 text-cyan-200" />
                                <span>⚡ Proses Pembayaran Debit ({formatRupiah(totalBelanja)})</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
