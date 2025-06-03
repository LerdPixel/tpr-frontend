import React, { useState } from 'react';
import styles from './Questions.module.css';
import { Input } from '@/components/ui/input.tsx';
import MyButton from "@/components/ui/button/MyButton.tsx"
import { Trash2 } from 'lucide-react';

interface Props {
  score: number;
  setScore: (value: number) => void;
}

const SingleChoiceQuestion: React.FC<Props> = ({ score, setScore }) => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([{ text: '', isCorrect: false }]);

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index].text = value;
    setOptions(updated);
  };

  const handleCorrectChange = (index: number) => {
    const updated = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(updated);
  };

  const handleAddOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Создание вопроса с одним вариантом ответа</h2>
        <div className={styles.scoreBox}>
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className={styles.scoreInput}
          />
          <span>балла</span>
        </div>
      </div>

      <textarea
        placeholder="Введите ваш вопрос здесь..."
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        className={styles.textarea}
      />

      {options.map((opt, index) => (
        <div key={index} className={styles.optionRow}>
          <input
            type="radio"
            checked={opt.isCorrect}
            onChange={() => handleCorrectChange(index)}
          />
          <Input
            type="text"
            value={opt.text}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            className={styles.optionInput}
          />
          <MyButton
            type="button"
            onClick={() => handleRemoveOption(index)}
            className={styles.removeButton}
          >
            <Trash2 size={18} />
          </MyButton>
        </div>
      ))}

      <MyButton onClick={handleAddOption} className={styles.addButton}>
        + Добавить вариант
      </MyButton>

      <MyButton className={styles.submitButton}>Создать вопрос</MyButton>
    </div>
  );
};

export default SingleChoiceQuestion;
