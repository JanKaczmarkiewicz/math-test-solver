import produce from "immer";
import { ChangeEventHandler } from "react";
import styled from "styled-components";

export type MatrixValue = (number | string)[][];

export type MatrixProps = {
  value: MatrixValue;
  onChange?: (matrix: MatrixValue) => void;
  edit: boolean;
};
const Cell = styled.td`
  border: 1px solid black;
  padding: 1rem;
  min-width: 100px;
  text-align: center;
  position: relative;
  & span {
    top: 2px;
    right: 2px;
    width: 15px;
    height: 15px;
    border-radius: 4px;
    line-height: 12px;
    vertical-align: center;
    position: absolute;
    background-color: red;
    color: white;
    cursor: pointer;
  }
`;

const Table = styled.table`
  border-collapse: collapse;
  grid-area: t;
`;
const Row = styled.tr``;

const MatrixWrapper = styled.div`
  display: grid;
  grid-template-areas: "t x" "y .";
  width: fit-content;
`;

const AddX = styled.button`
  grid-area: x;
`;

const AddY = styled.button`
  grid-area: y;
`;

const Matrix = ({ value, onChange = () => {}, edit }: MatrixProps) => {
  const onRowAddClick = () => {
    onChange(
      produce(value, (draft) => {
        draft.push(Array(value[0].length).fill(0));
      })
    );
  };

  const onColumnAddClick = () => {
    onChange(
      produce(value, (draft) => {
        for (const row of draft) {
          row.push(0);
        }
      })
    );
  };

  const onColumnRemove = (columnIndex: number) => {
    onChange(
      produce(value, (draft) => {
        for (const row of draft) {
          row.splice(columnIndex, 1);
        }
      })
    );
  };

  const onRowRemove = (rowIndex: number) => {
    onChange(
      produce(value, (draft) => {
        draft.splice(rowIndex, 1);
      })
    );
  };

  return (
    <MatrixWrapper>
      <Table>
        <tbody>
          {value.map((row, rowIndex) => (
            <Row>
              {row.map((cellValue, columnIndex) => {
                const isCellInEditMode =
                  !(typeof cellValue === "string" && cellValue.length > 0) &&
                  edit;

                const onCellChange: ChangeEventHandler<HTMLInputElement> = ({
                  target: { value: newCellValue },
                }) => {
                  onChange(
                    produce(value, (draft) => {
                      draft[rowIndex][columnIndex] =
                        newCellValue === "" ? "" : Number(newCellValue);
                    })
                  );
                };

                return (
                  <Cell>
                    {edit && columnIndex === 0 && rowIndex !== 0 && (
                      <span onClick={() => onRowRemove(rowIndex)}>x</span>
                    )}
                    {edit && rowIndex === 0 && columnIndex !== 0 && (
                      <span onClick={() => onColumnRemove(columnIndex)}>x</span>
                    )}
                    {isCellInEditMode ? (
                      <input
                        type="number"
                        value={cellValue}
                        onChange={onCellChange}
                      />
                    ) : (
                      cellValue
                    )}
                  </Cell>
                );
              })}
            </Row>
          ))}
        </tbody>
      </Table>

      {edit && (
        <>
          <AddY onClick={onRowAddClick}>Dodaj wiersz</AddY>
          <AddX onClick={onColumnAddClick}>Dodaj kolumne</AddX>
        </>
      )}
    </MatrixWrapper>
  );
};

export default Matrix;
