// components/AnketaStatistics.jsx
import React, { useMemo } from 'react';
import { PieChartComponent } from './statistics/PieChartComponent';
import { BarChartComponent } from './statistics/BarChartComponent';
import { COLORS } from '../utils/chartHelpers.jsx';

/**
 * Універсальний компонент для відображення статистики анкети (демографії).
 *
 * @param {object} props
 * @param {object} props.demographics - Об'єкт розподілів (Gender: {...}, Age: {...}, etc.).
 * @param {Array<string>} props.fieldKeys - Порядок ключів полів анкети для відображення (наприклад, ['Gender', 'Age', 'Profession']).
 * @param {Array<number>} props.barChartKeys - Порядкові номери питань (1-based), які мають бути Bar-діаграмою (наприклад, [1, 2, 5]).
 */
export const AnketaStatistics = ({ demographics, fieldKeys, barChartKeys = [] }) => {

    // Створюємо Set з номерів Bar-діаграм для швидкої перевірки
    const barKeysSet = useMemo(() => new Set(barChartKeys), [barChartKeys]);

    // Функція для спеціального форматування даних віку (Age)
    const formatAgeData = (ageDistribution) => {
        return Object.entries(ageDistribution || {})
            .map(([name, value]) => ({ name, value }))
            .filter(d => d.name !== 'Не вказано' && d.value > 0)
            .sort((a, b) => {
                const ageA = parseInt(a.name.split('-')[0], 10) || Infinity;
                const ageB = parseInt(b.name.split('-')[0], 10) || Infinity;
                return ageA - ageB;
            });
    };

    // Форматування для загальних категорій
    const formatCategoricalData = (distribution) => {
        return Object.entries(distribution)
            .map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value: value
            }))
            .filter(d => d.value > 0);
    };

    return (
        <div className="grid grid-cols-1 gap-8 mb-12">
            {fieldKeys.map((distributionKey, index) => {
                const questionNumber = index + 1; // Порядковий номер (починаючи з 1)
                const rawDistribution = demographics[distributionKey];

                if (!rawDistribution) return null;

                let chartData = [];
                let title = distributionKey;

                // Визначаємо заголовок (якщо ключ Gender, то Розподіл за статтю)
                if (distributionKey.toLowerCase() === 'gender') {
                    title = 'Розподіл за статтю';
                } else if (distributionKey.toLowerCase() === 'age') {
                    title = 'Розподіл за віковими групами';
                } else {
                    title = `Розподіл за ${distributionKey.toLowerCase()}`;
                }


                // 1. Форматування даних
                if (distributionKey.toLowerCase() === 'age') {
                    chartData = formatAgeData(rawDistribution);
                } else {
                    chartData = formatCategoricalData(rawDistribution);
                }

                if (chartData.length === 0) return null;

                // 2. Вибір компонента: Bar, якщо порядковий номер у масиві, інакше Pie
                const isBarChart = barKeysSet.has(questionNumber);

                const ComponentToRender = isBarChart ? BarChartComponent : PieChartComponent;

                return (
                    <ComponentToRender
                        key={distributionKey}
                        title={title}
                        data={chartData}
                        questionNumber={questionNumber.toString()}
                        // Додаткові пропси для BarChart (якщо Bar)
                        nameKey="name"
                        dataKey="value"
                        barColor={COLORS[index % COLORS.length]}
                    />
                );
            })}
        </div>
    );
};