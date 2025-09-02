import { useState } from "react";
import {
  ListChecks,
  CheckSquare,
  FileText,
  Hash,
  ArrowDownAZ,
  Shuffle,
} from "lucide-react";

// Типы данных
interface Topic {
  title: string;
  description: string;
}

interface Question {
  data: Record<string, any>;
  points: number;
  question_text: string;
  question_type: string;
  topic_id: number;
}

// Пример данных
const topics: Topic[] = [
  { title: "Математика", description: "Вопросы по алгебре и геометрии" },
  { title: "История", description: "Вопросы по мировой истории" },
  { title: "Физика", description: "Законы и явления природы" },
    { title: "Математика", description: "Вопросы по алгебре и геометрии" },
  { title: "История", description: "Вопросы по мировой истории" },
  { title: "Физика", description: "Законы и явления природы" },
    { title: "Математика", description: "Вопросы по алгебре и геометрии" },
  { title: "История", description: "Вопросы по мировой истории" },
  { title: "Физика", description: "Законы и явления природы" },
    { title: "Математика", description: "Вопросы по алгебре и геометрии" },
  { title: "История", description: "Вопросы по мировой истории" },
  { title: "Физика", description: "Законы и явления природы" },
    { title: "Математика", description: "Вопросы по алгебре и геометрии" },
  { title: "История", description: "Вопросы по мировой истории" },
  { title: "Физика", description: "Законы и явления природы" },
    { title: "Математика", description: "Вопросы по алгебре и геометрии" },
  { title: "История", description: "Вопросы по мировой истории" },
  { title: "Физика", description: "Законы и явления природы" },
    { title: "Математика", description: "Вопросы по алгебре и геометрии" },
  { title: "История", description: "Вопросы по мировой истории" },
  { title: "Физика", description: "Законы и явления природы" },
    { title: "Математика", description: "Вопросы по алгебре и геометрии" },
  { title: "История", description: "Вопросы по мировой истории" },
  { title: "Физика", description: "Законы и явления природы" },
];

const questions: Question[] = [
  {
    data: { additionalProp1: { options: ["2", "3", "4"] } },
    points: 1,
    question_text: "Сколько будет 2+2?",
    question_type: "single",
    topic_id: 0,
  },
    {
    data: { additionalProp1: { options: ["2", "3", "4"] } },
    points: 1,
    question_text: "Сколько будет 2+2?",
    question_type: "single",
    topic_id: 0,
  },
    {
    data: { additionalProp1: { options: ["2", "3", "4"] } },
    points: 1,
    question_text: "Сколько будет 2+2?",
    question_type: "single",
    topic_id: 0,
  },
    {
    data: { additionalProp1: { options: ["2", "3", "4"] } },
    points: 1,
    question_text: "Сколько будет 2+2?",
    question_type: "single",
    topic_id: 0,
  },
    {
    data: { additionalProp1: { options: ["2", "3", "4"] } },
    points: 1,
    question_text: "Сколько будет 2+2?",
    question_type: "single",
    topic_id: 0,
  },
    {
    data: { additionalProp1: { options: ["2", "3", "4"] } },
    points: 1,
    question_text: "Сколько будет 2+2?",
    question_type: "single",
    topic_id: 0,
  },
    {
    data: { additionalProp1: { options: ["2", "3", "4"] } },
    points: 1,
    question_text: "Сколько будет 2+2?",
    question_type: "single",
    topic_id: 0,
  },

    {
    data: { additionalProp1: { options: ["2", "3", "4"] } },
    points: 1,
    question_text: "Сколько будет 2+2?",
    question_type: "single",
    topic_id: 0,
  },
    {
    data: { additionalProp1: { options: ["2", "3", "4"] } },
    points: 1,
    question_text: "Сколько будет 2+2?",
    question_type: "single",
    topic_id: 0,
  },
    {
    data: { additionalProp1: { options: ["2", "3", "4"] } },
    points: 1,
    question_text: "Сколько будет 2+2?",
    question_type: "single",
    topic_id: 0,
  },
    {
    data: { additionalProp1: { options: ["2", "3", "4"] } },
    points: 1,
    question_text: "Сколько будет 2+2?",
    question_type: "single",
    topic_id: 0,
  },
    {
    data: { additionalProp1: { options: ["2", "3", "4"] } },
    points: 1,
    question_text: "Сколько будет 2+2?",
    question_type: "single",
    topic_id: 0,
  },
    {
    data: { additionalProp1: { options: ["2", "3", "4"] } },
    points: 1,
    question_text: "Сколько будет 2+2?",
    question_type: "single",
    topic_id: 0,
  },
    {
    data: { additionalProp1: { options: ["2", "3", "4"] } },
    points: 1,
    question_text: "Сколько будет 2+2?",
    question_type: "single",
    topic_id: 0,
  },

    {
    data: { additionalProp1: { options: ["2", "3", "4"] } },
    points: 1,
    question_text: "Сколько будет 2+2?",
    question_type: "single",
    topic_id: 0,
  },
    {
    data: { additionalProp1: { options: ["2", "3", "4"] } },
    points: 1,
    question_text: "Сколько будет 2+2?",
    question_type: "single",
    topic_id: 0,
  },
  {
    data: { additionalProp1: { placeholder: "Введите ответ" } },
    points: 2,
    question_text: "Кто был первым президентом США?",
    question_type: "short",
    topic_id: 1,
  },
  {
    data: { additionalProp1: { options: ["Сила", "Масса", "Энергия"] } },
    points: 1,
    question_text: "Что измеряется в Ньютонах?",
    question_type: "single",
    topic_id: 2,
  },
];

// Функция выбора иконки по типу вопроса
const getIconByType = (type: string) => {
  switch (type) {
    case "single":
      return <CheckSquare className="w-5 h-5 text-blue-500" />;
    case "multiple":
      return <ListChecks className="w-5 h-5 text-green-500" />;
    case "short":
      return <FileText className="w-5 h-5 text-purple-500" />;
    case "numeric":
      return <Hash className="w-5 h-5 text-orange-500" />;
    case "sortable":
      return <ArrowDownAZ className="w-5 h-5 text-pink-500" />;
    case "matching":
      return <Shuffle className="w-5 h-5 text-teal-500" />;
    default:
      return <FileText className="w-5 h-5 text-gray-400" />;
  }
};

export default function TopicsPage() {
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);

  return (
    <div className="flex h-screen">
      {/* Левая часть - список тем */}
      <div className="w-1/4 border-r border-gray-300 overflow-y-auto p-4">
        <h2 className="text-lg font-bold mb-4">Темы</h2>
        <ul className="space-y-2">
          {topics.map((topic, index) => (
            <li
              key={index}
              onClick={() => setSelectedTopic(index)}
              className={`cursor-pointer rounded-lg p-3 transition hover:bg-gray-100 ${
                selectedTopic === index ? "bg-gray-200 font-semibold" : ""
              }`}
            >
              <div className="text-base">{topic.title}</div>
              <div className="text-sm text-gray-600">{topic.description}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Правая часть - список вопросов */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-lg font-bold mb-4">Вопросы</h2>
        {selectedTopic === null ? (
          <p className="text-gray-500">Выберите тему, чтобы увидеть вопросы</p>
        ) : (
          <ul className="space-y-3">
            {questions
              .filter((q) => q.topic_id === selectedTopic)
              .map((q, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border p-3 shadow-sm hover:shadow-md transition"
                >
                  <div className="mt-1">{getIconByType(q.question_type)}</div>
                  <div>
                    <div className="font-medium">{q.question_text}</div>
                    <div className="text-sm text-gray-500">Тип: {q.question_type}</div>
                    <div className="text-sm text-gray-500">Баллы: {q.points}</div>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
