import { useState } from 'react';
import styles from '../../styles/QuestionCreator.module.css';

type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
};

const MultipleChoiceQuestion = () => {
  const [options, setOptions] = useState<Option[]>([
    { id: '1', text: '', isCorrect: false },
    { id: '2', text: '', isCorrect: false },
    { id: '3', text: '', isCorrect: false },
    { id: '4', text: '', isCorrect: false },
  ]);

  const handleTextChange = (id: string, text: string) => {
    setOptions(prev =>
      prev.map(option => option.id === id ? { ...option, text } : option)
    );
  };

  const handleToggleCorrect = (id: string) => {
    setOptions(prev =>
      prev.map(option => option.id === id ? { ...option, isCorrect: !option.isCorrect } : option)
    );
  };

  const addOption = () => {
    setOptions(prev => [
      ...prev,
      { id: `${Date.now()}`, text: '', isCorrect: false }
    ]);
  };

  const removeOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.optionsBlock}>

      {options.map((option, index) => (
        <div key={option.id} className={styles.optionRow}>
          <input
            type="checkbox"
            checked={option.isCorrect}
            onChange={() => handleToggleCorrect(option.id)}
          />
          <input
            type="text"
            value={option.text}
            onChange={(e) => handleTextChange(option.id, e.target.value)}
            className={styles.input}
            placeholder={`Вариант ${index + 1}`}
          />
          <button onClick={() => removeOption(index)} className={styles.removeButton}>✕</button>
        </div>
      ))}

      <button onClick={addOption} className={styles.addOption}>+ Добавить вариант</button>
    </div>
  );
};

export default MultipleChoiceQuestion;
