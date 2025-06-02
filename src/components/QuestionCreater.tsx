import React, { useState } from 'react';
import styles from './QuestionCreator.module.css';

import { MultipleChoiceQuestion } from './types/MultipleChoiceQuestion';
import { ShortAnswerQuestion } from './types/ShortAnswerQuestion';
import { SortingQuestion } from './types/SortingQuestion';
import { MatchingQuestion } from './types/MatchingQuestion';
import { NumericAnswerQuestion } from './types/NumericAnswerQuestion';

const QUESTION_TYPES = {
  multiple: 'Несколько вариантов',
  short: 'Краткий ответ',
  numeric: 'Числовой ответ',
  sorting: 'Сортировка',
  matching: 'Соответствие',
};

export const QuestionCreator: React.FC = () => {
  const [questionType, setQuestionType] = useState<'multiple' | 'short' | 'numeric' | 'sorting' | 'matching'>('multiple');
  const [score, setScore] = useState<number>(1);

  const renderQuestionComponent = () => {
    switch (questionType) {
      case 'multiple':
        return <MultipleChoiceQuestion score={score} setScore={setScore} />;
      case 'short':
        return <ShortAnswerQuestion score={score} setScore={setScore} />;
      case 'numeric':
        return <NumericAnswerQuestion score={score} setScore={setScore} />;
      case 'sorting':
        return <SortingQuestion score={score} setScore={setScore} />;
      case 'matching':
        return <MatchingQuestion score={score} setScore={setScore} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.selectorWrapper}>
        <label htmlFor="type">Тип вопроса:</label>
        <select
          id="type"
          className={styles.select}
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value as keyof typeof QUESTION_TYPES)}
        >
          {Object.entries(QUESTION_TYPES).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      {renderQuestionComponent()}
    </div>
  );
};
