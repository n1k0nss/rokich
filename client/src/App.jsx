import React, { useState } from "react";
import AnketaForm from "./components/AnketaForm";
import SortableList from "./components/SortableList";
import SchwartzForm from "./components/SchwartzForm";
import StatisticsPage from "./components/StatisticsPage";
import { useFormState } from "./hooks/useFormState";
import { submitResults } from "./utils/api.js";

/**
 * Компонент верхнього колонтитула (Header) для навігації
 */
const AppHeader = ({ view, setView }) => {
    // ... (Код AppHeader залишається незмінним)
    const title = view === 'test'
        ? '📝 Опитувальник Цінностей'
        : '📊 Зведена Статистика';
    // ... (інший код AppHeader)
    const buttonContent = view === 'test' ? (
        <>
            📊 Перейти до Статистики
        </>
    ) : (
        <>
            <svg className="w-4 h-4 inline mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Повернутися до тесту
        </>
    );

    const buttonClass = view === 'test'
        ? "px-3 py-1 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm shadow-md"
        : "px-3 py-1 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition text-sm shadow-md";

    return (
        <header className="py-4 px-4 sm:px-6 lg:px-8 shadow-lg bg-white w-full border-b sticky top-0 z-20">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">
                    {title}
                </h1>

                <button
                    onClick={() => setView(view === 'test' ? 'stats' : 'test')}
                    className={buttonClass}
                >
                    {buttonContent}
                </button>
            </div>
        </header>
    );
};


export default function App() {
    const [view, setView] = useState('test');

    const {
        data,
        setAnketaField,
        setTerminal, setInstrumental, setSchwartz,
        step, setStep,
        status, setStatus, submitted, setSubmitted,
        getErrors, setValidationErrors, scrollToFirstError,
        setRef, mainSectionRefs, getPayload, firstErrorField,
    } = useFormState();

    /**
     * Головний обробник переходу по кроках та фінальної відправки
     */
    const handleNextStep = async (e) => {
        e.preventDefault();

        let action;
        let payload = getPayload(); // Отримуємо уніфікований payload

        if (step === 1) {
            action = 'validate_anketa';
        } else if (step === 2) {
            action = 'validate_rokich';
        } else if (step === 3) {
            action = 'submit_full_results';
        }

        if (submitted) return;

        setStatus("sending");
        setValidationErrors({}); // Очищаємо помилки перед відправкою

        try {
            // Використовуємо уніфікований payload
            await submitResults(payload, action);

            if (step < 3) {
                setStep(step + 1);
                setStatus("idle");
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setStatus("success");
                setSubmitted(true);
                setTimeout(() => setView('stats'), 1500);
            }
        } catch (err) {
            console.error(err);
            setStatus("error");

            if (err.validationErrors) {
                setValidationErrors(err.validationErrors);
                // 2. Скролимо до першого поля, використовуючи функцію з хука
                scrollToFirstError(err.validationErrors);

            } else {
                setValidationErrors({ general: ['Сталася критична помилка: ' + (err.message || 'Збій мережі')] });
            }
        }
    };

    // --- Функція рендерингу поточного кроку ---
    const renderStep = () => {
        switch (step) {
            case 1:
                return (

                    <div>
                        <AnketaForm
                            data={data}
                            setAnketaField={setAnketaField}
                            setRef={setRef}
                            submitted={submitted}
                            getErrors={getErrors}
                            mainSectionRefs={mainSectionRefs}
                            setValidationErrors={setValidationErrors}
                        />
                    </div>
                );
            case 2:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <SortableList
                            listName="Термінальні цінності"
                            listData={data.terminal}
                            setListData={setTerminal}
                            listRef={mainSectionRefs.terminal} // Ref для скролінгу секції
                            submitted={submitted}
                            getErrors={getErrors}
                        />

                        <SortableList
                            listName="Інструментальні цінності"
                            listData={data.instrumental}
                            setListData={setInstrumental}
                            listRef={mainSectionRefs.instrumental} // Ref для скролінгу секції
                            submitted={submitted}
                            getErrors={getErrors}
                        />
                    </div>
                );
            case 3:
                return (
                    <div>
                        <SchwartzForm
                            schwartz={data.schwartz}
                            setSchwartz={setSchwartz}
                            submitted={submitted}
                            getErrors={getErrors}
                            setValidationErrors={setValidationErrors}
                            firstErrorField={firstErrorField}
                        />
                    </div>
                );
            default:
                // Повідомлення про успішне завершення
                return (
                    <div className="text-center p-8 bg-green-50 rounded-xl shadow-inner">
                        <p className="text-3xl mb-4">🎉</p>
                        <h2 className="text-2xl font-bold text-green-700 mb-2">Тест завершено!</h2>
                        <p className="text-gray-600">Ваші результати успішно надіслані. Через секунду ви будете перенаправлені.</p>
                        <button onClick={() => setView('stats')} className="mt-6 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md">Перейти до Статистики</button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            {/* ХЕДЕР */}
            <AppHeader view={view} setView={setView} />

            <main className="w-full max-w-4xl mx-auto py-10 px-4">
                {view === 'test' ? (
                    // РЕЖИМ ТЕСТУВАННЯ
                    <div className="bg-white shadow-xl rounded-2xl p-8 md:p-10 border border-gray-200">
                        {/* ... (Індикатор кроків та заголовок) ... */}
                        <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800">
                            Методика «Ціннісні орієнтації»
                        </h1>

                        {step <= 3 && (
                            <div className="mb-8 text-center text-xl font-semibold text-blue-600">
                                Крок {step} з 3
                            </div>
                        )}


                        <form onSubmit={handleNextStep} className="space-y-8">
                            {renderStep()}

                            {/* --- Кнопки Навігації --- */}
                            <div className="flex justify-between pt-4">
                                {/* ... (Кнопка "Назад" залишається незмінною) ... */}
                                {step > 1 && step <= 3 && !submitted && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep(step - 1);
                                            setValidationErrors({});
                                            setStatus("idle");
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="px-6 py-2 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition shadow-md"
                                    >
                                        ← Назад
                                    </button>
                                )}

                                {(step >= 1 && step <= 3 && !submitted) && (
                                    <button
                                        type="submit"
                                        disabled={status === "sending"}
                                        className={`px-8 py-3 rounded-lg font-semibold text-white text-lg transition-all shadow-md 
                                            ${status === "sending"
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:ring-4 focus:ring-blue-300"
                                        } ${step === 2 || step === 1 ? 'ml-auto' : ''}` // Видалено зайвий повтор
                                        }
                                    >
                                        {status === "sending"
                                            ? "Перевірка..."
                                            : step === 3
                                                ? "Надіслати результати"
                                                : "Далі →"
                                        }
                                    </button>
                                )}
                            </div>

                            {/* --- Status Messages & General Errors --- */}
                            {(status === "error" || getErrors('general').length > 0) && (
                                <p className="text-center text-red-600 font-medium mt-2 p-3 bg-red-100 rounded-lg">
                                    {getErrors('general').length > 0
                                        ? getErrors('general').join(', ')
                                        : 'Помилка валідації. Перевірте поля на поточному кроці.'}
                                </p>
                            )}
                            {submitted && status === "success" && (
                                <p className="text-center text-green-600 font-medium mt-2 p-3 bg-green-100 rounded-lg">
                                    ✅ Дані успішно надіслані! Дякуємо за участь.
                                </p>
                            )}
                        </form>
                    </div>
                ) : (
                    // РЕЖИМ СТАТИСТИКИ
                    <StatisticsPage setView={setView} />
                )}
            </main>
        </div>
    );
}