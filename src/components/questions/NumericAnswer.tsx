import React, { useState } from 'react'
import styles from '../../styles/QuestionCreator.module.css';


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

export default NumericAnswer