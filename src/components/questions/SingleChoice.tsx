import React, { useState } from 'react';
import styles from '../../styles/QuestionCreator.module.css';

const SingleChoice = () => {
  const [options, setOptions] = useState(['']);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (i: number) => {
    const updated = options.filter((_, index) => index !== i);
    setOptions(updated);
    if (i === selectedIndex) setSelectedIndex(0);
    else if (i < selectedIndex) setSelectedIndex(selectedIndex - 1);
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  return (
    <div className={styles.optionsBlock}>
      {options.map((opt, i) => (
        <div key={i} className={styles.optionRow}>
          <input
            type="radio"
            checked={selectedIndex === i}
            onChange={() => setSelectedIndex(i)}
          />
          <input
            placeholder={`Вариант ${i+1}`}
            value={opt}
            onChange={(e) => handleOptionChange(i, e.target.value)}
            className={styles.optionInput}
          />
          <button
            onClick={() => handleRemoveOption(i)}
            className={styles.removeButton}
          >
            ✕
          </button>
        </div>
      ))}

      <button onClick={handleAddOption} className={styles.addOption}>
        + Добавить вариант
      </button>
    </div>
  );
};
export default SingleChoice