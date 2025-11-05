import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import {SCHWARTZ_QUESTIONS} from './utils/constants.js';
import {AGGREGATE_FIELDS_CONFIG} from './utils/configs.js';

import {aggregateData} from './utils/statistics.js';

import {
    validateAnketa,
    validateRokich,
    validateSchwartz,
    validateBody
} from './utils/validators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const PORT = process.env.PORT || 5000;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const CREDENTIALS_PATH = process.env.GOOGLE_CREDENTIALS_PATH;
const BACKUP_FILE = path.resolve('results_backup.json');
const STATS_ACCESS_KEY = process.env.STATS_ACCESS_KEY;

const app = express();

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);
app.use(bodyParser.json({ limit: '300kb' }));


const allowedFromEnv = process.env.ALLOWED_ORIGIN || '';

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedFromEnv === '*') return callback(null, true);
        if (allowedFromEnv) {
            const list = allowedFromEnv.split(',').map(s => s.trim());
            if (list.includes(origin)) return callback(null, true);
        }
        if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: true,
}));

app.use(rateLimit({ windowMs: 60*1000, max: 60 }));

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


app.post('/api/results', async (req, res) => {
    try {
        const body = req.body;
        const { action } = body;

        let errs = {};

        if (action === 'validate_anketa') {
            errs = validateAnketa(body);
        } else if (action === 'validate_rokich') {
            errs = validateRokich(body);
        } else if (action === 'validate_schwartz') {
            errs = validateSchwartz(body);
        } else if (action === 'submit_full_results') {
            errs = validateBody(body);
        } else {
            return res.status(400).json({ ok: false, errors: { general: ['Невірна дія (action).'] }, message: 'Невірний запит' });
        }

        if (Object.keys(errs).length) {
            return res.status(400).json({
                ok: false,
                errors: errs,
                message: 'Помилка валідації даних. Перевірте поля.'
            });
        }

        if (action === 'submit_full_results') {
            const sheets = await getSheets();

            const rowData = {
                Timestamp: new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' }),
                Name: body.name,
                Age: body.age,
                Gender: body.gender,
                Profession: body.profession,
                Hobbies: Array.isArray(body.hobbies) ? body.hobbies.join(', ') : '',
                TerminalRanks: Array.isArray(body.terminal) ? body.terminal.map((v, i) => `${i + 1}. ${v}`).join('; ') : '',
                InstrumentalRanks: Array.isArray(body.instrumental) ? body.instrumental.map((v, i) => `${i + 1}. ${v}`).join('; ') : '',

                ...SCHWARTZ_QUESTIONS.reduce((acc, qKey) => {
                    acc[qKey] = body[qKey] || '';
                    return acc;
                }, {}),
            };

            try {
                let backupData = [];
                try {
                    const fileContent = await fs.readFile(BACKUP_FILE, 'utf-8');
                    backupData = JSON.parse(fileContent);
                } catch (readErr) {
                    if (readErr.code !== 'ENOENT') {
                        console.error("Помилка читання файлу бекапу:", readErr);
                    }
                    backupData = [];
                }

                backupData.push(rowData);
                await fs.writeFile(BACKUP_FILE, JSON.stringify(backupData, null, 2), 'utf-8');
                console.log(`[BACKUP] Дані збережено у ${BACKUP_FILE}`);
            } catch (backupErr) {
                console.error("Помилка під час створення резервної копії:", backupErr);
            }

            const headers = Object.keys(rowData);
            const values = Object.values(rowData);
            const sheetName = 'Аркуш1';

            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: `${sheetName}!A1`,
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: [values],
                },
            });

            return res.json({ ok: true, message: 'Дані успішно збережено.' });
        } else {
            return res.json({ ok: true, message: 'Валідація пройшла успішно.' });
        }

    } catch (err) {
        console.error('Критична помилка при обробці /api/results:', err);
        res.status(500).json({
            ok: false,
            error: 'Internal Server Error',
            message: 'Критична помилка сервера. Зверніться до адміністратора.'
        });
    }
});

app.post('/api/validate-stats-key', (req, res) => {
    const { key } = req.body;

    if (!STATS_ACCESS_KEY) {
        console.error("STATS_ACCESS_KEY не встановлено у .env");
    }

    // Перевірка пароля
    if (key && key === STATS_ACCESS_KEY) {
        return res.json({ success: true, message: 'Доступ надано.' });
    } else {
        return res.status(401).json({ success: false, message: 'Невірний пароль.' });
    }
});

app.get('/api/statistics-data', async (req, res) => {
    try {
        let allResults = [];

        try {
            const fileContent = await fs.readFile(BACKUP_FILE, 'utf-8');
            allResults = JSON.parse(fileContent);
        } catch (readErr) {
            if (readErr.code === 'ENOENT') {
                return res.json({});
            }
            throw readErr;
        }

        if (allResults.length === 0) {
            return res.json({});
        }

        const stats = aggregateData(allResults, SCHWARTZ_QUESTIONS, AGGREGATE_FIELDS_CONFIG);

        res.json(stats);

    } catch (err) {
        console.error('Помилка під час генерації статистики:', err);
        res.status(500).json({
            ok: false,
            message: 'Помилка сервера під час агрегації даних.'
        });
    }
});

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

app.use('/methodics', express.static(path.join(__dirname, '../client/dist')));

app.get('/methodics/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
