import { useState } from 'react'
import styles from '../../styles/QuestionCreator.module.css';


const NumericAnswer = () => {
  const [answer, setAnswer] = useState('');
  const [tolerance, setTolerance] = useState('2');

  const handleNumericInput = (value, setter) => {
    //setter(value.replace(',', '.'))
    setter(parseInt(value.toString().replace(',', '.')))
    console.log(value);
    
  }

  return (
    <div className={styles.numericBlock}>
      <div className={styles.numericRow}>
        <label>Ответ:</label>
        <input
          type="number"
          value={answer}
          onChange={(e) => handleNumericInput(e.target.value, setAnswer)}
          className={styles.numericInput}
        />
      </div>
      <div className={styles.numericRow}>
        <label>Округление:</label>
        <input
          type="text"
          value={tolerance}
          onChange={(e) => handleNumericInput(e.target.value, setTolerance)}
          className={styles.numericInput}
        />
        <span className={styles.percent}>%</span>
      </div>
    </div>
  );
};

export default NumericAnswer