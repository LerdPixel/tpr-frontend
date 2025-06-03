import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from '../../styles/QuestionCreator.module.css';
import { useState } from 'react';

type Answer = { id: string; text: string };

const SortableQuestion = () => {
  const [answers, setAnswers] = useState<Answer[]>([
    { id: '1', text: 'Ответ 1' },
    { id: '2', text: 'Ответ 2' },
    { id: '3', text: 'Ответ 3' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleTextChange = (id: string, newText: string) => {
    setAnswers(prev =>
      prev.map(answer => (answer.id === id ? { ...answer, text: newText } : answer))
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (active.id !== over?.id) {
          const oldIndex = answers.findIndex(a => a.id === active.id);
          const newIndex = answers.findIndex(a => a.id === over?.id);
          setAnswers(arrayMove(answers, oldIndex, newIndex));
        }
      }}
    >
      <SortableContext items={answers.map(a => a.id)} strategy={verticalListSortingStrategy}>
        {answers.map((answer, index) => (
          <SortableItem
            key={answer.id}
            id={answer.id}
            index={index}
            text={answer.text}
            onTextChange={handleTextChange}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({
  id,
  index,
  text,
  onTextChange,
}: {
  id: string;
  index: number;
  text: string;
  onTextChange: (id: string, text: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.item}>
      <span className={styles.index}>{index + 1}</span>
      <input
        type="text"
        className={styles.input}
        value={text}
        onChange={(e) => onTextChange(id, e.target.value)}
      />
      <span {...attributes} {...listeners} className={styles.dragHandle}>≡</span>
    </div>
  );
}

export default SortableQuestion;