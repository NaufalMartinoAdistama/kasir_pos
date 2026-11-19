import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { IconMapPin, IconSparkles, IconCheckCircle } from '@/Components/Icons';

export default function InteractiveMapPicker({
    latitude = -0.1337,
    longitude = 117.4947,
    onChange,
    googleMapsApiKey = '',
}) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    const [currentLat, setCurrentLat] = useState(latitude || -0.1337);
    const [currentLng, setCurrentLng] = useState(longitude || 117.4947);
    const [locating, setLocating] = useState(false);
    const [addressNote, setAddressNote] = useState('');

    // Custom SVG Pin Icon for Leaflet to avoid missing image assets
    const createCustomIcon = () => {
        return L.divIcon({
            className: 'custom-map-marker',
            html: `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 38px;
                    height: 38px;
                    border-radius: 50% 50% 50% 0;
                    background: linear-gradient(135deg, #2563eb, #06b6d4);
                    transform: rotate(-45deg);
                    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
                    border: 2px solid white;
                    cursor: grab;
                ">
                    <div style="
                        width: 14px;
                        height: 14px;
                        background: white;
                        border-radius: 50%;
                        transform: rotate(45deg);
                    "></div>
                </div>
            `,
            iconSize: [38, 38],
            iconAnchor: [19, 38],
            popupAnchor: [0, -38],
        });
    };

    // Reverse Geocoding via OpenStreetMap Nominatim
    const reverseGeocode = async (lat, lng) => {
        try {
            setAddressNote('Mencari detail alamat...');
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                {
                    headers: {
                        'Accept-Language': 'id,en',
                    },
                }
            );
            if (!res.ok) throw new Error('Geocoding request failed');
            const data = await res.json();
            if (data && data.display_name) {
                setAddressNote(data.display_name);
                if (onChange) {
                    onChange({
                        latitude: lat,
                        longitude: lng,
                        address: data.display_name,
                    });
                }
                return;
            }
        } catch (e) {
            // Silently fallback
            setAddressNote('');
        }

        if (onChange) {
            onChange({
                latitude: lat,
                longitude: lng,
            });
        }
    };

    // Initialize Leaflet Map
    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return;

        const initialLat = currentLat || -0.1337;
        const initialLng = currentLng || 117.4947;

        const map = L.map(mapContainerRef.current, {
            center: [initialLat, initialLng],
            zoom: 15,
            zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        const marker = L.marker([initialLat, initialLng], {
            draggable: true,
            icon: createCustomIcon(),
        }).addTo(map);

        marker.bindPopup('<b>📍 Titik Pengiriman Anda</b><br/>Geser pin ini ke lokasi yang tepat.').openPopup();

        marker.on('dragend', (e) => {
            const pos = e.target.getLatLng();
            const lat = Number(pos.lat.toFixed(6));
            const lng = Number(pos.lng.toFixed(6));
            setCurrentLat(lat);
            setCurrentLng(lng);
            reverseGeocode(lat, lng);
        });

        map.on('click', (e) => {
            const lat = Number(e.latlng.lat.toFixed(6));
            const lng = Number(e.latlng.lng.toFixed(6));
            marker.setLatLng([lat, lng]);
            setCurrentLat(lat);
            setCurrentLng(lng);
            reverseGeocode(lat, lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
            markerRef.current = null;
        };
    }, []);

    // Handle HTML5 Geolocation (Gunakan Lokasi Saya Saat Ini)
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Browser Anda tidak mendukung deteksi lokasi otomatis.');
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = Number(pos.coords.latitude.toFixed(6));
                const lng = Number(pos.coords.longitude.toFixed(6));
                setCurrentLat(lat);
                setCurrentLng(lng);
                setLocating(false);

                if (mapInstanceRef.current && markerRef.current) {
                    mapInstanceRef.current.setView([lat, lng], 16);
                    markerRef.current.setLatLng([lat, lng]);
                    markerRef.current.bindPopup('<b>📍 Lokasi Anda Terdeteksi!</b>').openPopup();
                }

                reverseGeocode(lat, lng);
            },
            (err) => {
                setLocating(false);
                alert('Gagal mendeteksi lokasi: ' + (err.message || 'Izin lokasi tidak diberikan.'));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
            }
        );
    };

    return (
        <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5">
                    <IconMapPin className="w-4 h-4 text-blue-700" />
                    <span className="text-xs font-black text-slate-900">
                        Pilih Titik Lokasi Pengiriman di Peta
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                        Interaktif
                    </span>
                </div>

                <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={locating}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                    <IconSparkles className="w-3.5 h-3.5" />
                    <span>{locating ? 'Mendeteksi Lokasi...' : '📍 Gunakan Lokasi Saya Saat Ini'}</span>
                </button>
            </div>

            {/* Map Container */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-300 shadow-xs bg-slate-100 h-64 md:h-72">
                <div ref={mapContainerRef} className="w-full h-full z-10" />

                <div className="absolute bottom-2 left-2 right-2 z-20 pointer-events-none">
                    <div className="bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-md border border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-800 pointer-events-auto">
                        <span>
                            🧭 Koordinat: <code className="font-mono text-blue-700 font-black">{currentLat}, {currentLng}</code>
                        </span>
                        <a
                            href={`https://www.google.com/maps?q=${currentLat},${currentLng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-black text-[10px] ml-2"
                        >
                            Buka di Google Maps ↗
                        </a>
                    </div>
                </div>
            </div>

            <p className="text-[11px] text-slate-500">
                💡 <strong>Tips:</strong> Klik area pada peta atau geser pin biru untuk menentukan alamat pengantaran yang paling akurat.
            </p>

            {addressNote && (
                <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start space-x-2">
                    <IconCheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <strong className="font-black text-blue-900">Perkiraan Alamat dari Titik Peta:</strong>
                        <p className="text-[11px] mt-0.5 text-blue-800 leading-relaxed">{addressNote}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
