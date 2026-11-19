import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { IconPrinter } from '@/Components/Icons';
import { formatRupiah } from '@/Utils/format';

export default function Struk({ transaksi, kasir_name = 'Kasir Operasional' }) {
    // State waktu real-time yang terus berdetik setiap detik
    const [liveTime, setLiveTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setLiveTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handlePrint = () => {
        window.print();
    };

    // Format Hari, Tanggal, dan Jam Real-Time (Bahasa Indonesia)
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const dayName = days[liveTime.getDay()];
    const dateNum = liveTime.getDate();
    const monthName = months[liveTime.getMonth()];
    const yearNum = liveTime.getFullYear();
    const hours = String(liveTime.getHours()).padStart(2, '0');
    const minutes = String(liveTime.getMinutes()).padStart(2, '0');
    const seconds = String(liveTime.getSeconds()).padStart(2, '0');

    // Kalkulasi subtotal kotor
    const rawSubtotal = transaksi.details?.reduce(
        (sum, item) => sum + (Number(item.subtotal) || (Number(item.jumlah) * Number(item.harga || 0))),
        0
    ) || Number(transaksi.total_belanja);

    // Ambil data pembayaran & diskon
    const totalBelanja = Number(transaksi.total_belanja) || 0;
    const diskonPersen = Number(transaksi.diskon) || (rawSubtotal > totalBelanja ? Math.round(((rawSubtotal - totalBelanja) / rawSubtotal) * 100) : 0);
    const diskonNominal = rawSubtotal > totalBelanja ? (rawSubtotal - totalBelanja) : (rawSubtotal * (diskonPersen / 100));

    const metodeBayar = transaksi.metode_pembayaran || 'Tunai';
    const nominalBayar = Number(transaksi.bayar) && Number(transaksi.bayar) > 0 ? Number(transaksi.bayar) : totalBelanja;
    const kembalian = Number(transaksi.kembalian) !== undefined && Number(transaksi.kembalian) !== null
        ? Number(transaksi.kembalian)
        : Math.max(0, nominalBayar - totalBelanja);

    return (
        <div className="struk-page-wrapper min-h-screen bg-slate-100 py-6 px-4 flex flex-col items-center justify-start font-mono print:min-h-0 print:h-auto print:py-0 print:px-0 print:m-0 print:bg-white print:block">
            <Head title={`Struk #TRX-${String(transaksi.id_transaksi).padStart(5, '0')} - MARTIN MART`} />

            {/* Injected Print Stylesheet: Format Thermal Paper Mepet Atas & Pas Isi (Tanpa Sisa Kertas Kosong) */}
            <style>{`
                @page {
                    size: 76mm auto;
                    margin: 0mm !important;
                }

                @media print {
                    *, *:before, *:after {
                        box-sizing: border-box !important;
                    }

                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        height: auto !important;
                        min-height: 0 !important;
                        width: 76mm !important;
                        background: #ffffff !important;
                        font-family: 'Courier New', Courier, monospace !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .struk-page-wrapper {
                        display: block !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        height: auto !important;
                        min-height: 0 !important;
                        background: #ffffff !important;
                        width: 76mm !important;
                    }

                    .struk-card {
                        display: block !important;
                        margin: 0 !important;
                        padding: 2mm 3mm !important;
                        box-shadow: none !important;
                        border: none !important;
                        border-radius: 0 !important;
                        background: #ffffff !important;
                        width: 76mm !important;
                        max-width: 76mm !important;
                        font-family: 'Courier New', Courier, monospace !important;
                        font-size: 11px !important;
                        line-height: 1.25 !important;
                        color: #000000 !important;
                        page-break-after: avoid !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }

                    .print-hidden,
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Action Bar (Hanya tampil di layar, tersembunyi saat dicetak) */}
            <div className="w-full max-w-[340px] mb-4 flex items-center justify-between gap-2 print-hidden no-print font-sans">
                <Link
                    href={route('kasir.pos')}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-white px-3.5 py-2 rounded-xl shadow-xs border border-slate-200 transition-colors"
                >
                    <span>← Kembali ke Kasir</span>
                </Link>

                <button
                    onClick={handlePrint}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                    <IconPrinter className="w-4 h-4" />
                    <span>Cetak Struk</span>
                </button>
            </div>

            {/* Lembar Struk Kasir Otentik (Format Thermal Roll) */}
            <div
                className="struk-card bg-white p-5 shadow-xl rounded-2xl border border-slate-200 text-black text-xs font-mono transition-all w-full max-w-[340px]"
                style={{
                    fontFamily: "'Courier New', Courier, monospace",
                }}
            >
                {/* Header Toko */}
                <div className="text-center pb-2.5">
                    <h2 className="font-extrabold tracking-tight uppercase text-base text-black">
                        MARTIN MART
                    </h2>
                    <p className="text-[11px] text-slate-700 mt-0.5">
                        Supermarket & Ritel Modern
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                        Jl. Raya Niaga No. 45 - Madiun
                    </p>
                    <p className="text-[10px] text-slate-600">
                        Telp: 0812-3456-7890
                    </p>
                </div>

                {/* Garis Pembatas */}
                <div className="border-b border-dashed border-black/80 my-2" />

                {/* Informasi Transaksi, Pelanggan, dan Hari/Tanggal/Jam Real-Time */}
                <div className="space-y-1 text-[11px] text-black">
                    <div className="flex justify-between">
                        <span>No. Faktur :</span>
                        <span className="font-bold">#TRX-{String(transaksi.id_transaksi).padStart(5, '0')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Hari       :</span>
                        <span className="font-bold">{dayName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tanggal    :</span>
                        <span>{dateNum} {monthName} {yearNum}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Jam (Waktu):</span>
                        <span className="font-bold font-mono text-black">{hours}:{minutes}:{seconds} WIB</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Kasir      :</span>
                        <span>{kasir_name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Pelanggan  :</span>
                        <span className="font-bold">{transaksi.pelanggan?.nama_pelanggan || 'Pelanggan Umum'}</span>
                    </div>
                    {transaksi.pelanggan?.kota && (
                        <div className="flex justify-between text-[10px] text-slate-700">
                            <span>Kota       :</span>
                            <span>{transaksi.pelanggan.kota}</span>
                        </div>
                    )}
                </div>

                {/* Garis Pembatas */}
                <div className="border-b border-dashed border-black/80 my-2" />

                {/* Rincian Produk Belanja */}
                <div className="space-y-2 text-[11px] text-black">
                    {transaksi.details?.map((detail) => (
                        <div key={detail.id_detail} className="space-y-0.5">
                            <div className="font-bold">
                                {detail.jumlah}x {detail.produk?.nama_produk || detail.nama_produk || 'Produk'}
                            </div>
                            <div className="flex justify-between text-slate-800 pl-4 text-[10.5px]">
                                <span>à {formatRupiah(detail.produk?.harga || detail.harga || 0)}</span>
                                <span className="font-bold">
                                    {formatRupiah(detail.subtotal || (detail.jumlah * (detail.harga || 0)))}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Garis Pembatas */}
                <div className="border-b border-dashed border-black/80 my-2" />

                {/* Rekap Subtotal, Diskon, dan Total Akhir (Diskon selalu ditampilkan jelas) */}
                <div className="space-y-1 text-[11px] text-black">
                    <div className="flex justify-between text-slate-800">
                        <span>Subtotal Kotor</span>
                        <span>{formatRupiah(rawSubtotal)}</span>
                    </div>

                    <div className="flex justify-between font-bold">
                        <span>Diskon ({diskonPersen}%)</span>
                        <span className={diskonNominal > 0 ? 'text-black' : 'text-slate-500'}>
                            {diskonNominal > 0 ? `- ${formatRupiah(diskonNominal)}` : 'Rp 0'}
                        </span>
                    </div>

                    <div className="border-b border-dotted border-black/50 my-1" />

                    <div className="flex justify-between items-baseline font-black text-sm pt-0.5 pb-1">
                        <span>TOTAL BAYAR:</span>
                        <span className="text-base font-extrabold">{formatRupiah(totalBelanja)}</span>
                    </div>
                </div>

                {/* Garis Pembatas */}
                <div className="border-b border-dashed border-black/80 my-2" />

                {/* Rincian Metode Pembayaran & Kembalian */}
                <div className="space-y-1 text-[11px] text-black">
                    <div className="flex justify-between">
                        <span>Metode Bayar</span>
                        <span className="font-bold uppercase">{metodeBayar}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Bayar ({metodeBayar})</span>
                        <span className="font-bold">{formatRupiah(nominalBayar)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold pt-0.5">
                        <span>KEMBALIAN</span>
                        <span className="text-xs font-black">{formatRupiah(kembalian)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-700 pt-0.5">
                        <span>Status</span>
                        <span className="font-bold">LUNAS</span>
                    </div>
                </div>

                {/* Garis Pembatas */}
                <div className="border-b border-dashed border-black/80 my-2" />

                {/* Footer Struk */}
                <div className="pt-2 text-center text-[10px] text-black/80 space-y-1 leading-tight">
                    <p className="font-bold tracking-wider">
                        *** TERIMA KASIH ATAS KUNJUNGAN ANDA ***
                    </p>
                    <p className="text-[9px]">
                        Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan tanpa struk resmi.
                    </p>
                    <p className="pt-1 text-[8.5px] text-slate-500">
                        Dicetak oleh Sistem MARTIN MART POS
                    </p>
                </div>
            </div>
        </div>
    );
}
