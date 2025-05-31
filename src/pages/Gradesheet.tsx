import Table from "../components/ui/table/Table.tsx"
import cl from "../styles/gradesheet.module.css"

const Gradesheet = () => {
  const columnLabels = ['A', 'B', 'C'];
  const rowLabels = ['Row1', 'Row2', 'Row3'];
  const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  return (
    
    <div className={cl.gradesheet_body}>
      <div className={cl.gradesheet_header}>
        <h1 className="">Ведомость группы</h1>
      </div>
      <Table
        tableCl={cl.table}
        matrix={matrix}
        rowLabels={rowLabels}
        columnLabels={columnLabels}
      />
    </div>

  );
};

export default Gradesheet;
