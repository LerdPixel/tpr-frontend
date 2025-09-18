import SingleChoice from "./SingleChoice.tsx";
import NumericAnswer from "./NumericAnswer.tsx";
import SortableQuestion from "./SortableQuestion.tsx";
import MatchingQuestion from "./MatchingQuestion.tsx";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion.tsx";
import ShortAnswerQuestion from "./ShortAnswerQuestion.tsx";
export const questionTypes = {
    single_choice: ["Один ответ", "Создание вопроса с одним вариантом ответа", (data, setData) => <SingleChoice data={data} setData={setData} />],
    multiple_choice: [
      "Несколько вариантов",
      "Создание вопроса с несколькими ответами",
      (data, setData) => <MultipleChoiceQuestion data={data} setData={setData} />
    ],
    text: ["Краткий ответ", "Создание вопроса с коротким ответом", (data, setData) => <ShortAnswerQuestion data={data} setData={setData} />],
    numeric: ["Числовой", "Создание вопроса с численным ответом", (data, setData) => <NumericAnswer data={data} setData={setData} />],
    ordering: ["Сортировка", "Создание вопроса на упорядочивание", (data, setData) => <SortableQuestion data={data} setData={setData} />],
    matching: ["Соответствие", "Создание вопроса на соответствие", (data, setData) => <MatchingQuestion data={data} setData={setData} />],
  } as const;