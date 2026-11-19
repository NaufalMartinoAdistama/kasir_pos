export function formatRupiah(value) {
    if (value === null || value === undefined || isNaN(value)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateString;
    }
}

export const formatTanggal = formatDate;

export function formatDateTime(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    } catch {
        return dateString;
    }
}

export function formatFullDayDateTime(date = new Date()) {
    try {
        const d = date instanceof Date ? date : new Date(date);
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];

        const dayName = days[d.getDay()];
        const day = d.getDate();
        const monthName = months[d.getMonth()];
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return `${dayName}, ${day} ${monthName} ${year} • ${hours}:${minutes}:${seconds} WIB`;
    } catch {
        return '';
    }
}

export function getPaymentBadgeProps(metode) {
    const m = (metode || 'Tunai').trim();
    const lower = m.toLowerCase();

    if (lower === 'tunai' || lower === 'cash') {
        return {
            label: m,
            icon: '💵',
            className: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        };
    }
    if (lower.includes('qris')) {
        return {
            label: m,
            icon: '📱',
            className: 'bg-rose-50 text-rose-800 border-rose-300',
        };
    }
    if (lower.includes('virtual account') || lower.includes('va')) {
        return {
            label: m,
            icon: '🏦',
            className: 'bg-blue-50 text-blue-800 border-blue-300',
        };
    }
    if (lower.includes('shopee') || lower.includes('ovo') || lower.includes('dana') || lower.includes('gopay') || lower.includes('linkaja')) {
        return {
            label: m,
            icon: '👛',
            className: 'bg-amber-50 text-amber-800 border-amber-300',
        };
    }
    if (lower.includes('kartu') || lower.includes('debit') || lower.includes('kredit')) {
        return {
            label: m,
            icon: '💳',
            className: 'bg-purple-50 text-purple-800 border-purple-300',
        };
    }
    return {
        label: m,
        icon: '💳',
        className: 'bg-sky-50 text-sky-800 border-sky-300',
    };
}
