import React, { useState } from 'react';
import styles from '../styles/QuestionCreator.module.css';
import SingleChoice from './questions/SingleChoice.tsx'
import NumericAnswer from './questions/NumericAnswer.tsx'
import SortableQuestion from './questions/SortableQuestion.tsx'

const questionTypes = {
  single: ["Один ответ", "Создание вопроса с одним вариантом ответа"],
  multiple: ["Несколько вариантов", "Создание вопроса с несколькими ответами"],
  short: ["Краткий ответ", "Создание вопроса с коротким ответом"],
  numeric: ["Числовой", "Создание вопроса с численным ответом"],
  sortable: ["Ранжирующий","Создание вопроса на упорядочивание"],
  matching: ["Соответствие","Создание вопроса на соответствие"],
} as const;

type QuestionType = keyof typeof questionTypes;

const QuestionCreator = () => {
  const [questionType, setQuestionType] = useState<QuestionType>('single');
  const [cost, setCost] = useState(1);

  const renderQuestionComponent = () => {
    console.log(questionType);
    
    switch (questionType) {
      case "single":
        return <SingleChoice />;
      case 'numeric':
        return <NumericAnswer />;
      case 'sortable':
        return <SortableQuestion />;
      //   case 'sorting':
      //     return <SortingQuestion score={score} setScore={setScore} />;
      //   case 'matching':
      //     return <MatchingQuestion score={score} setScore={setScore} />;
      default:
        return null;
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {questionTypes[questionType][1]}
        </h2>
        <div className={styles.points}>
          <span className={styles.pointsValue}>{cost}</span> балл{RusWordEnding(cost)}
        </div>
      </div>

      <div>
        <label className={styles.label}>Вопрос</label>
        <textarea
          placeholder="Введите ваш вопрос здесь..."
          className={styles.textarea}
        />
      </div>

      {renderQuestionComponent()}

      <button className={styles.createButton}>Создать вопрос</button>

      <div className={styles.typeSelect}>
        Тип вопроса:{' '}
        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value as QuestionType)}
        >
          {Object.keys(questionTypes).map((key) =>
            <option key={key} value={key}>{questionTypes[key][0]}</option>
          )}
          
          <option value="numeric">Численный</option>
        </select>
      </div>
    </div>
  );
};

function RusWordEnding(n : number) {
  if ([11, 12, 13, 14].includes(n))
    return "ов";
  else if (n % 10 === 1)
    return "";
  else if ([2, 3, 4].includes(n % 10))
    return "а"
  return "ов"
}



export default QuestionCreator;
