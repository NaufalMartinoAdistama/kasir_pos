<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Penjualan - MARTIN MART</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 11px;
            line-height: 1.4;
            margin: 0;
            padding: 10px;
        }

        .header-table {
            width: 100%;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 12px;
            margin-bottom: 15px;
        }

        .brand-title {
            font-size: 20px;
            font-weight: 900;
            color: #2563eb;
            margin: 0;
            letter-spacing: -0.5px;
        }

        .brand-subtitle {
            font-size: 10px;
            color: #64748b;
            margin: 2px 0 0 0;
            font-weight: 600;
        }

        .report-title-box {
            text-align: center;
            margin-bottom: 15px;
            padding: 8px;
            background-color: #eff6ff;
            border-radius: 6px;
            border: 1px solid #bfdbfe;
        }

        .report-title {
            font-size: 14px;
            font-weight: 800;
            color: #1e40af;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .report-subtitle {
            font-size: 10px;
            color: #3b82f6;
            margin: 3px 0 0 0;
            font-weight: 700;
        }

        .summary-table {
            width: 100%;
            margin-bottom: 15px;
        }

        .summary-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 12px;
            text-align: center;
        }

        .summary-label {
            font-size: 9px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 700;
        }

        .summary-value {
            font-size: 13px;
            font-weight: 900;
            color: #1e3a8a;
            margin-top: 3px;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .data-table th {
            background-color: #2563eb;
            color: #ffffff;
            font-size: 9.5px;
            font-weight: 800;
            text-transform: uppercase;
            padding: 7px 8px;
            text-align: left;
            border: 1px solid #1d4ed8;
        }

        .data-table td {
            padding: 6px 8px;
            border: 1px solid #e2e8f0;
            font-size: 9.5px;
        }

        .data-table tr:nth-child(even) {
            background-color: #f8fafc;
        }

        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: 700; }
        .font-mono { font-family: 'Courier New', Courier, monospace; }

        .total-row td {
            background-color: #dbeafe !important;
            font-weight: 800;
            color: #1e3a8a;
            border-top: 2px solid #3b82f6;
            font-size: 10.5px;
        }

        .signature-table {
            width: 100%;
            margin-top: 30px;
            page-break-inside: avoid;
        }

        .signature-box {
            text-align: center;
            width: 35%;
        }

        .signature-line {
            margin-top: 55px;
            border-bottom: 1px solid #334155;
            font-weight: 800;
            color: #0f172a;
        }
    </style>
</head>
<body>

    <!-- Header / Kop Surat Toko -->
    <table class="header-table">
        <tr>
            <td style="width: 70%;">
                <h1 class="brand-title">🏪 MARTIN MART</h1>
                <p class="brand-subtitle">
                    Supermarket, Ritel & POS Modern Terintegrasi<br>
                    Jl. Ahmad Yani No. 88 • Telp: (0548) 22345 • WhatsApp: 0812-3456-7890
                </p>
            </td>
            <td style="width: 30%; text-align: right; vertical-align: bottom;">
                <span style="font-size: 9px; color: #64748b;">
                    Dicetak: {{ date('d/m/Y H:i') }} WIB<br>
                    Petugas: {{ auth()->check() ? auth()->user()->name : 'Administrator' }}
                </span>
            </td>
        </tr>
    </table>

    <!-- Judul Laporan & Periode -->
    <div class="report-title-box">
        <h2 class="report-title">LAPORAN REKAPITULASI PENJUALAN</h2>
        <p class="report-subtitle">Periode: {{ $periode_info ?? 'Semua Waktu' }}</p>
    </div>

    <!-- Ringkasan Statistik Periode -->
    <table class="summary-table">
        <tr>
            <td style="width: 33.3%;">
                <div class="summary-card">
                    <div class="summary-label">Total Omset Pendapatan</div>
                    <div class="summary-value" style="color: #2563eb;">Rp {{ number_format($total_omset ?? 0, 0, ',', '.') }}</div>
                </div>
            </td>
            <td style="width: 33.3%; padding: 0 8px;">
                <div class="summary-card">
                    <div class="summary-label">Total Item Terjual</div>
                    <div class="summary-value" style="color: #059669;">{{ number_format($total_item ?? 0, 0, ',', '.') }} Unit</div>
                </div>
            </td>
            <td style="width: 33.3%;">
                <div class="summary-card">
                    <div class="summary-label">Jumlah Faktur Transaksi</div>
                    <div class="summary-value" style="color: #4f46e5;">{{ number_format($total_transaksi ?? 0, 0, ',', '.') }} Faktur</div>
                </div>
            </td>
        </tr>
    </table>

    <!-- Tabel Rincian Data Penjualan -->
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 14%;" class="text-center">No Faktur</th>
                <th style="width: 12%;" class="text-center">Tanggal</th>
                <th style="width: 18%;">Pelanggan</th>
                <th style="width: 14%;">Kategori</th>
                <th style="width: 22%;">Produk</th>
                <th style="width: 10%;" class="text-right">Harga</th>
                <th style="width: 8%;" class="text-center">Qty</th>
                <th style="width: 12%;" class="text-right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @forelse($items as $row)
                <tr>
                    <td class="text-center font-mono font-bold">#TRX-{{ str_pad($row->id_transaksi, 5, '0', STR_PAD_LEFT) }}</td>
                    <td class="text-center">{{ $row->tanggal ? date('d/m/Y', strtotime($row->tanggal)) : '-' }}</td>
                    <td class="font-bold">{{ $row->nama_pelanggan ?: 'Pelanggan Umum' }}</td>
                    <td>{{ $row->nama_kategori ?: 'Umum' }}</td>
                    <td>{{ $row->nama_produk }}</td>
                    <td class="text-right">Rp {{ number_format($row->harga, 0, ',', '.') }}</td>
                    <td class="text-center font-bold">{{ $row->jumlah }}</td>
                    <td class="text-right font-bold">Rp {{ number_format($row->subtotal, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" class="text-center" style="padding: 20px; color: #94a3b8;">
                        Tidak ada catatan transaksi penjualan pada periode ini.
                    </td>
                </tr>
            @endforelse

            <!-- Baris Total Keseluruhan -->
            <tr class="total-row">
                <td colspan="6" class="text-right" style="padding-right: 15px;">TOTAL KESELURUHAN:</td>
                <td class="text-center">{{ number_format($total_item ?? 0, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($total_omset ?? 0, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <!-- Tanda Tangan Mengetahui -->
    <table class="signature-table">
        <tr>
            <td style="width: 60%;"></td>
            <td class="signature-box">
                <p style="margin: 0; font-size: 10px; color: #64748b;">
                    Bontang, {{ date('d F Y') }}<br>
                    <strong>Kasir / Penanggung Jawab Toko,</strong>
                </p>
                <div class="signature-line">
                    {{ auth()->check() ? auth()->user()->name : 'Manager Toko' }}
                </div>
                <span style="font-size: 9px; color: #94a3b8;">NIP: {{ auth()->check() && auth()->user()->id ? 'EMP-'.str_pad(auth()->user()->id, 4, '0', STR_PAD_LEFT) : 'ADM-0001' }}</span>
            </td>
        </tr>
    </table>

</body>
</html>
