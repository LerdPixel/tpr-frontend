import React, { useState } from 'react';
import styles from '../styles/QuestionCreator.module.css';
import SingleChoice from '../components/questions/SingleChoice.tsx'
import NumericAnswer from '../components/questions/NumericAnswer.tsx'
import SortableQuestion from '../components/questions/SortableQuestion.tsx'
import MatchingQuestion from '../components/questions/MatchingQuestion.tsx'
import MultipleChoiceQuestion from '../components/questions/MultipleChoiceQuestion.tsx'
import ShortAnswerQuestion from '../components/questions/ShortAnswerQuestion.tsx'
import PointsInput from '../components/ui/pointsInput/PointsInput.tsx'


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

  const [points, setPoints] = useState();



  const renderQuestionComponent = () => {
    switch (questionType) {
      case "single":
        return <SingleChoice />;
      case 'numeric':
        return <NumericAnswer />;
      case 'sortable':
        return <SortableQuestion />;
      case 'matching':
        return <MatchingQuestion />;
      case 'multiple':
        return <MultipleChoiceQuestion />;
      case 'short':
        return <ShortAnswerQuestion />;
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
        <PointsInput points={points} setPoints={setPoints}/>
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
        </select>
      </div>
    </div>
  );
};




export default QuestionCreator;
