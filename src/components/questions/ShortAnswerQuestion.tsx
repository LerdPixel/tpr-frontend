import React, { useState } from 'react';
import styles from '../../styles/QuestionCreator.module.css';
import MyButton from '../ui/button/MyButton';

const ShortAnswerQuestion = () => {
  const [questionText, setQuestionText] = useState('');
  const [points, setPoints] = useState(1);
  const [answers, setAnswers] = useState<string[]>(['']);

  const handleAnswerChange = (index: number, value: string) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const addAnswer = () => {
    setAnswers([...answers, '']);
  };

  const removeAnswer = (index: number) => {
    if (answers.length === 1) return; // Не удаляем последний ответ
    const updated = answers.filter((_, i) => i !== index);
    setAnswers(updated);
  };

  const handleSubmit = () => {
    const trimmedAnswers = answers.map(a => a.trim());
    if (!questionText.trim()) {
      alert('Введите текст вопроса.');
      return;
    }
    if (trimmedAnswers.some(a => a === '')) {
      alert('Все ответы должны быть заполнены.');
      return;
    }

    const questionPayload = {
      type: 'short-answer',
      text: questionText.trim(),
      points,
      correctAnswers: trimmedAnswers,
    };

    console.log('Создан вопрос:', questionPayload);
    // TODO: передать в API или родителю
  };

  return (
    <div className=''>


      {answers.map((ans, index) => (
        <div key={index} className={styles.optionRow}>
          <input
            type="text"
            className={styles.input}
            value={ans}
            placeholder={`Ответ ${index + 1}`}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
          />
          <button
            className={styles.removeButton}
            onClick={() => removeAnswer(index)}
          >
            ✕
          </button>
        </div>
      ))}

      <button onClick={addAnswer} className={styles.addOption}>
        + Добавить возможный ответ
      </button>

    </div>
  );
};

export default ShortAnswerQuestion;
