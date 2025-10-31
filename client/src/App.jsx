import React, { useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { terminalValues, instrumentalValues } from "./values";
import { submitResults } from "./api";

export default function App() {
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [terminal, setTerminal] = useState(
        terminalValues.map((v, id) => ({ id: `t-${id}`, name: v }))
    );
    const [instrumental, setInstrumental] = useState(
        instrumentalValues.map((v, id) => ({ id: `i-${id}`, name: v }))
    );

    const [status, setStatus] = useState("idle");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (submitted) return alert("Ви вже відправили результати!");
        if (!name.trim() || !age.trim()) {
            alert("Будь ласка, введіть ім’я та вік.");
            return;
        }

        setStatus("sending");
        try {
            await submitResults({
                name,
                age,
                terminal: terminal.map((v) => v.name),
                instrumental: instrumental.map((v) => v.name),
            });
            setStatus("success");
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            if (err.response?.data?.errors?.length) {
                setStatus("error");
                alert("Помилки валідації:\n" + err.response.data.errors.join("\n"));
            } else {
                setStatus("error");
                alert("Сталася помилка при відправленні");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center py-10 px-4">
            <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-8 md:p-10 border border-gray-200">
                <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800">
                    Методика «Ціннісні орієнтації» (М. Рокіч)
                </h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* --- Name & Age --- */}
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-1">
                            <label className="block font-medium text-gray-700 mb-2">Ім’я</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={submitted}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100"
                                placeholder="Введіть ваше ім’я"
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block font-medium text-gray-700 mb-2">Вік</label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                disabled={submitted}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100"
                                placeholder="Ваш вік"
                            />
                        </div>
                    </div>

                    {/* --- Sortable Lists --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <h2 className="font-semibold text-lg mb-3 text-center text-gray-800">
                                Термінальні цінності
                            </h2>
                            <p className="text-sm text-gray-500 text-center mb-4">
                                Перетягуйте, щоб розставити пріоритети
                            </p>
                            <ReactSortable
                                list={terminal}
                                setList={setTerminal}
                                animation={200}
                                swapThreshold={0.5}
                                delay={50}
                                delayOnTouchOnly={true}
                                disabled={submitted}
                                className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 shadow-inner"
                            >
                                {terminal.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="bg-white border border-gray-300 px-3 py-2 rounded-md shadow-sm
                               hover:bg-blue-50 cursor-move flex items-center gap-2 transition"
                                    >
                                        <span className="text-gray-500 font-medium">{index + 1}.</span>
                                        <span className="text-gray-800">{item.name}</span>
                                    </div>
                                ))}
                            </ReactSortable>
                        </div>

                        <div>
                            <h2 className="font-semibold text-lg mb-3 text-center text-gray-800">
                                Інструментальні цінності
                            </h2>
                            <p className="text-sm text-gray-500 text-center mb-4">
                                Перетягуйте, щоб розставити пріоритети
                            </p>
                            <ReactSortable
                                list={instrumental}
                                setList={setInstrumental}
                                animation={200}
                                swapThreshold={0.5}
                                delay={50}
                                delayOnTouchOnly={true}
                                disabled={submitted}
                                className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 shadow-inner"
                            >
                                {instrumental.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="bg-white border border-gray-300 px-3 py-2 rounded-md shadow-sm
                               hover:bg-blue-50 cursor-move flex items-center gap-2 transition"
                                    >
                                        <span className="text-gray-500 font-medium">{index + 1}.</span>
                                        <span className="text-gray-800">{item.name}</span>
                                    </div>
                                ))}
                            </ReactSortable>
                        </div>
                    </div>

                    {/* --- Submit Button --- */}
                    <div className="text-center pt-4">
                        <button
                            type="submit"
                            disabled={status === "sending" || submitted}
                            className={`px-8 py-3 rounded-lg font-semibold text-white text-lg transition-all shadow-md 
                ${submitted
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:ring-4 focus:ring-blue-300"
                            }`}
                        >
                            {status === "sending"
                                ? "Надсилання..."
                                : submitted
                                    ? "Відправлено ✅"
                                    : "Надіслати результати"}
                        </button>
                    </div>

                    {/* --- Status Messages --- */}
                    {status === "error" && (
                        <p className="text-center text-red-600 font-medium mt-2">
                            Сталася помилка при відправленні 😢
                        </p>
                    )}
                    {status === "success" && (
                        <p className="text-center text-green-600 font-medium mt-2">
                            ✅ Дані успішно надіслані!
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
