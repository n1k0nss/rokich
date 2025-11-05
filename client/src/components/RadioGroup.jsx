import React from 'react';

const ErrorMessages = ({ errors }) => errors.map((msg, idx) => (
    <p key={idx} className="mt-1 text-sm text-red-500">{msg}</p>
));

const getContainerClasses = (errors) => {
    const baseClasses = 'p-4 rounded-lg border transition duration-200 space-y-3';
    return `${baseClasses} ${errors.length ? 'border-red-500 bg-red-50' : 'border-gray-300'}`;
};

export const RadioGroup = ({
   label,
   field,
   options,
   value,
   onChange,
   submitted,
   errors,
   inputRef
}) => {

    const containerClasses = getContainerClasses(errors);

    return (
        <div className="mb-6" ref={inputRef}>
            <label className="block font-medium text-gray-700 mb-3">{label}</label>

            <div className={containerClasses}>
                {options.map((option, idx) => {
                    const isChecked = value === option.value;
                    const isDisabled = submitted;

                    const optionContainerClasses = `
                        flex items-center cursor-pointer p-2.5 rounded-lg transition duration-150
                        ${isChecked
                        ? 'bg-blue-50 border-blue-600'
                        : 'hover:bg-gray-50'
                    }
                        ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}
                    `;

                    const customRadioClasses = `
                        w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center flex-shrink-0
                        ${isChecked
                        ? 'border-blue-600 bg-white shadow-inner'
                        : 'border-gray-400 bg-white' 
                    }
                    `;

                    const dotClasses = `
                        w-2.5 h-2.5 rounded-full transition duration-150
                        ${isChecked ? 'bg-blue-600 scale-100' : 'bg-transparent scale-0'}
                    `;

                    return (
                        <label key={idx} className={optionContainerClasses}>
                            <input
                                type="radio"
                                name={field}
                                value={option.value}
                                checked={isChecked}
                                onChange={onChange}
                                disabled={isDisabled}
                                className="absolute opacity-0 w-0 h-0"
                            />

                            <div className={customRadioClasses}>
                                <div className={dotClasses} />
                            </div>

                            <span className={`text-sm font-medium ${isDisabled ? 'text-gray-500' : 'text-gray-700'}`}>
                                {option.label}
                            </span>
                        </label>
                    );
                })}
            </div>

            <ErrorMessages errors={errors} />
        </div>
    );
};