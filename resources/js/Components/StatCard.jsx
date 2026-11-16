import React from 'react';

export default function StatCard({
    title,
    value,
    subtitle,
    icon,
    color = 'blue',
    trend,
}) {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-600',
            iconColor: 'text-white',
            lightBg: 'bg-blue-50',
            border: 'border-slate-200 hover:border-blue-500',
            badge: 'bg-blue-100 text-blue-900 border border-blue-300 font-extrabold',
        },
        indigo: {
            bg: 'bg-indigo-600',
            iconColor: 'text-white',
            lightBg: 'bg-indigo-50',
            border: 'border-slate-200 hover:border-indigo-500',
            badge: 'bg-indigo-100 text-indigo-900 border border-indigo-300 font-extrabold',
        },
        emerald: {
            bg: 'bg-emerald-600',
            iconColor: 'text-white',
            lightBg: 'bg-emerald-50',
            border: 'border-slate-200 hover:border-emerald-500',
            badge: 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-extrabold',
        },
        amber: {
            bg: 'bg-amber-600',
            iconColor: 'text-white',
            lightBg: 'bg-amber-50',
            border: 'border-slate-200 hover:border-amber-500',
            badge: 'bg-amber-100 text-amber-950 border border-amber-300 font-extrabold',
        },
        rose: {
            bg: 'bg-rose-600',
            iconColor: 'text-white',
            lightBg: 'bg-rose-50',
            border: 'border-rose-200 hover:border-rose-500',
            badge: 'bg-rose-100 text-rose-950 border border-rose-300 font-extrabold',
        },
    };

    const currentTheme = colorClasses[color] || colorClasses.blue;

    return (
        <div className={`p-5 bg-white rounded-2xl shadow-xs border-2 ${currentTheme.border} transition-all duration-200 hover:shadow-md flex flex-col justify-between`}>
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-[11px] font-black tracking-wider text-slate-700 uppercase">
                        {title}
                    </p>
                    <h3 className="text-2xl font-black tracking-tight text-slate-950">
                        {value}
                    </h3>
                    {subtitle && (
                        <p className="text-xs font-semibold text-slate-600">
                            {subtitle}
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${currentTheme.bg} ${currentTheme.iconColor} shadow-md shrink-0`}>
                    {icon}
                </div>
            </div>
            {trend && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-slate-500">Status</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] ${currentTheme.badge}`}>
                        {trend}
                    </span>
                </div>
            )}
        </div>
    );
}
