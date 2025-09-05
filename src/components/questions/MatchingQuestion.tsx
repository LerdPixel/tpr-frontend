import { useState, useEffect } from "react";
import styles from "../../styles/QuestionCreator.module.css";

type LeftItem = {
  id: number;
  text: string;
};

type RightItem = {
  id: number;
  text: string;
};

type CorrectMatch = {
  leftId: number;
  rightId: number;
};

type MatchingData = {
  left: LeftItem[];
  right: RightItem[];
  correct: CorrectMatch[];
};

interface MatchingQuestionProps {
  data: MatchingData | null;
  setData: (data: MatchingData) => void;
}

const MatchingQuestion: React.FC<MatchingQuestionProps> = ({
  data,
  setData,
}) => {
  const [leftItems, setLeftItems] = useState<LeftItem[]>(
    data?.left || [
      { id: 1, text: "" },
      { id: 2, text: "" },
    ]
  );

  const [rightItems, setRightItems] = useState<RightItem[]>(
    data?.right || [
      { id: 10, text: "" },
      { id: 11, text: "" },
      { id: 12, text: "" },
    ]
  );

  const [correctMatches, setCorrectMatches] = useState<CorrectMatch[]>(
    data?.correct || []
  );

  // Generate next available ID for left items
  const getNextLeftId = () => {
    const maxId =
      leftItems.length > 0 ? Math.max(...leftItems.map((item) => item.id)) : 0;
    return maxId + 1;
  };

  // Generate next available ID for right items
  const getNextRightId = () => {
    const maxId =
      rightItems.length > 0
        ? Math.max(...rightItems.map((item) => item.id))
        : 9;
    return maxId + 1;
  };

  useEffect(() => {
    const newData: MatchingData = {
      left: leftItems,
      right: rightItems,
      correct: correctMatches,
    };
    console.log("MatchingQuestion data update:", newData);
    setData(newData);
  }, [leftItems, rightItems, correctMatches, setData]);

  const handleLeftTextChange = (id: number, value: string) => {
    setLeftItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text: value } : item))
    );
  };

  const handleRightTextChange = (id: number, value: string) => {
    setRightItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text: value } : item))
    );
  };

  const handleMatchChange = (leftId: number, rightId: number) => {
    setCorrectMatches((prev) => {
      // Remove any existing match for this leftId
      const filtered = prev.filter((match) => match.leftId !== leftId);
      // Add new match if rightId is valid (not 0)
      if (rightId !== 0) {
        return [...filtered, { leftId, rightId }];
      }
      return filtered;
    });
  };

  // Get the current match for a left item
  const getCurrentMatch = (leftId: number): number => {
    const match = correctMatches.find((m) => m.leftId === leftId);
    return match ? match.rightId : 0;
  };

  const addLeftItem = () => {
    const newId = getNextLeftId();
    setLeftItems((prev) => [
      ...prev,
      {
        id: newId,
        text: "",
      },
    ]);
  };

  const addRightItem = () => {
    const newId = getNextRightId();
    setRightItems((prev) => [
      ...prev,
      {
        id: newId,
        text: "",
      },
    ]);
  };

  const removeLeftItem = (id: number) => {
    setLeftItems((prev) => prev.filter((item) => item.id !== id));
    // Remove any matches for this left item
    setCorrectMatches((prev) => prev.filter((match) => match.leftId !== id));
  };

  const removeRightItem = (id: number) => {
    setRightItems((prev) => prev.filter((item) => item.id !== id));
    // Remove any matches for this right item
    setCorrectMatches((prev) => prev.filter((match) => match.rightId !== id));
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
            <button
              onClick={() => removeLeftItem(item.id)}
              className={styles.removeButton}
            >
              ✕
            </button>
            <select
              className={styles.select}
              value={getCurrentMatch(item.id)}
              onChange={(e) =>
                handleMatchChange(item.id, parseInt(e.target.value))
              }
            >
              <option value={0}>Соответствующий элемент</option>
              {rightItems.map((rightItem) => (
                <option key={rightItem.id} value={rightItem.id}>
                  {rightItem.text || "Без названия"}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button className={styles.addOption} onClick={addLeftItem}>
          + Добавить элемент
        </button>
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
            <button
              onClick={() => removeRightItem(item.id)}
              className={styles.removeButton}
            >
              ✕
            </button>
          </div>
        ))}
        <button className={styles.addOption} onClick={addRightItem}>
          + Добавить элемент
        </button>
      </div>
    </div>
  );
};

export default MatchingQuestion;
