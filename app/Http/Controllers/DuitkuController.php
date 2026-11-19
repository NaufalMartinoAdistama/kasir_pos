<?php

namespace App\Http\Controllers;

use App\Models\DetailTransaksi;
use App\Models\Pelanggan;
use App\Models\Produk;
use App\Models\Transaksi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DuitkuController extends Controller
{
    /**
     * Endpoint POST /duitku/create-invoice
     * Dipanggil oleh Pelanggan (Online Ordering) maupun Kasir (POS Non-Tunai)
     */
    public function createInvoice(Request $request): JsonResponse
    {
        $user = $request->user();
        $sumberTransaksi = $request->input('sumber_transaksi', 'Online Pelanggan');
        $isKasir = $sumberTransaksi === 'POS Kasir';

        // 1. Tentukan Pelanggan
        $idPelanggan = null;
        if ($isKasir) {
            $idPelanggan = $request->input('id_pelanggan');
            if (!$idPelanggan) {
                // Pelanggan umum / default kasir
                $pelangganUmum = Pelanggan::firstOrCreate(
                    ['nama_pelanggan' => 'Pelanggan Umum'],
                    ['kota' => 'Bontang', 'no_hp' => '-', 'status_member' => 'Reguler', 'poin' => 0]
                );
                $idPelanggan = $pelangganUmum->id_pelanggan;
            }
        } else {
            // Pelanggan online: gunakan akun yang login
            $pelanggan = null;
            if ($user->id_pelanggan) {
                $pelanggan = Pelanggan::find($user->id_pelanggan);
            }
            if (!$pelanggan) {
                $pelanggan = Pelanggan::create([
                    'nama_pelanggan' => $user->name,
                    'kota' => 'Bontang',
                    'no_hp' => $request->input('no_hp_penerima', '-'),
                    'alamat_lengkap' => $request->input('alamat_pengiriman', '-'),
                    'status_member' => 'Reguler',
                    'poin' => 0,
                ]);
                $user->update(['id_pelanggan' => $pelanggan->id_pelanggan]);
            }
            $idPelanggan = $pelanggan->id_pelanggan;
        }

        $pelangganData = Pelanggan::find($idPelanggan);

        // 2. Validasi input
        $rules = [
            'items' => ['required', 'array', 'min:1'],
            'items.*.id_produk' => ['required', 'integer', 'exists:tbl_produk,id_produk'],
            'items.*.jumlah' => ['required', 'integer', 'min:1'],
        ];

        if (!$isKasir) {
            $rules['no_hp_penerima'] = ['required', 'string', 'max:20'];
            $rules['alamat_pengiriman'] = ['required', 'string', 'max:500'];
        }

        $validated = $request->validate($rules, [
            'items.required' => 'Keranjang belanja Anda masih kosong.',
            'items.min' => 'Pilih minimal 1 produk untuk checkout.',
            'no_hp_penerima.required' => 'Nomor HP / WhatsApp wajib diisi.',
            'alamat_pengiriman.required' => 'Alamat pengiriman wajib diisi.',
        ]);

        $noHp = $request->input('no_hp_penerima', $pelangganData->no_hp ?? '-');
        $alamat = $request->input('alamat_pengiriman', $pelangganData->alamat_lengkap ?? '-');
        $latitude = $request->input('latitude');
        $longitude = $request->input('longitude');
        $diskonPersen = (float) $request->input('diskon', 0);

        try {
            $merchantCode = config('duitku.merchant_code');
            $apiKey = config('duitku.api_key');
            $baseUrl = config('duitku.base_url');
            $callbackUrl = config('duitku.callback_url');
            $returnUrl = config('duitku.return_url');

            // Cek apakah merchant code masih berupa template default
            if (empty($merchantCode) || str_starts_with($merchantCode, 'DS_ISI_')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kode Merchant Duitku Sandbox belum diatur di file .env (DUITKU_MERCHANT_CODE). Silakan masukkan kode merchant Sandbox Anda dari dashboard Duitku.',
                ], 422);
            }

            // 3. Simpan transaksi & kurangi stok dalam DB::transaction
            $result = DB::transaction(function () use (
                $idPelanggan,
                $validated,
                $diskonPersen,
                $noHp,
                $alamat,
                $latitude,
                $longitude,
                $sumberTransaksi,
                $isKasir,
                $user,
                $pelangganData,
                $merchantCode,
                $apiKey,
                $baseUrl,
                $callbackUrl,
                $returnUrl
            ) {
                $totalBersihSemua = 0;
                $itemsToSave = [];
                $itemDetails = [];

                foreach ($validated['items'] as $it) {
                    $idProduk = (int) $it['id_produk'];
                    $qty = max(1, (int) $it['jumlah']);

                    $produk = Produk::where('id_produk', $idProduk)->lockForUpdate()->first();
                    if (!$produk) {
                        throw new \Exception("Produk ID #{$idProduk} tidak ditemukan.");
                    }

                    if ($produk->stok < $qty) {
                        throw new \Exception("Stok \"{$produk->nama_produk}\" tidak mencukupi (Tersedia: {$produk->stok}, Diminta: {$qty}).");
                    }

                    // Gunakan Stored Function database HitungTotalBersih jika ada
                    try {
                        $hitung = DB::selectOne("SELECT HitungTotalBersih(?, ?, ?) AS total", [$produk->harga, $qty, $diskonPersen]);
                        $subtotal = $hitung ? (float) $hitung->total : (float) (($produk->harga * $qty) * (1 - ($diskonPersen / 100)));
                    } catch (\Throwable $e) {
                        $subtotal = (float) (($produk->harga * $qty) * (1 - ($diskonPersen / 100)));
                    }

                    $totalBersihSemua += $subtotal;

                    $itemsToSave[] = [
                        'produk' => $produk,
                        'id_produk' => $idProduk,
                        'nama_produk' => $produk->nama_produk,
                        'harga' => (float) $produk->harga,
                        'jumlah' => $qty,
                        'subtotal' => $subtotal,
                    ];
                }

                $paymentAmount = (int) round($totalBersihSemua);

                // Buat merchantOrderId unik format INV-TIMESTAMP-RAND
                $merchantOrderId = 'INV-' . time() . '-' . rand(100, 999);

                // 4. Simpan ke tbl_transaksi (selalu berhasil disimpan baik 1 barang maupun banyak barang)
                $transaksi = Transaksi::create([
                    'tanggal' => now(),
                    'id_pelanggan' => $idPelanggan,
                    'total_belanja' => $paymentAmount,
                    'metode_pembayaran' => 'Duitku Non-Tunai',
                    'bayar' => $paymentAmount,
                    'kembalian' => 0,
                    'diskon' => $diskonPersen,
                    'no_hp_penerima' => $noHp,
                    'alamat_pengiriman' => $alamat,
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'status_pesanan' => 'Menunggu Pembayaran',
                    'sumber_transaksi' => $sumberTransaksi,
                    'merchant_order_id' => $merchantOrderId,
                ]);

                // 5. Simpan ke tbl_detail_transaksi & kurangi stok
                foreach ($itemsToSave as $item) {
                    DetailTransaksi::create([
                        'id_transaksi' => $transaksi->id_transaksi,
                        'id_produk' => $item['id_produk'],
                        'nama_produk' => $item['nama_produk'],
                        'jumlah' => $item['jumlah'],
                        'harga' => $item['harga'],
                        'subtotal' => $item['subtotal'],
                    ]);

                    $item['produk']->decrement('stok', $item['jumlah']);
                }

                // Update profil pelanggan jika online
                if (!$isKasir && $pelangganData) {
                    $pelangganData->update([
                        'no_hp' => $noHp,
                        'alamat_lengkap' => $alamat,
                        'latitude' => $latitude ?? $pelangganData->latitude,
                        'longitude' => $longitude ?? $pelangganData->longitude,
                    ]);
                }

                // 6. Siapkan data Duitku
                $signature = md5($merchantCode . $merchantOrderId . $paymentAmount . $apiKey);
                $customerName = $pelangganData ? $pelangganData->nama_pelanggan : ($user->name ?? 'Pelanggan');
                $customerEmail = $user && $user->email ? $user->email : 'pelanggan@martinmart.local';
                $customerPhone = !empty($noHp) && $noHp !== '-' ? $noHp : '081234567890';

                // Format itemDetails untuk Duitku:
                // Duitku mensyaratkan sum(price * quantity) == paymentAmount secara persis.
                // Jika 1 item dan tanpa diskon, cantumkan nama produk tersebut secara spesifik.
                // Jika multi-item atau ada diskon, gunakan ringkasan belanja agar nominal selalu sama persis dengan paymentAmount.
                $countItems = count($itemsToSave);
                $itemDetails = [];
                if ($countItems === 1 && $diskonPersen == 0) {
                    $itemDetails[] = [
                        'name' => mb_substr($itemsToSave[0]['nama_produk'], 0, 50),
                        'price' => $paymentAmount,
                        'quantity' => 1,
                    ];
                } else {
                    $itemDetails[] = [
                        'name' => mb_substr('Belanja di MARTIN MART (' . $countItems . ' Produk' . ($diskonPersen > 0 ? " Diskon {$diskonPersen}%" : '') . ')', 0, 50),
                        'price' => $paymentAmount,
                        'quantity' => 1,
                    ];
                }

                // Default reference fallback (berguna jika Sandbox offline atau nominal < 10.000)
                $reference = 'DS-' . time() . '-' . rand(100, 999);
                $paymentUrl = null;

                // Jika nominal >= 10.000, coba hubungi API Duitku POP Sandbox
                if ($paymentAmount >= 10000) {
                    $timestamp = round(microtime(true) * 1000);
                    $hashSignature = hash('sha256', $merchantCode . $timestamp . $apiKey);

                    $payload = [
                        'paymentAmount' => $paymentAmount,
                        'merchantOrderId' => $merchantOrderId,
                        'productDetails' => 'Pembayaran Belanja di MARTIN MART #' . $merchantOrderId,
                        'email' => $customerEmail,
                        'phoneNumber' => $customerPhone,
                        'additionalParam' => (string) $transaksi->id_transaksi,
                        'merchantUserInfo' => $customerName,
                        'customerVaName' => mb_substr($customerName, 0, 30),
                        'callbackUrl' => $callbackUrl,
                        'returnUrl' => $returnUrl,
                        'expiryPeriod' => 60, // 60 menit
                        'itemDetails' => $itemDetails,
                    ];

                    $createInvoiceUrl = rtrim($baseUrl, '/') . '/createinvoice';
                    try {
                        $response = Http::timeout(8)
                            ->withHeaders([
                                'x-duitku-merchantcode' => $merchantCode,
                                'x-duitku-timestamp' => (string) $timestamp,
                                'x-duitku-signature' => $hashSignature,
                            ])
                            ->post($createInvoiceUrl, $payload);

                        if ($response->successful()) {
                            $duitkuData = $response->json();
                            if (!empty($duitkuData['reference'])) {
                                $reference = $duitkuData['reference'];
                                $paymentUrl = $duitkuData['paymentUrl'] ?? null;
                            }
                        } else {
                            Log::warning("Duitku POP CreateInvoice non-200: " . $response->body());
                        }
                    } catch (\Throwable $curlErr) {
                        Log::warning("Duitku Inquiry Timeout/Connection Error: " . $curlErr->getMessage());
                    }
                }

                // Update reference Duitku ke transaksi
                $transaksi->update([
                    'duitku_reference' => $reference,
                ]);

                $paymentPageUrl = route('duitku.payment-page', ['merchant_order_id' => $merchantOrderId]);

                return [
                    'reference' => $reference,
                    'payment_url' => $paymentUrl,
                    'payment_page_url' => $paymentPageUrl,
                    'merchant_order_id' => $merchantOrderId,
                    'id_transaksi' => $transaksi->id_transaksi,
                    'total_belanja' => $paymentAmount,
                ];
            });

            return response()->json([
                'status' => 'success',
                'reference' => $result['reference'],
                'payment_url' => $result['payment_url'] ?? null,
                'payment_page_url' => $result['payment_page_url'],
                'merchant_order_id' => $result['merchant_order_id'],
                'id_transaksi' => $result['id_transaksi'],
                'total_belanja' => $result['total_belanja'],
            ]);
        } catch (\Exception $e) {
            Log::error('Duitku Inquiry Exception: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Tampilkan Halaman Pembayaran Khusus (Dedicated Payment Page) Duitku
     * GET /pembayaran/{merchant_order_id}
     */
    public function showPaymentPage(Request $request, string $merchantOrderId)
    {
        $transaksi = Transaksi::with(['pelanggan', 'details.produk'])
            ->where('merchant_order_id', $merchantOrderId)
            ->firstOrFail();

        $user = $request->user();
        $isKasir = $user && in_array($user->role, ['admin', 'kasir']);

        // Generate virtual account nomor contoh untuk simulasi/tampilan
        $cleanId = preg_replace('/\D/', '', $merchantOrderId);
        $seed = substr($cleanId, -6) ?: '123456';
        $vaNumbers = [
            'BCA' => '80777' . $seed,
            'BRI' => '88880' . $seed,
            'Mandiri' => '89999' . $seed,
            'BNI' => '82770' . $seed,
            'Permata' => '85220' . $seed,
        ];

        return Inertia::render('Pembayaran/Duitku', [
            'transaksi' => $transaksi,
            'pelanggan' => $transaksi->pelanggan,
            'details' => $transaksi->details,
            'vaNumbers' => $vaNumbers,
            'duitkuConfig' => [
                'merchantCode' => config('duitku.merchant_code'),
                'isProduction' => config('duitku.is_production', false),
            ],
            'paymentUrl' => $transaksi->duitku_reference && !str_starts_with($transaksi->duitku_reference, 'DS') 
                ? "https://sandbox.duitku.com/payment/inquiryV2.aspx?ref={$transaksi->duitku_reference}" 
                : null,
            'isKasir' => $isKasir,
        ]);
    }

    /**
     * Endpoint POST /duitku/check-status
     * Memeriksa status real-time pesanan
     */
    public function checkStatus(Request $request): JsonResponse
    {
        $merchantOrderId = $request->input('merchant_order_id');
        $idTransaksi = $request->input('id_transaksi');

        $transaksi = Transaksi::where(function ($q) use ($merchantOrderId, $idTransaksi) {
            if ($merchantOrderId) {
                $q->where('merchant_order_id', $merchantOrderId);
            }
            if ($idTransaksi) {
                $q->orWhere('id_transaksi', $idTransaksi);
            }
        })->first();

        if (!$transaksi) {
            return response()->json(['status' => 'error', 'message' => 'Transaksi tidak ditemukan'], 404);
        }

        $isLunas = in_array($transaksi->status_pesanan, ['Selesai', 'Diproses']);

        return response()->json([
            'status' => 'success',
            'status_pesanan' => $transaksi->status_pesanan,
            'is_lunas' => $isLunas,
            'metode_pembayaran' => $transaksi->metode_pembayaran,
        ]);
    }

    /**
     * Endpoint POST /duitku/callback
     * Menerima Webhook HTTP Notification dari Duitku
     * Dikecualikan dari proteksi CSRF di bootstrap/app.php
     */
    public function callback(Request $request): Response
    {
        $merchantCode = $request->input('merchantCode');
        $amount = $request->input('amount');
        $merchantOrderId = $request->input('merchantOrderId');
        $signature = $request->input('signature');
        $resultCode = $request->input('resultCode');
        $paymentCode = $request->input('paymentCode'); // e.g. 'VA', 'BT', 'QR', 'BC', etc.
        $reference = $request->input('reference');

        $apiKey = config('duitku.api_key');
        $localMerchantCode = config('duitku.merchant_code');

        // Verifikasi Signature Duitku: md5(merchantCode + amount + merchantOrderId + apiKey)
        $expectedSignature = md5($localMerchantCode . $amount . $merchantOrderId . $apiKey);

        if ($signature && $signature !== $expectedSignature) {
            Log::warning('Duitku Callback: Signature tidak valid', [
                'received' => $signature,
                'expected' => $expectedSignature,
                'merchantOrderId' => $merchantOrderId,
            ]);
            return response('Bad Signature', 400);
        }

        $transaksi = Transaksi::where('merchant_order_id', $merchantOrderId)->first();
        if (!$transaksi) {
            Log::warning('Duitku Callback: Transaksi tidak ditemukan', ['merchantOrderId' => $merchantOrderId]);
            return response('Transaction Not Found', 404);
        }

        $metodeNama = $this->mapDuitkuPaymentCode($paymentCode);

        // Jika resultCode === '00', pembayaran sukses lunas
        if ($resultCode === '00') {
            $isKasir = $transaksi->sumber_transaksi === 'POS Kasir';
            $statusFinal = $isKasir ? 'Selesai' : 'Diproses';

            $transaksi->update([
                'status_pesanan' => $statusFinal,
                'metode_pembayaran' => $metodeNama,
                'bukti_pembayaran' => 'Lunas via Duitku (' . ($paymentCode ?: 'POP') . ')',
                'duitku_reference' => $reference ?: $transaksi->duitku_reference,
            ]);

            Log::info("Duitku Callback: Transaksi #{$transaksi->id_transaksi} ({$merchantOrderId}) Berhasil Lunas -> {$statusFinal}");
        } else {
            // Pembayaran gagal / kedaluwarsa: batalkan dan kembalikan stok
            if ($transaksi->status_pesanan !== 'Dibatalkan') {
                DB::transaction(function () use ($transaksi) {
                    $transaksi->load('details');
                    foreach ($transaksi->details as $detail) {
                        Produk::where('id_produk', $detail->id_produk)->increment('stok', $detail->jumlah);
                    }
                    $transaksi->update([
                        'status_pesanan' => 'Dibatalkan',
                    ]);
                });
                Log::info("Duitku Callback: Transaksi #{$transaksi->id_transaksi} ({$merchantOrderId}) Dibatalkan, Stok Dikembalikan.");
            }
        }

        return response('SUCCESS', 200);
    }

    /**
     * Endpoint POST /duitku/update-status
     * Sinkronisasi status dari frontend (successEvent Duitku POP di localhost)
     */
    public function updateStatus(Request $request): JsonResponse
    {
        $user = $request->user();
        $merchantOrderId = $request->input('merchant_order_id');
        $idTransaksi = $request->input('id_transaksi');
        $paymentCode = $request->input('payment_code') ?? $request->input('paymentCode') ?? $request->input('metode_pembayaran');
        $reference = $request->input('reference');

        $transaksi = Transaksi::where(function ($q) use ($merchantOrderId, $idTransaksi) {
            if ($merchantOrderId) {
                $q->where('merchant_order_id', $merchantOrderId);
            }
            if ($idTransaksi) {
                $q->orWhere('id_transaksi', $idTransaksi);
            }
        })->first();

        if (!$transaksi) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaksi tidak ditemukan',
            ], 404);
        }

        // Jika role pelanggan, verifikasi bahwa transaksi miliknya
        if ($user && $user->role === 'pelanggan' && $transaksi->id_pelanggan !== $user->id_pelanggan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak: bukan pemilik transaksi',
            ], 403);
        }

        $isKasir = $transaksi->sumber_transaksi === 'POS Kasir';
        $statusFinal = $isKasir ? 'Selesai' : 'Diproses';
        $metodeNama = $this->mapDuitkuPaymentCode($paymentCode);

        $transaksi->update([
            'status_pesanan' => $statusFinal,
            'metode_pembayaran' => $metodeNama,
            'bayar' => $transaksi->total_belanja,
            'kembalian' => 0,
            'bukti_pembayaran' => 'Lunas via ' . $metodeNama . ' (' . ($paymentCode ?: 'Sukses') . ')',
            'duitku_reference' => $reference ?: $transaksi->duitku_reference,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Status transaksi berhasil diperbarui menjadi ' . $statusFinal,
            'transaksi' => $transaksi,
        ]);
    }

    /**
     * Helper pemetaan kode pembayaran Duitku ke nama yang rapi dan spesifik
     */
    protected function mapDuitkuPaymentCode(?string $code): string
    {
        if (!$code) {
            return 'Duitku Non-Tunai';
        }

        $raw = trim($code);
        $upper = strtoupper($raw);

        // Jika string sudah merupakan nama metode spesifik yang lengkap, gunakan langsung
        if (str_contains($raw, 'Virtual Account') || str_contains($raw, 'VA') || in_array($upper, ['QRIS', 'SHOPEEPAY', 'OVO', 'DANA', 'GOPAY', 'LINKAJA', 'TUNAI'])) {
            if ($upper === 'QRIS') return 'QRIS';
            if ($upper === 'SHOPEEPAY') return 'ShopeePay';
            if ($upper === 'OVO') return 'OVO';
            if ($upper === 'DANA') return 'DANA';
            if ($upper === 'GOPAY') return 'GoPay';
            if ($upper === 'LINKAJA') return 'LinkAja';
            if ($upper === 'TUNAI') return 'Tunai';
            return $raw;
        }

        $map = [
            'BC' => 'BCA Virtual Account',
            'BR' => 'BRI Virtual Account',
            'M2' => 'Mandiri Virtual Account',
            'M1' => 'Mandiri Virtual Account',
            'I1' => 'BNI Virtual Account',
            'BT' => 'Permata Virtual Account',
            'B1' => 'CIMB Niaga Virtual Account',
            'VA' => 'Maybank Virtual Account',
            'DA' => 'Danamon Virtual Account',
            'NC' => 'Bank Neo Commerce Virtual Account',
            'SP' => 'ShopeePay',
            'SA' => 'ShopeePay',
            'OV' => 'OVO',
            'DA_QRIS' => 'QRIS',
            'NQ' => 'QRIS',
            'LQ' => 'QRIS',
            'QR' => 'QRIS',
            'LF' => 'LinkAja',
            'VC' => 'Kartu Kredit/Debit',
            'AG' => 'Bank Artha Graha',
            'FT' => 'Ritel Retail Mart',
        ];

        if (isset($map[$upper])) {
            return $map[$upper];
        }

        if (str_contains($upper, 'QR')) {
            return 'QRIS';
        }

        if (str_contains($upper, 'BCA')) {
            return 'BCA Virtual Account';
        }
        if (str_contains($upper, 'BRI')) {
            return 'BRI Virtual Account';
        }
        if (str_contains($upper, 'MANDIRI')) {
            return 'Mandiri Virtual Account';
        }
        if (str_contains($upper, 'BNI')) {
            return 'BNI Virtual Account';
        }
        if (str_contains($upper, 'PERMATA')) {
            return 'Permata Virtual Account';
        }

        return $raw;
    }
}
