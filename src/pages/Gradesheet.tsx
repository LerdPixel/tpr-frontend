import { useMemo, useState } from "react";
import Table from "../components/ui/table/Table.tsx"
import cl from "../styles/gradesheet.module.css"
import EditableTable from "../components/ui/table/EditableTable.tsx";
import AdvancedTable from "../components/ui/table/AdvancedTable.tsx";
import { SelectList } from "../components/ui/select/Select.tsx";

const Gradesheet = () => {
  const [groupsData, setGroupsData] = useState([
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
    },
    {
      groupName : 'Б24-372',
      columnLabels : ['студенты', '1', '2', '3', '4', '5', '6', '7', '8', 'тест', 'лр1', 'лр2', 'итого'],
      lections : [1, 2, 3, 4, 5, 6, 7, 8],
      labs : [11, 10],
      test : [9],
      data : [
        ['Гладков И.', 'н', 'н', '', '', 'н', 'н', '', '', '20', '10', '', '90'],
        ['Юривец В.', '', '', 'н', '', 'н', 'н', '', '', '13', '8', 'н', '30'],
        ['Крылакин В.', '', 'н', '', 'н', 'н', '', '', '', '15', '9', 'н', '54'],
        ['Стричник. A', 'н', 'н', '', '', 'н', 'н', '', '', '20', '10','', '95'],
        ['Тихон Б.', '', '', 'н', '', 'н', 'н', '', '', '13', '8', '12', '32'],
        ['Лосов В.', '', 'н', '+', '', 'н', 'н', '', '', '15', '9', 'н', '65'],
        ['Голувой И.', 'н', 'н', '', '', 'н', 'н', '', '', '2', '10', '', '60' ],
        ['Малдер В.', '', '', 'н', '', 'н', 'н', '', '', '13', '8', 'н', '65'],
        ['Чазов В.', '', 'н', '', '', 'н', 'н', '', '', '15', '9', '9', '79'],
        ['Макартни П', 'н', 'н', '', '', 'н', 'н', '', '', '20', '10', '', '83'],
        ['Никитосов Н.', '', '', 'н', '', 'н', 'н', '', '', '13', '8', 'н', '69'],
        ['Стрельковец В.', '', 'н', '+', '', 'н', 'н', '', '', '15', '9', 'н', '60'],
        ['Морозов В.', '', 'н', '+', '', 'н', 'н', '', '', '15', '9', 'н', '89'],
        ['Краснов В.', '', 'н', '+', '', 'н', 'н', '', '', '15', '9', 'н', '72'],
      ]
    }
  ])
  const [selectedGroupId, setSelectedGroupId] = useState(-1)
  const [selectedGroup, setSelectedGroup] = useState()
  const options = groupsData.map( (el) => ({"label" : el.groupName, "value" : el.groupName}));

  const changeSelectedGroup = (selectedGroupName) => {
    setSelectedGroupId(groupsData.findIndex((el) => el.groupName === selectedGroupName))
  }
  const handleGroupChange = (NewData) => {
    setGroupsData(prev => {
      const updatedItems = [...prev];
      if (selectedGroupId != -1)
        updatedItems[selectedGroupId] = {...updatedItems[selectedGroupId], data : NewData};
      return updatedItems;
    })
  };
  
  return (
    
    <div className={cl.gradesheet_body}>
      <div className={cl.gradesheet_header}>
        <h1 className={cl.header_label}>Ведомость группы</h1>
        <div className={cl.select_block}>
        <SelectList 
          placeholder="Группа"
          options={options}
          textColor={cl.my_color}
          onChange={changeSelectedGroup}
        />
        </div>
      </div>
      {selectedGroupId >= 0 &&
        <AdvancedTable 
          data={groupsData[selectedGroupId].data}
          setData={handleGroupChange}
          columnLabels={groupsData[selectedGroupId].columnLabels}
          uneditableCols={[...groupsData[selectedGroupId].test, ...groupsData[selectedGroupId].labs]}
          boolCols={groupsData[selectedGroupId].lections}
          tableCl={cl.table}
        />
      }
    </div>
      

  );
};

export default Gradesheet;
