import React from 'react';
const ErrorMessages = ({ errors }) => errors.map((msg, idx) => (
    <p key={idx} className="mt-1 text-sm text-red-500">{msg}</p>
));

const getInputClasses = (errors) => {
    const baseClasses = 'w-full border rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100';
    return `${baseClasses} ${errors.length ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`;
};

export const TextInput = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  submitted,
  errors,
  inputRef,
  description
}) => {

    const inputClasses = getInputClasses(errors);

    return (
        <div className="mb-6">
            <label htmlFor={id} className="block font-medium text-gray-700 mb-2">{label}</label>
            <input
                id={id}
                type={type}
                ref={inputRef}
                value={value}
                onChange={onChange}
                disabled={submitted}
                className={inputClasses}
                placeholder={placeholder}
            />

            {description && (
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}

            <ErrorMessages errors={errors} />
        </div>
    );
};