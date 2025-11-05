import { useState, useRef, useCallback } from 'react';
import { terminalValues, instrumentalValues } from '../utils/values.js';

// Ініціалізація списків Рокіча (залишається)
const initialTerminal = terminalValues.map((v, id) => ({ id: `t-${id}`, name: v }));
const initialInstrumental = instrumentalValues.map((v, id) => ({ id: `i-${id}`, name: v }));

// --- КОНФІГУРАЦІЯ ПОЛІВ АНКЕТИ (СПРОЩЕНО) ---
const SIMPLE_ANKETA_FIELDS = [
    'name', 'age', 'gender', 'profession' // Залишаємо лише основні
    // Сюди додаватимуться ваші нові прості поля (city, education, etc.)
];

// --- УНІВЕРСАЛЬНИЙ ХУК ---
export function useFormState() {
    // --- Стан форми та навігації ---
    const [step, setStep] = useState(1);
    const [status, setStatus] = useState("idle");
    const [submitted, setSubmitted] = useState(false);

    // --- Стан помилок та скролінгу ---
    const [validationErrors, setValidationErrors] = useState({});
    const [firstErrorField, setFirstErrorField] = useState(null);

    // --- Стан даних ---

    // 1. Уніфікований об'єкт для простих полів
    const [anketaData, setAnketaData] = useState(() =>
        SIMPLE_ANKETA_FIELDS.reduce((acc, field) => ({ ...acc, [field]: '' }), {})
    );

    // 2. Тестові дані (Рокіч, Шварц)
    const [terminal, setTerminal] = useState(initialTerminal);
    const [instrumental, setInstrumental] = useState(initialInstrumental);
    const [schwartz, setSchwartz] = useState({});

    // --- Dynamic Ref Management ---

    // Об'єкт, який зберігатиме всі Refs.
    const fieldRefs = useRef({});
    // Refs для скролінгу великих секцій
    const mainSectionRefs = useRef({
        form: useRef(null), // Загальний ref для Анкети
        terminal: useRef(null),
        instrumental: useRef(null)
    });


    // Функція, яка повертає функцію, щоб присвоїти Ref елементу
    const setRef = useCallback((fieldKey) => (element) => {
        fieldRefs.current[fieldKey] = element;
    }, []);

    // Функція-сеттер для уніфікованого стану (єдина функція для всіх простих полів)
    const setAnketaField = useCallback((field, value) => {
        setAnketaData(prev => ({ ...prev, [field]: value }));
        setValidationErrors(prev => ({ ...prev, [field]: null }));
    }, []);


    // Допоміжна функція для отримання помилок
    const getErrors = useCallback((field) => validationErrors[field] || [], [validationErrors]);


    // --- ЛОГІКА СКРОЛІНГУ ---

    const setValidationErrorsAndFirstError = useCallback((errors) => {
        setValidationErrors(errors);
        const errorKey = Object.keys(errors).find(key => errors[key] && errors[key].length > 0);
        setFirstErrorField(errorKey || null);
    }, []);


    const scrollToFirstError = useCallback((errors) => {
        const firstErrorFieldKey = Object.keys(errors).find(key => errors[key] && errors[key].length > 0);

        if (firstErrorFieldKey) {
            let targetElement = null;

            if (SIMPLE_ANKETA_FIELDS.includes(firstErrorFieldKey)) {
                targetElement = fieldRefs.current[firstErrorFieldKey];
            } else if (firstErrorFieldKey.startsWith('terminal') || firstErrorFieldKey.startsWith('instrumental')) {
                targetElement = mainSectionRefs.current[firstErrorFieldKey.split('_')[0]].current;
            }

            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
                    if (targetElement.tagName === 'INPUT') {
                        targetElement.focus();
                    }
                }, 0);
            }
        }
    }, [mainSectionRefs]);


    return {
        step, setStep, status, setStatus, submitted, setSubmitted,
        firstErrorField,
        data: { ...anketaData, terminal, instrumental, schwartz },
        setAnketaField,
        setTerminal, setInstrumental, setSchwartz,

        getErrors,
        setValidationErrors: setValidationErrorsAndFirstError,
        scrollToFirstError,
        setRef,
        mainSectionRefs: mainSectionRefs.current,

        getPayload: () => ({
            ...anketaData,
            terminal: terminal.map((v) => v.name),
            instrumental: instrumental.map((v) => v.name),
            ...schwartz,
        }),
    };
}