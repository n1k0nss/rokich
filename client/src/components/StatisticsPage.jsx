import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Припускається, що ці імпорти є коректними
import { schwartzQuestionsText, terminalValues, instrumentalValues } from '../utils/values.js';
import { fetchStatistics, validateStatsKey } from '../utils/api.js';

// Імпорти уніфікованих компонентів
import { AnketaStatistics } from './AnketaStatistics';
import { RokichRankTable } from './RokichRankTable';
import { PieChartComponent } from './statistics/PieChartComponent';

// Імпорт спільних констант
import { COLORS, SCORE_LABELS } from '../utils/chartHelpers.jsx';

// --- ОСНОВНИЙ КОМПОНЕНТ СТОРІНКИ ---

export default function StatisticsPage({ setView }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [keyInput, setKeyInput] = useState('');
    const [hasAccess, setHasAccess] = useState(false);
    const [keyLoading, setKeyLoading] = useState(false);

    const totalTerminalValues = terminalValues.length;
    const totalInstrumentalValues = instrumentalValues.length;

    // Мапа для швидкого отримання назви питання Шварца за номером
    const schwartzQuestionsMap = useMemo(() => {
        return schwartzQuestionsText.reduce((map, text, index) => {
            const key = (index + 1).toString();
            map[key] = text;
            return map;
        }, {});
    }, []);

    // --- ЛОГІКА ДОСТУПУ ---

    const loadStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchStatistics();
            setStats(data);
            setHasAccess(true);
        } catch (err) {
            setError(err.message || "Не вдалося завантажити статистику. Можливо, закінчився час сесії.");
            setHasAccess(false);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleKeySubmit = async (e) => {
        e.preventDefault();
        setKeyLoading(true);
        setError(null);
        try {
            const success = await validateStatsKey(keyInput);
            if (success) {
                setHasAccess(true);
                await loadStats();
            } else {
                setError("Невірний пароль доступу.");
            }
        } catch (err) {
            setError("Помилка мережі при перевірці пароля.");
        } finally {
            setKeyLoading(false);
        }
    };


    // --- РЕНДЕРИНГ ФОРМИ / СТАТУСІВ ---
    if (!hasAccess) {
        // ... (рендеринг форми валідації ключа) ...
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-blue-200">
                    <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
                        🔒 Доступ до Статистики
                    </h1>
                    <p className="text-center text-gray-600 mb-6">
                        Для перегляду зведених результатів введіть ключ доступу.
                    </p>
                    <form onSubmit={handleKeySubmit} className="space-y-4">
                        <input
                            type="password"
                            value={keyInput}
                            onChange={(e) => setKeyInput(e.target.value)}
                            placeholder="Введіть пароль..."
                            disabled={keyLoading}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        />
                        {error && (
                            <p className="text-red-500 text-sm text-center font-medium">{error}</p>
                        )}
                        <button
                            type="submit"
                            disabled={keyLoading || keyInput.length === 0}
                            className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-150 disabled:bg-gray-400"
                        >
                            {keyLoading ? 'Перевірка...' : 'Отримати доступ'}
                        </button>
                    </form>
                    <button
                        onClick={() => setView('test')}
                        className="mt-6 w-full text-center text-blue-500 hover:text-blue-700 transition"
                    >
                        Повернутися до тестування
                    </button>
                </div>
            </div>
        );
    }

    if (loading || keyLoading) return <div className="text-center p-10"><p className="text-xl text-blue-600">Завантаження статистики...</p></div>;
    if (error) return <div className="text-center p-10"><p className="text-xl text-red-600 font-bold">Помилка: {error}</p></div>;

    if (!stats || Object.keys(stats).length === 0 || stats.demographics.total_users === 0) return (
        <div className="text-center p-10">
            <p className="text-xl text-gray-500">❌ Даних для статистики поки що немає.</p>
            <button
                onClick={() => setView('test')}
                className="mt-6 w-full max-w-xs mx-auto px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
                Повернутися
            </button>
        </div>
    );

    // --- ПІДГОТОВКА ДАНИХ ---
    const { demographics, schwartz_distributions, rokich_terminal, rokich_instrumental } = stats;

    // Визначаємо ключі анкети, які буде відображати AnketaStatistics, у потрібному порядку
    const anketaFieldKeys = Object.keys(demographics).filter(
        key => key !== 'total_users' && key !== 'average_completion_time' && demographics[key] && Object.keys(demographics[key]).length > 0
    );

    const sortedRokichTerminal = (rokich_terminal || []).sort((a, b) => a.average_rank - b.average_rank);
    const sortedRokichInstrumental = (rokich_instrumental || []).sort((a, b) => a.average_rank - b.average_rank);

    // --- РЕНДЕРИНГ ОСНОВНОЇ СТОРІНКИ СТАТИСТИКИ ---

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="w-full max-w-6xl mx-auto">
                <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800">
                    📈 Зведена Статистика Тестування
                </h1>

                <p className="text-center text-gray-500 mb-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <span>
                        Відгуків: <span className="font-semibold text-lg text-blue-600">{demographics.total_users || 'N/A'}</span>
                    </span>
                    <button
                        onClick={() => setView('test')}
                        className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition text-sm"
                    >
                        Повернутися до тесту
                    </button>
                </p>

                {/* --- СЕКЦІЯ 1: АНКЕТА (ДЕМОГРАФІЯ) --- */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">1. Статистика Анкети</h2>

                {/* Тут AnketaStatistics генерує цикли діаграм */}
                <AnketaStatistics
                    demographics={demographics}
                    fieldKeys={anketaFieldKeys}
                    // Номери питань (1-based), які мають бути BAR-діаграмою. Наприклад, якщо Age - друге поле, а Profession - третє.
                    barChartKeys={[2, 3]}
                />


                {/* --- СЕКЦІЯ 2: РОКІЧ (Таблиці Рейтингу) --- */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">2. Методика Рокіча (Середній Рейтинг)</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Термінальні цінності */}
                    <RokichRankTable
                        title="Термінальні цінності (Цілі життя)"
                        data={sortedRokichTerminal}
                        totalValuesCount={totalTerminalValues}
                    />

                    {/* Інструментальні цінності */}
                    <RokichRankTable
                        title="Інструментальні цінності (Засоби)"
                        data={sortedRokichInstrumental}
                        totalValuesCount={totalInstrumentalValues}
                    />
                </div>

                {/* --- СЕКЦІЯ 3: ШВАРЦ (Детальні Кругові Діаграми) --- */}
                <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-6 border-b pb-2">3. Методика Шварца (Розподіл відповідей)</h2>

                <div className="grid grid-cols-1 gap-6">
                    {Object.entries(schwartz_distributions || {}).map(([qKey, distribution]) => {
                        const cleanQKey = qKey.toString().replace('Q', '');
                        const questionText = schwartzQuestionsMap[cleanQKey] || `Питання ${cleanQKey} (Назва не знайдена)`;

                        const pieData = Object.entries(distribution)
                            .map(([score, count]) => {
                                const numericScore = parseInt(score);
                                const label = SCORE_LABELS[numericScore] || `Бал ${numericScore} (Невідомо)`;

                                return {
                                    name: `${numericScore}: ${label}`,
                                    value: count
                                };
                            })
                            .filter(d => d.value > 0)
                            .sort((a, b) => {
                                // Сортуємо за числовим балом (1, 2, 3...)
                                const scoreA = parseInt(a.name.split(':')[0]);
                                const scoreB = parseInt(b.name.split(':')[0]);
                                return scoreA - scoreB;
                            });

                        if (pieData.length === 0) return null;

                        return (
                            <PieChartComponent
                                key={qKey}
                                title={questionText}
                                data={pieData.map((d, i) => ({...d, fill: COLORS[i + 1]}))}
                                questionNumber={cleanQKey}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}