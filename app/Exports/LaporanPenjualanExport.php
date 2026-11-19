<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LaporanPenjualanExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithCustomStartCell
{
    protected $data;
    protected $periodeInfo;
    protected $totalOmset;
    protected $totalItem;

    public function __construct($data, string $periodeInfo = 'Semua Periode')
    {
        $this->data = $data;
        $this->periodeInfo = $periodeInfo;
        $this->totalOmset = $data->sum('subtotal');
        $this->totalItem = $data->sum('jumlah');
    }

    public function collection()
    {
        return $this->data;
    }

    public function startCell(): string
    {
        return 'A5';
    }

    public function headings(): array
    {
        return [
            'No Faktur',
            'Tanggal',
            'Pelanggan',
            'Kota',
            'Kategori',
            'Nama Produk',
            'Harga Satuan (Rp)',
            'Qty',
            'Subtotal (Rp)',
        ];
    }

    public function map($row): array
    {
        $faktur = '#TRX-' . str_pad($row->id_transaksi, 5, '0', STR_PAD_LEFT);
        $tgl = $row->tanggal ? date('d/m/Y H:i', strtotime($row->tanggal)) : '-';

        return [
            $faktur,
            $tgl,
            $row->nama_pelanggan ?: 'Pelanggan Umum',
            $row->kota ?: '-',
            $row->nama_kategori ?: 'Umum',
            $row->nama_produk,
            (float) $row->harga,
            (int) $row->jumlah,
            (float) $row->subtotal,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $rowCount = $this->data->count();
        $lastRow = 5 + $rowCount;
        $totalRow = $lastRow + 1;

        // Title and Header Block
        $sheet->mergeCells('A1:I1');
        $sheet->setCellValue('A1', 'LAPORAN PENJUALAN MARTIN MART');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('FF1E3A8A'));

        $sheet->mergeCells('A2:I2');
        $sheet->setCellValue('A2', 'Periode Laporan: ' . $this->periodeInfo);
        $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(11)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('FF3B82F6'));

        $sheet->mergeCells('A3:I3');
        $sheet->setCellValue('A3', 'Dicetak pada: ' . date('d F Y H:i:s') . ' WIB');
        $sheet->getStyle('A3')->getFont()->setItalic(true)->setSize(9)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('FF64748B'));

        // Table Header Styling (Row 5)
        $sheet->getStyle('A5:I5')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '2563EB'], // Modern Blue
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);
        $sheet->getRowDimension(5)->setRowHeight(26);

        // Data Rows Styling
        if ($rowCount > 0) {
            $sheet->getStyle("A6:I{$lastRow}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'E2E8F0'],
                    ],
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ]);

            // Number formatting for Currency and Qty
            $sheet->getStyle("G6:G{$lastRow}")->getNumberFormat()->setFormatCode('#,##0');
            $sheet->getStyle("H6:H{$lastRow}")->getNumberFormat()->setFormatCode('#,##0');
            $sheet->getStyle("I6:I{$lastRow}")->getNumberFormat()->setFormatCode('#,##0');

            // Alignments
            $sheet->getStyle("A6:A{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("B6:B{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("H6:H{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("G6:G{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("I6:I{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        }

        // Summary Total Row
        $sheet->mergeCells("A{$totalRow}:G{$totalRow}");
        $sheet->setCellValue("A{$totalRow}", 'TOTAL KESELURUHAN:');
        $sheet->setCellValue("H{$totalRow}", $this->totalItem);
        $sheet->setCellValue("I{$totalRow}", $this->totalOmset);

        $sheet->getStyle("A{$totalRow}:I{$totalRow}")->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 11,
                'color' => ['rgb' => '1E293B'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'DBEAFE'], // Soft Blue
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_MEDIUM,
                    'color' => ['rgb' => '3B82F6'],
                ],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        $sheet->getStyle("A{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("H{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("I{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("H{$totalRow}")->getNumberFormat()->setFormatCode('#,##0');
        $sheet->getStyle("I{$totalRow}")->getNumberFormat()->setFormatCode('#,##0');
        $sheet->getRowDimension($totalRow)->setRowHeight(24);

        return [];
    }
}
