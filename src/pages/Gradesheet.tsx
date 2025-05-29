import Table from "../components/ui/table/Table.tsx"


const Gradesheet = () => {
  const columnLabels = ['A', 'B', 'C'];
  const rowLabels = ['Row1', 'Row2', 'Row3'];
  const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Labeled Matrix Table</h1>
      <Table
        matrix={matrix}
        rowLabels={rowLabels}
        columnLabels={columnLabels}
      />
    </div>
  );
};

export default Gradesheet;
