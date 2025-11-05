import Joi from 'joi';

// VALIDATION
const baseString = Joi.string().trim().required().messages({
    'string.empty': 'Поле обов\'язкове.',
});

const baseNumber = Joi.number().integer().required().messages({
    'number.base': 'Має бути числом.',
    'any.required': 'Поле обов\'язкове.'
});

const baseRadio = Joi.string().required().messages({
    'string.empty': 'Будь ласка, виберіть одну з опцій.',
    'any.required': 'Поле обов\'язкове.',
});

export const ANKETA_FIELDS_CONFIG = {

    name: {
        schema: baseString.min(2),
        minMessage: 'Ім’я має містити щонайменше 2 символи.'
    },
    age: {
        schema: baseNumber.min(1).max(120),
        minMessage: 'Введіть коректний вік.'
    },
    gender: {
        schema: baseRadio.valid('male', 'female', 'other').messages({
            'any.only': 'Виберіть вашу стать.',
        }),
    },
    profession: {
        schema: baseString.min(3),
        minMessage: 'Професія має містити щонайменше 3 символи.'
    },
};

// STATISTICS

export const AGGREGATE_FIELDS_CONFIG = [
    { key: 'Gender', default: 'Не вказано', case: 'lower' }, // Потрібно привести до нижнього регістру
    { key: 'Age', default: 'Не вказано', case: 'string' }, // Потрібно привести до рядка
    { key: 'Profession', default: 'Не вказано', case: 'string' }, // Нове універсальне поле
    { key: 'City', default: 'Не вказано', case: 'string' }, // Ще одне універсальне поле
];