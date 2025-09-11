import { useEffect, useState } from "react";
import styles from "../../styles/QuestionCreator.module.css";

interface Props {
  data: {
    options?: string[];
    correct?: number[];
  };
  setData: (data: { options: string[]; correct: number[] }) => void;
}

const MultipleChoiceQuestion = ({ data, setData }: Props) => {
  const [isLoading, setIsLoading] = useState(true);

  // Initialization of data
  useEffect(() => {
    if (!data.options) {
      setData({ ...data, options: [""], correct: data.correct || [] });
    }
    if (!data.correct) {
      setData({ ...data, correct: [], options: data.options || [""] });
    }
    setIsLoading(false);
  }, []);

  if (isLoading || !data.options || !data.correct) return null;

  // Now we can safely use data.options and data.correct since we've checked they exist
  const options = data.options;
  const correct = data.correct;

  const handleTextChange = (index: number, text: string) => {
    const updated = [...options];
    updated[index] = text;
    setData({ options: updated, correct });
  };

  const handleToggleCorrect = (index: number) => {
    const isCorrect = correct.includes(index);
    const updatedCorrect = isCorrect
      ? correct.filter((i) => i !== index)
      : [...correct, index];
    setData({ options, correct: updatedCorrect });
  };

  const addOption = () => {
    setData({ options: [...options, ""], correct });
  };

  const removeOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);

    // Пересчёт correct после удаления
    const updatedCorrect = correct
      .filter((i) => i !== index) // убираем удалённый индекс
      .map((i) => (i > index ? i - 1 : i)); // смещаем индексы

    setData({ options: updatedOptions, correct: updatedCorrect });
  };

  return (
    <div className={styles.optionsBlock}>
      {options.map((option, index) => (
        <div key={index} className={styles.optionRow}>
          <input
            type="checkbox"
            checked={correct.includes(index)}
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
