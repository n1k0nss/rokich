import Joi from 'joi';
import {
    TERMINAL_VALUES,
    INSTRUMENTAL_VALUES,
    SCHWARTZ_QUESTIONS
} from './constants.js';

import {ANKETA_FIELDS_CONFIG} from './configs.js';

const validateSchema = (schema, data) => {

    const { error } = schema.validate(data, { abortEarly: false, allowUnknown: true });

    if (!error) return {};

    const formattedErrors = error.details.reduce((acc, detail) => {
        const field = detail.path.join('_') || 'general';
        if (!acc[field]) acc[field] = [];

        const message = detail.message.replace(/['"]/g, '').replace(' value', '');

        if (!acc[field].includes(message)) {
            acc[field].push(message);
        }
        return acc;
    }, {});

    return formattedErrors;
};

const generateAnketaSchema = () => {
    const schemaFields = Object.entries(ANKETA_FIELDS_CONFIG).reduce((acc, [key, config]) => {
        let schema = config.schema;

        if (config.minMessage) {
            const ruleKey = schema.type === 'string' ? 'string.min' : 'number.min';
            schema = schema.messages({ [ruleKey]: config.minMessage });
        }

        if (config.customMessages) {
            schema = schema.messages(config.customMessages);
        }

        acc[key] = schema;
        return acc;
    }, {});

    return Joi.object(schemaFields);
};


const anketaSchema = generateAnketaSchema();

const rokichSchema = Joi.object({
    terminal: Joi.array()
        .items(Joi.string().valid(...TERMINAL_VALUES))
        .length(TERMINAL_VALUES.length)
        .unique()
        .required()
        .messages({
            'array.length': `Термінальні цінності: необхідно розставити ${TERMINAL_VALUES.length} пунктів.`,
            'array.unique': 'У списку термінальних цінностей є повтори.',
            'any.only': 'Одне з обраних значень термінальних цінностей не є коректним.'
        }),
    instrumental: Joi.array()
        .items(Joi.string().valid(...INSTRUMENTAL_VALUES))
        .length(INSTRUMENTAL_VALUES.length)
        .unique()
        .required()
        .messages({
            'array.length': `Інструментальні цінності: необхідно розставити ${INSTRUMENTAL_VALUES.length} пунктів.`,
            'array.unique': 'У списку інструментальних цінностей є повтори.',
            'any.only': 'Одне з обраних значень інструментальних цінностей не є коректним.'
        }),
});

const schwartzAnswer = Joi.number().integer().valid(1, 2, 3, 4, 5, 6).required().messages({
    'number.base': 'Відповідь має бути числом (1-6).',
    'any.only': 'Відповідь має бути в діапазоні від 1 до 6.'
});

const schwartzSchema = Joi.object(
    SCHWARTZ_QUESTIONS.reduce((acc, qKey) => {
        acc[qKey] = schwartzAnswer.messages({'any.required': `Відповідь на питання ${qKey.replace('Q', '')} обов'язкова.`});
        return acc;
    }, {})
);


export const validateAnketa = (body) => validateSchema(anketaSchema, body);

export const validateRokich = (body) => validateSchema(rokichSchema, body);

export const validateSchwartz = (body) => validateSchema(schwartzSchema, body);

export const validateBody = (body) =>
    validateSchema(anketaSchema.concat(rokichSchema).concat(schwartzSchema), body);