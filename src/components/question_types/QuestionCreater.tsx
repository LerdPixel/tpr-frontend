import React, { useState } from "react";
import styles from "./Questions.module.css";

import SingleChoiceQuestion from "./SingleChoiceQuestion";
 import { ShortAnswerQuestion } from './ShortAnswerQuestion';
// import { SortingQuestion } from './types/SortingQuestion';
// import { MatchingQuestion } from './types/MatchingQuestion';
// import { NumericAnswerQuestion } from './types/NumericAnswerQuestion';

const QUESTION_TYPES = {
  single: "Один ответ",
  multiple: "Несколько вариантов",
  short: "Краткий ответ",
  numeric: "Числовой",
  ordering: "Ранжирующий",
  matching: "Соответствие",
};

const QuestionCreator: React.FC = () => {
  const [questionType, setQuestionType] = useState<
    "single" | "multiple" | "short" | "numeric" | "ordering" | "matching"
  >("single");
  const [score, setScore] = useState<number>(1);

  const renderQuestionComponent = () => {
    switch (questionType) {
      case "single":
        return <SingleChoiceQuestion score={score} setScore={setScore} />;
      case 'short':
        return <ShortAnswerQuestion score={score} setScore={setScore} />;
      //   case 'numeric':
      //     return <NumericAnswerQuestion score={score} setScore={setScore} />;
      //   case 'sorting':
      //     return <SortingQuestion score={score} setScore={setScore} />;
      //   case 'matching':
      //     return <MatchingQuestion score={score} setScore={setScore} />;
      default:
        return null;
    }
  };

  return (
    <div >
      <div className={styles.selectorWrapper}>
        <label htmlFor="type">Тип вопроса:</label>
        <select
          id="type"
          className={styles.select}
          value={questionType}
          onChange={(e) =>
            setQuestionType(e.target.value as keyof typeof QUESTION_TYPES)
          }
        >
          {Object.entries(QUESTION_TYPES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {renderQuestionComponent()}
    </div>
  );
};

export default QuestionCreator;
