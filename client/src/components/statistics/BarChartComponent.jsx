// components/statistics/BarChartComponent.jsx
import React from 'react';
import { BarChart, XAxis, YAxis, CartesianGrid, Bar, ResponsiveContainer, Tooltip, Legend as RechartsLegend } from 'recharts';
import { COLORS, CustomStatTooltip } from '../../utils/chartHelpers.jsx';

export const BarChartComponent = ({ title, data, dataKey = 'value', nameKey = 'name', barColor = COLORS[0], questionNumber = '' }) => {
    if (!data || data.length === 0) {
        // ... (рендеринг "Немає даних")
        return (
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100 flex items-center justify-center min-h-[300px]">
                <h3 className="text-lg font-bold text-gray-800 mb-3 text-center border-b pb-2">{title}</h3>
                <p className="text-gray-400 text-sm">Немає даних для відображення</p>
            </div>
        );
    }

    const maxValue = data.reduce((max, item) => Math.max(max, item[dataKey]), 0);
    const maxDomain = Math.ceil(maxValue / 10) * 10 || 10;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-3 text-center border-b pb-2">
                {questionNumber ? `${questionNumber}. ` : ''}
                {title}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart
                    data={data}
                    layout="horizontal"
                    margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey={nameKey}
                        type="category"
                        tick={{ fontSize: 10 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={50}
                    />
                    <YAxis
                        dataKey={dataKey}
                        type="number"
                        domain={[0, maxDomain]}
                        allowDecimals={false}
                        label={{ value: 'Кількість', angle: -90, position: 'insideLeft', fontSize: 10 }}
                        tick={{ fontSize: 10 }}
                    />
                    <Tooltip content={<CustomStatTooltip />} />
                    <RechartsLegend wrapperStyle={{ paddingTop: '10px', fontSize: 10 }} />
                    <Bar dataKey={dataKey} fill={barColor} name="Кількість" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};