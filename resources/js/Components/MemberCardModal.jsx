import React from 'react';
import ModalDialog from '@/Components/ModalDialog';
import { IconPrinter, IconCheckCircle, IconIdCard } from '@/Components/Icons';
import Barcode from 'react-barcode';

export default function MemberCardModal({ show, onClose, pelanggan }) {
    if (!pelanggan) return null;

    const handlePrint = () => {
        window.print();
    };

    const memberId = `PLG-${String(pelanggan.id_pelanggan || 0).padStart(4, '0')}`;
    const rfidCode = pelanggan.kode_rfid || 'BELUM TERDAFTAR';
    const isRfidActive = !!pelanggan.kode_rfid;

    return (
        <ModalDialog
            show={show}
            onClose={onClose}
            title="Cetak Kartu Member Pelanggan"
            maxWidth="max-w-xl"
        >
            {/* Scoped Print Styles for CR80 Standard ID Card (85.6mm x 54mm) */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    .member-card-print-area, .member-card-print-area * {
                        visibility: visible !important;
                    }
                    .member-card-print-area {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 85.6mm !important;
                        height: 54mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border-radius: 4mm !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        overflow: hidden !important;
                    }
                    @page {
                        size: 85.6mm 54mm;
                        margin: 0;
                    }
                }
            `}</style>

            <div className="space-y-5 py-2">
                {/* Petunjuk Penggunaan */}
                <div className="flex items-center justify-between text-xs text-slate-500 bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-2">
                        <IconIdCard className="w-5 h-5 text-blue-600" />
                        <span>Format standar kartu member (CR80 / 85.6mm x 54mm) siap cetak</span>
                    </div>
                    <span className="font-bold text-blue-700">
                        {isRfidActive ? '✓ Terintegrasi RFID' : '⚠️ Belum Ada UID'}
                    </span>
                </div>

                {/* Tampilan Visual Kartu Member (Biru-Putih Elegan) */}
                <div className="flex justify-center p-2">
                    <div className="member-card-print-area w-[360px] h-[210px] rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-800 to-blue-600 text-white p-5 shadow-2xl relative overflow-hidden border border-blue-400/40 flex flex-col justify-between select-none">
                        {/* Background Decorative Rings */}
                        <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />
                        <div className="absolute -left-10 -top-10 w-36 h-36 rounded-full bg-white/10 blur-lg pointer-events-none" />

                        {/* Card Header: Store Logo & RFID Wave Indicator */}
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-lg bg-white text-blue-800 flex items-center justify-center font-black text-sm shadow-sm">
                                    N
                                </div>
                                <div>
                                    <h4 className="font-black text-sm tracking-tight leading-tight">
                                        MARTIN MART
                                    </h4>
                                    <p className="text-[8.5px] text-blue-200 font-medium tracking-widest uppercase">
                                        Priority Member Card
                                    </p>
                                </div>
                            </div>

                            {/* Contactless RFID Wave Graphic */}
                            <div className="flex items-center space-x-1.5 opacity-90">
                                <span className="text-[9px] font-mono tracking-wider text-blue-200">RFID</span>
                                <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.5 7.5a6 6 0 010 9m3.5-12a10 10 0 010 15m3.5-18a14 14 0 010 21" />
                                </svg>
                            </div>
                        </div>

                        {/* EMV Microchip Graphic */}
                        <div className="relative z-10 flex items-center justify-between my-auto">
                            <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-500/60 shadow-inner flex items-center justify-center p-1">
                                <div className="w-full h-full border border-amber-600/50 rounded-xs grid grid-cols-2 gap-0.5 opacity-70">
                                    <div className="border-r border-amber-600/50" />
                                    <div />
                                </div>
                            </div>

                            {/* Poin & Status Member Badge */}
                            <div className="text-right">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-white/20 border border-white/30 tracking-wider uppercase">
                                    {pelanggan.status_member || 'Member RFID'}
                                </span>
                                <p className="text-[10px] text-blue-200 font-bold mt-1">
                                    Poin: <strong className="text-white text-xs">{pelanggan.poin || 0}</strong>
                                </p>
                            </div>
                        </div>

                        {/* Card Footer: Nama Pelanggan, ID Member & UID RFID */}
                        <div className="relative z-10 pt-1">
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-[8.5px] uppercase tracking-wider text-blue-200 font-medium">
                                        Nama Pelanggan
                                    </div>
                                    <div className="font-extrabold text-sm tracking-wide uppercase line-clamp-1 text-white">
                                        {pelanggan.nama_pelanggan}
                                    </div>
                                    <div className="text-[9px] text-blue-100/90 font-mono">
                                        ID: {memberId} • {pelanggan.kota}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-[8px] uppercase tracking-wider text-blue-200 font-medium">
                                        RFID UID
                                    </div>
                                    <div className="font-mono text-[10.5px] font-black tracking-widest text-amber-300">
                                        {rfidCode}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barcode Code128 Pendukung di Bawah Kartu */}
                {pelanggan.kode_rfid && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-1">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                            Barcode Identitas Member
                        </span>
                        <div className="py-1">
                            <Barcode
                                value={pelanggan.kode_rfid}
                                format="CODE128"
                                width={1.4}
                                height={38}
                                displayValue={true}
                                fontSize={10}
                                margin={0}
                            />
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                        Tutup
                    </button>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-2 transition-transform active:scale-95"
                    >
                        <IconPrinter className="w-4 h-4" />
                        <span>Cetak Kartu Member</span>
                    </button>
                </div>
            </div>
        </ModalDialog>
    );
}
