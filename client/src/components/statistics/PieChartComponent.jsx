// components/statistics/PieChartComponent.jsx
import React, { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS, CustomStatTooltip, renderActiveShape, CustomLegendWithCount } from '../../utils/chartHelpers.jsx';

export const PieChartComponent = ({ title, data, questionNumber = '' }) => {
    const [activeIndex, setActiveIndex] = useState(-1);

    const onPieEnter = useCallback((_, index) => setActiveIndex(index), []);
    const onPieLeave = useCallback(() => setActiveIndex(-1), []);

    if (!data || data.length === 0) {
        // ... (рендеринг "Немає даних")
        return (
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100 flex flex-col items-center justify-center h-full min-h-[350px]">
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">{title}</h3>
                <p className="text-gray-400 text-sm">Немає даних для відображення</p>
            </div>
        );
    }

    const currentColors = data.map((d, i) => COLORS[i % COLORS.length]);

    const legendProps = {
        activeIndex, data: data, onLegendEnter: onPieEnter, onLegendLeave: onPieLeave,
        payload: data.map((entry, index) => ({
            value: entry.name, type: 'circle', color: currentColors[index], payload: entry
        }))
    };

    const chartComponent = (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart margin={{ top: 10, right: 80, left: 80, bottom: 10 }}>
                <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomStatTooltip />} wrapperStyle={{ zIndex: 10 }} />
            </PieChart>
        </ResponsiveContainer>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                {questionNumber ? `${questionNumber}. ` : ''}
                {title}
            </h3>
            {/* ... (Логіка відображення діаграми та легенди) */}
            <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-full md:w-1/2">
                    <CustomLegendWithCount {...legendProps} />
                </div>
                <div className="w-full md:w-1/2 min-h-[300px]">
                    {chartComponent}
                </div>
            </div>
        </div>
    );
};