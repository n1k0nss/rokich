/**
 * Функція для агрегації зібраних даних тестування.
 * Ця функція універсально обробляє демографічні дані,
 * використовуючи зовнішню конфігурацію.
 *
 * @param {Array<Object>} results Масив результатів тестування (сирі дані).
 * @param {Array<string>} SCHWARTZ_QUESTIONS Масив ключів питань Шварца (наприклад, ['Q1', 'Q2', ...]).
 * @param {Array<Object>} AGGREGATE_FIELDS_CONFIG Конфігурація полів анкети для агрегації частот.
 * @returns {Object} Агреговані статистичні дані.
 */
export function aggregateData(results, SCHWARTZ_QUESTIONS, AGGREGATE_FIELDS_CONFIG) {
    const total_users = results.length;

    // --- 1. Універсальна Агрегація Частот (Демографія/Прості Поля) ---
    // Формат: { Gender: { male: count, female: count, ... }, Age: { 25: count, ... } }
    const general_distributions = {};

    // Ініціалізація усіх полів, які ми агрегуємо
    AGGREGATE_FIELDS_CONFIG.forEach(field => {
        general_distributions[field.key] = {};
    });

    results.forEach(r => {
        AGGREGATE_FIELDS_CONFIG.forEach(field => {
            const fieldKey = field.key;
            // Використовуємо значення з результату або дефолтне
            let value = r[fieldKey] || field.default;

            // Застосування правил форматування (lower, string)
            if (field.case === 'lower' && typeof value === 'string') {
                value = value.toLowerCase();
            } else if (field.case === 'string') {
                value = String(value);
            }

            // Підрахунок частоти
            const dist = general_distributions[fieldKey];
            dist[value] = (dist[value] || 0) + 1;
        });
    });


    // --- 2. Рокіч (Середні Ранги) ---
    const rokichTerminalRanks = {};
    const rokichInstrumentalRanks = {};

    results.forEach(r => {
        // Логіка парсингу Рокіча залишається специфічною, оскільки формат даних складний

        // Розпарсити термінальні цінності
        if (r.TerminalRanks) {
            r.TerminalRanks.split('; ').forEach(item => {
                const match = item.match(/^(\d+)\.\s*(.*)$/);
                if (match) {
                    const rank = parseInt(match[1], 10);
                    const name = match[2].trim();
                    if (!rokichTerminalRanks[name]) rokichTerminalRanks[name] = [];
                    rokichTerminalRanks[name].push(rank);
                }
            });
        }

        // Розпарсити інструментальні цінності
        if (r.InstrumentalRanks) {
            r.InstrumentalRanks.split('; ').forEach(item => {
                const match = item.match(/^(\d+)\.\s*(.*)$/);
                if (match) {
                    const rank = parseInt(match[1], 10);
                    const name = match[2].trim();
                    if (!rokichInstrumentalRanks[name]) rokichInstrumentalRanks[name] = [];
                    rokichInstrumentalRanks[name].push(rank);
                }
            });
        }
    });

    // Функція обчислення середнього рангу
    const calculateAvgRank = (rankData) => {
        return Object.entries(rankData).map(([name, ranks]) => {
            const sum = ranks.reduce((a, b) => a + b, 0);
            const average_rank = sum / ranks.length;
            return { name, average_rank };
        }).sort((a, b) => a.average_rank - b.average_rank);
    };

    const rokich_terminal = calculateAvgRank(rokichTerminalRanks);
    const rokich_instrumental = calculateAvgRank(rokichInstrumentalRanks);


    // --- 3. Шварц (Розподіл Частот) ---
    const schwartz_distributions = {};

    // Ініціалізація усіх питань
    SCHWARTZ_QUESTIONS.forEach(qKey => {
        // Ініціалізуємо бали від '1' до '6' для кожного питання
        schwartz_distributions[qKey] = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 };
    });

    results.forEach(r => {
        SCHWARTZ_QUESTIONS.forEach(qKey => {
            const score = r[qKey]; // Бал від 1 до 6
            if (score) {
                const scoreKey = String(score);
                // Додаємо лише якщо бал знаходиться в діапазоні ініціалізації
                if (schwartz_distributions[qKey].hasOwnProperty(scoreKey)) {
                    schwartz_distributions[qKey][scoreKey] += 1;
                }
            }
        });
    });

    // --- 4. Зведена Статистика ---
    return {
        demographics: {
            total_users,
            ...general_distributions
        },
        rokich_terminal,
        rokich_instrumental,
        schwartz_distributions
    };
}