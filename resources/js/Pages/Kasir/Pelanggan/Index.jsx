import React, { useState, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ModalDialog from '@/Components/ModalDialog';
import MemberCardModal from '@/Components/MemberCardModal';
import Pagination from '@/Components/Pagination';
import {
    IconPlus,
    IconSearch,
    IconEdit,
    IconUsers,
    IconRfid,
    IconIdCard,
    IconCheckCircle,
} from '@/Components/Icons';
import { playRfidSuccessBeep } from '@/Utils/sound';

export default function KasirPelangganIndex({ pelanggan, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [cardModalOpen, setCardModalOpen] = useState(false);
    const [selectedMemberForCard, setSelectedMemberForCard] = useState(null);
    const [rfidDetected, setRfidDetected] = useState(false);

    const rfidInputRef = useRef(null);
    const namaInputRef = useRef(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nama_pelanggan: '',
        kota: '',
        kode_rfid: '',
        poin: 0,
        status_member: 'Reguler',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('kasir.pelanggan.index'), { search }, { preserveState: true });
    };

    const openAddModal = () => {
        setEditingItem(null);
        reset();
        clearErrors();
        setRfidDetected(false);
        setModalOpen(true);
        setTimeout(() => {
            rfidInputRef.current?.focus();
        }, 150);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setData({
            nama_pelanggan: item.nama_pelanggan,
            kota: item.kota,
            kode_rfid: item.kode_rfid || '',
            poin: item.poin || 0,
            status_member: item.status_member || (item.kode_rfid ? 'Member RFID' : 'Reguler'),
        });
        clearErrors();
        setRfidDetected(false);
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            put(route('kasir.pelanggan.update', editingItem.id_pelanggan), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('kasir.pelanggan.store'), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleOpenCard = (item) => {
        setSelectedMemberForCard(item);
        setCardModalOpen(true);
    };

    return (
        <AppLayout
            header={
                <div>
                    <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                        Data Pelanggan & Member Toko (Kasir)
                    </h1>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        Pendaftaran cepat pelanggan baru, tap kartu member RFID (USB Reader), dan cetak kartu member
                    </p>
                </div>
            }
        >
            <Head title="Data Pelanggan - NAUFAM MART" />

            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xs overflow-hidden">
                {/* Search Bar & Add Button */}
                <div className="p-6 border-b-2 border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama, kota, atau UID RFID..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-950 placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                        />
                        <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </form>

                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors shrink-0 active:scale-95"
                    >
                        <IconPlus className="w-4 h-4" />
                        <span>+ Tambah Pelanggan / Member RFID</span>
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y-2 divide-slate-100 text-left text-sm">
                        <thead className="bg-slate-100 text-slate-900 text-xs uppercase font-black border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3.5">ID Pelanggan</th>
                                <th className="px-6 py-3.5">Nama Pelanggan</th>
                                <th className="px-6 py-3.5">Member & RFID</th>
                                <th className="px-6 py-3.5 text-center">Poin</th>
                                <th className="px-6 py-3.5">Kota Asal</th>
                                <th className="px-6 py-3.5 text-center">Status Belanja</th>
                                <th className="px-6 py-3.5 text-center">Transaksi</th>
                                <th className="px-6 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {pelanggan.data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-slate-500 font-bold">
                                        Tidak ada data pelanggan yang cocok dengan pencarian Anda.
                                    </td>
                                </tr>
                            ) : (
                                pelanggan.data.map((item) => (
                                    <tr key={item.id_pelanggan} className="hover:bg-blue-50/40 transition-colors">
                                        <td className="px-6 py-4 text-xs font-mono font-black text-slate-700">
                                            PLG-{String(item.id_pelanggan).padStart(4, '0')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-slate-950 block text-sm">
                                                {item.nama_pelanggan}
                                            </span>
                                            <span className="text-[11px] font-bold text-slate-500">
                                                ID #{item.id_pelanggan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.kode_rfid ? (
                                                <div className="space-y-1">
                                                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-950 text-[10.5px] font-black border border-blue-300 shadow-2xs">
                                                        <IconRfid className="w-3.5 h-3.5 text-blue-700" />
                                                        <span>MEMBER RFID</span>
                                                    </span>
                                                    <div className="text-[11px] font-mono font-black text-slate-700">
                                                        UID: <span className="text-blue-900">{item.kode_rfid}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-500 italic font-bold">
                                                    Pelanggan Reguler
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-950 font-black text-xs border border-amber-300">
                                                ⭐ {item.poin || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-800">
                                            📍 {item.kota}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                                                    item.kategori_status === 'Pelanggan Gold'
                                                        ? 'bg-amber-100 text-amber-950 border-amber-300'
                                                        : item.kategori_status === 'Pelanggan Silver'
                                                        ? 'bg-slate-200 text-slate-950 border-slate-300'
                                                        : 'bg-blue-50 text-blue-950 border-blue-300'
                                                }`}
                                            >
                                                {item.kategori_status || 'Pelanggan Reguler'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-900 border border-slate-300">
                                                {item.transaksi_count || 0} Trx
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                                            <button
                                                onClick={() => handleOpenCard(item)}
                                                className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-colors border border-blue-300"
                                                title="Cetak Kartu Member Pelanggan"
                                            >
                                                <IconIdCard className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit Pelanggan"
                                            >
                                                <IconEdit className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={pelanggan.links} />
            </div>

            {/* Modal Tambah / Edit Pelanggan Kasir */}
            <ModalDialog
                show={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingItem ? 'Edit Data Pelanggan / Member RFID' : 'Pendaftaran Pelanggan & Member RFID Baru'}
                maxWidth="max-w-lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Input Khusus: Tap Kartu RFID Member */}
                    <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-blue-950 flex items-center space-x-1.5">
                                <IconRfid className="w-4 h-4 text-blue-600" />
                                <span>Tap Kartu RFID Member (USB Reader HID)</span>
                            </label>
                            {rfidDetected && (
                                <span className="inline-flex items-center space-x-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-xs animate-bounce">
                                    <IconCheckCircle className="w-3.5 h-3.5" />
                                    <span>Kartu Terdeteksi!</span>
                                </span>
                            )}
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                ref={rfidInputRef}
                                value={data.kode_rfid}
                                onChange={(e) => {
                                    setData('kode_rfid', e.target.value);
                                    if (e.target.value.trim().length > 0) {
                                        setData('status_member', 'Member RFID');
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (data.kode_rfid.trim()) {
                                            setRfidDetected(true);
                                            playRfidSuccessBeep();
                                            namaInputRef.current?.focus();
                                            setTimeout(() => setRfidDetected(false), 3000);
                                        }
                                    }
                                }}
                                placeholder="Klik di sini & tempelkan kartu RFID pada reader..."
                                className="w-full pl-9 pr-24 py-2.5 rounded-xl border border-blue-300 bg-white font-mono text-xs font-extrabold text-slate-900 focus:border-blue-600 focus:ring-blue-600 shadow-2xs"
                            />
                            <IconRfid className="w-4 h-4 text-blue-500 absolute left-3 top-3" />

                            {data.kode_rfid && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData('kode_rfid', '');
                                        setData('status_member', 'Reguler');
                                    }}
                                    className="absolute right-2 top-2 px-2.5 py-1 text-[10px] text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-lg font-bold"
                                >
                                    Kosongkan
                                </button>
                            )}
                        </div>
                        <p className="text-[10.5px] text-blue-700 leading-tight">
                            ⚡ Reader akan otomatis mengetikkan UID kartu dan memindahkan kursor saat kartu di-tap.
                        </p>
                        {errors.kode_rfid && (
                            <p className="text-xs text-rose-600 font-bold mt-1">{errors.kode_rfid}</p>
                        )}
                    </div>

                    {/* Nama Pelanggan */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nama Pelanggan <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            ref={namaInputRef}
                            value={data.nama_pelanggan}
                            onChange={(e) => setData('nama_pelanggan', e.target.value)}
                            placeholder="Contoh: Hendra Pratama"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-600 focus:ring-blue-600 shadow-2xs"
                            required
                        />
                        {errors.nama_pelanggan && (
                            <p className="text-xs text-rose-600 mt-1">{errors.nama_pelanggan}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Kota Asal <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.kota}
                                onChange={(e) => setData('kota', e.target.value)}
                                placeholder="Contoh: Surabaya"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-600 focus:ring-blue-600 shadow-2xs"
                                required
                            />
                            {errors.kota && (
                                <p className="text-xs text-rose-600 mt-1">{errors.kota}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Status Member
                            </label>
                            <select
                                value={data.status_member}
                                onChange={(e) => setData('status_member', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-600 focus:ring-blue-600 shadow-2xs"
                            >
                                <option value="Reguler">Reguler</option>
                                <option value="Member RFID">Member RFID</option>
                            </select>
                        </div>
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
                            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Pelanggan'}
                        </button>
                    </div>
                </form>
            </ModalDialog>

            {/* Modal Cetak Kartu Member Pelanggan */}
            <MemberCardModal
                show={cardModalOpen}
                onClose={() => setCardModalOpen(false)}
                pelanggan={selectedMemberForCard}
            />
        </AppLayout>
    );
}
