import React, { useState, useEffect } from 'react';

export default function RealtimeClock({ className = '', compact = false }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const dayName = days[currentTime.getDay()];
    const day = currentTime.getDate();
    const monthName = months[currentTime.getMonth()];
    const year = currentTime.getFullYear();
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getSeconds()).padStart(2, '0');

    if (compact) {
        return (
            <div className={`inline-flex items-center space-x-2 font-mono text-xs px-2.5 py-1 bg-slate-100/90 rounded-lg border border-slate-200 shadow-2xs ${className}`}>
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse inline-block shrink-0" />
                <span className="font-extrabold text-slate-900">{dayName}, {day} {monthName.slice(0, 3)}</span>
                <span className="text-slate-400 font-bold">•</span>
                <span className="font-black text-blue-800 tracking-wider">{hours}:{minutes}:{seconds}</span>
            </div>
        );
    }

    return (
        <div className={`inline-flex items-center space-x-3 px-3.5 py-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs ${className}`}>
            <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                <span className="text-xs font-black text-slate-900">
                    {dayName}, {day} {monthName} {year}
                </span>
            </div>
            <span className="text-slate-300 font-bold">|</span>
            <div className="font-mono text-xs font-black text-blue-800 tracking-wider flex items-center space-x-1">
                <span>{hours}:{minutes}:{seconds}</span>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 py-0.2 rounded border border-blue-200">WIB</span>
            </div>
        </div>
    );
}
