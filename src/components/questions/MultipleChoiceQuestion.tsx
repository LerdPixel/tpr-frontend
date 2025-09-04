import { useEffect, useState } from 'react';
import styles from '../../styles/QuestionCreator.module.css';

interface Props {
  data: {
    options?: string[];
    correct?: number[];
  };
  setData: (data: { options: string[]; correct: number[] }) => void;
}

const MultipleChoiceQuestion = ({ data, setData }: Props) => {
  const [isLoading, setIsLoading] = useState(true);

  // Инициализация data
  useEffect(() => {
    if (!data.options) {
      setData({ ...data, options: [""] });
    }
    if (!data.correct) {
      setData({ ...data, correct: [] });
    }
    setIsLoading(false);
  }, []);

  if (isLoading || !data.options || !data.correct) return null;

  const handleTextChange = (index: number, text: string) => {
    const updated = [...data.options];
    updated[index] = text;
    setData({ ...data, options: updated });
  };

  const handleToggleCorrect = (index: number) => {
    const isCorrect = data.correct.includes(index);
    const updatedCorrect = isCorrect
      ? data.correct.filter((i) => i !== index)
      : [...data.correct, index];
    setData({ ...data, correct: updatedCorrect });
  };

  const addOption = () => {
    setData({ ...data, options: [...data.options, ""] });
  };

  const removeOption = (index: number) => {
    const updatedOptions = data.options.filter((_, i) => i !== index);

    // Пересчёт correct после удаления
    const updatedCorrect = data.correct
      .filter((i) => i !== index) // убираем удалённый индекс
      .map((i) => (i > index ? i - 1 : i)); // смещаем индексы

    setData({ ...data, options: updatedOptions, correct: updatedCorrect });
  };

  return (
    <div className={styles.optionsBlock}>
      {data.options.map((option, index) => (
        <div key={index} className={styles.optionRow}>
          <input
            type="checkbox"
            checked={data.correct.includes(index)}
            onChange={() => handleToggleCorrect(index)}
          />
          <input
            type="text"
            value={option}
            onChange={(e) => handleTextChange(index, e.target.value)}
            className={styles.input}
            placeholder={`Вариант ${index + 1}`}
          />
          <button
            onClick={() => removeOption(index)}
            className={styles.removeButton}
          >
            ✕
          </button>
        </div>
      ))}

      <button onClick={addOption} className={styles.addOption}>
        + Добавить вариант
      </button>
    </div>
  );
};

export default MultipleChoiceQuestion;
