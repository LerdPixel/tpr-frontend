import { useState, useEffect } from "react";
import styles from "../../styles/QuestionCreator.module.css";

type LeftItem = {
  id: string;
  text: string;
};

type RightItem = {
  id: string;
  text: string;
};

type MatchingData = {
  left: LeftItem[];
  right: RightItem[];
  correct: Record<string, string>;
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
      { id: "L1", text: "" },
      { id: "L2", text: "" },
    ]
  );

  const [rightItems, setRightItems] = useState<RightItem[]>(
    data?.right || [
      { id: "R1", text: "" },
      { id: "R2", text: "" },
      { id: "R3", text: "" },
    ]
  );

  const [correctMatches, setCorrectMatches] = useState<Record<string, string>>(
    data?.correct || {}
  );

  // Generate next available ID for left items
  const getNextLeftId = () => {
    const existingNumbers = leftItems
      .map((item) => parseInt(item.id.substring(1)))
      .filter((num) => !isNaN(num));
    const maxNum =
      existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    return `L${maxNum + 1}`;
  };

  // Generate next available ID for right items
  const getNextRightId = () => {
    const existingNumbers = rightItems
      .map((item) => parseInt(item.id.substring(1)))
      .filter((num) => !isNaN(num));
    const maxNum =
      existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    return `R${maxNum + 1}`;
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

  const handleLeftTextChange = (id: string, value: string) => {
    setLeftItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text: value } : item))
    );
  };

  const handleRightTextChange = (id: string, value: string) => {
    setRightItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text: value } : item))
    );
  };

  const handleMatchChange = (leftId: string, rightId: string) => {
    setCorrectMatches((prev) => {
      const newMatches = { ...prev };
      if (rightId === "") {
        // Remove match if empty selection
        delete newMatches[leftId];
      } else {
        // Add/update match
        newMatches[leftId] = rightId;
      }
      return newMatches;
    });
  };

  // Get the current match for a left item
  const getCurrentMatch = (leftId: string): string => {
    return correctMatches[leftId] || "";
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

  const removeLeftItem = (id: string) => {
    setLeftItems((prev) => prev.filter((item) => item.id !== id));
    // Remove any matches for this left item
    setCorrectMatches((prev) => {
      const newMatches = { ...prev };
      delete newMatches[id];
      return newMatches;
    });
  };

  const removeRightItem = (id: string) => {
    setRightItems((prev) => prev.filter((item) => item.id !== id));
    // Remove any matches for this right item
    setCorrectMatches((prev) => {
      const newMatches = { ...prev };
      Object.keys(newMatches).forEach((leftId) => {
        if (newMatches[leftId] === id) {
          delete newMatches[leftId];
        }
      });
      return newMatches;
    });
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
              onChange={(e) => handleMatchChange(item.id, e.target.value)}
            >
              <option value="">Соответствующий элемент</option>
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
