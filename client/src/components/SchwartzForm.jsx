import React, { useEffect, useRef } from 'react';
import { schwartzQuestionsText } from '../utils/values.js';

const SCORES = [1, 2, 3, 4, 5, 6];

// ТЕКСТОВІ ПОЗНАЧКИ
const SCORE_LABELS = {
    1: 'Зовсім не така, як я',
    2: 'Не така, як я',
    3: 'Трішки така, як я',
    4: 'Майже така, як я',
    5: 'Така ж, як я',
    6: 'Дуже подібна',
};

export default function SchwartzForm({
                                         schwartz,
                                         setSchwartz,
                                         submitted,
                                         getErrors,
                                         setValidationErrors,
                                         firstErrorField
                                     }) {

    const qRefs = useRef({});

    schwartzQuestionsText.forEach((_, index) => {
        const qKey = `Q${index + 1}`;
        qRefs.current[qKey] = qRefs.current[qKey] || React.createRef();
    });

    useEffect(() => {
        if (firstErrorField && firstErrorField.startsWith('Q')) {
            const refToScroll = qRefs.current[firstErrorField];

            if (refToScroll && refToScroll.current) {
                requestAnimationFrame(() => {
                    refToScroll.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
            }
        }
    }, [firstErrorField]);

    const handleScoreChange = (qKey, score) => {
        setSchwartz(prev => ({
            ...prev,
            [qKey]: String(score)
        }));
        setValidationErrors(prev => ({ ...prev, [qKey]: null }));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Крок 3: Методика Шварца (40 питань)
            </h2>

            {/* НОВА ЛЕГЕНДА: Grid перемикається на 1 колонку на мобільному */}
            <div className="text-md text-gray-700 text-center mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <p className="font-bold mb-3">Оцініть, наскільки ви подібні до опису цінності:</p>
                <div className={`grid gap-2 text-left text-sm ${
                    /* ВИПРАВЛЕННЯ: на мобілі в 1 колонку, на md (таблет) і вище в 2 */
                    'grid-cols-1 md:grid-cols-2'
                }`}>
                    {Object.entries(SCORE_LABELS).map(([score, label]) => (
                        <p key={score}>
                            <span className="font-extrabold text-blue-700 mr-2">{score}:</span> {label}
                        </p>
                    ))}
                </div>
            </div>

            {schwartzQuestionsText.map((qText, index) => {
                const qKey = `Q${index + 1}`;
                const errors = getErrors(qKey);
                const currentScore = Number(schwartz[qKey]);

                return (
                    <div
                        key={qKey}
                        ref={qRefs.current[qKey]}
                        className={`p-4 rounded-lg border transition-colors 
                                ${errors.length ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
                    >
                        {/* Зменшуємо шрифт питання */}
                        <p className="font-semibold text-gray-700 mb-4 text-base sm:text-lg">
                            {index + 1}. {qText}
                        </p>

                        {/* Підказка над кнопками: зменшуємо шрифт */}
                        <div className="flex justify-between items-center font-medium text-gray-500 mb-2 text-xs sm:text-sm">
                            <span>{SCORE_LABELS[1]}</span>
                            <span>{SCORE_LABELS[6]}</span>
                        </div>

                        <div className="flex justify-evenly items-center gap-2">
                            {SCORES.map(score => (
                                <button
                                    key={score}
                                    type="button"
                                    onClick={() => !submitted && handleScoreChange(qKey, score)}
                                    disabled={submitted}
                                    className={`
                                        flex-1 min-w-[30px] h-10 flex items-center justify-center 
                                        rounded-md text-base font-semibold transition-all duration-200 ease-in-out
                                        ${submitted ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : ''}
                                        ${currentScore === score
                                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                                        : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 active:bg-blue-200'
                                    }
                                        ${errors.length && currentScore !== score ? 'border border-red-400' : ''}
                                    `}
                                    aria-pressed={currentScore === score}
                                >
                                    {score}
                                </button>
                            ))}
                        </div>

                        {/* Відображення повної позначки вибраного балу: зменшуємо шрифт */}
                        <div className="mt-3 h-6 text-center">
                            {currentScore > 0 && (
                                <p className="font-medium text-blue-600 transition-opacity duration-300 text-xs sm:text-sm">
                                    Ваш вибір: {currentScore} ({SCORE_LABELS[currentScore]})
                                </p>
                            )}
                        </div>

                        {errors.map((msg, idx) => (
                            <p key={idx} className="mt-2 text-sm text-red-500">{msg}</p>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}