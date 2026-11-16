import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ModalDialog from '@/Components/ModalDialog';
import { IconPlus, IconSearch, IconEdit, IconTrash, IconTag } from '@/Components/Icons';

export default function KategoriIndex({ kategori = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nama_kategori: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.kategori.index'), { search }, { preserveState: true });
    };

    const openAddModal = () => {
        setEditingItem(null);
        reset();
        clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setData('nama_kategori', item.nama_kategori);
        clearErrors();
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            put(route('admin.kategori.update', editingItem.id_kategori), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.kategori.store'), {
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
        router.delete(route('admin.kategori.destroy', itemToDelete.id_kategori), {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setItemToDelete(null);
            },
        });
    };

    return (
        <AppLayout
            header={
                <div>
                    <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                        Master Data Kategori
                    </h1>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        Kelola kategori klasifikasi produk toko (tbl_kategori)
                    </p>
                </div>
            }
        >
            <Head title="Master Kategori - NAUFAM MART" />

            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xs overflow-hidden">
                {/* Header Actions */}
                <div className="p-6 border-b-2 border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama kategori..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                        />
                        <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </form>

                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors shrink-0 active:scale-95"
                    >
                        <IconPlus className="w-4 h-4" />
                        <span>+ Tambah Kategori Baru</span>
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y-2 divide-slate-100 text-left text-sm">
                        <thead className="bg-slate-100 text-slate-900 text-xs uppercase font-black border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3.5 w-16">No</th>
                                <th className="px-6 py-3.5">ID Kategori</th>
                                <th className="px-6 py-3.5">Nama Kategori</th>
                                <th className="px-6 py-3.5 text-center">Jumlah Produk</th>
                                <th className="px-6 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {kategori.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-bold">
                                        Tidak ada kategori produk yang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                kategori.map((item, index) => (
                                    <tr key={item.id_kategori} className="hover:bg-blue-50/40 transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold text-slate-600">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono font-black text-slate-700">
                                            KAT-{String(item.id_kategori).padStart(3, '0')}
                                        </td>
                                        <td className="px-6 py-4 font-black text-slate-950 text-sm">
                                            {item.nama_kategori}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-950 border border-blue-300">
                                                {item.produk_count || 0} Produk
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit Kategori"
                                            >
                                                <IconEdit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(item)}
                                                className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Hapus Kategori"
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
            </div>

            {/* Add / Edit Modal */}
            <ModalDialog
                show={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingItem ? 'Edit Kategori Produk' : 'Tambah Kategori Baru'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-slate-900 mb-1">
                            Nama Kategori <span className="text-rose-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.nama_kategori}
                            onChange={(e) => setData('nama_kategori', e.target.value)}
                            placeholder="Contoh: Aksesoris Komputer"
                            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                            required
                        />
                        {errors.nama_kategori && (
                            <p className="text-xs text-rose-600 font-bold mt-1">{errors.nama_kategori}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4 border-t-2 border-slate-100">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                        >
                            {processing ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambah Kategori'}
                        </button>
                    </div>
                </form>
            </ModalDialog>

            {/* Delete Confirmation Modal */}
            <ModalDialog
                show={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Konfirmasi Hapus Kategori"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Apakah Anda yakin ingin menghapus kategori{' '}
                        <strong className="text-slate-900 font-bold">"{itemToDelete?.nama_kategori}"</strong>?
                    </p>
                    <p className="text-xs text-slate-500">
                        Kategori yang masih memiliki produk terkait tidak dapat dihapus demi integritas database.
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
