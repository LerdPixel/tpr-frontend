import React, { useState } from 'react'
import styles from '../../../styles/QuestionCreator.module.css';

function RusWordEnding(n : number) {
  if ([11, 12, 13, 14].includes(n))
    return "ов";
  else if (n % 10 === 1)
    return "";
  else if ([2, 3, 4].includes(n % 10))
    return "а"
  return "ов"
}


const PointsInput = ({points, setPoints, defaultPoints = 1}) => {
    const [isQuestionPointsEditing, setIsQuestionPointsEditing] = useState<boolean>(false);
    //setPoints(defaultPoints)
    const handleBlur = () => {
        setIsQuestionPointsEditing(false)
        const newPoints = parseInt(points)
        if (newPoints)
            setPoints(newPoints)
        else 
            setPoints(defaultPoints)
    };
    return (
    <div className={styles.points}>
        <span className={styles.pointsValue}>
        {isQuestionPointsEditing ? points : 
            <input
                style={{width : "1.5em"}}
                type="text"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                onBlur={handleBlur}
            />
        }
        </span> балл{RusWordEnding(points)}
    </div>
    )
}

export default PointsInput