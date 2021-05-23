import produce from "immer";
import React, { ReactNode, useState } from "react";
import styled from "styled-components";
import Matrix, { MatrixValue } from "./components/Matrix";
import { evaluate } from "mathjs";

const initialMatrix = [
  ["X   /   Y", -4, 0, 2, 3],
  [-1, 0.22, 0.2, 0.15, 0.08],
  [5, 0.15, 0.05, 0.05, 0.1],
];

type Var = "X" | "Y";

const getProbabilityMatrix = (matrix: MatrixValue) =>
  produce(matrix, (draft) => {
    draft.shift();
    for (const row of draft) {
      row.shift();
    }
  }) as number[][];

const sum = (array: number[]) => array.reduce((prev, curr) => prev + curr, 0);
const array = (size: number) => Array(size).fill(undefined);

const getDistibution = (matrix: MatrixValue, variable: Var) => {
  const probabilityMatrix = getProbabilityMatrix(matrix);

  if (variable === "X") {
    const xValues = array(probabilityMatrix.length).map(
      (_, i) => matrix[i + 1][0]
    );

    return [
      ["xj", ...xValues],
      ["pj", ...probabilityMatrix.map(sum)],
    ] as number[][];
  }

  const yValues = array(probabilityMatrix[0].length).map(
    (_, i) => matrix[0][i + 1]
  );

  probabilityMatrix[0].map((_, index) =>
    sum(probabilityMatrix.map((row) => row[index]))
  );

  return [
    ["yj", ...yValues],
    [
      "pj",
      ...probabilityMatrix[0].map((_, index) =>
        sum(probabilityMatrix.map((row) => row[index]))
      ),
    ],
  ] as number[][];
};

const acc = (array: MatrixValue[number]) => {
  let acc = 0;
  return array.map((val) => {
    acc += Number(val);
    return acc;
  });
};

const getDistrybuanta = (matrix: MatrixValue, variable: Var) => {
  const distribution = getDistibution(matrix, variable);
  const [pName, ...pValues] = distribution[1];
  const [vName, ...vValues] = distribution[0];

  return [
    [
      vName,
      `(-oo, ${vValues[0]}>`,
      ...vValues.map(
        (val, index) =>
          `(${val}, ${vValues[index + 1] ? `${vValues[index + 1]}>` : "oo)"}`
      ),
    ],
    [pName, 0, ...acc(pValues)],
  ];
};

const getExpectedValue = (
  matrix: MatrixValue,
  variable: Var,
  power: number = 1
) => {
  const distribution = getDistibution(matrix, variable);
  const [, ...pValues] = distribution[1];
  const [, ...vValues] = distribution[0];

  return sum(pValues.map((value, index) => value * vValues[index] ** power));
};

const getVariation = (matrix: MatrixValue, variable: Var) => {
  const expectedValue = getExpectedValue(matrix, variable);
  const expectedValueToPowerOfTwo = getExpectedValue(matrix, variable, 2);

  return expectedValueToPowerOfTwo - expectedValue ** 2;
};

const getExpectedValueYTimesX = (matrix: MatrixValue) => {
  const [[, ...xValues]] = getDistibution(matrix, "X");
  const [[, ...yValues]] = getDistibution(matrix, "Y");
  const probabilityMatrix = getProbabilityMatrix(matrix);

  return sum(
    probabilityMatrix
      .map((row, rowIndex) =>
        row.flatMap(
          (value, cellIndex) => xValues[rowIndex] * yValues[cellIndex] * value
        )
      )
      .flat()
  );
};

const getCorrelationCoefficient = (matrix: MatrixValue) => {
  const expectedValueYTimesX = getExpectedValueYTimesX(matrix);

  return (
    (expectedValueYTimesX -
      getExpectedValue(matrix, "X") * getExpectedValue(matrix, "Y")) /
    (Math.sqrt(getVariation(matrix, "X")) *
      Math.sqrt(getVariation(matrix, "Y")))
  );
};

const getIntependenceMessage = (matrix: MatrixValue) => {
  const probabilityMatrix = getProbabilityMatrix(matrix);
  const [[, ...xValues], [, ...xpValues]] = getDistibution(matrix, "X");
  const [[, ...yValues], [, ...ypValues]] = getDistibution(matrix, "Y");

  for (const [rowIndex, row] of probabilityMatrix.entries()) {
    for (const [cellIndex, cell] of row.entries()) {
      console.log(
        { x: xValues[rowIndex], y: yValues[cellIndex] },
        xValues[rowIndex] * yValues[cellIndex]
      );
      if (cell !== xpValues[rowIndex] * ypValues[cellIndex]) {
        return `
          Zmienne X i Y są zalezne. 
          P(X=${xValues[rowIndex]}, Y=${
          yValues[cellIndex]
        }) = ${cell} jest rózne od P(X=${xValues[rowIndex]}) * P(Y=${
          yValues[cellIndex]
        }) = ${xpValues[rowIndex] * ypValues[cellIndex]}`;
      }
    }
  }
  return `Zmienne X i Y są niezalezne.`;
};

const Wrapper = styled.div`
  padding: 1rem 4rem;
`;

const Card = styled.div`
  padding: 2rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
`;

const Container = ({ children }: { children: ReactNode }) => (
  <Wrapper>
    <Card>{children}</Card>
  </Wrapper>
);

const safeEval = (text: string) => {
  try {
    return evaluate(text);
  } catch (error) {
    return "Coś jest nie tak";
  }
};

const EQSolver = ({ value }: { value: MatrixValue }) => {
  const [eq, setEq] = useState("");

  const variable = eq.includes("X") ? "X" : "Y";

  const EZ = safeEval(
    eq.replace(variable, "*" + getExpectedValue(value, variable).toString())
  );

  const D2Z = safeEval(
    `${eq.split(variable)[0]}^2*${getVariation(value, variable)}`
  );
  return (
    <>
      <h3>Zmienna Z</h3>
      <p>
        Z ={" "}
        <input
          type="text"
          value={eq}
          placeholder={"-2X+5"}
          onChange={(e) => {
            setEq(e.target.value);
          }}
        />
      </p>
      <p>EZ = {EZ}</p>
      <p>D^2Z = {D2Z}</p>
    </>
  );
};

const VariableMeta = (props: { matrix: MatrixValue; variable: Var }) => {
  const { matrix, variable } = props;

  return (
    <>
      <h2>Zmienna {variable}</h2>

      <h3>Rozkład zmiennej {variable}</h3>
      <Matrix edit={false} value={getDistibution(matrix, variable)} />

      <h3>Dystrybuanta {variable}</h3>
      <Matrix edit={false} value={getDistrybuanta(matrix, variable)} />

      <h3>Wartość spodziewana {variable}</h3>
      <p>
        E{variable} = {getExpectedValue(matrix, variable)}
      </p>

      <h3>Wartość spodziewana {variable} ^2</h3>
      <p>
        E{variable}^2 = {getExpectedValue(matrix, variable, 2)}
      </p>

      <h3>Wariacja {variable}</h3>
      <p>
        D{variable}^2 = {getVariation(matrix, variable)}
      </p>
    </>
  );
};

const App = () => {
  const [matrix, setMatrix] = useState<MatrixValue>(initialMatrix);

  const isEmptyCell = !!matrix.find((row) => row.indexOf("") > -1);
  console.log(matrix);

  return (
    <div>
      <Container>
        <h1>Sprawdzian solver 🧙‍♂️</h1>
        <Matrix edit value={matrix} onChange={setMatrix} />

        {isEmptyCell && <p>Wypełnij wszystkie pola</p>}
      </Container>
      {!isEmptyCell && (
        <>
          <Container>
            <VariableMeta matrix={matrix} variable={"X"} />
          </Container>

          <Container>
            <VariableMeta matrix={matrix} variable={"Y"} />
          </Container>

          <Container>
            <h3>Współczynik korelacji</h3>
            <p>E(XY) = {getExpectedValueYTimesX(matrix)}</p>
            <p>p(X, Y) = {getCorrelationCoefficient(matrix)}</p>
          </Container>

          <Container>
            <EQSolver value={matrix} />
          </Container>

          <Container>
            <h3>Niezalezność X i Y</h3>
            <p>{getIntependenceMessage(matrix)}</p>
          </Container>
        </>
      )}
    </div>
  );
};

export default App;
