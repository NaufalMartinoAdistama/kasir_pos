import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PelangganLayout from '@/Layouts/PelangganLayout';
import {
    IconCart,
    IconSearch,
    IconTag,
    IconBarcode,
    IconPlus,
    IconMinus,
    IconTrash,
    IconCheckCircle,
    IconCamera,
    IconSparkles,
} from '@/Components/Icons';
import { formatRupiah } from '@/Utils/format';

export default function Katalog({ produk_list = [], kategori_list = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.id_kategori || '');
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('naufam_mart_cart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [cartOpen, setCartOpen] = useState(false);

    // Save cart to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('naufam_mart_cart', JSON.stringify(cart));
        } catch (e) {}
    }, [cart]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('pelanggan.katalog'),
            { search, id_kategori: selectedCategory },
            { preserveState: true, replace: true }
        );
    };

    const handleCategoryClick = (catId) => {
        const nextId = selectedCategory === catId ? '' : catId;
        setSelectedCategory(nextId);
        router.get(
            route('pelanggan.katalog'),
            { search, id_kategori: nextId },
            { preserveState: true, replace: true }
        );
    };

    const addToCart = (product) => {
        if (product.stok <= 0) {
            alert('Maaf, stok produk ini sedang habis!');
            return;
        }

        setCart((prev) => {
            const existingIndex = prev.findIndex((item) => item.id_produk === product.id_produk);
            if (existingIndex > -1) {
                const currentQty = prev[existingIndex].jumlah;
                if (currentQty >= product.stok) {
                    alert(`Jumlah maksimal stok yang tersedia adalah ${product.stok} item.`);
                    return prev;
                }
                const updated = [...prev];
                updated[existingIndex].jumlah += 1;
                return updated;
            } else {
                return [
                    ...prev,
                    {
                        id_produk: product.id_produk,
                        nama_produk: product.nama_produk,
                        harga: Number(product.harga),
                        stok: Number(product.stok),
                        foto_url: product.foto_url,
                        kode_barcode: product.kode_barcode,
                        jumlah: 1,
                    },
                ];
            }
        });
        setCartOpen(true);
    };

    const updateQty = (idProduk, change) => {
        setCart((prev) => {
            return prev
                .map((item) => {
                    if (item.id_produk === idProduk) {
                        const newQty = item.jumlah + change;
                        if (newQty > item.stok) {
                            alert(`Jumlah maksimal stok adalah ${item.stok}.`);
                            return item;
                        }
                        return newQty > 0 ? { ...item, jumlah: newQty } : null;
                    }
                    return item;
                })
                .filter(Boolean);
        });
    };

    const removeFromCart = (idProduk) => {
        setCart((prev) => prev.filter((item) => item.id_produk !== idProduk));
    };

    const clearCart = () => {
        if (confirm('Kosongkan semua produk dari keranjang?')) {
            setCart([]);
        }
    };

    const totalItems = cart.reduce((sum, item) => sum + item.jumlah, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.harga * item.jumlah, 0);

    return (
        <PelangganLayout cartCount={totalItems} onOpenCart={() => setCartOpen(true)}>
            <Head title="Katalog Belanja Online - NAUFAM MART" />

            {/* Banner Header */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 text-white p-6 md:p-8 shadow-lg shadow-blue-500/20 mb-8 border-2 border-white/60">
                <div className="relative z-10 max-w-2xl">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider mb-3">
                        <IconSparkles className="w-3.5 h-3.5 text-cyan-200" />
                        <span>Pemesanan Online Terpercaya</span>
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                        Katalog Produk Segar & Kebutuhan Harian
                    </h1>
                    <p className="mt-2 text-xs md:text-sm text-blue-100 font-medium leading-relaxed">
                        Pilih produk favorit Anda, tentukan alamat tujuan di peta interaktif, dan kami antarkan langsung ke depan pintu rumah Anda dengan metode pembayaran non-tunai yang aman.
                    </p>
                </div>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-xs mb-8 space-y-4">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama barang atau kode barcode..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-slate-950 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                        />
                        <IconSearch className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                    </div>

                    <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-xs font-black rounded-xl shadow-md shadow-blue-500/25 transition-all"
                    >
                        Cari Produk
                    </button>
                </form>

                {/* Category Pills */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1">
                    <button
                        type="button"
                        onClick={() => handleCategoryClick('')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all ${
                            !selectedCategory
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                    >
                        Semua Kategori ({produk_list.length})
                    </button>
                    {kategori_list.map((cat) => (
                        <button
                            key={cat.id_kategori}
                            type="button"
                            onClick={() => handleCategoryClick(cat.id_kategori)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all ${
                                selectedCategory == cat.id_kategori
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                        >
                            {cat.nama_kategori}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            {produk_list.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border-2 border-slate-200">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-3xl">
                        🔍
                    </div>
                    <h3 className="text-base font-black text-slate-900">
                        Produk Tidak Ditemukan
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Coba gunakan kata kunci pencarian yang berbeda atau pilih kategori lain.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {produk_list.map((product) => {
                        const isOutOfStock = product.stok <= 0;
                        const cartItem = cart.find((it) => it.id_produk === product.id_produk);
                        const qtyInCart = cartItem ? cartItem.jumlah : 0;

                        return (
                            <div
                                key={product.id_produk}
                                className={`bg-white rounded-2xl border-2 transition-all flex flex-col justify-between overflow-hidden group ${
                                    isOutOfStock
                                        ? 'border-slate-200 opacity-75'
                                        : 'border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10'
                                }`}
                            >
                                <div>
                                    {/* Product Rectangular Photo (aspect 16/10) */}
                                    <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden border-b border-slate-100">
                                        {product.foto_url ? (
                                            <img
                                                src={product.foto_url}
                                                alt={product.nama_produk}
                                                className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                                                    isOutOfStock ? 'grayscale' : ''
                                                }`}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-tr from-slate-100 to-blue-50/50">
                                                <IconCamera className="w-7 h-7 text-slate-400 mb-1" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    NAUFAM MART
                                                </span>
                                            </div>
                                        )}

                                        {/* Badges on Image */}
                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                            <span className="px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-blue-900 font-black text-[9.5px] uppercase tracking-wider shadow-2xs border border-blue-200">
                                                {product.kategori?.nama_kategori || 'Produk'}
                                            </span>
                                        </div>

                                        <div className="absolute top-2 right-2">
                                            {isOutOfStock ? (
                                                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[9.5px] shadow-sm">
                                                    STOK HABIS
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[9.5px] shadow-sm">
                                                    Sisa: {product.stok}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Product Content */}
                                    <div className="p-3.5">
                                        <h3 className="text-xs md:text-sm font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                            {product.nama_produk}
                                        </h3>

                                        {product.kode_barcode && (
                                            <div className="mt-1 flex items-center space-x-1 text-[10px] font-mono font-bold text-slate-500">
                                                <IconBarcode className="w-3 h-3 text-slate-400" />
                                                <span>{product.kode_barcode}</span>
                                            </div>
                                        )}

                                        <div className="mt-2.5">
                                            <span className="text-sm md:text-base font-black text-blue-700 block">
                                                {formatRupiah(product.harga)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Add to Cart Action */}
                                <div className="p-3.5 pt-0">
                                    {isOutOfStock ? (
                                        <button
                                            type="button"
                                            disabled
                                            className="w-full py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed"
                                        >
                                            Stok Habis
                                        </button>
                                    ) : qtyInCart > 0 ? (
                                        <div className="flex items-center justify-between bg-blue-50 rounded-xl p-1 border border-blue-200">
                                            <button
                                                type="button"
                                                onClick={() => updateQty(product.id_produk, -1)}
                                                className="w-7 h-7 rounded-lg bg-white text-blue-700 font-black hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center shadow-2xs"
                                            >
                                                <IconMinus className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="text-xs font-black text-blue-950">
                                                {qtyInCart} di Keranjang
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => updateQty(product.id_produk, 1)}
                                                className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black hover:bg-blue-700 transition-colors flex items-center justify-center shadow-2xs"
                                            >
                                                <IconPlus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => addToCart(product)}
                                            className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-1.5 active:scale-95"
                                        >
                                            <IconCart className="w-3.5 h-3.5" />
                                            <span>+ Beli Online</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Shopping Cart Drawer / Sidebar Modal */}
            {cartOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                        onClick={() => setCartOpen(false)}
                    />

                    <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
                            {/* Drawer Header */}
                            <div className="p-5 border-b-2 border-slate-100 flex items-center justify-between bg-blue-50/50">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                                        <IconCart className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-950">
                                            Keranjang Belanja Anda
                                        </h3>
                                        <span className="text-[11px] font-bold text-slate-500">
                                            {totalItems} item barang dipilih
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setCartOpen(false)}
                                    className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Drawer Items List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {cart.length === 0 ? (
                                    <div className="text-center py-16 text-slate-400">
                                        <div className="text-4xl mb-2">🛒</div>
                                        <p className="text-xs font-bold text-slate-600">
                                            Keranjang belanja Anda masih kosong
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            Pilih produk di atas untuk mulai berbelanja.
                                        </p>
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div
                                            key={item.id_produk}
                                            className="p-3 rounded-2xl border-2 border-slate-200 bg-white shadow-2xs flex items-center space-x-3"
                                        >
                                            <div className="w-14 h-11 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                                {item.foto_url ? (
                                                    <img
                                                        src={item.foto_url}
                                                        alt={item.nama_produk}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <IconCamera className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-black text-slate-900 truncate">
                                                    {item.nama_produk}
                                                </h4>
                                                <span className="text-xs font-bold text-blue-700">
                                                    {formatRupiah(item.harga)}
                                                </span>

                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center space-x-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQty(item.id_produk, -1)}
                                                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
                                                        >
                                                            <IconMinus className="w-3 h-3" />
                                                        </button>
                                                        <span className="text-xs font-black text-slate-950 px-1">
                                                            {item.jumlah}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQty(item.id_produk, 1)}
                                                            className="w-6 h-6 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold flex items-center justify-center"
                                                        >
                                                            <IconPlus className="w-3 h-3" />
                                                        </button>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeFromCart(item.id_produk)}
                                                        className="text-rose-600 hover:text-rose-800 p-1"
                                                        title="Hapus barang"
                                                    >
                                                        <IconTrash className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Drawer Footer & Checkout Button */}
                            {cart.length > 0 && (
                                <div className="p-4 border-t-2 border-slate-100 bg-slate-50 space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-slate-600">Total Belanja:</span>
                                        <span className="text-base font-black text-blue-700">
                                            {formatRupiah(totalPrice)}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={clearCart}
                                            className="px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200"
                                        >
                                            Kosongkan
                                        </button>
                                        <Link
                                            href={route('pelanggan.checkout')}
                                            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl text-xs font-black text-center shadow-md shadow-blue-500/25 transition-all block"
                                        >
                                            Lanjut ke Checkout & Pengiriman →
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </PelangganLayout>
    );
}
