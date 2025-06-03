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
import MyButton from '../ui/button/MyButton';

type Answer = { id: string; text: string };

const SortableQuestion = () => {
  const [options, setOptions] = useState<Answer[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
    { id: '3', text: '' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const handleAddOption = () => {
    setOptions([...options, {id : ++options.length, text : ''}])
  }
    const handleOptionChange = (index: number, value: string) => {
        const updated = [...options];
        updated[index].text = value;
        setOptions(updated);
    };
    const handleRemoveOption = (i: number) => {
        const updated = options.filter((_, index) => index !== i);
        setOptions(updated);
    };
function SortableItem({ id, index, text}: { id: string; index: number; text: string}) {
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
    <div ref={setNodeRef} style={style} className={styles.item} key={id}>
      <span className={styles.index}>{index + 1}</span>
      <input 
        className={styles.input}
        value={text} 
        placeholder={`Ответ ${id}`} 
        onChange={(e) => {handleOptionChange(index, e.target.value)}}  />
      <span {...attributes} {...listeners} className={styles.dragHandle}>≡</span>
        <button
            onClick={() => handleRemoveOption(index)}
            className={styles.removeButton}
        >
            ✕
        </button>
    </div>
  );
}

  return (
    <div className={styles.optionsBlock}>
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (active.id !== over?.id) {
          const oldIndex = options.findIndex(a => a.id === active.id);
          const newIndex = options.findIndex(a => a.id === over?.id);
          setOptions(arrayMove(options, oldIndex, newIndex));
        }
      }}
    >
      <SortableContext items={options.map(a => a.id)} strategy={verticalListSortingStrategy}>
        {options.map((answer, index) => (
          <SortableItem key={answer.id} id={answer.id} index={index} text={answer.text} />
        ))}
      </SortableContext>

    </DndContext>
      <button onClick={handleAddOption} className={styles.addOption}>
        + Добавить вариант
      </button>
    </div>
  );
  
}


export default SortableQuestion;