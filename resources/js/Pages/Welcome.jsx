import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import RealtimeClock from '@/Components/RealtimeClock';
import {
    IconPos,
    IconBox,
    IconChart,
    IconUserShield,
    IconClipboardList,
    IconReceipt,
    IconCheckCircle,
    IconExclamation,
    IconBarcode,
    IconRfid,
    IconCamera,
    IconPrinter,
    IconUsers,
    IconBuilding,
    IconTag,
    IconSparkles,
    IconSearch,
} from '@/Components/Icons';
import { formatRupiah } from '@/Utils/format';

export default function Welcome({ auth, stats = {}, produk_list = [] }) {
    const [selectedKategori, setSelectedKategori] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('default'); // 'default' | 'harga-asc' | 'harga-desc' | 'stok-desc'

    // Helper URL foto persegi panjang berkualitas
    const getProductImage = (produk) => {
        if (produk.foto_url) {
            return produk.foto_url;
        }
        if (produk.foto) {
            return produk.foto.startsWith('http') ? produk.foto : `/${produk.foto}`;
        }

        const nama = (produk.nama_produk || '').toLowerCase();
        const kat = (produk.kategori?.nama_kategori || '').toLowerCase();

        if (nama.includes('mousepad')) {
            return 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=800&auto=format&fit=crop&q=80';
        }
        if (nama.includes('mouse')) {
            return 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80';
        }
        if (nama.includes('keyboard')) {
            return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80';
        }
        if (nama.includes('headset') || nama.includes('headphone')) {
            return 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80';
        }
        if (nama.includes('flashdisk') || nama.includes('usb')) {
            return 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=800&auto=format&fit=crop&q=80';
        }
        if (nama.includes('monitor') || nama.includes('led')) {
            return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80';
        }
        if (nama.includes('kertas') || nama.includes('hvs')) {
            return 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80';
        }
        if (nama.includes('kopi') || nama.includes('coffee')) {
            return 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80';
        }
        if (nama.includes('webcam') || nama.includes('camera')) {
            return 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=800&auto=format&fit=crop&q=80';
        }
        if (nama.includes('speaker') || nama.includes('audio')) {
            return 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80';
        }
        if (kat.includes('makanan') || kat.includes('minuman')) {
            return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80';
        }
        if (kat.includes('kantor')) {
            return 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80';
        }
        return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';
    };

    // Ambil daftar kategori unik dari produk_list
    const kategoriList = useMemo(() => {
        const set = new Set();
        produk_list.forEach(p => {
            if (p.kategori?.nama_kategori) {
                set.add(p.kategori.nama_kategori);
            }
        });
        return Array.from(set);
    }, [produk_list]);

    // Filter produk berdasarkan kategori dan pencarian nama/barcode serta sorting
    const filteredProduk = useMemo(() => {
        let list = produk_list.filter(p => {
            const matchKat = !selectedKategori || p.kategori?.nama_kategori === selectedKategori;
            const matchSearch = !searchQuery.trim() ||
                p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.kode_barcode && p.kode_barcode.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchKat && matchSearch;
        });

        if (sortBy === 'harga-asc') {
            list = [...list].sort((a, b) => Number(a.harga) - Number(b.harga));
        } else if (sortBy === 'harga-desc') {
            list = [...list].sort((a, b) => Number(b.harga) - Number(a.harga));
        } else if (sortBy === 'stok-desc') {
            list = [...list].sort((a, b) => Number(b.stok) - Number(a.stok));
        }

        return list;
    }, [produk_list, selectedKategori, searchQuery, sortBy]);

    // Kategori dengan ikon representatif sesuai referensi ClassiAds / Modern Retail
    const categoryCards = [
        { name: '', label: 'Semua Produk', icon: '🏪', count: produk_list.length },
        { name: 'Elektronik & Komputer', label: 'Elektronik', icon: '💻', count: produk_list.filter(p => (p.kategori?.nama_kategori || '').toLowerCase().includes('elektronik') || (p.kategori?.nama_kategori || '').toLowerCase().includes('komputer')).length },
        { name: 'Alat Tulis Kantor', label: 'Alat Kantor', icon: '📑', count: produk_list.filter(p => (p.kategori?.nama_kategori || '').toLowerCase().includes('kantor') || (p.kategori?.nama_kategori || '').toLowerCase().includes('tulis')).length },
        { name: 'Makanan & Snack', label: 'Makanan', icon: '🍞', count: produk_list.filter(p => (p.kategori?.nama_kategori || '').toLowerCase().includes('makan') || (p.kategori?.nama_kategori || '').toLowerCase().includes('snack')).length },
        { name: 'Minuman Segar', label: 'Minuman', icon: '☕', count: produk_list.filter(p => (p.kategori?.nama_kategori || '').toLowerCase().includes('minum') || (p.kategori?.nama_kategori || '').toLowerCase().includes('kopi')).length },
        { name: 'Perlengkapan Kasir', label: 'Hardware POS', icon: '🖨️', count: 4 },
        { name: 'Member RFID', label: 'Member Card', icon: '💳', count: stats.total_pelanggan || 12 },
    ];

    const popularTags = ['Semua', 'Kopi', 'Mouse', 'Kertas HVS', 'Headset', 'Snack'];

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
            <Head title="MARTIN MART - Supermarket, Retail & POS System Terpadu" />

            {/* Ambient Background 3D Pill Ornaments (Matching Reference Style) */}
            <div className="absolute top-16 -left-12 w-48 h-48 rounded-full bg-blue-100/60 blur-2xl pointer-events-none" />
            <div className="absolute top-80 right-0 w-72 h-72 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />
            <div className="absolute top-[650px] -left-16 w-56 h-56 rounded-full bg-sky-100/60 blur-2xl pointer-events-none" />

            {/* 1. TOP NAVBAR (Clean, White Backdrop-Blur Header) */}
            <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                    {/* Brand Logo */}
                    <div className="flex items-center space-x-3">
                        <ApplicationLogo variant="dark" size="md" href="/" />
                    </div>

                    {/* Desktop Navigation Links (Clean Minimalist Links like ClassiAds) */}
                    <nav className="hidden lg:flex items-center space-x-8 text-xs font-bold text-slate-600">
                        <a href="#beranda" className="text-blue-600 font-extrabold hover:text-blue-700 transition">
                            Beranda
                        </a>
                        <a href="#kategori" className="hover:text-blue-600 transition">
                            Kategori
                        </a>
                        <a href="#featured" className="hover:text-blue-600 transition">
                            Featured Products
                        </a>
                        <Link href={route('pelanggan.katalog')} className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 transition font-bold">
                            <span>🛍️ Belanja Online</span>
                        </Link>
                        <a href="#hardware" className="hover:text-blue-600 transition">
                            Hardware POS
                        </a>
                        <a href="#roles" className="hover:text-blue-600 transition">
                            Akses Role
                        </a>
                    </nav>

                    {/* Right Action Bar */}
                    <div className="flex items-center space-x-3">
                        <div className="hidden md:block">
                            <RealtimeClock compact className="bg-slate-100/80 border-slate-200 text-slate-700 font-bold" />
                        </div>

                        {auth?.user ? (
                            <Link
                                href={auth.user.role === 'pelanggan' ? route('pelanggan.katalog') : route('dashboard')}
                                className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-full text-xs font-bold shadow-sm transition-all flex items-center space-x-2 active:scale-95"
                            >
                                <span>
                                    {auth.user.role === 'pelanggan' ? 'Portal Belanja' : `Dashboard (${auth.user.role.toUpperCase()})`}
                                </span>
                                <span>→</span>
                            </Link>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    href={route('register')}
                                    className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-full text-xs font-bold border border-slate-300 shadow-2xs transition-all hidden sm:inline-block"
                                >
                                    Daftar Member
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-full text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 active:scale-95"
                                >
                                    <span>Masuk / Tap RFID</span>
                                    <span>🔐</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* 2. HERO SECTION (Split Card Design with Unified Search Pill Bar) */}
            <section id="beranda" className="pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    {/* Left Column: Headlines & Unified Search Pill Bar */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Pill Badge */}
                        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs">
                            <IconSparkles className="w-4 h-4 text-amber-500" />
                            <span>MARTIN MART • Supermarket, Ritel & POS Kasir Modern</span>
                        </div>

                        {/* Big Headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                            Belanja Praktis & Lengkap di <span className="text-blue-600">MARTIN MART</span>
                        </h1>

                        {/* Subtitle Description */}
                        <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium max-w-2xl">
                            Temukan ribuan kebutuhan pokok, perlengkapan kantor, dan elektronik pilihan dengan kemudahan kasir barcode scanner, diskon instan kartu member RFID, dan transaksi pembayaran cepat (QRIS, Debit, & Tunai).
                        </p>

                        {/* UNIFIED SEARCH PILL BAR (Faithfully Replicating Reference Image!) */}
                        <div className="bg-white rounded-full p-2 border border-slate-200/90 shadow-md hover:shadow-lg transition-shadow flex flex-col sm:flex-row items-center gap-2 max-w-2xl">
                            {/* Search Input Field */}
                            <div className="relative flex-1 w-full pl-3 flex items-center">
                                <IconSearch className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari produk, merk, atau barcode..."
                                    className="w-full py-2 bg-transparent border-0 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-0"
                                />
                            </div>

                            {/* Category Selector Dropdown Divider */}
                            <div className="hidden sm:block h-7 w-[1px] bg-slate-200" />

                            {/* Category Selector */}
                            <div className="w-full sm:w-auto px-2">
                                <select
                                    value={selectedKategori}
                                    onChange={(e) => setSelectedKategori(e.target.value)}
                                    className="w-full sm:w-40 py-2 bg-transparent border-0 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-0 cursor-pointer"
                                >
                                    <option value="">Semua Kategori</option>
                                    {kategoriList.map(kat => (
                                        <option key={kat} value={kat}>{kat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Dark Pill Search Action Button */}
                            <a
                                href="#featured"
                                className="w-full sm:w-auto px-7 py-3 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm transition-all flex items-center justify-center space-x-2 shrink-0 active:scale-95"
                            >
                                <span>Cari Produk</span>
                                <span>🔍</span>
                            </a>
                        </div>

                        {/* Popular Search Tags Underneath Search Bar */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                            <span className="font-bold text-slate-400">Populer:</span>
                            {popularTags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => {
                                        if (tag === 'Semua') {
                                            setSearchQuery('');
                                            setSelectedKategori('');
                                        } else {
                                            setSearchQuery(tag);
                                        }
                                    }}
                                    className="px-3 py-1 rounded-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 text-[11px] font-semibold transition shadow-2xs"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        {/* Action CTA Links */}
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                            <Link
                                href={route('pelanggan.katalog')}
                                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 active:scale-95"
                            >
                                <span>🛍️ Pesan Online (Katalog Belanja)</span>
                                <span>→</span>
                            </Link>
                            <Link
                                href={route('kasir.pos')}
                                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 rounded-full text-xs font-bold border border-slate-300 shadow-2xs transition-all flex items-center space-x-2 active:scale-95"
                            >
                                <IconPos className="w-4 h-4 text-blue-600" />
                                <span>Buka Terminal Kasir (POS)</span>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Modern Aesthetic Showcase Card (ClassiAds Inspired) */}
                    <div className="lg:col-span-5 relative">
                        <div className="bg-white rounded-3xl p-3.5 border border-slate-200/90 shadow-xl relative overflow-hidden group">
                            {/* Showcase Hero Image */}
                            <div className="aspect-[4/3] rounded-2xl overflow-hidden relative bg-slate-100">
                                <img
                                    src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1000&auto=format&fit=crop&q=80"
                                    alt="MARTIN MART Modern Supermarket Interior"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />

                                {/* Subtle Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-black/20 to-transparent" />

                                {/* Top Floating Badge */}
                                <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md flex items-center space-x-1.5 text-xs font-bold text-slate-800 border border-slate-200">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span>Toko Buka • Siap Melayani</span>
                                </div>

                                {/* Bottom Info inside photo */}
                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                                        Supermarket & Retail
                                    </span>
                                    <h3 className="text-xl font-black mt-1 leading-tight text-white drop-shadow-xs">
                                        MARTIN MART Store
                                    </h3>
                                    <p className="text-xs text-slate-200 mt-0.5 font-medium line-clamp-1">
                                        Jl. Niaga Raya No. 45 • Telp: 0812-3456-7890
                                    </p>
                                </div>
                            </div>

                            {/* Bottom Highlights Row */}
                            <div className="pt-3.5 px-2 grid grid-cols-3 gap-2 text-center">
                                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                                    <span className="text-sm font-black text-blue-600 block leading-tight">
                                        {stats?.total_produk || '25+'}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500">Produk</span>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                                    <span className="text-sm font-black text-emerald-600 block leading-tight">
                                        {stats?.total_transaksi || '120+'}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500">Transaksi</span>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                                    <span className="text-sm font-black text-amber-500 block leading-tight">
                                        4.9 ★
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500">Rating Toko</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating Micro-Card 1 (Left Badge) */}
                        <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-200 hidden sm:flex items-center space-x-3 max-w-[210px] animate-bounce-slow">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-black text-base shadow-2xs">
                                💳
                            </div>
                            <div className="text-left">
                                <p className="text-[11px] font-extrabold text-slate-900 leading-tight">Member RFID</p>
                                <p className="text-[9.5px] font-medium text-slate-500">Diskon Otomatis POS</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. FLOATING CATEGORY ROW (Faithfully Matching the ClassiAds Horizontal Strip) */}
            <section id="kategori" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16">
                <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                                Jelajahi Berdasarkan Kategori
                            </h3>
                        </div>
                        <span className="text-xs font-bold text-slate-400">
                            {kategoriList.length} Kategori Tersedia
                        </span>
                    </div>

                    {/* Category Cards Carousel / Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                        {categoryCards.map((cat, idx) => {
                            const isActive = (cat.name === '' && selectedKategori === '') ||
                                (cat.name !== '' && selectedKategori.toLowerCase().includes(cat.label.toLowerCase()));

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        if (cat.name === '') {
                                            setSelectedKategori('');
                                        } else {
                                            // Find exact match from kategoriList
                                            const match = kategoriList.find(k => k.toLowerCase().includes(cat.label.toLowerCase()));
                                            setSelectedKategori(match || cat.name);
                                        }
                                    }}
                                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between group cursor-pointer ${
                                        isActive
                                            ? 'bg-blue-50/80 border-blue-600 shadow-xs'
                                            : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-xs'
                                    }`}
                                >
                                    <span className="text-2xl mb-1.5 transition-transform group-hover:scale-110">
                                        {cat.icon}
                                    </span>
                                    <span className={`text-xs font-bold tracking-tight block ${
                                        isActive ? 'text-blue-700 font-black' : 'text-slate-800'
                                    }`}>
                                        {cat.label}
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                        {cat.count} Item
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 4. FEATURED PRODUCTS SECTION (Faithfully Matching the Grid of Rectangular Product Cards in the Reference!) */}
            <section id="featured" className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header Bar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-1.5">
                            <span>Featured Products</span>
                            <span>✨</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            Katalog Pilihan di MARTIN MART
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                            Produk siap beli dengan kode barcode terverifikasi, harga transparan, dan stok terpantau real-time.
                        </p>
                    </div>

                    {/* Filter / Sort Controls */}
                    <div className="flex items-center space-x-2 self-start md:self-auto">
                        <span className="text-xs font-bold text-slate-500">Urutkan:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs focus:border-blue-600 focus:outline-hidden"
                        >
                            <option value="default">Default (Urutan ID)</option>
                            <option value="harga-asc">Harga: Terendah</option>
                            <option value="harga-desc">Harga: Tertinggi</option>
                            <option value="stok-desc">Stok: Terbanyak</option>
                        </select>
                    </div>
                </div>

                {/* Filter Feedback Pill if Active */}
                {(selectedKategori || searchQuery) && (
                    <div className="mb-6 p-3 bg-blue-50/70 rounded-2xl border border-blue-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 text-slate-700">
                            <span className="font-bold">Filter Aktif:</span>
                            {selectedKategori && (
                                <span className="bg-white px-2.5 py-0.5 rounded-lg border border-blue-300 font-bold text-blue-700">
                                    Kategori: {selectedKategori}
                                </span>
                            )}
                            {searchQuery && (
                                <span className="bg-white px-2.5 py-0.5 rounded-lg border border-blue-300 font-bold text-blue-700">
                                    Kata Kunci: "{searchQuery}"
                                </span>
                            )}
                            <span className="text-slate-400">({filteredProduk.length} produk ditemukan)</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setSelectedKategori('');
                                setSearchQuery('');
                            }}
                            className="text-blue-600 hover:text-blue-800 font-bold underline"
                        >
                            Reset Filter
                        </button>
                    </div>
                )}

                {/* Grid Produk Rectangular (4 Columns Desktop, 2 Tablet/Mobile) */}
                {filteredProduk.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
                        <IconBox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-base font-bold text-slate-800">Tidak ada produk ditemukan</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            Coba ubah kata kunci pencarian atau pilih kategori lain untuk melihat produk lainnya.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedKategori('');
                                setSearchQuery('');
                            }}
                            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-blue-600 transition"
                        >
                            Tampilkan Semua Produk
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {filteredProduk.map((p) => {
                            const isOutOfStock = Number(p.stok) <= 0;
                            const isLowStock = Number(p.stok) > 0 && Number(p.stok) <= 10;
                            const photoUrl = getProductImage(p);

                            return (
                                <div
                                    key={p.id_produk}
                                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                                >
                                    <div>
                                        {/* FOTO PERSEGI PANJANG (16:10 Aspect Ratio) */}
                                        <div className="w-full aspect-[16/10] overflow-hidden relative bg-slate-100">
                                            <img
                                                src={photoUrl}
                                                alt={p.nama_produk}
                                                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-106 ${
                                                    isOutOfStock ? 'grayscale opacity-75' : ''
                                                }`}
                                                loading="lazy"
                                            />

                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />

                                            {/* Badge Kategori Kiri Atas */}
                                            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-white/95 backdrop-blur-xs text-slate-800 shadow-2xs">
                                                {p.kategori?.nama_kategori || 'Retail'}
                                            </span>

                                            {/* Badge Stok Kanan Atas */}
                                            <span
                                                className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-2xs ${
                                                    isOutOfStock
                                                        ? 'bg-rose-500 text-white'
                                                        : isLowStock
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-emerald-500 text-white'
                                                }`}
                                            >
                                                {isOutOfStock ? 'Habis' : `Stok: ${p.stok}`}
                                            </span>

                                            {/* Tag Barcode Kiri Bawah */}
                                            {p.kode_barcode && (
                                                <div className="absolute bottom-2 left-2.5 flex items-center space-x-1 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[9.5px] font-mono font-bold">
                                                    <IconBarcode className="w-3 h-3 text-cyan-300" />
                                                    <span>{p.kode_barcode}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Detail Konten Kartu */}
                                        <div className="p-4 space-y-2">
                                            {/* Nama Produk */}
                                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
                                                {p.nama_produk}
                                            </h4>

                                            {/* Star Rating Baris (Matching Reference Stars) */}
                                            <div className="flex items-center space-x-1.5 text-xs">
                                                <div className="flex text-amber-400 text-xs">
                                                    <span>★</span>
                                                    <span>★</span>
                                                    <span>★</span>
                                                    <span>★</span>
                                                    <span>★</span>
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-600">
                                                    5.0
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    (24 terjual)
                                                </span>
                                            </div>

                                            {/* Harga Produk */}
                                            <div className="pt-1 flex items-baseline justify-between">
                                                <span className="text-lg font-black text-slate-900 tracking-tight">
                                                    {formatRupiah(p.harga)}
                                                </span>
                                                <span className="text-[11px] font-semibold text-slate-400">
                                                    / unit
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="p-4 pt-0">
                                        {isOutOfStock ? (
                                            <div className="w-full py-2 px-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold text-center">
                                                Stok Habis Sementara
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2">
                                                <Link
                                                    href={route('pelanggan.katalog')}
                                                    className="w-full py-2 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-2xs flex items-center justify-center space-x-1 transition-all active:scale-95"
                                                >
                                                    <span>🛍️ Pesan</span>
                                                </Link>
                                                <Link
                                                    href={route('kasir.pos')}
                                                    className="w-full py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold border border-slate-300 flex items-center justify-center space-x-1 transition-all active:scale-95"
                                                >
                                                    <span>POS Kasir</span>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* 5. HARDWARE & MODERN RETAIL INTEGRATION (4 CLEAN CARDS) */}
            <section id="hardware" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 mt-12">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
                        Hardware & Integrasi POS
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2.5">
                        Didukung Perangkat Keras Ritel Modern
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed font-medium">
                        Dirancang untuk kecepatan operasional kasir minimarket dan kenyamanan belanja pelanggan.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Feature 1: Barcode Scanner */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 font-black shadow-2xs group-hover:scale-105 transition-transform">
                                <IconBarcode className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                                Code128 Scanner
                            </span>
                            <h3 className="text-base font-black text-slate-900 tracking-tight mt-2.5">
                                USB Barcode & Camera
                            </h3>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                Kasir cukup memindai barcode produk dengan USB Scanner atau kamera perangkat untuk input item instan bebas antre.
                            </p>
                        </div>
                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-[11px] font-bold text-slate-600">
                            <IconCheckCircle className="w-4 h-4 text-emerald-500 mr-1.5 shrink-0" />
                            <span>Audio Beep Konfirmasi</span>
                        </div>
                    </div>

                    {/* Feature 2: RFID Member */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 font-black shadow-2xs group-hover:scale-105 transition-transform">
                                <IconRfid className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                Contactless RFID
                            </span>
                            <h3 className="text-base font-black text-slate-900 tracking-tight mt-2.5">
                                Kartu Member RFID
                            </h3>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                Cukup tempelkan kartu RFID pada card reader untuk login cepat pelanggan dan penerapan diskon member otomatis di kasir.
                            </p>
                        </div>
                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-[11px] font-bold text-slate-600">
                            <IconCheckCircle className="w-4 h-4 text-emerald-500 mr-1.5 shrink-0" />
                            <span>USB Keyboard-Wedge HID</span>
                        </div>
                    </div>

                    {/* Feature 3: Multi Payment */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-black shadow-2xs group-hover:scale-105 transition-transform">
                                <IconReceipt className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                4 Metode Bayar
                            </span>
                            <h3 className="text-base font-black text-slate-900 tracking-tight mt-2.5">
                                Tunai & Non-Tunai
                            </h3>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                Mendukung pembayaran uang Tunai dengan kalkulator kembalian, QRIS Dinamis, Transfer Bank Virtual Account, dan Kartu Debit.
                            </p>
                        </div>
                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-[11px] font-bold text-slate-600">
                            <IconCheckCircle className="w-4 h-4 text-emerald-500 mr-1.5 shrink-0" />
                            <span>Dummy Payment Simulator</span>
                        </div>
                    </div>

                    {/* Feature 4: Online Ordering */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 font-black shadow-2xs group-hover:scale-105 transition-transform">
                                <IconTag className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                                Delivery & GPS
                            </span>
                            <h3 className="text-base font-black text-slate-900 tracking-tight mt-2.5">
                                Order Online & Antar
                            </h3>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                Pelanggan dapat memesan dari rumah dengan penentuan titik antar presisi menggunakan peta interaktif Leaflet GPS.
                            </p>
                        </div>
                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-[11px] font-bold text-slate-600">
                            <IconCheckCircle className="w-4 h-4 text-emerald-500 mr-1.5 shrink-0" />
                            <span>Notifikasi WhatsApp Siap Kirim</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. THREE ROLES CARDS (Admin, Kasir, Pelanggan) */}
            <section id="roles" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                        Hak Akses Multi-Role
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2.5">
                        Pemisahan Wewenang Aman & Terstruktur
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed font-medium">
                        Diproteksi oleh Middleware Laravel untuk memastikan transaksi dan privasi pelanggan tetap terjaga.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Role 1: Administrator */}
                    <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                                    <IconUserShield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-base text-slate-900">1. Administrator</h3>
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                        Owner & Manajemen
                                    </span>
                                </div>
                            </div>
                            <ul className="space-y-2 text-xs text-slate-600 font-medium">
                                <li className="flex items-center space-x-2">
                                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black shrink-0">✓</span>
                                    <span>Dashboard omset harian & Recharts analitik.</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black shrink-0">✓</span>
                                    <span>Manajemen Master Produk, Cabang & Barcode.</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black shrink-0">✓</span>
                                    <span>Export Laporan Penjualan (Excel & PDF Resmi).</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black shrink-0">✓</span>
                                    <span>Audit Log Trigger perubahan stok MariaDB.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="pt-6 mt-6 border-t border-slate-100">
                            <Link
                                href={route('login')}
                                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
                            >
                                <span>Login Admin</span>
                                <span>→</span>
                            </Link>
                        </div>
                    </div>

                    {/* Role 2: Kasir POS */}
                    <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                                    <IconPos className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-base text-slate-900">2. Kasir POS</h3>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        Operasional Kasir
                                    </span>
                                </div>
                            </div>
                            <ul className="space-y-2 text-xs text-slate-600 font-medium">
                                <li className="flex items-center space-x-2">
                                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black shrink-0">✓</span>
                                    <span>Terminal Kasir POS Multi-Item kilat.</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black shrink-0">✓</span>
                                    <span>Scan Barcode USB & Kamera WebCam Laptop/HP.</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black shrink-0">✓</span>
                                    <span>Tap Kartu Member RFID + diskon otomatis.</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black shrink-0">✓</span>
                                    <span>Cetak struk thermal 58/80mm waktu real-time.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="pt-6 mt-6 border-t border-slate-100">
                            <Link
                                href={route('kasir.pos')}
                                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
                            >
                                <span>Buka Mesin Kasir</span>
                                <span>→</span>
                            </Link>
                        </div>
                    </div>

                    {/* Role 3: Pelanggan Online */}
                    <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-black">
                                    <IconTag className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-base text-slate-900">3. Pelanggan Online</h3>
                                    <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                                        Portal Belanja & Antar
                                    </span>
                                </div>
                            </div>
                            <ul className="space-y-2 text-xs text-slate-600 font-medium">
                                <li className="flex items-center space-x-2">
                                    <span className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center text-[9px] font-black shrink-0">✓</span>
                                    <span>Katalog belanja online & keranjang live.</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center text-[9px] font-black shrink-0">✓</span>
                                    <span>Peta interaktif penentuan alamat GPS.</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center text-[9px] font-black shrink-0">✓</span>
                                    <span>Pembayaran Non-Tunai (QRIS / Bank / Debit).</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center text-[9px] font-black shrink-0">✓</span>
                                    <span>Login cepat lewat Tap Kartu Member RFID.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="pt-6 mt-6 border-t border-slate-100">
                            <Link
                                href={route('pelanggan.katalog')}
                                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
                            >
                                <span>Mulai Belanja</span>
                                <span>→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. FOOTER (Clean Dark Slate Footer for MARTIN MART) */}
            <footer className="bg-[#0F172A] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 text-xs border-t border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
                        {/* Column 1: Brand Info */}
                        <div className="space-y-3">
                            <ApplicationLogo variant="light" size="md" href="/" />
                            <p className="text-slate-400 text-xs leading-relaxed">
                                Supermarket dan retail modern terintegrasi dengan POS kasir, pembayaran lengkap, dan layanan belanja online terpercaya.
                            </p>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div className="space-y-2">
                            <h4 className="text-white font-bold text-sm">Navigasi Cepat</h4>
                            <ul className="space-y-1.5 text-slate-400">
                                <li><a href="#beranda" className="hover:text-white transition">Beranda Toko</a></li>
                                <li><a href="#featured" className="hover:text-white transition">Katalog Produk Pilihan</a></li>
                                <li><Link href={route('pelanggan.katalog')} className="hover:text-white transition">Portal Belanja Online</Link></li>
                                <li><Link href={route('kasir.pos')} className="hover:text-white transition">Terminal Kasir (POS)</Link></li>
                            </ul>
                        </div>

                        {/* Column 3: Alamat & Kontak */}
                        <div className="space-y-2">
                            <h4 className="text-white font-bold text-sm">Lokasi & Kontak</h4>
                            <p className="text-slate-400 leading-relaxed">
                                Jl. Niaga Raya No. 45, Kompleks Ruko Modern, Jawa Timur<br />
                                WhatsApp: 0812-3456-7890<br />
                                Jam Operasional: 07:00 - 22:00 WIB
                            </p>
                        </div>

                        {/* Column 4: Status Sistem */}
                        <div className="space-y-3">
                            <h4 className="text-white font-bold text-sm">Status Sistem Toko</h4>
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span>Semua Layanan Online</span>
                                </div>
                                <p className="text-[11px] text-slate-500">
                                    Database MariaDB, Trigger Stok, dan Stored Procedure aktif normal.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-3">
                        <p>© {new Date().getFullYear()} MARTIN MART. Seluruh hak cipta dilindungi.</p>
                        <p>Laravel 12 • Inertia.js • React • Tailwind CSS</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
