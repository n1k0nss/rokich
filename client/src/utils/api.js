const BASE_URL = window.location.origin + '/methodics';

export async function submitResults(data, action) {
    const payload = {
        ...data,
        action: action,
    };

    const res = await fetch(`${BASE_URL}/api/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errorData = await res.json();
        const error = new Error(errorData.message || 'Network error');
        error.validationErrors = errorData.errors;
        throw error;
    }
    return res.json();
}

export async function fetchStatistics() {
    const STATS_URL = `${BASE_URL}/api/statistics-data`;

    try {
        const response = await fetch(STATS_URL);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Помилка отримання даних: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Помилка запиту статистики:", error);
        throw error;
    }
}

export async function validateStatsKey(key) {
    const VALIDATE_URL = `${BASE_URL}/api/validate-stats-key`;

    const res = await fetch(VALIDATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
    });

    if (!res.ok) {
        return false;
    }

    return true;
}