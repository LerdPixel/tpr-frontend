import React, { useEffect, useState } from 'react';
import styles from '../../styles/QuestionCreator.module.css';
import MyButton from '../ui/button/MyButton';

interface ShortAnswerQuestionProps {
  data: any;
  setData: (data: any) => void;
}

const ShortAnswerQuestion: React.FC<ShortAnswerQuestionProps> = ({ data, setData }) => {
    const [isLoading, setIsLoading] = useState(true);
  
    // Инициализация data
    useEffect(() => {
      if (!data.correct) {
        setData({ ...data, correct: [''], caseInsensitive : 'true', "trim": true });
      }
      setIsLoading(false);
    }, []);
  
    if (isLoading || !data.correct) return null;

  const handleAnswerChange = (index: number, value: string) => {
    const updated = [...data.correct];
    updated[index] = value;
    setData({...data, correct : updated});
  };

  const addAnswer = () => {
    setData({...data , correct : [...data.correct, '']});
  };

  const removeAnswer = (index: number) => {
    if (data.correct.length === 1) return; // Не удаляем последний ответ
    const updated = data.correct.filter((_: any, i: number) => i !== index);
    setData({...data, correct : [updated]});
  };

  return (
    <div className=''>


      {data.correct.map((ans: string, index: number) => (
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
