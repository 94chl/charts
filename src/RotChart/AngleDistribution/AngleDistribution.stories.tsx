import React, { useState } from "react";
import type { StoryFn, Meta } from "@storybook/react";

import type { Props } from "./AngleDistribution";
import AngleDistribution from "./AngleDistribution";

const disableArgType = { control: false, table: { disable: true } };

const dummyData: [number, number][] = [
  [-175, 180],
  [180, -180],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [10, 9],
  [5, 1],
  [-10, -5],
  [0, 0],
  [1, 0],
  [1, 0],
  [1, 0],
  [1, 0],
  [1, 0],
  [1, 0],
  [-5, -1],
  [2, 3],
];

export default {
  component: AngleDistribution,
  title: "components/AngleDistribution",
  argTypes: {
    size: {
      control: {
        type: "number",
      },
    },
    data: {
      control: {
        type: "object",
      },
    },
    tolerance: disableArgType,
    changeTolerance: disableArgType,
    axisCenter: disableArgType,
    changeAxisCenter: disableArgType,
  },
} as Meta;

const Template: StoryFn<Props> = ({ data, size, disabled }) => {
  const [tolerance, setTolerance] = useState(3);
  const [axisCenter, setAxisCenter] = useState(0);
  return (
    <AngleDistribution
      data={data}
      tolerance={tolerance}
      changeTolerance={(newValue) => {
        setTolerance(newValue);
      }}
      axisCenter={axisCenter}
      changeAxisCenter={(newValue) => {
        setAxisCenter(newValue);
      }}
      size={size}
      disabled={disabled}
    />
  );
};

export const General = Template.bind({});
General.args = {
  data: dummyData,
  size: 360,
};
