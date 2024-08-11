// react, redux
import React, { useState, useEffect } from "react";

// libraries
import { makeStyles } from "@material-ui/core";
import {
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  Bar,
  Cell,
  Label,
} from "recharts";

// utils
import type { DataType } from "../RotChart.helpers";
import { convertData } from "../RotChart.helpers";

// components
import ToleranceInput from "../ToleranceInput";

export type Props = {
  data: DataType;
  tolerance: number;
  changeTolerance: (value: number) => void;
  onClickApply?: () => void;
  width?: number;
  height?: number;
  disabled?: boolean;
};

const useStyles = makeStyles({
  root: {
    width: "fit-content",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
  },
  chartContainer: {
    width: "fit-content",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    alignItems: "flex-end",
    background: "#fff",
    border: "1px solid #ddd",
    padding: 12,
  },
});

const ErrorDistribution: React.FC<React.PropsWithChildren<Props>> = ({
  data,
  tolerance,
  changeTolerance,
  onClickApply,
  width = 390,
  height = 297,
  disabled = false,
}) => {
  const classes = useStyles();

  const [rotData, setRotData] = useState<DataType[]>([]);

  useEffect(() => {
    const convertedData = convertData(data);
    setRotData(convertedData);
  }, [data]);

  const handleChange = (value: number) => {
    changeTolerance(value);
  };

  return (
    <div className={classes.root}>
      <ToleranceInput
        inputValue={tolerance}
        handleChange={handleChange}
        disabled={disabled}
        onClickApply={onClickApply}
      />
      <div className={classes.chartContainer}>
        <BarChart
          width={width - 26}
          height={height - 26}
          data={rotData}
          margin={{ top: 12, bottom: 12, left: 12, right: 12 }}
          barCategoryGap={0}
          style={{
            fontSize: 12,
          }}
        >
          <XAxis
            dataKey="angle"
            tickCount={7}
            domain={[-180, 180]}
            type="number"
          >
            <Label
              value="angleDifference"
              position="insideBottom"
              offset={-8}
              style={{ userSelect: "none" }}
            />
          </XAxis>
          <YAxis dataKey="counts" allowDecimals={false} domain={[0, "dataMax"]}>
            <Label
              value="numOfImages"
              position="insideLeft"
              offset={0}
              angle={-90}
              style={{ userSelect: "none", textAnchor: "middle" }}
            />
          </YAxis>
          <Tooltip labelFormatter={(value) => `angleDifference: ${value}º`} />
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <ReferenceLine stroke="rgba(0,0,0,1)" x="0" ifOverflow="hidden" />
          <ReferenceArea x1={0 - tolerance} x2={0 + tolerance} fill="blue" />
          <Bar dataKey="counts" legendType="none" name="numOfImages">
            {rotData.map((node) => (
              <Cell
                key={`cell-${node.angle}-${node.counts}`}
                fill={
                  Number(node.angle) < -tolerance ||
                  Number(node.angle) > tolerance
                    ? "red"
                    : "blue"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </div>
    </div>
  );
};
export default ErrorDistribution;
