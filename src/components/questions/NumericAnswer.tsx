import { useState, useEffect } from 'react'
import styles from '../../styles/QuestionCreator.module.css';

interface NumericAnswerProps {
  data: any;
  setData: (data: any) => void;
}

const NumericAnswer: React.FC<NumericAnswerProps> = ({ data, setData }) => {
  const [answer, setAnswer] = useState(data?.answer || '');
  const [tolerance, setTolerance] = useState(data?.tolerance || '2');

  useEffect(() => {
    setData({ answer, tolerance });
  }, [answer, tolerance, setData]);

  const handleNumericInput = (value: string, setter: (val: string | number) => void) => {
    //setter(value.replace(',', '.'))
    setter(value.toString().replace(',', '.'))
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