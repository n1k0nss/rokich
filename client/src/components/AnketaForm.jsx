import React from 'react';
import { TextInput } from './TextInput';
import { RadioGroup } from './RadioGroup';

// Список для radio buttons
const GENDERS = [
    { value: 'male', label: 'Чоловіча' },
    { value: 'female', label: 'Жіноча' },
    { value: 'other', label: 'Інша/Не хочу вказувати' },
];

export default function AnketaForm({
   data,
   setAnketaField,
   submitted,
   getErrors,
   setRef,
   mainSectionRefs
}) {

    const handleFieldChange = (field) => (e) => {
        setAnketaField(field, e.target.value);
    };

    return (
        <div ref={mainSectionRefs.form}>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Крок 1: Анкета
            </h2>

            {/* 1. Name */}
            <TextInput
                label="Ім’я" id="name-input" type="text"
                value={data.name} onChange={handleFieldChange('name')}
                placeholder="Введіть ваше ім’я" submitted={submitted}
                inputRef={setRef('name')}
                errors={getErrors('name')}
            />

            {/* 2. Age */}
            <TextInput
                label="Вік" id="age-input" type="number"
                value={data.age} onChange={handleFieldChange('age')}
                placeholder="Ваш вік" submitted={submitted}
                inputRef={setRef('age')}
                errors={getErrors('age')}
            />

            {/* 3. Gender (Radio Group) */}
            <RadioGroup
                label="Стать" field="gender"
                options={GENDERS} value={data.gender}
                onChange={handleFieldChange('gender')}
                submitted={submitted}
                inputRef={setRef('gender')}
                errors={getErrors('gender')}
            />

            {/* 4. Profession */}
            <TextInput
                label="Сфера діяльності / Професія" id="profession-input" type="text"
                value={data.profession} onChange={handleFieldChange('profession')}
                placeholder="Наприклад: IT, освіта, медицина" submitted={submitted}
                inputRef={setRef('profession')}
                errors={getErrors('profession')}
            />

            {/* ... (Тут ви можете додавати будь-які нові поля, наприклад, 'city', 'education'...) */}

        </div>
    );
}