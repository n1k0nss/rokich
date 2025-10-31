import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const CREDENTIALS_PATH = process.env.GOOGLE_CREDENTIALS_PATH || './google-credentials.json';
const BACKUP_FILE = path.resolve('results_backup.json');

const app = express();
app.use(helmet());
app.use(bodyParser.json({ limit: '300kb' }));


const allowedFromEnv = process.env.ALLOWED_ORIGIN || ''; // може бути '*' або 'https://mydomain.com' або список через кому

app.use(cors({
    origin: (origin, callback) => {
        // allow non-browser clients (Postman, curl) with no origin
        if (!origin) return callback(null, true);

        // if env explicitly allows all, allow
        if (allowedFromEnv === '*') return callback(null, true);

        // if env is comma-separated list, check membership
        if (allowedFromEnv) {
            const list = allowedFromEnv.split(',').map(s => s.trim());
            if (list.includes(origin)) return callback(null, true);
        }

        // allow any localhost (any port) and 127.0.0.1
        if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }

        // otherwise block
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: true,
}));

// rate limiter
app.use(rateLimit({ windowMs: 60*1000, max: 60 }));

// canonical lists — ОБОВ'ЯЗКОВО переконайся що ці значення збігаються з тим, що показує фронтенд
const TERMINAL_VALUES = [
    "Активне діяльне життя",
    "Життєва мудрість",
    "Здоров’я",
    "Цікава робота",
    "Краса природи і мистецтва",
    "Любов (духовна і фізична близькість)",
    "Матеріально забезпечене життя",
    "Наявність хороших і вірних друзів",
    "Громадське визнання",
    "Пізнання (можливість розширення освіти, кругозору)",
    "Продуктивне життя (максимально повне використання своїх можливостей)",
    "Розвиток (робота над собою)",
    "Свобода (самостійність, незалежність)",
    "Щасливе сімейне життя",
    "Щастя інших (добробут, розвиток і щастя інших людей)",
    "Творчість (можливість творчої діяльності)",
    "Впевненість у собі",
    "Розваги (приємне проведення часу)"
];

const INSTRUMENTAL_VALUES = [
    "Акуратність",
    "Вихованість",
    "Відповідальність",
    "Ввічливість",
    "Воля (самоконтроль)",
    "Високі запити (високі стандарти)",
    "Готовність допомогти іншим",
    "Життєрадісність",
    "Чесність",
    "Дисциплінованість",
    "Освіченість",
    "Незалежність",
    "Раціоналізм",
    "Сміливість у відстоюванні поглядів",
    "Толерантність",
    "Твердість волі",
    "Широта поглядів",
    "Чуйність"
];

// Google auth
const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
let sheetsClient;

async function getSheets() {
    if (!sheetsClient) {
        sheetsClient = google.sheets({ version: 'v4', auth: await auth.getClient() });
    }
    return sheetsClient;
}

// validate
function validateBody(body) {
    const errs = [];
    if (!body) { errs.push('Тіло запиту пусте'); return errs; }
    const { name, age, terminal, instrumental } = body;

    if (!name || typeof name !== 'string' || !name.trim()) errs.push('Будь ласка, введіть коректне ім’я');
    const ageNum = Number(age);
    if (!age || Number.isNaN(ageNum) || ageNum <= 0 || ageNum > 120) errs.push('Будь ласка, введіть коректний вік (1-120)');

    if (!Array.isArray(terminal) || terminal.length !== TERMINAL_VALUES.length) {
        errs.push(`Термінальні цінності повинні містити ${TERMINAL_VALUES.length} пунктів`);
    } else {
        const uniq = new Set(terminal);
        if (uniq.size !== terminal.length) errs.push('Термінальні цінності не повинні повторюватися');
        for (const v of terminal) if (!TERMINAL_VALUES.includes(v)) { errs.push(`Невідома термінальна цінність: ${v}`); break;}
    }

    if (!Array.isArray(instrumental) || instrumental.length !== INSTRUMENTAL_VALUES.length) {
        errs.push(`Інструментальні цінності повинні містити ${INSTRUMENTAL_VALUES.length} пунктів`);
    } else {
        const uniq = new Set(instrumental);
        if (uniq.size !== instrumental.length) errs.push('Інструментальні цінності не повинні повторюватися');
        for (const v of instrumental) if (!INSTRUMENTAL_VALUES.includes(v)) { errs.push(`Невідома інструментальна цінність: ${v}`); break;}
    }

    return errs;
}


// POST /api/results
app.post('/api/results', async (req, res) => {
    try {
        const body = req.body;
        const errs = validateBody(body);
        if (errs.length) return res.status(400).json({ ok: false, errors: errs });

        const { name, age, terminal, instrumental } = body;

        function formatDate(date) {
            const d = date;
            const pad = (n) => n.toString().padStart(2, '0');
            return `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        }

        const timestamp = formatDate(new Date());

        const terminalList = terminal.map((v, i) => `${i + 1}. ${v}`).join('\n');
        const instrumentalList = instrumental.map((v, i) => `${i + 1}. ${v}`).join('\n');

        const row = [
            timestamp,
            name,
            String(age),
            terminalList,
            instrumentalList
        ];

        // append to sheet
        const sheets = await getSheets();
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'A1',
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            requestBody: { values: [row] }
        });

        // backup locally (append)
        let backup = [];
        try {
            const raw = await fs.readFile(BACKUP_FILE, 'utf8');
            backup = JSON.parse(raw || '[]');
        } catch (err) { /* file may not exist */ }

        backup.push({ name, age, terminal, instrumental, timestamp });
        await fs.writeFile(BACKUP_FILE, JSON.stringify(backup, null, 2), 'utf8');

        res.json({ ok: true, message: 'Saved' });
    } catch (err) {
        console.error('Error /api/results:', err);
        res.status(500).json({ ok: false, error: 'Internal server error' });
    }
});

// optional: health check
app.get('/api/health', async (req, res) => {
    try {
        // try to get spreadsheet metadata to check auth
        const sheets = await getSheets();
        await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        res.json({ ok: true, sheets: true });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Google Sheets auth failed', details: err.message });
    }
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
