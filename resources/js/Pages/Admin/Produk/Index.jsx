import React, { useState, useRef } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ModalDialog from '@/Components/ModalDialog';
import Pagination from '@/Components/Pagination';
import Barcode from 'react-barcode';
import {
    IconPlus,
    IconSearch,
    IconEdit,
    IconTrash,
    IconBox,
    IconBarcode,
    IconSparkles,
    IconPrinter,
    IconClipboardList,
} from '@/Components/Icons';
import { formatRupiah } from '@/Utils/format';

export default function ProdukIndex({
    produk,
    kategori_list = [],
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [idKategori, setIdKategori] = useState(filters.id_kategori || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const barcodeInputRef = useRef(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        id_kategori: '',
        nama_produk: '',
        kode_barcode: '',
        harga: '',
        stok: '',
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            route('admin.produk.index'),
            {
                search,
                id_kategori: idKategori,
            },
            { preserveState: true }
        );
    };

    // Fungsi Generate Kode Barcode Otomatis: PRD-YYYYMMDD-XXXX
    const handleGenerateBarcode = () => {
        const today = new Date();
        const yyyymmdd = today.toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const generatedCode = `PRD-${yyyymmdd}-${randomNum}`;
        setData('kode_barcode', generatedCode);
    };

    const openAddModal = () => {
        setEditingItem(null);
        reset({
            id_kategori: kategori_list[0]?.id_kategori || '',
            nama_produk: '',
            kode_barcode: '',
            harga: '',
            stok: '',
        });
        clearErrors();
        setModalOpen(true);
        setTimeout(() => {
            barcodeInputRef.current?.focus();
        }, 150);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setData({
            id_kategori: item.id_kategori,
            nama_produk: item.nama_produk,
            kode_barcode: item.kode_barcode || '',
            harga: item.harga,
            stok: item.stok,
        });
        clearErrors();
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            put(route('admin.produk.update', editingItem.id_produk), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.produk.store'), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        }
    };

    const confirmDelete = (item) => {
        setItemToDelete(item);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        router.delete(route('admin.produk.destroy', itemToDelete.id_produk), {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setItemToDelete(null);
            },
        });
    };

    return (
        <AppLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                    <div>
                        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                            Master Data Produk & Barcode
                        </h1>
                        <p className="text-xs font-semibold text-slate-600 mt-0.5">
                            Kelola katalog barang, label barcode scanner (Code128), harga, dan stok inventaris toko
                        </p>
                    </div>

                    <div className="flex items-center space-x-2.5">
                        <Link
                            href={route('admin.produk.cetak-label')}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-blue-800 border-2 border-blue-300 rounded-xl text-xs font-black shadow-2xs transition-colors"
                        >
                            <IconBarcode className="w-4 h-4 text-blue-700" />
                            <span>Cetak Label Barcode</span>
                        </Link>
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors active:scale-95"
                        >
                            <IconPlus className="w-4 h-4" />
                            <span>+ Tambah Produk Baru</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Master Produk & Barcode - NAUFAM MART" />

            {/* Database Trigger Info Banner */}
            <div className="mb-6 p-4 rounded-xl bg-blue-50 border-2 border-blue-200 text-blue-950 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                    <IconClipboardList className="w-5 h-5 text-blue-700 shrink-0" />
                    <span>
                        <strong>Trigger Aktif:</strong> Setiap perubahan stok produk otomatis mengaktifkan trigger{' '}
                        <code className="bg-white px-2 py-0.5 rounded border border-blue-300 font-mono text-[11px] font-black text-blue-900">
                            after_update_stok_produk
                        </code>{' '}
                        dan tercatat permanen di riwayat Audit Log.
                    </span>
                </div>
                <a
                    href={route('admin.log.index')}
                    className="font-black underline text-blue-800 hover:text-blue-950 shrink-0 ml-3"
                >
                    Lihat Audit Log →
                </a>
            </div>

            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xs overflow-hidden">
                {/* Search & Filter Bar */}
                <div className="p-6 border-b-2 border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3 flex-1">
                        <div className="relative flex-1 min-w-[240px]">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama produk atau kode barcode..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                            />
                            <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>

                        <select
                            value={idKategori}
                            onChange={(e) => {
                                setIdKategori(e.target.value);
                                router.get(
                                    route('admin.produk.index'),
                                    { search, id_kategori: e.target.value },
                                    { preserveState: true }
                                );
                            }}
                            className="py-2 px-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                        >
                            <option value="">Semua Kategori</option>
                            {kategori_list.map((kat) => (
                                <option key={kat.id_kategori} value={kat.id_kategori}>
                                    {kat.nama_kategori}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black border border-slate-300 transition-colors"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {/* Table Produk */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y-2 divide-slate-100 text-left text-sm">
                        <thead className="bg-slate-100 text-slate-900 text-xs uppercase font-black border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3.5">ID Produk</th>
                                <th className="px-6 py-3.5">Nama Produk</th>
                                <th className="px-6 py-3.5">Kode Barcode (Code128)</th>
                                <th className="px-6 py-3.5">Kategori</th>
                                <th className="px-6 py-3.5 text-right">Harga Jual</th>
                                <th className="px-6 py-3.5 text-center">Sisa Stok</th>
                                <th className="px-6 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {produk.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500 font-bold">
                                        Tidak ada produk yang cocok dengan pencarian Anda.
                                    </td>
                                </tr>
                            ) : (
                                produk.data.map((item) => (
                                    <tr key={item.id_produk} className="hover:bg-blue-50/40 transition-colors">
                                        <td className="px-6 py-4 text-xs font-mono font-black text-slate-700">
                                            PRD-{String(item.id_produk).padStart(4, '0')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-slate-950 block text-sm">
                                                {item.nama_produk}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.kode_barcode ? (
                                                <div className="flex items-center space-x-2">
                                                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-950 font-mono text-xs font-black border border-slate-300">
                                                        <IconBarcode className="w-3.5 h-3.5 text-blue-700" />
                                                        <span>{item.kode_barcode}</span>
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-amber-800 italic font-black">
                                                    ⚠️ Belum Ada Barcode
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-950 font-black border border-blue-200">
                                                {item.kategori?.nama_kategori || 'Tanpa Kategori'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-blue-900 text-sm">
                                            {formatRupiah(item.harga)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border-2 ${
                                                    item.stok <= 0
                                                        ? 'bg-rose-100 text-rose-950 border-rose-300'
                                                        : item.stok <= 5
                                                        ? 'bg-amber-100 text-amber-950 border-amber-300'
                                                        : 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                                }`}
                                            >
                                                {item.stok <= 0 ? 'HABIS (0 unit)' : `${item.stok} unit`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                                            <Link
                                                href={route('admin.produk.cetak-label', { search: item.kode_barcode || item.nama_produk })}
                                                className="inline-flex p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-colors border border-blue-300"
                                                title="Cetak Label Barcode Produk Ini"
                                            >
                                                <IconPrinter className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit Produk / Stok / Barcode"
                                            >
                                                <IconEdit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(item)}
                                                className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Hapus Produk"
                                            >
                                                <IconTrash className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={produk.links} />
            </div>

            {/* Add / Edit Modal with Barcode Generator */}
            <ModalDialog
                show={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingItem ? 'Edit Produk, Stok & Barcode' : 'Tambah Produk & Buat Barcode Baru'}
                maxWidth="max-w-lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Kategori Produk */}
                    <div>
                        <label className="block text-xs font-black text-slate-900 mb-1">
                            Kategori Produk <span className="text-rose-600">*</span>
                        </label>
                        <select
                            value={data.id_kategori}
                            onChange={(e) => setData('id_kategori', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                            required
                        >
                            <option value="">Pilih Kategori</option>
                            {kategori_list.map((kat) => (
                                <option key={kat.id_kategori} value={kat.id_kategori}>
                                    {kat.nama_kategori}
                                </option>
                            ))}
                        </select>
                        {errors.id_kategori && (
                            <p className="text-xs text-rose-600 font-bold mt-1">{errors.id_kategori}</p>
                        )}
                    </div>

                    {/* Nama Produk */}
                    <div>
                        <label className="block text-xs font-black text-slate-900 mb-1">
                            Nama Produk <span className="text-rose-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.nama_produk}
                            onChange={(e) => setData('nama_produk', e.target.value)}
                            placeholder="Contoh: Mouse Wireless Logitech M170"
                            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                            required
                        />
                        {errors.nama_produk && (
                            <p className="text-xs text-rose-600 font-bold mt-1">{errors.nama_produk}</p>
                        )}
                    </div>

                    {/* Input Barcode Scanner & Tombol Generate Otomatis */}
                    <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-slate-950 flex items-center space-x-1.5">
                                <IconBarcode className="w-4 h-4 text-blue-700" />
                                <span>Kode Barcode (Scan USB / Input Manual)</span>
                            </label>

                            <button
                                type="button"
                                onClick={handleGenerateBarcode}
                                className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-950 rounded-lg text-xs font-black transition-colors border border-blue-300 shadow-2xs"
                                title="Buat kode barcode unik otomatis"
                            >
                                <IconSparkles className="w-3.5 h-3.5 text-blue-700" />
                                <span>Generate Otomatis</span>
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                ref={barcodeInputRef}
                                value={data.kode_barcode}
                                onChange={(e) => setData('kode_barcode', e.target.value)}
                                placeholder="Scan dengan USB Barcode Scanner atau klik 'Generate Otomatis'..."
                                className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-slate-300 font-mono text-xs font-black text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 bg-white shadow-2xs"
                            />
                            <IconBarcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>

                        {/* Live Barcode Preview */}
                        {data.kode_barcode && data.kode_barcode.trim().length > 0 && (
                            <div className="p-3 bg-white rounded-lg border-2 border-slate-200 flex flex-col items-center justify-center">
                                <span className="text-[10.5px] font-bold text-slate-600 mb-1">Pratinjau Barcode Code128:</span>
                                <Barcode
                                    value={data.kode_barcode}
                                    format="CODE128"
                                    width={1.3}
                                    height={38}
                                    fontSize={11}
                                    margin={0}
                                />
                            </div>
                        )}

                        <p className="text-[11px] font-semibold text-slate-600">
                            💡 Gunakan scanner USB pada barcode kemasan pabrik, atau buat kode otomatis jika barang tidak memiliki barcode bawaan.
                        </p>
                        {errors.kode_barcode && (
                            <p className="text-xs text-rose-600 font-bold mt-1">{errors.kode_barcode}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-slate-900 mb-1">
                                Harga Satuan (Rp) <span className="text-rose-600">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="1000"
                                value={data.harga}
                                onChange={(e) => setData('harga', e.target.value)}
                                placeholder="150000"
                                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                                required
                            />
                            {errors.harga && (
                                <p className="text-xs text-rose-600 font-bold mt-1">{errors.harga}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-900 mb-1">
                                Jumlah Stok <span className="text-rose-600">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.stok}
                                onChange={(e) => setData('stok', e.target.value)}
                                placeholder="50"
                                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                                required
                            />
                            {errors.stok && (
                                <p className="text-xs text-rose-600 mt-1">{errors.stok}</p>
                            )}
                        </div>
                    </div>

                    {editingItem && (
                        <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                            ℹ️ Jika Anda mengubah nilai stok, Trigger database akan secara otomatis mencatat perubahan ini di <code className="font-bold">tbl_log</code>.
                        </p>
                    )}

                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Produk'}
                        </button>
                    </div>
                </form>
            </ModalDialog>

            {/* Delete Modal */}
            <ModalDialog
                show={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Konfirmasi Hapus Produk"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Hapus produk <strong className="text-slate-900 font-bold">"{itemToDelete?.nama_produk}"</strong>?
                    </p>
                    <p className="text-xs text-slate-500">
                        Produk yang sudah pernah memiliki riwayat transaksi tidak dapat dihapus.
                    </p>
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setDeleteModalOpen(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
                        >
                            Hapus Sekarang
                        </button>
                    </div>
                </div>
            </ModalDialog>
        </AppLayout>
    );
}
