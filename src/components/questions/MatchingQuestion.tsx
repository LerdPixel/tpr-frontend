import { useState } from 'react';
import styles from '../../styles/QuestionCreator.module.css';

type MatchPair = {
  id: string;
  text: string;
  matchId: string | null;
};

type MatchOption = {
  id: string;
  text: string;
};

const MatchingQuestion = () => {
  const [leftItems, setLeftItems] = useState<MatchPair[]>([
    { id: '1', text: '', matchId: null },
    { id: '2', text: '', matchId: null },
  ]);

  const [rightItems, setRightItems] = useState<MatchOption[]>([
    { id: 'a', text: '' },
    { id: 'b', text: '' },
    { id: 'c', text: '' },
  ]);

  const handleLeftTextChange = (id: string, value: string) => {
    setLeftItems(prev =>
      prev.map(item => item.id === id ? { ...item, text: value } : item)
    );
  };

  const handleRightTextChange = (id: string, value: string) => {
    setRightItems(prev =>
      prev.map(item => item.id === id ? { ...item, text: value } : item)
    );
  };

  const handleMatchChange = (id: string, matchId: string) => {
    setLeftItems(prev =>
      prev.map(item => item.id === id ? { ...item, matchId } : item)
    );
  };

  const addLeftItem = () => {
    setLeftItems(prev => [...prev, {
      id: `${Date.now()}-left`, text: '', matchId: null
    }]);
  };

  const addRightItem = () => {
    setRightItems(prev => [...prev, {
      id: `${Date.now()}-right`, text: ''
    }]);
  };

  const removeLeftItem = (index: number) => {
    setLeftItems(prev => prev.filter((_, i) => i !== index));
  };

  const removeRightItem = (index: number) => {
    setRightItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.matchContainer}>
      <div className={styles.column}>
        <h3>Левый список</h3>
        {leftItems.map((item, index) => (
          <div key={item.id} className={styles.matchRow}>
            <input
              className={styles.input}
              value={item.text}
              onChange={(e) => handleLeftTextChange(item.id, e.target.value)}
              placeholder={`Элемент ${index + 1}`}
            />
            <button onClick={() => removeLeftItem(index)} className={styles.removeButton}>✕</button>
            <select
              className={styles.select}
              value={item.matchId || ''}
              onChange={(e) => handleMatchChange(item.id, e.target.value)}
            >
              <option value="">Соответствующий элемент</option>
              {rightItems.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.text || 'Без названия'}</option>
              ))}
            </select>
          </div>
        ))}
        <button className={styles.addOption} onClick={addLeftItem}>+ Добавить элемент</button>
      </div>

      <div className={styles.column}>
        <h3>Правый список</h3>
        {rightItems.map((item, index) => (
          <div key={item.id} className={styles.matchRow}>
            <input
              className={styles.input}
              value={item.text}
              onChange={(e) => handleRightTextChange(item.id, e.target.value)}
              placeholder={`Элемент ${index + 1}`}
            />
            <button onClick={() => removeRightItem(index)} className={styles.removeButton}>✕</button>
          </div>
        ))}
        <button className={styles.addOption} onClick={addRightItem}>+ Добавить элемент</button>
      </div>
    </div>
  );
};

export default MatchingQuestion;
