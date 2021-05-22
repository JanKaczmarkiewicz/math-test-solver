import produce from "immer";
import React, { ReactNode, useState } from "react";
import styled from "styled-components";
import Matrix, { MatrixValue } from "./components/Matrix";

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

  return (
    <div>
      <Container>
        <h1>Sprawdzian solver 🧙‍♂️</h1>
        <Matrix edit value={matrix} onChange={setMatrix} />
      </Container>

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
    </div>
  );
};

export default App;
