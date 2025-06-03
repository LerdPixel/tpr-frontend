import React, { useState } from 'react';
import styles from './Questions.module.css';
import { Trash2 } from 'lucide-react';
import MyButton from '../ui/button/MyButton';

interface ShortAnswerQuestionProps {
  onChange: (value: any) => void;
}

export const ShortAnswerQuestion: React.FC<ShortAnswerQuestionProps> = ({ onChange }) => {
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState<string[]>(['']);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestionText(e.target.value);
    onChange({ questionText: e.target.value, answers });
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    onChange({ questionText, answers: newAnswers });
  };

  const addAnswer = () => {
    const newAnswers = [...answers, ''];
    setAnswers(newAnswers);
    onChange({ questionText, answers: newAnswers });
  };

  const removeAnswer = (index: number) => {
    const newAnswers = answers.filter((_, i) => i !== index);
    setAnswers(newAnswers);
    onChange({ questionText, answers: newAnswers });
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>Вопрос</label>
      <textarea
        className={styles.textarea}
        placeholder="Введите ваш вопрос здесь..."
        value={questionText}
        onChange={handleQuestionChange}
      />

      {answers.map((answer, index) => (
        <div key={index} className={styles.answerRow}>
          <input
            className={styles.input}
            type="text"
            value={answer}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            placeholder={`Ответ ${index + 1}`}
          />
          <button className={styles.removeButton} onClick={() => removeAnswer(index)}>
            <Trash2 size={20} color="red" />
          </button>
        </div>
      ))}

      <button className={styles.addButton} onClick={addAnswer}>+ Добавить возможный ответ</button>
        <MyButton  className={styles.createButton}>Создать вопрос</MyButton>
    </div>
  );
};
