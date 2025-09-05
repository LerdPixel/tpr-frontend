import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "../../styles/QuestionCreator.module.css";
import { useState, useEffect } from "react";
import MyButton from "../ui/button/MyButton";
import React from "react";

type Answer = { id: string; text: string };

interface SortableQuestionProps {
  data: any;
  setData: (data: any) => void;
}

const SortableQuestion: React.FC<SortableQuestionProps> = ({
  data,
  setData,
}) => {
  const [options, setOptions] = useState<Answer[]>(
    data?.options || [
      { id: "1", text: "" },
      { id: "2", text: "" },
      { id: "3", text: "" },
    ]
  );

  useEffect(() => {
    setData({ options , correctOrder : options.map((_, i) => Number(i))});
  }, [options, setData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const handleAddOption = () => {
    setOptions([...options, { id: (options.length + 1).toString(), text: "" }]);
  };
  const handleTextChange = (id: string, newText: string) => {
    // setOptions(prev =>
    //   prev.map(option => (option.id === id ? {...option, text : newText} : option) )
    // )
    setOptions((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((a) => a.id === id);
      if (index !== -1) {
        updated[index] = { ...updated[index], text: newText };
      }
      return updated;
    });
  };
  const handleRemoveOption = (i: number) => {
    const updated = options.filter((_, index) => index !== i);
    setOptions(updated);
  };

  return (
    <div className={styles.optionsBlock}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (active.id !== over?.id) {
            const oldIndex = options.findIndex((a) => a.id === active.id);
            const newIndex = options.findIndex((a) => a.id === over?.id);
            setOptions(arrayMove(options, oldIndex, newIndex));
          }
        }}
      >
        <SortableContext
          items={options.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {options.map((answer, index) => (
            <SortableItem
              key={answer.id}
              id={answer.id}
              index={index}
              text={answer.text}
              handleTextChange={handleTextChange}
              handleRemoveOption={handleRemoveOption}
            />
          ))}
        </SortableContext>
      </DndContext>
      <button onClick={handleAddOption} className={styles.addOption}>
        + Добавить вариант
      </button>
    </div>
  );
};

const SortableItem = React.memo(function SortableItem({
  id,
  index,
  text,
  handleTextChange,
  handleRemoveOption,
}: {
  id: string;
  index: number;
  text: string;
  handleTextChange: (id: string, text: string) => void;
  handleRemoveOption: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.item} key={id}>
      <span className={styles.index}>{index + 1}</span>
      <input
        type="text"
        className={styles.input}
        value={text}
        placeholder={`Ответ ${id}`}
        onChange={(e) => handleTextChange(id, e.target.value)}
      />
      <span {...attributes} {...listeners} className={styles.dragHandle}>
        ≡
      </span>
      <button
        onClick={() => handleRemoveOption(index)}
        className={styles.removeButton}
      >
        ✕
      </button>
    </div>
  );
});

export default SortableQuestion;
