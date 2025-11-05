import React from 'react';
import { ReactSortable } from "react-sortablejs";

export default function SortableList({ listName, listData, setListData, listRef, submitted, getErrors }) {
    const listKey = listName.toLowerCase().replace(' ', ''); // 'terminal' або 'instrumental'

    return (
        <div ref={listRef}>
            <h2 className="font-semibold text-lg mb-3 text-center text-gray-800">
                {listName}
            </h2>
            <p className="text-sm text-gray-500 text-center mb-4">
                Перетягуйте, щоб розставити пріоритети
            </p>

            {getErrors(listKey).map((msg, idx) => (
                <p key={idx} className="mb-2 text-center text-red-500 font-medium">{msg}</p>
            ))}

            <ReactSortable
                list={listData}
                setList={setListData}
                animation={200}
                swapThreshold={0.5}
                delay={50}
                delayOnTouchOnly={true}
                disabled={submitted}
                className={`bg-gray-50 border rounded-lg p-3 space-y-2 shadow-inner
                ${getErrors(listKey).length ? 'border-red-500' : 'border-gray-200'}`}
            >
                {listData.map((item, index) => (
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
    );
}