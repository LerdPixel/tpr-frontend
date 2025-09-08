import React, { useState } from "react";
import styles from "../styles/QuestionCreator.module.css";
import SingleChoice from "../components/questions/SingleChoice.tsx";
import NumericAnswer from "../components/questions/NumericAnswer.tsx";
import SortableQuestion from "../components/questions/SortableQuestion.tsx";
import MatchingQuestion from "../components/questions/MatchingQuestion.tsx";
import MultipleChoiceQuestion from "../components/questions/MultipleChoiceQuestion.tsx";
import ShortAnswerQuestion from "../components/questions/ShortAnswerQuestion.tsx";
import PointsInput from "../components/ui/pointsInput/PointsInput.tsx";
import type IQuestion from "@/components/ui/interfaces/IQuestion.tsx";

const questionTypes = {
  single_choice: ["Один ответ", "Создание вопроса с одним вариантом ответа"],
  multiple_choice: [
    "Несколько вариантов",
    "Создание вопроса с несколькими ответами",
  ],
  text: ["Краткий ответ", "Создание вопроса с коротким ответом"],
  numeric: ["Числовой", "Создание вопроса с численным ответом"],
  sorting: ["Сортировка", "Создание вопроса на упорядочивание"],
  matching: ["Соответствие", "Создание вопроса на соответствие"],
} as const;

type QuestionType = keyof typeof questionTypes;

interface QuestionCreatorProps {
  saveQuestion: (question: IQuestion) => void;
  modalData: any;
  setModalData: (data: any) => void;
}

const QuestionCreator: React.FC<QuestionCreatorProps> = ({
  saveQuestion,
  modalData,
  setModalData,
}) => {
  const qType = modalData?.data?.question_type || "single";
  const [questionType, setQuestionType] = useState<QuestionType>(qType);
  const [questionText, setQuestionText] = useState(
    modalData?.data?.question_text || ""
  );

  const [points, setPoints] = useState(modalData?.data?.points || 1);
  const [data, setData] = useState(modalData?.data?.data || {});
  const handleSave = () => {
    const newQuestion: IQuestion = {
      ...modalData?.data,
      question_text: questionText,
      question_type: questionType,
      points,
      topic_id: modalData?.topic_id,
      data: {
        ...data,
        // тут сохраняем специфичные данные для типа
      },
    };

    setModalData({ ...modalData, data: { ...newQuestion } });
    saveQuestion(newQuestion);
  };
  const renderQuestionComponent = () => {
    switch (questionType) {
      case "single_choice":
        return <SingleChoice data={data} setData={setData} />;
      case "numeric":
        return <NumericAnswer data={data} setData={setData} />;
      case "sorting":
        return <SortableQuestion data={data} setData={setData} />;
      case "matching":
        return <MatchingQuestion data={data} setData={setData} />;
      case "multiple_choice":
        return <MultipleChoiceQuestion data={data} setData={setData} />;
      case "text":
        return <ShortAnswerQuestion data={data} setData={setData} />;
      default:
        setModalData(null);
        return null;
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{questionTypes[questionType][1]}</h2>
        <PointsInput points={points} setPoints={setPoints} />
      </div>

      <div>
        <label className={styles.label}>Вопрос</label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Введите ваш вопрос здесь..."
          className={styles.textarea}
        />
      </div>

      {renderQuestionComponent()}

      <button className={styles.createButton} onClick={handleSave}>
        Сохранить вопрос
      </button>

      <div className={styles.typeSelect}>
        Тип вопроса:{" "}
        <select
          value={questionType}
          onChange={(e) => {
            setQuestionType(e.target.value as QuestionType);
          }}
        >
          {Object.keys(questionTypes).map((key) => (
            <option key={key} value={key}>
              {questionTypes[key as QuestionType][0]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default QuestionCreator;
