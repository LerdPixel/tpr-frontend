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

type SortableItem = { id: number; text: string };

type SortableData = {
  items: SortableItem[];
  correct: number[];
};

interface SortableQuestionProps {
  data: SortableData | null;
  setData: (data: SortableData) => void;
}

const SortableQuestion: React.FC<SortableQuestionProps> = ({
  data,
  setData,
}) => {
  const [items, setItems] = useState<SortableItem[]>(
    data?.items || [
      { id: 10, text: "" },
      { id: 11, text: "" },
      { id: 12, text: "" },
    ]
  );

  // Generate next available ID
  const getNextId = () => {
    const maxId = items.length > 0 ? Math.max(...items.map(item => item.id)) : 9;
    return maxId + 1;
  };

  useEffect(() => {
    const sortableData: SortableData = {
      items: items,
      correct: items.map(item => item.id)
    };
    console.log("SortableQuestion data update:", sortableData);
    setData(sortableData);
  }, [items, setData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const handleAddItem = () => {
    const newId = getNextId();
    setItems([...items, { id: newId, text: "" }]);
  };
  
  const handleTextChange = (id: number, newText: string) => {
    setItems((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((item) => item.id === id);
      if (index !== -1) {
        updated[index] = { ...updated[index], text: newText };
      }
      return updated;
    });
  };
  
  const handleRemoveItem = (id: number) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
  };

  return (
    <div className={styles.optionsBlock}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (active.id !== over?.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over?.id);
            setItems(arrayMove(items, oldIndex, newIndex));
          }
        }}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item, index) => (
            <SortableItem
              key={item.id}
              id={item.id}
              index={index}
              text={item.text}
              handleTextChange={handleTextChange}
              handleRemoveItem={handleRemoveItem}
            />
          ))}
        </SortableContext>
      </DndContext>
      <button onClick={handleAddItem} className={styles.addOption}>
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
  handleRemoveItem,
}: {
  id: number;
  index: number;
  text: string;
  handleTextChange: (id: number, text: string) => void;
  handleRemoveItem: (id: number) => void;
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
        onClick={() => handleRemoveItem(id)}
        className={styles.removeButton}
      >
        ✕
      </button>
    </div>
  );
});

export default SortableQuestion;
