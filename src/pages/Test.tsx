import React, { useState } from 'react';
import styles from '../styles/QuestionCreator.module.css';

type QuestionType = 'single' | 'numeric';

const QuestionCreator = () => {
  const [questionType, setQuestionType] = useState<QuestionType>('single');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {questionType === 'single'
            ? 'Создание вопроса с одним вариантом ответа'
            : 'Вопрос с численным ответом'}
        </h2>
        <div className={styles.points}>
          <span className={styles.pointsValue}>2</span> балла
        </div>
      </div>

      <div>
        <label className={styles.label}>Вопрос</label>
        <textarea
          placeholder="Введите ваш вопрос здесь..."
          className={styles.textarea}
        />
      </div>

      {questionType === 'single' ? <SingleChoice /> : <NumericAnswer />}

      <button className={styles.createButton}>Создать вопрос</button>

      <div className={styles.typeSelect}>
        Тип вопроса:{' '}
        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value as QuestionType)}
        >
          <option value="single">Один вариант</option>
          <option value="numeric">Численный</option>
        </select>
      </div>
    </div>
  );
};

const SingleChoice = () => {
  const [options, setOptions] = useState(['Вариант 1', 'Вариант 2', 'Вариант 3']);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleAddOption = () => {
    setOptions([...options, `Вариант ${options.length + 1}`]);
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

const NumericAnswer = () => {
  const [answer, setAnswer] = useState('1.23');
  const [tolerance, setTolerance] = useState('2');

  return (
    <div className={styles.numericBlock}>
      <div className={styles.numericRow}>
        <label>Ответ:</label>
        <input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className={styles.numericInput}
        />
      </div>
      <div className={styles.numericRow}>
        <label>Округление:</label>
        <input
          type="text"
          value={tolerance}
          onChange={(e) => setTolerance(e.target.value)}
          className={styles.numericInput}
        />
        <span className={styles.percent}>%</span>
      </div>
    </div>
  );
};

export default QuestionCreator;
