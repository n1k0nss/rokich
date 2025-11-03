export async function submitResults(data) {
    const res = await fetch(`/api/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Network error');
    return res.json();
}
