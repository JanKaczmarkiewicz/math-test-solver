import produce from "immer";
import { ChangeEventHandler } from "react";
import styled from "styled-components";

export type MatrixValue = (number | string)[][];

export type MatrixProps = {
  value: MatrixValue;
  onChange?: (matrix: MatrixValue) => void;
  edit: boolean;
};

const Table = styled.table`
  border-collapse: collapse;
`;
const Row = styled.tr``;
const Cell = styled.td`
  border: 1px solid black;
  padding: 1rem;
  min-width: 100px;
  text-align: center;
`;

const Matrix = ({ value, onChange = () => {}, edit }: MatrixProps) => {
  return (
    <>
      <Table>
        <tbody>
          {value.map((row, rowIndex) => (
            <Row>
              {row.map((cellValue, cellIndex) => {
                const isCellInEditMode =
                  !(typeof cellValue === "string" && cellValue.length > 0) &&
                  edit;

                const onCellChange: ChangeEventHandler<HTMLInputElement> = ({
                  target: { value: newCellValue },
                }) => {
                  onChange(
                    produce(value, (draft) => {
                      draft[rowIndex][cellIndex] = Number(newCellValue);
                    })
                  );
                };

                return (
                  <Cell>
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
    </>
  );
};

export default Matrix;
