import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ModalDialog from '@/Components/ModalDialog';
import Pagination from '@/Components/Pagination';
import {
    IconPlus,
    IconSearch,
    IconEdit,
    IconTrash,
    IconUserShield,
} from '@/Components/Icons';
import { formatDateTime } from '@/Utils/format';

export default function UserIndex({ users, filters = {} }) {
    const { auth } = usePage().props;
    const currentUserId = auth?.user?.id;

    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        role: 'kasir',
        password: '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.user.index'), { search, role }, { preserveState: true });
    };

    const openAddModal = () => {
        setEditingItem(null);
        reset({
            name: '',
            email: '',
            role: 'kasir',
            password: '',
        });
        clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setData({
            name: item.name,
            email: item.email,
            role: item.role,
            password: '',
        });
        clearErrors();
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            put(route('admin.user.update', editingItem.id), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.user.store'), {
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
        router.delete(route('admin.user.destroy', itemToDelete.id), {
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
                        Manajemen Pengguna Aplikasi
                    </h1>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        Kelola akun hak akses Admin dan Kasir operasional (tabel users)
                    </p>
                </div>
            }
        >
            <Head title="Manajemen Pengguna - MARTIN MART" />

            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xs overflow-hidden">
                {/* Search & Actions */}
                <div className="p-6 border-b-2 border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3 flex-1 max-w-md">
                        <div className="relative flex-1 min-w-[200px]">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama atau email..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                            />
                            <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        </div>

                        <select
                            value={role}
                            onChange={(e) => {
                                setRole(e.target.value);
                                router.get(
                                    route('admin.user.index'),
                                    { search, role: e.target.value },
                                    { preserveState: true }
                                );
                            }}
                            className="py-2.5 px-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                        >
                            <option value="">Semua Role</option>
                            <option value="admin">Admin</option>
                            <option value="kasir">Kasir</option>
                        </select>
                    </form>

                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors shrink-0 active:scale-95"
                    >
                        <IconPlus className="w-4 h-4" />
                        <span>+ Tambah Pengguna Baru</span>
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y-2 divide-slate-100 text-left text-sm">
                        <thead className="bg-slate-100 text-slate-900 text-xs uppercase font-black border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3.5">Nama</th>
                                <th className="px-6 py-3.5">Email</th>
                                <th className="px-6 py-3.5">Role Hak Akses</th>
                                <th className="px-6 py-3.5">Waktu Dibuat</th>
                                <th className="px-6 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-bold">
                                        Tidak ada pengguna yang cocok dengan kriteria pencarian.
                                    </td>
                                </tr>
                            ) : (
                                users.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                                        <td className="px-6 py-4 font-black text-slate-950 flex items-center space-x-2.5">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                                                {item.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span>{item.name}</span>
                                            {item.id === currentUserId && (
                                                <span className="text-[10px] bg-blue-100 text-blue-950 border border-blue-300 px-2 py-0.5 rounded-full font-black">
                                                    Anda
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-700">
                                            {item.email}
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <span
                                                className={`px-3 py-1 rounded-full font-black uppercase text-[10.5px] border ${
                                                    item.role === 'admin'
                                                        ? 'bg-blue-100 text-blue-950 border-blue-300'
                                                        : 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                                }`}
                                            >
                                                {item.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-600">
                                            {formatDateTime(item.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit Pengguna"
                                            >
                                                <IconEdit className="w-4 h-4" />
                                            </button>
                                            {item.id !== currentUserId && (
                                                <button
                                                    onClick={() => confirmDelete(item)}
                                                    className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Hapus Pengguna"
                                                >
                                                    <IconTrash className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={users.links} />
            </div>

            {/* Add / Edit Modal */}
            <ModalDialog
                show={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingItem ? 'Edit Akun Pengguna' : 'Tambah Pengguna Baru'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nama Lengkap <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Contoh: Ahmad Kasir"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-600 focus:ring-blue-600 shadow-2xs"
                            required
                        />
                        {errors.name && (
                            <p className="text-xs text-rose-600 mt-1">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Alamat Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="kasir@toko.com"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-600 focus:ring-blue-600 shadow-2xs"
                            required
                        />
                        {errors.email && (
                            <p className="text-xs text-rose-600 mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Hak Akses (Role) <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-600 focus:ring-blue-600 shadow-2xs"
                            required
                        >
                            <option value="kasir">Kasir (Operasional Penjualan & POS)</option>
                            <option value="admin">Admin (Akses Penuh Master Data & Laporan)</option>
                        </select>
                        {errors.role && (
                            <p className="text-xs text-rose-600 mt-1">{errors.role}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            {editingItem ? 'Kata Sandi Baru (Kosongkan jika tidak diubah)' : 'Kata Sandi (Password)'}{' '}
                            {!editingItem && <span className="text-rose-500">*</span>}
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Minimal 6 karakter"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-600 focus:ring-blue-600 shadow-2xs"
                            required={!editingItem}
                        />
                        {errors.password && (
                            <p className="text-xs text-rose-600 mt-1">{errors.password}</p>
                        )}
                    </div>

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
                            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Pengguna'}
                        </button>
                    </div>
                </form>
            </ModalDialog>

            {/* Delete Modal */}
            <ModalDialog
                show={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Konfirmasi Hapus Akun"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Hapus akun pengguna <strong className="text-slate-900 font-bold">"{itemToDelete?.name}"</strong> ({itemToDelete?.email})?
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
