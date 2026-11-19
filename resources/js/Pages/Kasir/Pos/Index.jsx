import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ModalDialog from '@/Components/ModalDialog';
import CameraScannerModal from '@/Components/CameraScannerModal';
import RealtimeClock from '@/Components/RealtimeClock';
import {
    IconPos,
    IconPrinter,
    IconSearch,
    IconPlus,
    IconCheckCircle,
    IconExclamation,
    IconTrash,
    IconCart,
    IconBarcode,
    IconCamera,
    IconRfid,
    IconIdCard,
} from '@/Components/Icons';
import { formatRupiah } from '@/Utils/format';
import { playBeep, playRfidSuccessBeep, playErrorBeep } from '@/Utils/sound';
import DummyPaymentSimulator from '@/Components/DummyPaymentSimulator';
import DuitkuPopModal from '@/Components/DuitkuPopModal';
import { QRCodeSVG } from 'qrcode.react';

export default function PosIndex({
    pelanggan_list = [],
    produk_list = [],
    last_transaksi_id = null,
}) {
    // Form Transaksi Multi-Item
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        id_pelanggan: pelanggan_list[0]?.id_pelanggan || '',
        items: [], // Array: { id_produk, nama_produk, harga, stok, jumlah, subtotal }
        diskon: 0,
        metode_pembayaran: 'Tunai',
        bayar: '',
    });

    const [isPosSimulasiLunas, setIsPosSimulasiLunas] = useState(false);
    const [duitkuSuccessTrx, setDuitkuSuccessTrx] = useState(null);
    const [duitkuLoading, setDuitkuLoading] = useState(false);
    const [lastSuccessData, setLastSuccessData] = useState(null);
    const [duitkuModalData, setDuitkuModalData] = useState(null);
    const [showDuitkuModal, setShowDuitkuModal] = useState(false);
    const [duitkuModalTab, setDuitkuModalTab] = useState('qris');
    const [simulatingLunas, setSimulatingLunas] = useState(false);

    // Form Tambah Cepat Pelanggan Baru
    const customerForm = useForm({
        nama_pelanggan: '',
        kota: '',
        kode_rfid: '',
    });

    const { flash } = usePage().props;
    const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
    const [selectedProductSearch, setSelectedProductSearch] = useState('');
    const [selectedKategori, setSelectedKategori] = useState('');
    const [successModalOpen, setSuccessModalOpen] = useState(!!last_transaksi_id);
    const [stockAlert, setStockAlert] = useState(null);

    // Hardware Integration State
    const [cameraModalOpen, setCameraModalOpen] = useState(false);
    const [rfidMemberInput, setRfidMemberInput] = useState('');
    const [lastScanToast, setLastScanToast] = useState(null);

    const barcodeInputRef = useRef(null);
    const rfidInputRef = useRef(null);

    // Pelanggan Aktif yang Terpilih
    const activeCustomer = useMemo(() => {
        return pelanggan_list.find((pel) => String(pel.id_pelanggan) === String(data.id_pelanggan));
    }, [data.id_pelanggan, pelanggan_list]);

    // Hitung total produk stok habis
    const outOfStockCount = useMemo(() => {
        return produk_list.filter((p) => Number(p.stok) <= 0).length;
    }, [produk_list]);

    // Ambil daftar kategori unik dari produk_list
    const kategoriList = useMemo(() => {
        const map = new Map();
        produk_list.forEach((p) => {
            if (p.kategori?.id_kategori && !map.has(p.kategori.id_kategori)) {
                map.set(p.kategori.id_kategori, p.kategori.nama_kategori);
            }
        });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [produk_list]);

    // Filter katalog produk (pencarian teks & filter kategori)
    const filteredProducts = useMemo(() => {
        return produk_list.filter((p) => {
            const matchSearch = !selectedProductSearch.trim() ||
                p.nama_produk.toLowerCase().includes(selectedProductSearch.toLowerCase()) ||
                p.kategori?.nama_kategori?.toLowerCase().includes(selectedProductSearch.toLowerCase());

            const matchKategori = !selectedKategori || String(p.id_kategori) === String(selectedKategori);

            return matchSearch && matchKategori;
        });
    }, [produk_list, selectedProductSearch, selectedKategori]);

    // Tambah Produk ke Keranjang (Multi-Item)
    const handleAddToCart = (product) => {
        if (!product) return;

        // Validasi jika stok habis (stok <= 0)
        if (Number(product.stok) <= 0) {
            setStockAlert({
                title: 'Stok Produk Habis!',
                message: `Maaf, stok untuk produk "${product.nama_produk}" saat ini kosong (0 unit). Produk tidak dapat ditambahkan ke keranjang belanja kasir.`,
                product: product,
            });
            return;
        }

        const existingIndex = data.items.findIndex((item) => item.id_produk === product.id_produk);

        if (existingIndex > -1) {
            // Jika sudah ada di keranjang, tambah jumlahnya
            const currentItem = data.items[existingIndex];
            if (currentItem.jumlah >= product.stok) {
                setStockAlert({
                    title: 'Batas Stok Maksimum Tercapai!',
                    message: `Jumlah produk "${product.nama_produk}" di keranjang kasir sudah mencapai sisa stok maksimum yang tersedia (${product.stok} unit). Tidak dapat menambah lebih banyak.`,
                    product: product,
                });
                return;
            }

            const updatedItems = [...data.items];
            const newJumlah = currentItem.jumlah + 1;
            updatedItems[existingIndex] = {
                ...currentItem,
                jumlah: newJumlah,
                subtotal: newJumlah * currentItem.harga,
            };
            setData('items', updatedItems);
        } else {
            // Produk baru masuk ke keranjang
            const newItem = {
                id_produk: product.id_produk,
                nama_produk: product.nama_produk,
                harga: Number(product.harga),
                stok: product.stok,
                jumlah: 1,
                subtotal: Number(product.harga),
            };
            setData('items', [...data.items, newItem]);
        }
    };

    // Eksekusi Pencarian & Penambahan Produk via Scan Barcode (USB Scanner / Kamera)
    const processBarcodeScan = (rawCode) => {
        const code = rawCode?.trim();
        if (!code) return;

        // Cocokkan kode barcode, ID produk, atau nama produk
        const matched = produk_list.find((p) =>
            (p.kode_barcode && p.kode_barcode.toLowerCase() === code.toLowerCase()) ||
            String(p.id_produk) === code ||
            p.nama_produk.toLowerCase() === code.toLowerCase()
        ) || (filteredProducts.length === 1 ? filteredProducts[0] : null);

        if (matched) {
            playBeep();
            handleAddToCart(matched);
            setSelectedProductSearch('');
            setLastScanToast(`✓ Produk ditambahkan: ${matched.nama_produk}`);
            setTimeout(() => setLastScanToast(null), 3000);
            barcodeInputRef.current?.focus();
        } else {
            playErrorBeep();
            setStockAlert({
                title: 'Barcode Tidak Ditemukan!',
                message: `Produk dengan kode barcode atau SKU "${code}" tidak ditemukan di database MARTIN MART. Silakan cek label stiker atau cari manual pada katalog.`,
            });
            setSelectedProductSearch('');
            barcodeInputRef.current?.focus();
        }
    };

    // Eksekusi Deteksi Kartu Member RFID (USB Keyboard Wedge HID)
    const processRfidTap = (rawUid) => {
        const uid = rawUid?.trim();
        if (!uid) return;

        const matched = pelanggan_list.find((pel) =>
            (pel.kode_rfid && pel.kode_rfid.toLowerCase() === uid.toLowerCase()) ||
            String(pel.id_pelanggan) === uid
        );

        if (matched) {
            playRfidSuccessBeep();
            setData((prev) => ({
                ...prev,
                id_pelanggan: matched.id_pelanggan,
                diskon: prev.diskon > 0 ? prev.diskon : 5, // Otomatis diskon member 5%
            }));
            setLastScanToast(`✓ Member RFID Terverifikasi: ${matched.nama_pelanggan}`);
            setTimeout(() => setLastScanToast(null), 4000);
            setRfidMemberInput('');
        } else {
            playErrorBeep();
            setStockAlert({
                title: 'Kartu RFID Belum Terdaftar!',
                message: `Kartu RFID dengan nomor UID "${uid}" belum terdaftar pada sistem MARTIN MART. Silakan daftarkan pelanggan baru terlebih dahulu di menu Data Pelanggan.`,
            });
            setRfidMemberInput('');
        }
    };

    // Ubah Jumlah Item di Keranjang
    const handleUpdateQuantity = (id_produk, newQty) => {
        const targetProduct = produk_list.find((p) => p.id_produk === id_produk);
        const maxStok = targetProduct ? targetProduct.stok : 9999;

        if (newQty <= 0) {
            handleRemoveItem(id_produk);
            return;
        }

        if (newQty > maxStok) {
            setStockAlert({
                title: 'Batas Stok Terlampaui!',
                message: `Jumlah pembelian tidak dapat melebihi stok yang tersedia (${maxStok} unit) untuk produk "${targetProduct?.nama_produk || 'ini'}".`,
                product: targetProduct,
            });
        }

        const cappedQty = Math.min(newQty, maxStok);
        const updatedItems = data.items.map((item) => {
            if (item.id_produk === id_produk) {
                return {
                    ...item,
                    jumlah: cappedQty,
                    subtotal: cappedQty * item.harga,
                };
            }
            return item;
        });

        setData('items', updatedItems);
    };

    // Hapus 1 Item dari Keranjang
    const handleRemoveItem = (id_produk) => {
        setData('items', data.items.filter((item) => item.id_produk !== id_produk));
    };

    // Kosongkan Seluruh Keranjang
    const handleClearCart = () => {
        setData('items', []);
    };

    // Kalkulasi Total Belanja, Diskon, Bayar, dan Kembalian Real-Time
    const calculations = useMemo(() => {
        const totalItemsCount = data.items.reduce((sum, item) => sum + item.jumlah, 0);
        const subtotalKotor = data.items.reduce((sum, item) => sum + item.subtotal, 0);
        const diskonPersen = Math.min(Math.max(Number(data.diskon) || 0, 0), 100);

        const nilaiDiskon = subtotalKotor * (diskonPersen / 100);
        const totalBersih = Math.max(0, subtotalKotor - nilaiDiskon);

        const bayarNominal = data.bayar === '' ? totalBersih : (Number(data.bayar) || 0);
        const kembalian = Math.max(0, bayarNominal - totalBersih);
        const kurangBayar = bayarNominal < totalBersih ? totalBersih - bayarNominal : 0;

        return {
            totalItemsCount,
            subtotalKotor,
            diskonPersen,
            nilaiDiskon,
            totalBersih,
            bayarNominal,
            kembalian,
            kurangBayar,
        };
    }, [data.items, data.diskon, data.bayar]);

    // Submit Transaksi Tunai Kasir
    const handleProcessTransaction = (e) => {
        e.preventDefault();
        if (data.items.length === 0) {
            alert('Keranjang belanja masih kosong! Silakan pilih produk terlebih dahulu.');
            return;
        }

        setLastSuccessData({
            id_transaksi: null,
            total_belanja: calculations.totalBersih,
            total_items: calculations.totalItemsCount,
            metode_pembayaran: 'Tunai',
            bayar: calculations.bayarNominal,
            kembalian: calculations.kembalian,
        });

        post(route('kasir.pos.proses'), {
            onSuccess: () => {
                setSuccessModalOpen(true);
            },
        });
    };

    // Update status transaksi setelah pembayaran Duitku berhasil
    const handleDuitkuSuccess = async (resData, paymentCode = 'QRIS') => {
        const finalMethod = paymentCode || 'QRIS';
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
                    payment_code: finalMethod,
                    metode_pembayaran: finalMethod,
                }),
            });

            setLastSuccessData({
                id_transaksi: resData.id_transaksi,
                total_belanja: resData.total_belanja || calculations.totalBersih,
                total_items: data.items.reduce((acc, curr) => acc + Number(curr.jumlah || 1), 0),
                metode_pembayaran: finalMethod,
                bayar: resData.total_belanja || calculations.totalBersih,
                kembalian: 0,
            });

            playRfidSuccessBeep();
            setShowDuitkuModal(false);
            setDuitkuModalData(null);
            setDuitkuSuccessTrx(resData.id_transaksi);
            setSuccessModalOpen(true);
            handleClearCart();
        } catch (e) {
            setLastSuccessData({
                id_transaksi: resData.id_transaksi,
                total_belanja: resData.total_belanja || calculations.totalBersih,
                total_items: data.items.reduce((acc, curr) => acc + Number(curr.jumlah || 1), 0),
                metode_pembayaran: finalMethod,
                bayar: resData.total_belanja || calculations.totalBersih,
                kembalian: 0,
            });

            playRfidSuccessBeep();
            setShowDuitkuModal(false);
            setDuitkuModalData(null);
            setDuitkuSuccessTrx(resData.id_transaksi);
            setSuccessModalOpen(true);
            handleClearCart();
        }
    };

    // Jalankan Pop-up Duitku POP Sandbox
    const openDuitkuPopup = (resData) => {
        if (window.checkout && resData.reference && !resData.reference.startsWith('DS-')) {
            window.checkout.process(resData.reference, {
                defaultLanguage: 'id',
                successEvent: function (result) {
                    handleDuitkuSuccess(resData, result?.paymentCode || result?.paymentType || 'QRIS');
                },
                pendingEvent: function (result) {
                    alert('Status pesanan: Menunggu pembayaran dari pelanggan.');
                    handleClearCart();
                },
                errorEvent: function (result) {
                    // Fallback ke popup internal jika iframe Duitku error
                    setDuitkuModalData(resData);
                    setShowDuitkuModal(true);
                },
                closeEvent: function (result) {
                    // Popup ditutup oleh pengguna
                },
            });
        } else {
            // Popup modal internal interaktif (Fallback / Offline Sandbox)
            setDuitkuModalData(resData);
            setShowDuitkuModal(true);
        }
    };

    // Submit Transaksi Non-Tunai Duitku POP Kasir (Modal Popup)
    const handleDuitkuPosPayment = async () => {
        if (data.items.length === 0) {
            alert('Keranjang belanja masih kosong! Silakan pilih produk terlebih dahulu.');
            return;
        }

        if (!data.id_pelanggan) {
            alert('Silakan pilih pelanggan terlebih dahulu.');
            return;
        }

        setDuitkuLoading(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

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
                    id_pelanggan: data.id_pelanggan,
                    items: data.items.map((i) => ({
                        id_produk: i.id_produk,
                        jumlah: i.jumlah,
                    })),
                    diskon: data.diskon,
                    sumber_transaksi: 'POS Kasir',
                }),
            });

            const resData = await response.json();
            setDuitkuLoading(false);

            if (!response.ok || resData.status !== 'success' || !resData.merchant_order_id) {
                alert(resData.message || 'Gagal membuat invoice transaksi Duitku.');
                return;
            }

            openDuitkuPopup(resData);
        } catch (err) {
            setDuitkuLoading(false);
            alert('Terjadi kesalahan koneksi saat menyiapkan Duitku POP.');
        }
    };

    // Simpan Pelanggan Baru Cepat
    const handleSaveCustomer = (e) => {
        e.preventDefault();
        customerForm.post(route('kasir.pelanggan.store'), {
            onSuccess: () => {
                setAddCustomerModalOpen(false);
                customerForm.reset();
            },
        });
    };

    return (
        <AppLayout
            header={
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                            Kasir POS & Transaksi Multi-Item
                        </h1>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            Scan Barcode & WebCam • Tap RFID Member • Kalkulasi Diskon & Struk Otomatis
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Kasir POS - MARTIN MART" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* SISI KIRI: Katalog Produk Toko (7 Kolom) */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Header Katalog & Pencarian */}
                    <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-xs space-y-3.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-black text-slate-950">
                                    Katalog Produk MARTIN MART
                                </h3>
                                <p className="text-xs font-semibold text-slate-600">
                                    Klik produk untuk menambahkan ke keranjang kasir
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                {outOfStockCount > 0 && (
                                    <span className="text-xs font-black px-3 py-1 rounded-full bg-rose-100 text-rose-950 border border-rose-300 shadow-2xs">
                                        {outOfStockCount} Stok Habis
                                    </span>
                                )}
                                <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-100 text-blue-950 border border-blue-300 shadow-2xs">
                                    {produk_list.length} Total Produk
                                </span>
                            </div>
                        </div>

                        {/* Search Input Barcode Scanner & Camera Button */}
                        <div className="flex items-center space-x-2.5">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    ref={barcodeInputRef}
                                    value={selectedProductSearch}
                                    onChange={(e) => setSelectedProductSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            processBarcodeScan(selectedProductSearch);
                                        }
                                    }}
                                    placeholder="Scan barcode produk (USB Scanner) / ketik nama lalu Enter..."
                                    className="w-full pl-10 pr-24 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-xs"
                                />
                                <IconBarcode className="w-5 h-5 text-blue-700 absolute left-3 top-2.5" />

                                {selectedProductSearch && (
                                    <button
                                        type="button"
                                        onClick={() => processBarcodeScan(selectedProductSearch)}
                                        className="absolute right-2 top-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black shadow-xs transition-colors"
                                    >
                                        Enter ↵
                                    </button>
                                )}
                            </div>

                            {/* Tombol Scanner Kamera HP / Laptop */}
                            <button
                                type="button"
                                onClick={() => setCameraModalOpen(true)}
                                className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border-2 border-blue-300 rounded-xl text-xs font-black shadow-xs flex items-center space-x-1.5 shrink-0 transition-colors"
                                title="Buka Scanner Barcode Kamera"
                            >
                                <IconCamera className="w-4 h-4 text-blue-700" />
                                <span className="hidden sm:inline">Kamera</span>
                            </button>
                        </div>

                        {/* Toast Alert Feedback Barcode / RFID */}
                        {lastScanToast && (
                            <div className="p-3 rounded-xl bg-emerald-100 border-2 border-emerald-300 text-emerald-950 text-xs font-black flex items-center space-x-2 shadow-xs animate-fadeIn">
                                <IconCheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                                <span>{lastScanToast}</span>
                            </div>
                        )}

                        {/* Filter Kategori Tabs */}
                        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
                            <button
                                type="button"
                                onClick={() => setSelectedKategori('')}
                                className={`px-3.5 py-1.5 rounded-xl font-black transition-all shrink-0 border ${
                                    selectedKategori === ''
                                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                                        : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                                }`}
                            >
                                Semua
                            </button>
                            {kategoriList.map((kat) => (
                                <button
                                    key={kat.id}
                                    type="button"
                                    onClick={() => setSelectedKategori(kat.id)}
                                    className={`px-3.5 py-1.5 rounded-xl font-black transition-all shrink-0 border ${
                                        String(selectedKategori) === String(kat.id)
                                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                                            : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                                    }`}
                                >
                                    {kat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid Daftar Produk */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[620px] overflow-y-auto pr-1">
                        {filteredProducts.length === 0 ? (
                            <div className="col-span-2 py-16 text-center text-slate-600 font-bold bg-white rounded-2xl border-2 border-dashed border-slate-300 text-sm">
                                Tidak ada produk yang sesuai dengan pencarian.
                            </div>
                        ) : (
                            filteredProducts.map((p) => {
                                const isOutOfStock = Number(p.stok) <= 0;
                                const cartItem = data.items.find((item) => item.id_produk === p.id_produk);
                                const inCartQty = cartItem ? cartItem.jumlah : 0;

                                return (
                                    <div
                                        key={p.id_produk}
                                        onClick={() => handleAddToCart(p)}
                                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative group flex flex-col justify-between ${
                                            isOutOfStock
                                                ? 'bg-rose-50/50 border-rose-300 hover:border-rose-400 hover:shadow-xs'
                                                : inCartQty > 0
                                                ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                                                : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-md'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-1">
                                                <span className="text-[10.5px] font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider block truncate border border-blue-200">
                                                    {p.kategori?.nama_kategori || 'Kategori'}
                                                </span>
                                                {isOutOfStock ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-950 font-black text-[10px] border border-rose-300 flex items-center space-x-1 shrink-0 shadow-2xs">
                                                        <span>⚠️ STOK HABIS (0)</span>
                                                    </span>
                                                ) : inCartQty > 0 ? (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-black text-xs shrink-0 shadow-xs">
                                                        🛒 {inCartQty}x
                                                    </span>
                                                ) : null}
                                            </div>

                                            <h4 className={`text-sm font-black mt-2 line-clamp-2 leading-snug ${isOutOfStock ? 'text-slate-600' : 'text-slate-950'}`}>
                                                {p.nama_produk}
                                            </h4>

                                            {/* Foto Produk Persegi Panjang (jika diupload) */}
                                            {p.foto_url && (
                                                <div className="w-full aspect-[16/10] my-2 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
                                                    <img
                                                        src={p.foto_url}
                                                        alt={p.nama_produk}
                                                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
                                                    />
                                                </div>
                                            )}

                                            {p.kode_barcode && (
                                                <div className="mt-1.5">
                                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-900 font-mono text-[10px] font-bold border border-slate-300">
                                                        <IconBarcode className="w-3.5 h-3.5 text-blue-700" />
                                                        <span>{p.kode_barcode}</span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                                            <div>
                                                <span className={`text-base font-black block tracking-tight ${isOutOfStock ? 'text-slate-500 line-through' : 'text-blue-900'}`}>
                                                    {formatRupiah(p.harga)}
                                                </span>
                                                <span className="text-[11px] text-slate-600 font-bold">
                                                    Sisa:{' '}
                                                    <strong
                                                        className={
                                                            isOutOfStock
                                                                ? 'text-rose-700 font-black'
                                                                : p.stok <= 5
                                                                ? 'text-amber-800 font-black'
                                                                : 'text-slate-950 font-black'
                                                        }
                                                    >
                                                        {isOutOfStock ? 'HABIS (0 unit)' : `${p.stok} unit`}
                                                    </strong>
                                                </span>
                                            </div>

                                            {isOutOfStock ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToCart(p);
                                                    }}
                                                    className="px-3 py-1.5 bg-rose-100 hover:bg-rose-600 text-rose-900 hover:text-white rounded-xl text-xs font-black transition-colors border border-rose-300 shadow-2xs"
                                                    title="Klik untuk notifikasi stok habis"
                                                >
                                                    ⚠️ Stok Habis
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToCart(p);
                                                    }}
                                                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-900 hover:text-white rounded-xl text-xs font-black transition-colors border border-blue-300 group-hover:bg-blue-600 group-hover:text-white shadow-2xs"
                                                >
                                                    + Tambah
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* SISI KANAN: Terminal Kasir & Keranjang Belanja Multi-Item (5 Kolom) */}
                <div className="lg:col-span-5">
                    <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-5 sticky top-20 space-y-4">
                        {/* Terminal Header & Realtime Clock */}
                        <div className="flex items-center justify-between pb-3.5 border-b-2 border-slate-100">
                            <div className="flex items-center space-x-2.5">
                                <span className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
                                    <IconPos className="w-5 h-5" />
                                </span>
                                <div>
                                    <h3 className="text-base font-black text-slate-950 leading-tight">
                                        Terminal Kasir
                                    </h3>
                                    <p className="text-[10.5px] font-bold text-slate-600">
                                        MARTIN MART POS
                                    </p>
                                </div>
                            </div>
                            <RealtimeClock compact />
                        </div>

                        {/* Notifikasi Flash Error / Validasi Server */}
                        {flash?.error && (
                            <div className="p-3 rounded-xl bg-rose-100 border-2 border-rose-300 text-xs text-rose-950 flex items-start space-x-2">
                                <IconExclamation className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                                <div className="font-bold">{flash.error}</div>
                            </div>
                        )}

                        {Object.keys(errors).length > 0 && (
                            <div className="p-3 rounded-xl bg-rose-100 border-2 border-rose-300 text-xs text-rose-950 space-y-1">
                                <div className="flex items-center space-x-1 font-black text-rose-900">
                                    <IconExclamation className="w-4 h-4 text-rose-700 shrink-0" />
                                    <span>Peringatan Transaksi:</span>
                                </div>
                                <ul className="list-disc list-inside pl-1 text-[11px] font-bold text-rose-900 space-y-0.5">
                                    {Object.values(errors).map((err, idx) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleProcessTransaction} className="space-y-4">
                            {/* FITUR HARDWARE: Scan Kartu Member (RFID USB Reader HID) */}
                            <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50/80 border-2 border-blue-200 rounded-2xl space-y-2.5 shadow-2xs">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1.5 text-xs font-black text-blue-950">
                                        <IconRfid className="w-4 h-4 text-blue-700" />
                                        <span>Scan Kartu Member (RFID USB)</span>
                                    </div>
                                    <span className="text-[10px] text-blue-900 font-extrabold bg-white px-2.5 py-0.5 rounded-full border border-blue-300 shadow-2xs">
                                        HID Reader
                                    </span>
                                </div>

                                <div className="relative">
                                    <input
                                        type="text"
                                        ref={rfidInputRef}
                                        value={rfidMemberInput}
                                        onChange={(e) => setRfidMemberInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                processRfidTap(rfidMemberInput);
                                            }
                                        }}
                                        placeholder="Tap kartu RFID member di sini..."
                                        className="w-full pl-9 pr-16 py-2 rounded-xl border-2 border-blue-300 bg-white font-mono text-xs font-black text-slate-950 placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                                    />
                                    <IconRfid className="w-4 h-4 text-blue-600 absolute left-2.5 top-2.5" />

                                    {rfidMemberInput && (
                                        <button
                                            type="button"
                                            onClick={() => processRfidTap(rfidMemberInput)}
                                            className="absolute right-1.5 top-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10.5px] font-black"
                                        >
                                            Tap ↵
                                        </button>
                                    )}
                                </div>

                                {/* Indikator Visual Member Terverifikasi */}
                                {activeCustomer && (activeCustomer.kode_rfid || activeCustomer.status_member === 'Member RFID') && (
                                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-md space-y-1 text-xs">
                                        <div className="flex items-center justify-between font-black">
                                            <span className="flex items-center space-x-1 text-amber-300">
                                                <IconCheckCircle className="w-4 h-4" />
                                                <span>MEMBER TERVERIFIKASI</span>
                                            </span>
                                            <span className="text-[10px] font-mono text-blue-100 bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                                                UID: {activeCustomer.kode_rfid || '-'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-blue-100 pt-0.5">
                                            <span>Nama: <strong className="text-white font-black">{activeCustomer.nama_pelanggan}</strong></span>
                                            <span>Poin: <strong className="text-amber-300 font-black">⭐ {activeCustomer.poin || 0} Poin</strong></span>
                                        </div>
                                        <div className="text-[10.5px] text-amber-200 font-extrabold pt-0.5">
                                            🎁 Diskon member aktif: <strong>{data.diskon}%</strong>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pemilihan Pelanggan */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-black text-slate-900">
                                        Pelanggan Terpilih <span className="text-rose-600">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setAddCustomerModalOpen(true)}
                                        className="text-[11px] font-black text-blue-700 hover:text-blue-900 flex items-center space-x-1"
                                    >
                                        <IconPlus className="w-3.5 h-3.5" />
                                        <span>+ Pelanggan Baru</span>
                                    </button>
                                </div>
                                <select
                                    value={data.id_pelanggan}
                                    onChange={(e) => {
                                        const newId = e.target.value;
                                        const selected = pelanggan_list.find((p) => String(p.id_pelanggan) === String(newId));
                                        if (selected && (selected.kode_rfid || selected.status_member === 'Member RFID')) {
                                            setData((prev) => ({
                                                ...prev,
                                                id_pelanggan: newId,
                                                diskon: prev.diskon > 0 ? prev.diskon : 5,
                                            }));
                                        } else {
                                            setData((prev) => ({
                                                ...prev,
                                                id_pelanggan: newId,
                                                diskon: 0,
                                            }));
                                        }
                                    }}
                                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                                    required
                                >
                                    <option value="">-- Pilih Pelanggan --</option>
                                    {pelanggan_list.map((pel) => (
                                        <option key={pel.id_pelanggan} value={pel.id_pelanggan}>
                                            {pel.nama_pelanggan} ({pel.kota}) {pel.kode_rfid ? `[RFID: ${pel.kode_rfid}]` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Daftar Produk di Keranjang (Shopping Cart List) */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-black text-slate-950 flex items-center space-x-1.5">
                                        <IconCart className="w-4 h-4 text-blue-700" />
                                        <span>Keranjang Belanja ({calculations.totalItemsCount} item)</span>
                                    </span>
                                    {data.items.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleClearCart}
                                            className="text-[11px] font-black text-rose-700 hover:text-rose-900"
                                        >
                                            Kosongkan Keranjang
                                        </button>
                                    )}
                                </div>

                                {data.items.length === 0 ? (
                                    <div className="py-8 px-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center">
                                        <IconCart className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                        <p className="text-xs text-slate-700 font-bold">
                                            Keranjang masih kosong.
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            Klik produk pada katalog di sebelah kiri untuk menambahkan.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 border-2 border-slate-200 rounded-xl p-2 bg-slate-50/70">
                                        {data.items.map((item) => (
                                            <div
                                                key={item.id_produk}
                                                className="p-2.5 bg-white rounded-xl border-2 border-slate-200 shadow-2xs space-y-1.5"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h5 className="font-black text-xs text-slate-950 leading-tight">
                                                            {item.nama_produk}
                                                        </h5>
                                                        <span className="text-[10.5px] font-bold text-slate-600">
                                                            @{formatRupiah(item.harga)}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(item.id_produk)}
                                                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition-colors"
                                                        title="Hapus dari keranjang"
                                                    >
                                                        <IconTrash className="w-4 h-4 text-rose-600" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between pt-1">
                                                    {/* Kuantitas Button +/- */}
                                                    <div className="flex items-center space-x-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateQuantity(item.id_produk, item.jumlah - 1)}
                                                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 font-black flex items-center justify-center text-sm border border-slate-300 transition-colors"
                                                        >
                                                            -
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={item.stok}
                                                            value={item.jumlah}
                                                            onChange={(e) => handleUpdateQuantity(item.id_produk, parseInt(e.target.value) || 1)}
                                                            className="w-12 text-center py-1 px-1 border-2 border-slate-300 rounded-lg text-xs font-black text-slate-950"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateQuantity(item.id_produk, item.jumlah + 1)}
                                                            disabled={item.jumlah >= item.stok}
                                                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 font-black flex items-center justify-center text-sm border border-slate-300 transition-colors disabled:opacity-40"
                                                        >
                                                            +
                                                        </button>
                                                        <span className="text-[10px] font-bold text-slate-500 pl-1">
                                                            (Maks: {item.stok})
                                                        </span>
                                                    </div>

                                                    <span className="font-black text-sm text-blue-900">
                                                        {formatRupiah(item.subtotal)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Diskon Penjualan (%) */}
                            <div>
                                <label className="block text-xs font-black text-slate-900 mb-1">
                                    Diskon Transaksi (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.5"
                                        value={data.diskon}
                                        onChange={(e) => setData('diskon', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                                        placeholder="0"
                                        className="w-full pl-3 pr-8 py-2 rounded-xl border-2 border-slate-300 text-xs font-black text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                                    />
                                    <span className="absolute right-3 top-2 text-xs font-black text-slate-500">
                                        %
                                    </span>
                                </div>
                            </div>

                            {/* Pilihan Metode Pembayaran Kasir (Dual Option: Tunai & Non-Tunai via Duitku) */}
                            <div>
                                <label className="block text-xs font-black text-slate-900 mb-1.5">
                                    Metode Pembayaran Kasir
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData('metode_pembayaran', 'Tunai');
                                            setData('bayar', '');
                                        }}
                                        className={`py-3 px-3 text-center rounded-xl text-xs font-black transition-all border-2 flex items-center justify-center space-x-2 ${
                                            data.metode_pembayaran === 'Tunai'
                                                ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                                                : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                                        }`}
                                    >
                                        <span className="text-base">💵</span>
                                        <span>Tunai / Cash</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData('metode_pembayaran', 'Duitku');
                                            setData('bayar', calculations.totalBersih);
                                        }}
                                        className={`py-3 px-3 text-center rounded-xl text-xs font-black transition-all border-2 flex items-center justify-center space-x-2 ${
                                            data.metode_pembayaran === 'Duitku'
                                                ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                                                : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                                        }`}
                                    >
                                        <span className="text-base">💳</span>
                                        <span>Non-Tunai (Duitku POP)</span>
                                    </button>
                                </div>
                            </div>

                            {/* Tampilan Sesuai Metode Pembayaran Terpilih */}
                            {data.metode_pembayaran === 'Tunai' ? (
                                <>
                                    {/* Input Jumlah Bayar / Uang Diterima & Quick Buttons */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-xs font-black text-slate-900">
                                                Uang Tunai Diterima (Rp)
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setData('bayar', calculations.totalBersih)}
                                                className="text-[11px] font-black text-blue-700 hover:text-blue-900"
                                            >
                                                [Uang Pas]
                                            </button>
                                        </div>

                                        <input
                                            type="number"
                                            value={data.bayar}
                                            onChange={(e) => setData('bayar', e.target.value)}
                                            placeholder={String(calculations.totalBersih || 0)}
                                            className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 text-lg font-black text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                                        />

                                        {/* Tombol Cepat Nominal Uang */}
                                        <div className="flex items-center space-x-1.5 mt-2 overflow-x-auto pb-1">
                                            {[50000, 100000, 200000, 500000].map((nominal) => (
                                                <button
                                                    key={nominal}
                                                    type="button"
                                                    onClick={() => setData('bayar', nominal)}
                                                    className="px-2.5 py-1 text-[10.5px] font-black rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-800 border border-slate-300 shrink-0"
                                                >
                                                    {formatRupiah(nominal)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Real-time Calculation Box: Subtotal, Diskon, Total, Kembalian */}
                                    <div className="p-4 rounded-2xl bg-slate-100/90 border-2 border-slate-200 space-y-2 text-xs">
                                        <div className="flex justify-between font-bold text-slate-700">
                                            <span>Subtotal Kotor ({calculations.totalItemsCount} item):</span>
                                            <span className="text-slate-950 font-black">{formatRupiah(calculations.subtotalKotor)}</span>
                                        </div>

                                        <div className="flex justify-between font-bold text-slate-700">
                                            <span>Diskon ({calculations.diskonPersen}%):</span>
                                            <span className={calculations.nilaiDiskon > 0 ? 'text-rose-700 font-black' : 'text-slate-500 font-bold'}>
                                                {calculations.nilaiDiskon > 0 ? `- ${formatRupiah(calculations.nilaiDiskon)}` : 'Rp 0'}
                                            </span>
                                        </div>

                                        <div className="pt-2.5 border-t-2 border-slate-200 flex justify-between items-baseline">
                                            <span className="font-black text-slate-900 uppercase tracking-wider text-xs">
                                                TOTAL BAYAR:
                                            </span>
                                            <span className="text-2xl font-black text-blue-900 tracking-tight">
                                                {formatRupiah(calculations.totalBersih)}
                                            </span>
                                        </div>

                                        {/* Kembalian Section */}
                                        <div className="pt-2 border-t-2 border-dashed border-slate-300">
                                            {calculations.kurangBayar > 0 && data.bayar !== '' ? (
                                                <div className="p-2.5 rounded-xl bg-rose-100 border-2 border-rose-300 text-rose-950 flex justify-between items-center text-xs font-black">
                                                    <span>Uang Kurang:</span>
                                                    <span className="text-base text-rose-900 font-black">- {formatRupiah(calculations.kurangBayar)}</span>
                                                </div>
                                            ) : (
                                                <div className="p-3 rounded-xl bg-emerald-100 border-2 border-emerald-300 text-emerald-950 flex justify-between items-center text-xs font-black shadow-2xs">
                                                    <span className="uppercase tracking-wider">UANG KEMBALIAN:</span>
                                                    <span className="text-xl text-emerald-950 font-black">
                                                        {formatRupiah(calculations.kembalian)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Button: Proses Tunai */}
                                    <button
                                        type="submit"
                                        disabled={
                                            processing ||
                                            data.items.length === 0 ||
                                            (calculations.kurangBayar > 0 && data.bayar !== '')
                                        }
                                        className="w-full py-3.5 px-4 rounded-xl text-sm font-black text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-98 shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        <IconPos className="w-5 h-5" />
                                        <span>
                                            {processing
                                                ? 'Memproses Transaksi Tunai...'
                                                : `PROSES TRANSAKSI TUNAI (${calculations.totalItemsCount} Barang)`}
                                        </span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Non-Tunai Duitku Card Info */}
                                    <div className="p-4 rounded-2xl bg-blue-50/80 border-2 border-blue-200 space-y-3 text-xs">
                                        <div className="flex justify-between items-baseline pb-2 border-b border-blue-200">
                                            <span className="font-bold text-slate-700">Subtotal Belanja:</span>
                                            <span className="font-black text-slate-900">{formatRupiah(calculations.subtotalKotor)}</span>
                                        </div>

                                        {calculations.nilaiDiskon > 0 && (
                                            <div className="flex justify-between items-baseline pb-2 border-b border-blue-200 text-rose-700">
                                                <span className="font-bold">Diskon ({calculations.diskonPersen}%):</span>
                                                <span className="font-black">- {formatRupiah(calculations.nilaiDiskon)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-baseline">
                                            <span className="font-black text-slate-900 uppercase tracking-wider text-xs">
                                                TAGIHAN DIGITAL:
                                            </span>
                                            <span className="text-2xl font-black text-blue-900 tracking-tight">
                                                {formatRupiah(calculations.totalBersih)}
                                            </span>
                                        </div>

                                        <div className="pt-2 border-t border-blue-200 space-y-1.5 text-center">
                                            <span className="text-[10px] font-bold text-slate-600 block uppercase tracking-wider">
                                                Saluran Pembayaran Gateway Duitku:
                                            </span>
                                            <div className="flex flex-wrap items-center justify-center gap-1 text-[10px] font-extrabold text-slate-700">
                                                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">QRIS</span>
                                                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">BCA VA</span>
                                                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">BRI VA</span>
                                                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">Mandiri VA</span>
                                                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">BNI VA</span>
                                                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">ShopeePay</span>
                                                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">OVO</span>
                                            </div>
                                            <p className="text-[10.5px] text-slate-500 pt-1">
                                                Pelanggan dapat melakukan scan QRIS atau transfer VA langsung pada jendela pop-up Duitku POP.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Button: Buka Jendela Duitku POP */}
                                    <button
                                        type="button"
                                        onClick={handleDuitkuPosPayment}
                                        disabled={duitkuLoading || data.items.length === 0}
                                        className="w-full py-3.5 px-4 rounded-xl text-sm font-black text-white bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 hover:from-blue-800 hover:to-sky-600 active:scale-98 shadow-xl shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2.5 cursor-pointer"
                                    >
                                        <span className="text-lg">💳</span>
                                        <span>
                                            {duitkuLoading
                                                ? 'Menyiapkan Duitku POP...'
                                                : `BAYAR VIA DUITKU POP (${calculations.totalItemsCount} Barang)`}
                                        </span>
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            {/* Quick Add Customer Modal */}
            <ModalDialog
                show={addCustomerModalOpen}
                onClose={() => setAddCustomerModalOpen(false)}
                title="Tambah Pelanggan Baru Cepat"
            >
                <form onSubmit={handleSaveCustomer} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-slate-900 mb-1">
                            Nama Pelanggan <span className="text-rose-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={customerForm.data.nama_pelanggan}
                            onChange={(e) => customerForm.setData('nama_pelanggan', e.target.value)}
                            placeholder="Contoh: Rina Kusuma"
                            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-900 mb-1">
                            Kota Asal <span className="text-rose-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={customerForm.data.kota}
                            onChange={(e) => customerForm.setData('kota', e.target.value)}
                            placeholder="Contoh: Surabaya"
                            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                            required
                        />
                    </div>

                    {/* Input Tap Kartu RFID Member Opsional */}
                    <div className="bg-blue-50 p-3.5 rounded-xl border-2 border-blue-200 space-y-1.5">
                        <label className="text-xs font-black text-blue-950 flex items-center space-x-1.5">
                            <IconRfid className="w-4 h-4 text-blue-700" />
                            <span>Nomor UID Kartu RFID (Opsional)</span>
                        </label>
                        <input
                            type="text"
                            value={customerForm.data.kode_rfid || ''}
                            onChange={(e) => customerForm.setData('kode_rfid', e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    playRfidSuccessBeep();
                                }
                            }}
                            placeholder="Tempelkan kartu RFID ke USB reader..."
                            className="w-full px-3 py-2 rounded-xl border-2 border-blue-300 text-xs font-mono font-black text-slate-950 bg-white focus:border-blue-600"
                        />
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4 border-t-2 border-slate-100">
                        <button
                            type="button"
                            onClick={() => setAddCustomerModalOpen(false)}
                            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={customerForm.processing}
                            className="px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                        >
                            {customerForm.processing ? 'Menyimpan...' : 'Simpan & Pilih'}
                        </button>
                    </div>
                </form>
            </ModalDialog>

            {/* Success Notification Modal with Direct Receipt Printing */}
            <ModalDialog
                show={successModalOpen && !!(last_transaksi_id || duitkuSuccessTrx)}
                onClose={() => {
                    setSuccessModalOpen(false);
                    setDuitkuSuccessTrx(null);
                    setLastSuccessData(null);
                }}
                title="Transaksi Berhasil Diproses!"
                maxWidth="max-w-md"
            >
                <div className="text-center py-3 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center border-2 border-emerald-300">
                        <IconCheckCircle className="w-10 h-10" />
                    </div>

                    <div>
                        <h4 className="text-xl font-black text-slate-950">
                            Faktur #TRX-{String(last_transaksi_id || duitkuSuccessTrx || 0).padStart(5, '0')}
                        </h4>
                        <p className="text-xs font-semibold text-slate-600 mt-1">
                            Transaksi kasir telah berhasil dicatat dan seluruh stok produk otomatis diperbarui.
                        </p>
                    </div>

                    {/* Ringkasan Pembayaran di Modal */}
                    <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200 text-xs space-y-2 text-left">
                        <div className="flex justify-between font-bold text-slate-700">
                            <span>Jumlah Produk:</span>
                            <span className="font-black text-slate-950">
                                {lastSuccessData?.total_items ?? calculations.totalItemsCount} item
                            </span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-700">
                            <span>Metode Bayar:</span>
                            <span className="font-black text-slate-950">
                                {lastSuccessData?.metode_pembayaran ?? data.metode_pembayaran}
                            </span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-700">
                            <span>Total Belanja:</span>
                            <span className="font-black text-blue-900 text-sm">
                                {formatRupiah(lastSuccessData?.total_belanja ?? calculations.totalBersih)}
                            </span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-700">
                            <span>Uang Diterima:</span>
                            <span className="font-black text-slate-950">
                                {formatRupiah(lastSuccessData?.bayar ?? calculations.bayarNominal)}
                            </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t-2 border-dashed border-slate-300 font-black text-emerald-900 text-sm">
                            <span>Kembalian:</span>
                            <span>
                                {formatRupiah(lastSuccessData?.kembalian ?? calculations.kembalian)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center space-x-3 pt-3">
                        <Link
                            href={route('transaksi.struk', last_transaksi_id || duitkuSuccessTrx || 0)}
                            target="_blank"
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md flex items-center space-x-2 transition-transform active:scale-95"
                        >
                            <IconPrinter className="w-4 h-4" />
                            <span>Cetak Struk Belanja</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => {
                                setSuccessModalOpen(false);
                                setDuitkuSuccessTrx(null);
                                setLastSuccessData(null);
                                setData({
                                    id_pelanggan: pelanggan_list[0]?.id_pelanggan || '',
                                    items: [],
                                    diskon: 0,
                                    metode_pembayaran: 'Tunai',
                                    bayar: '',
                                });
                            }}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300"
                        >
                            Transaksi Baru
                        </button>
                    </div>
                </div>
            </ModalDialog>

            {/* Modal Notifikasi / Peringatan Stok Habis atau Melebihi Batas */}
            <ModalDialog
                show={!!stockAlert}
                onClose={() => setStockAlert(null)}
                title={stockAlert?.title || 'Pemberitahuan Stok Produk'}
                maxWidth="max-w-md"
            >
                <div className="text-center py-3 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 mx-auto flex items-center justify-center border-2 border-rose-300">
                        <IconExclamation className="w-10 h-10" />
                    </div>

                    <div>
                        <h4 className="text-xl font-black text-slate-950">
                            {stockAlert?.title || 'Stok Produk Habis!'}
                        </h4>
                        <p className="text-sm font-semibold text-slate-700 mt-2 leading-relaxed px-2">
                            {stockAlert?.message}
                        </p>
                    </div>

                    {stockAlert?.product && (
                        <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200 text-xs text-left space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-700">Nama Produk:</span>
                                <span className="font-black text-slate-950 text-right">{stockAlert.product.nama_produk}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-700">Kategori:</span>
                                <span className="font-black text-slate-800">{stockAlert.product.kategori?.nama_kategori || 'Umum'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-700">Harga Satuan:</span>
                                <span className="font-black text-blue-900 text-sm">{formatRupiah(stockAlert.product.harga)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t-2 border-slate-200">
                                <span className="text-slate-900 font-black">Status Stok Toko:</span>
                                <span className={`font-black px-2.5 py-1 rounded-lg text-xs ${Number(stockAlert.product.stok) <= 0 ? 'bg-rose-100 text-rose-950 border-2 border-rose-300' : 'bg-slate-200 text-slate-900'}`}>
                                    {Number(stockAlert.product.stok) <= 0 ? 'HABIS (0 Unit)' : `${stockAlert.product.stok} Unit Tersisa`}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => setStockAlert(null)}
                            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
                        >
                            Saya Mengerti & Tutup
                        </button>
                    </div>
                </div>
            </ModalDialog>

            {/* Modal Scanner Barcode / QR via Kamera */}
            <CameraScannerModal
                show={cameraModalOpen}
                onClose={() => setCameraModalOpen(false)}
                onScanSuccess={(scannedCode) => {
                    processBarcodeScan(scannedCode);
                }}
            />

            {/* Modal Pop-up Duitku POP Sandbox (Official Style Dialog) */}
            <DuitkuPopModal
                show={showDuitkuModal}
                onClose={() => setShowDuitkuModal(false)}
                transaksi={duitkuModalData}
                customerName={activeCustomer ? activeCustomer.nama_pelanggan : 'Pelanggan'}
                isKasir={true}
                onSuccess={(trx, paymentCode) => {
                    handleDuitkuSuccess(trx, paymentCode);
                }}
            />
        </AppLayout>
    );
}
