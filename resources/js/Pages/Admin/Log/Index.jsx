import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Pagination from '@/Components/Pagination';
import { IconClipboardList, IconSearch, IconUsers, IconBox } from '@/Components/Icons';
import { formatDateTime } from '@/Utils/format';

export default function LogIndex({
    logs,
    log_pelanggan,
    log_perubahan_nama,
    active_tab = 'stok',
    aksi_list = [],
    filters = {},
}) {
    const [currentTab, setCurrentTab] = useState(active_tab);
    const [search, setSearch] = useState(filters.search || '');
    const [aksi, setAksi] = useState(filters.aksi || '');

    const switchTab = (tabName) => {
        setCurrentTab(tabName);
        router.get(
            route('admin.log.index'),
            { tab: tabName, search, aksi },
            { preserveState: true }
        );
    };

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(
            route('admin.log.index'),
            { tab: currentTab, search, aksi },
            { preserveState: true }
        );
    };

    return (
        <AppLayout
            header={
                <div>
                    <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                        Audit Log Database (db_tokokita)
                    </h1>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        Memantau riwayat audit mutasi data otomatis dari Trigger Database MySQL
                    </p>
                </div>
            }
        >
            <Head title="Audit Log - NAUFAM MART" />

            {/* Banner explaining all native triggers */}
            <div className="mb-6 p-5 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-indigo-950 text-xs shadow-xs">
                <div className="flex items-start space-x-3">
                    <span className="p-2.5 bg-indigo-100 text-indigo-800 rounded-xl shrink-0 mt-0.5 border border-indigo-300">
                        <IconClipboardList className="w-5 h-5" />
                    </span>
                    <div className="space-y-1">
                        <h4 className="font-black text-sm text-indigo-950">
                            Pusat Audit Trail dari Trigger MySQL (db_tokokita)
                        </h4>
                        <p className="text-indigo-900 font-semibold leading-relaxed">
                            Sistem ini mengintegrasikan seluruh Trigger aktif di basis data:
                        </p>
                        <ul className="list-disc pl-4 space-y-0.5 text-indigo-950 font-bold">
                            <li><code className="font-black">after_update_stok_produk</code>: Otomatis mencatat mutasi stok ke <code className="bg-white px-1.5 py-0.5 rounded font-black border border-indigo-200">tbl_log</code>.</li>
                            <li><code className="font-black">after_insert_pelanggan</code> & <code className="font-black">after_delete_pelanggan</code>: Otomatis mencatat registrasi & hapus ke <code className="bg-white px-1.5 py-0.5 rounded font-black border border-indigo-200">log_pelanggan</code>.</li>
                            <li><code className="font-black">after_update_pelanggan</code>: Otomatis mencatat riwayat perubahan nama ke <code className="bg-white px-1.5 py-0.5 rounded font-black border border-indigo-200">log_perubahan_pelanggan</code>.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center space-x-2 border-b-2 border-slate-200 mb-6">
                <button
                    onClick={() => switchTab('stok')}
                    className={`flex items-center space-x-2 px-5 py-3 text-xs font-black border-b-2 transition-all ${
                        currentTab === 'stok'
                            ? 'border-blue-700 text-blue-900 bg-white rounded-t-xl shadow-xs'
                            : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                    <IconBox className="w-4 h-4" />
                    <span>Log Mutasi Stok (tbl_log)</span>
                </button>

                <button
                    onClick={() => switchTab('pelanggan')}
                    className={`flex items-center space-x-2 px-5 py-3 text-xs font-black border-b-2 transition-all ${
                        currentTab === 'pelanggan'
                            ? 'border-blue-700 text-blue-900 bg-white rounded-t-xl shadow-xs'
                            : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                    <IconUsers className="w-4 h-4" />
                    <span>Log Pendaftaran Pelanggan (log_pelanggan)</span>
                </button>

                <button
                    onClick={() => switchTab('perubahan_nama')}
                    className={`flex items-center space-x-2 px-5 py-3 text-xs font-black border-b-2 transition-all ${
                        currentTab === 'perubahan_nama'
                            ? 'border-blue-700 text-blue-900 bg-white rounded-t-xl shadow-xs'
                            : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                    <IconClipboardList className="w-4 h-4" />
                    <span>Log Perubahan Nama (log_perubahan_pelanggan)</span>
                </button>
            </div>

            {/* TAB 1: LOG STOK PRODUK (tbl_log) */}
            {currentTab === 'stok' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <form onSubmit={handleFilter} className="p-6 border-b border-slate-100 flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[240px]">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari deskripsi mutasi stok..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:border-blue-600 focus:ring-blue-600 shadow-2xs"
                            />
                            <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>

                        <select
                            value={aksi}
                            onChange={(e) => {
                                setAksi(e.target.value);
                                router.get(
                                    route('admin.log.index'),
                                    { tab: 'stok', search, aksi: e.target.value },
                                    { preserveState: true }
                                );
                            }}
                            className="py-2 px-3 rounded-xl border border-slate-300 text-sm text-slate-700 focus:border-blue-600 focus:ring-blue-600 shadow-2xs"
                        >
                            <option value="">Semua Tipe Aksi</option>
                            {aksi_list.map((ak, idx) => (
                                <option key={idx} value={ak}>
                                    {ak}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
                        >
                            Cari
                        </button>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5 w-20">ID Log</th>
                                    <th className="px-6 py-3.5">Waktu Mutasi</th>
                                    <th className="px-6 py-3.5">Tabel Terkait</th>
                                    <th className="px-6 py-3.5">Aksi</th>
                                    <th className="px-6 py-3.5">Deskripsi Perubahan Stok</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                                            Tidak ada riwayat mutasi stok tercatat.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((item) => (
                                        <tr key={item.id_log} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-xs text-slate-500">
                                                #{item.id_log}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                                                {formatDateTime(item.waktu)}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono font-semibold text-blue-700">
                                                {item.tabel_terkait}
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-amber-100 text-amber-800 border border-amber-200">
                                                    {item.aksi}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-800 font-medium">
                                                {item.deskripsi}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={logs.links} />
                </div>
            )}

            {/* TAB 2: LOG PELANGGAN (log_pelanggan) */}
            {currentTab === 'pelanggan' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs text-slate-600">
                        ⚡ Dicatat otomatis oleh trigger <code className="font-bold text-blue-700">after_insert_pelanggan</code> dan <code className="font-bold text-rose-700">after_delete_pelanggan</code>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5 w-20">ID Log</th>
                                    <th className="px-6 py-3.5">Waktu Pencatatan</th>
                                    <th className="px-6 py-3.5">Aktivitas Trigger</th>
                                    <th className="px-6 py-3.5">ID Pelanggan Terkait</th>
                                    <th className="px-6 py-3.5">Nama Pelanggan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {log_pelanggan.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                                            Belum ada log pelanggan yang tercatat.
                                        </td>
                                    </tr>
                                ) : (
                                    log_pelanggan.data.map((item) => (
                                        <tr key={item.id_log} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-xs text-slate-500">
                                                #{item.id_log}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                                                {formatDateTime(item.waktu)}
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                                        item.aktivitas.includes('INSERT')
                                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                                                    }`}
                                                >
                                                    {item.aktivitas}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-xs text-slate-600">
                                                PLG-{String(item.id_pelanggan).padStart(4, '0')}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                                                {item.pelanggan?.nama_pelanggan || '(Telah Dihapus)'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={log_pelanggan.links} />
                </div>
            )}

            {/* TAB 3: LOG PERUBAHAN NAMA PELANGGAN (log_perubahan_pelanggan) */}
            {currentTab === 'perubahan_nama' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs text-slate-600">
                        ⚡ Dicatat otomatis oleh trigger <code className="font-bold text-blue-700">after_update_pelanggan</code> setiap kali nama pelanggan diubah
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5 w-20">ID Log</th>
                                    <th className="px-6 py-3.5">Waktu Perubahan</th>
                                    <th className="px-6 py-3.5">ID Pelanggan</th>
                                    <th className="px-6 py-3.5">Nama Sebelumnya (OLD)</th>
                                    <th className="px-6 py-3.5">Nama Baru (NEW)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {log_perubahan_nama.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                                            Belum ada catatan perubahan nama pelanggan.
                                        </td>
                                    </tr>
                                ) : (
                                    log_perubahan_nama.data.map((item) => (
                                        <tr key={item.id_log} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-xs text-slate-500">
                                                #{item.id_log}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                                                {formatDateTime(item.waktu)}
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-xs text-slate-600">
                                                PLG-{String(item.id_pelanggan).padStart(4, '0')}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-semibold text-rose-700 bg-rose-50/50">
                                                {item.nama_lama}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-emerald-700 bg-emerald-50/50">
                                                {item.nama_baru}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={log_perubahan_nama.links} />
                </div>
            )}
        </AppLayout>
    );
}
