import React from 'react';

export default function StatCard({
    title,
    value,
    subtitle,
    icon,
    color = 'blue',
    trend,
    isWarning = false,
}) {
    const isPeach = isWarning || color === 'rose';

    const colorClasses = {
        blue: {
            iconBg: 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/25',
            cardBg: 'bg-white border-blue-200/80 hover:border-blue-400',
            valueColor: 'text-slate-950',
            titleColor: 'text-slate-500',
            badgeBg: 'bg-blue-50 text-blue-700 border border-blue-200',
        },
        indigo: {
            iconBg: 'bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-md shadow-indigo-500/25',
            cardBg: 'bg-white border-indigo-200/80 hover:border-indigo-400',
            valueColor: 'text-slate-950',
            titleColor: 'text-slate-500',
            badgeBg: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
        },
        emerald: {
            iconBg: 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/25',
            cardBg: 'bg-white border-emerald-200/80 hover:border-emerald-400',
            valueColor: 'text-slate-950',
            titleColor: 'text-slate-500',
            badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        },
        amber: {
            iconBg: 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-md shadow-amber-500/25',
            cardBg: 'bg-white border-amber-200/80 hover:border-amber-400',
            valueColor: 'text-slate-950',
            titleColor: 'text-slate-500',
            badgeBg: 'bg-amber-50 text-amber-800 border border-amber-200',
        },
        rose: {
            iconBg: 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25',
            cardBg: 'bg-gradient-to-br from-rose-50 via-orange-50/50 to-rose-50 border-rose-300',
            valueColor: 'text-rose-950',
            titleColor: 'text-rose-700',
            badgeBg: 'bg-rose-100 text-rose-800 border border-rose-300',
        },
    };

    const currentTheme = isPeach ? colorClasses.rose : (colorClasses[color] || colorClasses.blue);

    return (
        <div
            className={`p-4 md:p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between relative group ${
                isPeach
                    ? 'bg-gradient-to-br from-rose-50 to-orange-50 border-rose-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-blue-400 shadow-xs'
            }`}
        >
            <div className="flex items-center space-x-3.5">
                {/* Vibrant Glowing Icon Box on left */}
                <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${currentTheme.iconBg}`}
                >
                    {icon}
                </div>

                {/* Values & Title */}
                <div className="truncate">
                    <h3 className={`text-2xl font-black tracking-tight leading-none ${currentTheme.valueColor}`}>
                        {value}
                    </h3>
                    <p className={`text-xs font-bold mt-1.5 truncate ${currentTheme.titleColor}`}>
                        {title}
                    </p>
                </div>
            </div>

            {/* Bottom info or trend */}
            {isPeach ? (
                <div className="absolute right-3.5 bottom-2.5 text-[11px] font-bold text-rose-700 flex items-center space-x-1">
                    <span className="w-4 h-4 rounded-full border-2 border-rose-600 flex items-center justify-center text-[10px] font-black italic bg-white text-rose-600 shadow-2xs">
                        i
                    </span>
                </div>
            ) : trend ? (
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold">{subtitle || 'Status'}</span>
                    <span className={`font-black px-2 py-0.5 rounded-md text-[10.5px] ${currentTheme.badgeBg}`}>
                        {trend}
                    </span>
                </div>
            ) : subtitle ? (
                <div className="mt-2 text-[10.5px] text-slate-400 font-semibold truncate">
                    {subtitle}
                </div>
            ) : null}
        </div>
    );
}