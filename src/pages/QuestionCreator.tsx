import React, { useState } from "react";
import styles from "../styles/QuestionCreator.module.css";
import PointsInput from "../components/ui/pointsInput/PointsInput.tsx";
import type IQuestion from "@/components/ui/interfaces/IQuestion.tsx";
import { questionTypes } from "../components/questions/questionTypesData.tsx";


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
  const qType = modalData?.data?.question_type || "single_choice";
  const [questionType, setQuestionType] = useState<QuestionType>(qType);
  console.log(questionType);
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
    if (questionType in questionTypes) {
      return questionTypes[questionType][2](data, setData);
    }
    setModalData(null);
    return null;
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
