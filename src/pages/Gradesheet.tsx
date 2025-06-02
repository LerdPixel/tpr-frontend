import { useState } from "react";
import Table from "../components/ui/table/Table.tsx"
import cl from "../styles/gradesheet.module.css"
import EditableTable from "../components/ui/table/EditableTable.tsx";
import AdvancedTable from "../components/ui/table/AdvancedTable.tsx";

const Gradesheet = () => {
  const groups = [
    {
      groupName : 'М25-923',
      columnLabels : ['студенты', '1', '2', '3', '4', 'тест', 'лр1', 'лр2', 'итого'],
      lections : [1, 2, 3, 4],
      labs : [6, 7],
      test : [5],
      data : [
  ['Панин И.', 'н', 'н', '', '', '20', '10', '', '90'],
 ['Мардер В.', '', '', 'н', '', '13', '8', 'н', '30'],
 ['Крылатов В.', '', 'н', '', '', '15', '9', 'н', '54'],
 ['Стричников. A', 'н', 'н', '', '', '20', '10','', '98'],
 ['Тихонов Б.', '', '', 'н', '', '13', '8', '12', '32'],
 ['Леносов В.', '', 'н', '+', '', '15', '9', 'н', '65'],
   ['Ировон И.', 'н', 'н', '', '', '2', '10', '', '60' ],
 ['Малдер В.', '', '', 'н', '', '13', '8', 'н', '65'],
 ['Чазов В.', '', 'н', '', '', '15', '9', '9', '79'],
 ['Макартни П', 'н', 'н', '', '', '20', '10', '', '83'],
 ['Соколон Н.', '', '', 'н', '', '13', '8', 'н', '69'],
 ['Коносов В.', '', 'н', '+', '', '15', '9', 'н', '60'],
  ]
    }
  ]
  const students = ['Панин И.', 'Мардер В.', 'Крылатов В.', 'Стричников. A', 'Тихонов Б.', 'Леносов В.'];
  const columnLabels = ['студенты', '1', '2', '3', '4', 'тест', 'лр1', 'лр2', 'итого'];
  const lections = [1, 2, 3, 4]
  const labs = [6, 7]
  const test = [5]
  const [gradesheetValues, setGradesheetValues] = useState([
  ['Панин И.', 'н', 'н', '', '', '20', '10', '', '90'],
 ['Мардер В.', '', '', 'н', '', '13', '8', 'н', '30'],
 ['Крылатов В.', '', 'н', '', '', '15', '9', 'н', '54'],
 ['Стричников. A', 'н', 'н', '', '', '20', '10','', '98'],
 ['Тихонов Б.', '', '', 'н', '', '13', '8', '12', '32'],
 ['Леносов В.', '', 'н', '+', '', '15', '9', 'н', '65'],
   ['Ировон И.', 'н', 'н', '', '', '2', '10', '', '60' ],
 ['Малдер В.', '', '', 'н', '', '13', '8', 'н', '65'],
 ['Чазов В.', '', 'н', '', '', '15', '9', '9', '79'],
 ['Макартни П', 'н', 'н', '', '', '20', '10', '', '83'],
 ['Соколон Н.', '', '', 'н', '', '13', '8', 'н', '69'],
 ['Коносов В.', '', 'н', '+', '', '15', '9', 'н', '60'],
  ]);
  
  function mergeArray(line, matrix) {
    return matrix.map((row, rowNum) => [line[rowNum], ...row])
  }  

  return (
    
    <div className={cl.gradesheet_body}>
      <div className={cl.gradesheet_header}>
        <h1 className="">Ведомость группы</h1>
      </div>
      <AdvancedTable 
        data={gradesheetValues}
        setData={setGradesheetValues}
        columnLabels={columnLabels}
        uneditableCols={[...test, ...labs]}
        boolCols={lections}
        tableCl={cl.table}
      />
    </div>

  );
};

export default Gradesheet;
