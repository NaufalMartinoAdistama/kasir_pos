import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Barcode from 'react-barcode';
import {
    IconBarcode,
    IconPrinter,
    IconSearch,
    IconCheckCircle,
} from '@/Components/Icons';
import { formatRupiah } from '@/Utils/format';

export default function CetakLabel({
    produk_list = [],
    kategori_list = [],
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedKategori, setSelectedKategori] = useState(filters.id_kategori || '');

    // State kuantitas salinan label untuk setiap produk: { [id_produk]: jumlahCopies }
    const [selectedItems, setSelectedItems] = useState(() => {
        const initial = {};
        // Default pilih 3 produk pertama dengan 5 salinan masing-masing
        produk_list.slice(0, 3).forEach((p) => {
            initial[p.id_produk] = 5;
        });
        return initial;
    });

    // Filter produk yang ada di list
    const filteredProducts = useMemo(() => {
        return produk_list.filter((p) => {
            const matchSearch = !search.trim() ||
                p.nama_produk.toLowerCase().includes(search.toLowerCase()) ||
                (p.kode_barcode && p.kode_barcode.toLowerCase().includes(search.toLowerCase()));

            const matchKategori = !selectedKategori || String(p.id_kategori) === String(selectedKategori);

            return matchSearch && matchKategori;
        });
    }, [produk_list, search, selectedKategori]);

    // Toggle pilih satu produk
    const handleToggleProduct = (id_produk, defaultCopies = 5) => {
        setSelectedItems((prev) => {
            const next = { ...prev };
            if (next[id_produk] !== undefined) {
                delete next[id_produk];
            } else {
                next[id_produk] = defaultCopies;
            }
            return next;
        });
    };

    // Update jumlah salinan label untuk produk tertentu
    const handleUpdateCopies = (id_produk, count) => {
        const val = Math.max(1, Math.min(100, parseInt(count) || 1));
        setSelectedItems((prev) => ({
            ...prev,
            [id_produk]: val,
        }));
    };

    // Pilih Semua Produk yang terfilter
    const handleSelectAll = (copies = 5) => {
        const next = { ...selectedItems };
        filteredProducts.forEach((p) => {
            next[p.id_produk] = copies;
        });
        setSelectedItems(next);
    };

    // Kosongkan Pilihan
    const handleClearAll = () => {
        setSelectedItems({});
    };

    // Susun array kartu label yang akan dicetak berdasarkan salinan
    const printQueue = useMemo(() => {
        const queue = [];
        Object.entries(selectedItems).forEach(([id, count]) => {
            const product = produk_list.find((p) => String(p.id_produk) === String(id));
            if (product && count > 0) {
                for (let i = 0; i < count; i++) {
                    queue.push({
                        ...product,
                        labelIndex: i + 1,
                        totalCopies: count,
                    });
                }
            }
        });
        return queue;
    }, [selectedItems, produk_list]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                    <div>
                        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                            Cetak Label Barcode Produk (Stiker POS)
                        </h1>
                        <p className="text-xs font-semibold text-slate-600 mt-0.5">
                            Pilih produk dan tentukan jumlah salinan stiker barcode Code128 siap tempel pada kemasan barang
                        </p>
                    </div>

                    <div className="flex items-center space-x-2.5">
                        <Link
                            href={route('admin.produk.index')}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black border border-slate-300 transition-colors"
                        >
                            ← Kembali ke Produk
                        </Link>
                        <button
                            type="button"
                            onClick={handlePrint}
                            disabled={printQueue.length === 0}
                            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
                        >
                            <IconPrinter className="w-4 h-4" />
                            <span>Cetak {printQueue.length} Label Sekarang</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Cetak Label Barcode - MARTIN MART" />

            {/* Injected Print Stylesheet for Barcode Sticker Grid */}
            <style>{`
                @media print {
                    /* Sembunyikan semua elemen layout standar kecuali area cetak label */
                    header, aside, .no-print, .print-hidden {
                        display: none !important;
                    }
                    body, html {
                        background: #ffffff !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        color: #000000 !important;
                    }
                    .print-label-container {
                        display: grid !important;
                        grid-template-columns: repeat(3, 1fr) !important;
                        gap: 3mm !important;
                        padding: 4mm !important;
                        width: 100% !important;
                    }
                    .barcode-sticker-card {
                        box-shadow: none !important;
                        border: 1px dashed #666666 !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        padding: 3mm !important;
                        width: 100% !important;
                        height: auto !important;
                        background: #ffffff !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 5mm;
                    }
                }
            `}</style>

            <div className="space-y-6">
                {/* PANEL ATAS: Kontrol Pemilihan Produk & Jumlah Salinan (Hanya Tampil di Layar) */}
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-xs space-y-4 no-print">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3 flex-1">
                            {/* Pencarian Produk */}
                            <div className="relative flex-1 min-w-[240px]">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama produk / kode barcode..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                                />
                                <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                            </div>

                            {/* Filter Kategori */}
                            <select
                                value={selectedKategori}
                                onChange={(e) => setSelectedKategori(e.target.value)}
                                className="py-2.5 px-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                            >
                                <option value="">Semua Kategori</option>
                                {kategori_list.map((kat) => (
                                    <option key={kat.id_kategori} value={kat.id_kategori}>
                                        {kat.nama_kategori}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tombol Aksi Cepat Preset Salinan */}
                        <div className="flex items-center space-x-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => handleSelectAll(5)}
                                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl text-xs font-black transition-colors border border-blue-300 shadow-2xs"
                            >
                                Pilih Semua (5 Stiker)
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSelectAll(10)}
                                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl text-xs font-black transition-colors border border-blue-300 shadow-2xs"
                            >
                                Pilih Semua (10 Stiker)
                            </button>
                            {Object.keys(selectedItems).length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleClearAll}
                                    className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-black border border-slate-300 transition-colors"
                                >
                                    Kosongkan Pilihan
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Ringkasan Produk Terpilih */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border-2 border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2.5">
                            <span className="font-bold text-slate-800">
                                Produk Terpilih: <strong className="text-blue-900 font-black text-sm">{Object.keys(selectedItems).length}</strong> jenis
                            </span>
                            <span className="text-slate-400 font-black">•</span>
                            <span className="font-bold text-slate-800">
                                Total Stiker Siap Cetak: <strong className="text-emerald-900 font-black text-sm">{printQueue.length}</strong> lembar
                            </span>
                        </div>

                        <span className="text-[11px] text-slate-600 font-bold">
                            💡 Format barcode otomatis disesuaikan dengan standar scanner Code128.
                        </span>
                    </div>

                    {/* Horizontal Scroller Pemilihan Produk Cepat */}
                    <div className="max-h-[220px] overflow-y-auto border border-slate-200 rounded-xl p-3 bg-white space-y-2">
                        {filteredProducts.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-4">
                                Tidak ada produk yang sesuai dengan filter pencarian.
                            </p>
                        ) : (
                            filteredProducts.map((p) => {
                                const isSelected = selectedItems[p.id_produk] !== undefined;
                                const copies = selectedItems[p.id_produk] || 5;
                                const barcodeCode = p.kode_barcode || `PRD-${String(p.id_produk).padStart(4, '0')}`;

                                return (
                                    <div
                                        key={p.id_produk}
                                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                                            isSelected
                                                ? 'bg-blue-50/70 border-blue-300'
                                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleToggleProduct(p.id_produk, 5)}
                                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <div>
                                                <h5 className="text-xs font-bold text-slate-900 leading-tight">
                                                    {p.nama_produk}
                                                </h5>
                                                <div className="flex items-center space-x-2 text-[10.5px] text-slate-500 mt-0.5">
                                                    <span>{formatRupiah(p.harga)}</span>
                                                    <span>•</span>
                                                    <span className="font-mono text-blue-700 font-bold">
                                                        {barcodeCode}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div className="flex items-center space-x-2">
                                                <span className="text-[11px] text-slate-500 font-medium">
                                                    Jumlah Stiker:
                                                </span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    value={copies}
                                                    onChange={(e) => handleUpdateCopies(p.id_produk, e.target.value)}
                                                    className="w-16 text-center py-1 px-2 border border-blue-300 rounded-lg text-xs font-bold text-blue-900 bg-white shadow-2xs"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* PRATINJAU LEMBAR CETAK STIKER LABEL BARCODE (Grid Layout) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 no-print">
                        <div className="flex items-center space-x-2">
                            <IconBarcode className="w-5 h-5 text-blue-600" />
                            <h3 className="text-base font-bold text-slate-800">
                                Pratinjau Lembar Stiker Barcode ({printQueue.length} Label)
                            </h3>
                        </div>

                        <button
                            type="button"
                            onClick={handlePrint}
                            disabled={printQueue.length === 0}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-transform active:scale-95"
                        >
                            <IconPrinter className="w-4 h-4" />
                            <span>Cetak Sekarang</span>
                        </button>
                    </div>

                    {printQueue.length === 0 ? (
                        <div className="py-16 text-center text-slate-400 border border-dashed border-slate-300 rounded-2xl">
                            <IconBarcode className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-slate-600">
                                Belum ada label produk yang dipilih untuk dicetak.
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Centang produk pada daftar di atas untuk menambahkan salinan stiker barcode.
                            </p>
                        </div>
                    ) : (
                        <div className="print-label-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2 bg-slate-50/50 rounded-xl">
                            {printQueue.map((item, idx) => {
                                const barcodeValue = item.kode_barcode || `PRD-${String(item.id_produk).padStart(4, '0')}`;

                                return (
                                    <div
                                        key={`${item.id_produk}-${item.labelIndex}-${idx}`}
                                        className="barcode-sticker-card bg-white p-3.5 rounded-xl border-2 border-slate-300 shadow-2xs flex flex-col justify-between items-center text-center space-y-1 relative"
                                    >
                                        {/* Header Toko */}
                                        <div className="w-full flex items-center justify-between border-b border-slate-200 pb-1">
                                            <span className="text-[10px] font-black text-slate-950 tracking-wider uppercase">
                                                MARTIN MART
                                            </span>
                                            <span className="text-[8.5px] font-bold text-slate-500 uppercase">
                                                Label #{item.labelIndex}/{item.totalCopies}
                                            </span>
                                        </div>

                                        {/* Nama Produk */}
                                        <h6 className="font-black text-xs text-slate-950 leading-tight line-clamp-2 w-full pt-0.5">
                                            {item.nama_produk}
                                        </h6>

                                        {/* Harga Produk */}
                                        <div className="text-base font-black text-blue-900 tracking-tight">
                                            {formatRupiah(item.harga)}
                                        </div>

                                        {/* Barcode Code128 Rendered with SVG */}
                                        <div className="py-1 w-full flex items-center justify-center overflow-hidden">
                                            <Barcode
                                                value={barcodeValue}
                                                format="CODE128"
                                                width={1.25}
                                                height={40}
                                                fontSize={10}
                                                displayValue={true}
                                                margin={0}
                                            />
                                        </div>

                                        {/* Footer Kategori */}
                                        <div className="text-[9px] font-bold text-slate-600 w-full text-center">
                                            {item.kategori?.nama_kategori || 'Produk Retail'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
