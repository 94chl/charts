import React, { useState } from "react";
import type { StoryFn, Meta } from "@storybook/react";

import type { Props } from "./ErrorDistribution";
import ErrorDistribution from "./ErrorDistribution";

const dummyData = {
  "-10": 3,
  "-7": 1,
  "-2": 5,
  "0": 10,
  "3": 3,
  "8": 5,
  "15": 1,
};

export default {
  component: ErrorDistribution,
  title: "components/ErrorDistribution",
  argTypes: {
    width: {
      control: {
        type: "number",
      },
    },
    height: {
      control: {
        type: "number",
      },
    },
    data: {
      control: {
        type: "object",
      },
    },
  },
  parameters: {},
} as Meta;

const Template: StoryFn<Props> = ({ data, width, height }) => {
  const [tolerance, setTolerance] = useState(3);

  return (
    <ErrorDistribution
      data={data}
      tolerance={tolerance}
      changeTolerance={(newValue) => {
        setTolerance(newValue);
      }}
      width={width}
      height={height}
    />
  );
};

export const General = Template.bind({});
General.args = {
  data: dummyData,
  tolerance: 3,
  width: 360,
  height: 240,
};
