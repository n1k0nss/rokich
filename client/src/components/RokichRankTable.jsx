import React from 'react';
import { COLORS } from '../utils/chartHelpers.jsx';

/**
 * Відображає таблицю середніх рангів для цінностей Рокіча.
 * * @param {object} props
 * @param {string} props.title - Заголовок таблиці.
 * @param {Array<object>} props.data - Відсортовані дані Рокіча (name, average_rank).
 * @param {number} props.totalValuesCount - Загальна кількість цінностей (для розрахунку діапазону рангу).
 */
export const RokichRankTable = ({ title, data, totalValuesCount }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100 flex flex-col items-center justify-center min-h-[250px]">
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                <p className="text-gray-400 text-sm mt-2">Немає даних для відображення.</p>
            </div>
        );
    }

    const maxRank = totalValuesCount;

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100 h-full flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{title}</h3>

            <div className="text-sm font-semibold text-gray-500 grid grid-cols-12 gap-2 pb-2 border-b border-gray-200 sticky top-0 bg-white z-10">
                <div className="col-span-1 text-center">№</div>
                <div className="col-span-4">Цінність</div>
                <div className="col-span-3 text-center">Сер. Ранг</div>
                <div className="col-span-4 text-left">Рейтинг (від 1 до {maxRank})</div>
            </div>

            <div className="flex-grow overflow-y-auto max-h-[500px]">
                {data.map((item, index) => {
                    const rank = index + 1;
                    const avgRank = item.average_rank;
                    // Обчислюємо відсоток, наскільки близько ранг до 1 (ідеального)
                    const percentage = ((maxRank - avgRank) / (maxRank - 1)) * 100;
                    const color = rank <= 3 ? COLORS[0] : rank <= 8 ? COLORS[1] : COLORS[6];

                    return (
                        <div key={index}
                             className="grid grid-cols-12 gap-2 py-2 border-b border-gray-100 hover:bg-gray-50 transition duration-100 items-center text-sm"
                        >
                            <div className="col-span-1 font-extrabold text-center text-lg" style={{ color: color }}>
                                {rank}
                            </div>
                            <div className="col-span-4 font-medium text-gray-700">
                                {item.name}
                            </div>
                            <div className="col-span-3 text-center font-mono text-gray-800">
                                {avgRank.toFixed(2)}
                            </div>
                            <div className="col-span-4 px-1">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="h-2.5 rounded-full"
                                        style={{
                                            width: `${Math.max(0, percentage)}%`,
                                            backgroundColor: color
                                        }}
                                        title={`Близькість до 1: ${percentage.toFixed(1)}%`}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};