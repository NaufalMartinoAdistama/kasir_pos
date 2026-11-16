import React, { useEffect, useRef, useState } from 'react';
import ModalDialog from '@/Components/ModalDialog';
import { Html5Qrcode } from 'html5-qrcode';
import { IconCamera, IconExclamation } from '@/Components/Icons';

export default function CameraScannerModal({ show, onClose, onScanSuccess }) {
    const scannerRef = useRef(null);
    const [cameraError, setCameraError] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        let html5QrCode = null;

        if (show) {
            setCameraError(null);
            setIsScanning(true);

            // Beri sedikit jeda agar DOM modal sudah terpasang
            const timer = setTimeout(() => {
                const element = document.getElementById('camera-reader-box');
                if (!element) return;

                html5QrCode = new Html5Qrcode('camera-reader-box');
                scannerRef.current = html5QrCode;

                const config = {
                    fps: 10,
                    qrbox: { width: 260, height: 180 },
                    aspectRatio: 1.333333,
                };

                html5QrCode
                    .start(
                        { facingMode: 'environment' }, // Utamakan kamera belakang
                        config,
                        (decodedText) => {
                            // Sukses membaca barcode / QR code
                            if (html5QrCode && html5QrCode.isScanning) {
                                html5QrCode.stop().then(() => {
                                    setIsScanning(false);
                                    onScanSuccess(decodedText);
                                    onClose();
                                }).catch(() => {
                                    onScanSuccess(decodedText);
                                    onClose();
                                });
                            } else {
                                onScanSuccess(decodedText);
                                onClose();
                            }
                        },
                        () => {
                            // Frame scan biasa (abaikan error per frame)
                        }
                    )
                    .catch((err) => {
                        console.error('Kamera barcode error:', err);
                        setCameraError('Gagal mengakses kamera. Pastikan izin kamera aktif pada browser Anda.');
                        setIsScanning(false);
                    });
            }, 300);

            return () => {
                clearTimeout(timer);
                if (html5QrCode && html5QrCode.isScanning) {
                    html5QrCode.stop().catch(() => {});
                }
            };
        } else {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(() => {});
            }
            setIsScanning(false);
        }
    }, [show]);

    const handleClose = () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => {
                onClose();
            }).catch(() => {
                onClose();
            });
        } else {
            onClose();
        }
    };

    return (
        <ModalDialog
            show={show}
            onClose={handleClose}
            title="Scan Barcode / QR Produk via Kamera"
            maxWidth="max-w-md"
        >
            <div className="space-y-4 py-2">
                <p className="text-xs text-slate-500">
                    Arahkan kamera ke barcode (Code128 / EAN) atau QR Code pada kemasan barang:
                </p>

                {cameraError ? (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-2 text-center">
                        <IconExclamation className="w-8 h-8 text-rose-600 mx-auto" />
                        <p className="font-bold">{cameraError}</p>
                        <p className="text-[11px] text-slate-500">
                            Anda tetap dapat menggunakan <strong>USB Barcode Scanner</strong> atau input teks manual pada kasir.
                        </p>
                    </div>
                ) : (
                    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-blue-400 bg-slate-900 text-white min-h-[260px] flex items-center justify-center">
                        <div id="camera-reader-box" className="w-full h-full" />
                        
                        {isScanning && (
                            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none px-2 py-1 bg-black/60 rounded-lg text-[10px] text-blue-200">
                                <span>🎥 Kamera Aktif</span>
                                <span className="animate-pulse text-emerald-400 font-bold">Mendeteksi Barcode...</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">
                        Didukung oleh HTML5 QR/Barcode Engine
                    </span>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                        Tutup Kamera
                    </button>
                </div>
            </div>
        </ModalDialog>
    );
}
