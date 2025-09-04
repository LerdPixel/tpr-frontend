import React, { useEffect, useState } from "react";
import styles from "../../styles/QuestionCreator.module.css";

interface SingleChoiceProps {
  data: any;
  setData: (data: any) => void;
}

const SingleChoice: React.FC<SingleChoiceProps> = ({ data, setData }) => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (data.options == undefined) setData({ ...data, options: [""] });
    if (data.correct == undefined) setData({ ...data, correct: 0 });
    setIsLoading(false);
  }, []);
  const setOptions = (options: string[]) => {
    setData({ ...data, options });
  };
  const setSelectedIndex = (selectedIndex: number) => {
    setData({ ...data, correct: selectedIndex });
  };

  const handleAddOption = () => {
    setOptions([...data.options, ""]);
  };

  const handleRemoveOption = (i: number) => {
    const updated = data.options.filter((_: any, index: number) => index !== i);
    setOptions(updated);
    if (i === data.correct) setSelectedIndex(0);
    else if (i < data.correct) setSelectedIndex(data.correct - 1);
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...data.options];
    updated[index] = value;
    setOptions(updated);
  };
  if (isLoading || !data.options) return null;
  return (
    <div className={styles.optionsBlock}>
      {data.options &&
        data.options.map((opt: string, i: number) => (
          <div key={i} className={styles.optionRow}>
            <input
              type="radio"
              checked={data.correct === i}
              onChange={() => setSelectedIndex(i)}
            />
            <input
              placeholder={`Вариант ${i + 1}`}
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
export default SingleChoice;
