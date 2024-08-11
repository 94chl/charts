import React from "react";

import { Text } from "recharts";

import { get180Degree } from "../RotChart.helpers";

enum weightEnum {
  REGULAR = 400,
  MEDIUM = 500,
  BOLD = 700,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = { props: any; axisCenter?: number };

const CustomTick: React.FC<React.PropsWithChildren<Props>> = ({
  props,
  axisCenter = 0,
}) => {
  const {
    payload: { value },
  } = props;

  return (
    <Text
      {...props}
      style={{
        fontSize: "11px",
        lineHeight: "16px",
        fontWeight:
          axisCenter === get180Degree(value + axisCenter, 0)
            ? weightEnum.BOLD
            : weightEnum.MEDIUM,
      }}
    >
      {get180Degree(value + axisCenter, 0)}
    </Text>
  );
};

export default CustomTick;
