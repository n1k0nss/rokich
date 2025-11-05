import React from 'react';
import { Sector } from 'recharts';

// --- КОНСТАНТИ ТА ДИЗАЙН ---

export const COLORS = [
    '#3b82f6', // blue (1)w
    '#f97316', // orange (2)
    '#10b981', // emerald (3)
    '#f59e0b', // yellow (4)
    '#8b5cf6', // violet (5)
    '#ef4444', // red (6)
    '#6b7280', // gray (7)
    '#9ca3af', // light gray (8)
];

// --- МІТКИ ДЛЯ БАЛІВ ШВАРЦА (потрібні на StatisticsPage) ---
export const SCORE_LABELS = {
    1: 'Зовсім не така, як я',
    2: 'Не така, як я',
    3: 'Трішки така, як я',
    4: 'Майже така, як я',
    5: 'Така ж, як я',
    6: 'Дуже подібна',
};

// --- ДОПОМІЖНІ КОМПОНЕНТИ ДЛЯ ДІАГРАМ ---

// Кастомний компонент Tooltip для відображення % та кількості
export const CustomStatTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload || payload[0];
        const rawPercent = payload[0].percent;
        const percentage = rawPercent !== undefined && !isNaN(rawPercent)
            ? (rawPercent * 100).toFixed(1)
            : 'N/A';

        const nameToDisplay = data.name || payload[0].name || payload[0].dataKey;
        const valueToDisplay = payload[0].value;

        return (
            <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-xl text-sm max-w-xs sm:max-w-sm">
                <p className="font-bold text-gray-800 break-words mb-1">{nameToDisplay}</p>
                <p className="text-gray-600">
                    Кількість: <span className="font-semibold text-blue-600">{valueToDisplay}</span> {percentage !== 'N/A' && `(${percentage}%)`}
                </p>
            </div>
        );
    }
    return null;
};


// Custom Active Shape для Pie Chart
export const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

    if (!payload || percent === undefined) return null;

    const finalOuterRadius = outerRadius ?? 0;
    const finalCx = cx ?? 0;
    const finalCy = cy ?? 0;
    const finalMidAngle = midAngle ?? 0;

    const sin = Math.sin(-RADIAN * finalMidAngle);
    const cos = Math.cos(-RADIAN * finalMidAngle);

    const radialOffset = 15;
    const horizontalOffset = 30;
    const textPadding = 4;

    const sx = finalCx + finalOuterRadius * cos;
    const sy = finalCy + finalOuterRadius * sin;
    const mx = finalCx + (finalOuterRadius + radialOffset) * cos;
    const my = finalCy + (finalOuterRadius + radialOffset) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * horizontalOffset;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    const displayPercent = (percent * 100).toFixed(1);
    const nameToDisplay = payload.name;
    const truncatedName = nameToDisplay.length > 20 ? nameToDisplay.substring(0, 17) + '...' : nameToDisplay;

    return (
        <g>
            <Sector cx={finalCx} cy={finalCy} innerRadius={innerRadius} outerRadius={finalOuterRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
            <Sector cx={finalCx} cy={finalCy} startAngle={startAngle} endAngle={endAngle} innerRadius={finalOuterRadius + 6} outerRadius={finalOuterRadius + 10} fill={fill} opacity={0.8} />
            <text x={finalCx} y={finalCy} dy={-5} textAnchor="middle" fill="#333" fontSize={12} fontWeight="semibold">{truncatedName}</text>
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={3} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * textPadding} y={ey} textAnchor={textAnchor} fill="#333" dominantBaseline="central" fontSize={13} fontWeight="bold">{`${value}`}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * textPadding} y={ey} dy={16} textAnchor={textAnchor} fill="#999" fontSize={10}>{`(${displayPercent}%)`}</text>
        </g>
    );
};

// Кастомна легенда для відображення назви та кількості відповідей
export const CustomLegendWithCount = (props) => {
    const { payload, onLegendEnter, onLegendLeave, activeIndex, data } = props;

    if (!payload || payload.length === 0) return null;

    const dataColorMap = data.reduce((acc, item, index) => {
        acc[item.name] = COLORS[index % COLORS.length];
        return acc;
    }, {});

    return (
        <div className="space-y-1 text-gray-700 mt-2 max-h-[380px] overflow-y-auto pr-1 w-full text-sm">
            {payload.map((entry, index) => {
                const value = entry.payload.value;
                const name = entry.value;
                const isActive = index === activeIndex;
                const color = entry.color || dataColorMap[name] || COLORS[index % COLORS.length];

                return (
                    <div key={`legend-${index}`}
                         className="flex justify-between items-center p-1.5 rounded-lg transition duration-200 cursor-pointer text-sm"
                         style={{
                             backgroundColor: isActive ? '#e0f2fe' : 'transparent',
                             color: isActive ? color : '#4b5563',
                             fontWeight: isActive ? 'bold' : 'normal',
                         }}
                         onMouseEnter={() => onLegendEnter(null, index)}
                         onMouseLeave={() => onLegendLeave()}
                    >
                        <span className="flex items-center w-3/4">
                            <svg width="10" height="10" className="mr-2 flex-shrink-0">
                                <circle cx="5" cy="5" r="5" fill={color} />
                            </svg>
                            <span className="break-words" title={name}>{name}</span>
                        </span>
                        <span className="font-semibold text-right w-1/4 min-w-[30px]">{value}</span>
                    </div>
                );
            })}
        </div>
    );
};