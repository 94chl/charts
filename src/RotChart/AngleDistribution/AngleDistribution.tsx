// react, redux
import React, { useState, useEffect, useRef } from "react";

// libraries
import { Button, makeStyles } from "@material-ui/core";
import { ZoomIn, ZoomOut, Restore } from "@material-ui/icons";
import {
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Legend,
  Scatter,
  ReferenceLine,
  ReferenceArea,
  Cell,
  Label,
} from "recharts";

// utils
import type { ScatterDatum } from "../RotChart.helpers";
import {
  convertScatterData,
  filterDataInRange,
  getAngleDifference,
  colorPicker,
  convertTick180,
} from "../RotChart.helpers";

// components
import InputController from "./InputController";
import CustomTick from "./CustomTick";

const DEFAULT_SEGMENT = [
  { x: -360, y: -360 },
  { x: 360, y: 360 },
];
const COLORS = [
  "#FF1C03",
  "#FF7A00",
  "#FFFA00",
  "#4EFFB2",
  "#0055FF",
  "#00008E",
];
const ZOOM_IN_VALUE = 15;
const DEFAULT_ZOOM = {
  x1: -180,
  y1: -180,
  x2: 180,
  y2: 180,
};

export interface Props extends React.HtmlHTMLAttributes<HTMLDivElement> {
  data: [number, number][];
  tolerance: number;
  changeTolerance: (value: number) => void;
  axisCenter: number;
  changeAxisCenter: (value: number) => void;
  // size = 차트 크기 + 컬러바의 크기
  onClickApply?: () => void;
  size?: number;
  disabled?: boolean;
}

type StyleProps = { size: number };

const useStyles = makeStyles({
  root: {
    width: "fit-content",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  zoomButtons: { display: "flex" },
  button: { width: 28, height: 28 },
  chartContainer: {
    background: "#fff",
    border: "1px solid #ddd",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  chartWrapper: {
    display: "flex",
    gap: 12,
    "& .recharts-surface": {
      overflow: "visible",
    },
    "& .recharts-text": {
      userSelect: "none",
    },
  },
  tooltip: {
    background: "#fff",
    border: "1px solid #ddd",
    padding: 12,
  },
  tooltipContent: {
    listStyle: "none",
  },
  colorBarWrapper: {
    display: "flex",
    width: 38,
  },
  colorBar: {
    width: 16,
    height: (props: StyleProps) => props.size - 136,
    marginTop: 7,
    background: `linear-gradient(${COLORS[0]}, ${COLORS[1]}, ${COLORS[2]}, ${COLORS[3]}, ${COLORS[4]}, ${COLORS[5]})`,
  },
  scaleBar: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 7,
  },
  scaleUnit: {
    height: (props: StyleProps) => (props.size - 136) / 6,
    userSelect: "none",
    textIndent: -1,
  },
});

type ChartMouseEvent = {
  xValue: number;
  yValue: number;
  chartX: number;
  chartY: number;
};

const isChartMouseEvent = (e: unknown): e is ChartMouseEvent =>
  !!e &&
  typeof e === "object" &&
  "xValue" in e &&
  typeof e.xValue === "number" &&
  "yValue" in e &&
  typeof e.yValue === "number" &&
  "chartX" in e &&
  typeof e.chartX === "number" &&
  "chartY" in e &&
  typeof e.chartY === "number";

const AngleDistribution: React.FC<React.PropsWithChildren<Props>> = ({
  data,
  tolerance,
  changeTolerance,
  axisCenter = 0,
  changeAxisCenter,
  onClickApply,
  disabled = false,
  size = 390,
  ...args
}) => {
  const classes = useStyles({ size });

  const [convertedRotData, setConvertedRotData] = useState<ScatterDatum[]>([]);
  const [originalRotData, setOriginalRotData] = useState<ScatterDatum[]>([]);
  const [filteredData, setFilteredData] = useState(convertedRotData);
  const [chartAxis, setChartAxis] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
  const [zoomedArea, setZoomedArea] = useState(DEFAULT_ZOOM);
  const [zoomArea, setZoomArea] = useState(DEFAULT_ZOOM);
  const startZoomRef = useRef(false);
  const zoomingRef = useRef(false);
  const zoomHistoryRef = useRef([DEFAULT_ZOOM]);
  const zoomedSegment = [
    {
      x: Math.min(zoomedArea.x1, zoomedArea.y1),
      y: Math.min(zoomedArea.x1, zoomedArea.y1),
    },
    {
      x: Math.max(zoomedArea.x2, zoomedArea.y2),
      y: Math.max(zoomedArea.x2, zoomedArea.y2),
    },
  ];
  const maxCounts = convertedRotData[convertedRotData.length - 1]?.counts || 0;
  const countsRange =
    maxCounts < 5
      ? [5, 4, 3, 2, 1, 0]
      : new Array(6)
          .fill(5)
          .map((value, index) => Math.round((maxCounts / 5) * (value - index)));
  const zoomedWidth =
    Math.abs(Math.sign(zoomedArea.x1) + Math.sign(zoomedArea.x2)) < 2
      ? Math.abs(zoomedArea.x1) + Math.abs(zoomedArea.x2)
      : Math.abs(Math.abs(zoomedArea.x1) - Math.abs(zoomedArea.x2));
  const scale = (size - 160) / zoomedWidth;
  const disableZoomIButton =
    Math.abs(zoomedArea.x1 - zoomedArea.x2) <= ZOOM_IN_VALUE * 2 ||
    Math.abs(zoomedArea.y1 - zoomedArea.y2) <= ZOOM_IN_VALUE * 2;

  useEffect(() => {
    const { originalData, convertedData } = convertScatterData(
      data,
      axisCenter
    );
    const filteredConvertedData =
      axisCenter === 0
        ? filterDataInRange(originalData, zoomedArea)
        : filterDataInRange(convertedData, zoomedArea);
    setConvertedRotData(convertedData);
    setOriginalRotData(originalData);
    setFilteredData(filteredConvertedData);
  }, [axisCenter, data, zoomedArea]);

  const handleZoomReset = () => {
    zoomHistoryRef.current = [DEFAULT_ZOOM];
    setFilteredData(convertedRotData);
    setZoomArea(DEFAULT_ZOOM);
    setZoomedArea(DEFAULT_ZOOM);
  };

  const handleZoomIn = () => {
    if (disableZoomIButton) return;

    let { x1, y1, x2, y2 } = zoomedArea;
    x1 = x1 < 0 ? x1 + ZOOM_IN_VALUE : x1 - ZOOM_IN_VALUE;
    y1 = y1 < 0 ? y1 + ZOOM_IN_VALUE : y1 - ZOOM_IN_VALUE;
    x2 = x2 < 0 ? x2 + ZOOM_IN_VALUE : x2 - ZOOM_IN_VALUE;
    y2 = y2 < 0 ? y2 + ZOOM_IN_VALUE : y2 - ZOOM_IN_VALUE;

    const nextZoomArea = { x1, y1, x2, y2 };
    const dataPointsInRange = filterDataInRange(filteredData, nextZoomArea);

    setFilteredData(dataPointsInRange);
    setZoomedArea(nextZoomArea);
    zoomHistoryRef.current.push(nextZoomArea);
  };

  const handleZoomOut = () => {
    const targetZoomedArea =
      zoomHistoryRef.current[zoomHistoryRef.current.length - 2] ?? DEFAULT_ZOOM;
    setZoomedArea(targetZoomedArea);
    const dataPointsInRange = filterDataInRange(
      convertedRotData,
      targetZoomedArea
    );

    setFilteredData(dataPointsInRange);
    zoomHistoryRef.current.pop();
  };

  const handleMouseDown = (e: unknown) => {
    if (zoomingRef.current || !isChartMouseEvent(e)) return;
    startZoomRef.current = true;
    const { xValue, yValue, chartX, chartY } = e;
    setZoomArea({
      x1: xValue < 0 ? Math.floor(xValue) : Math.ceil(xValue),
      y1: yValue < 0 ? Math.floor(yValue) : Math.ceil(yValue),
      x2: xValue < 0 ? Math.floor(xValue) : Math.ceil(xValue),
      y2: yValue < 0 ? Math.floor(yValue) : Math.ceil(yValue),
    });
    setChartAxis({ ...chartAxis, x1: chartX, y1: chartY });
  };

  const handleMouseMove = (e: unknown) => {
    if (startZoomRef.current && isChartMouseEvent(e)) {
      zoomingRef.current = true;
      const { xValue, yValue, chartX, chartY } = e;
      const { x1, y1 } = zoomArea;
      const x2Temp = xValue < 0 ? Math.floor(xValue) : Math.ceil(xValue);
      const y2Temp = yValue < 0 ? Math.floor(yValue) : Math.ceil(yValue);
      const distance = Math.min(Math.abs(x1 - x2Temp), Math.abs(y1 - y2Temp));
      const x2 = xValue < x1 ? x1 - distance : x1 + distance;
      const y2 = yValue < y1 ? y1 - distance : y1 + distance;

      setZoomArea({
        ...zoomArea,
        x2,
        y2,
      });
      setChartAxis({ ...chartAxis, x2: chartX, y2: chartY });
    }
  };

  const handleMouseUp = () => {
    if (zoomingRef.current) {
      let { x1, y1, x2, y2 } = zoomArea;
      if (x1 > x2) [x1, x2] = [x2, x1];
      if (y1 > y2) [y1, y2] = [y2, y1];

      const nextZoomArea = { x1, y1, x2, y2 };
      const dataPointsInRange = filterDataInRange(filteredData, nextZoomArea);

      setFilteredData(dataPointsInRange);
      setZoomedArea(nextZoomArea);
      zoomHistoryRef.current.push(nextZoomArea);
      zoomingRef.current = false;
    }
    startZoomRef.current = false;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ScatterShape = (nodeData: any) => {
    const {
      cx,
      cy,
      payload: { predicted, labeled, counts },
    } = nodeData;
    const difference = getAngleDifference(predicted, labeled);
    return difference > tolerance && countsRange ? (
      <polygon
        points={`${cx},${cy - 3} ${cx + 3},${cy + 3} ${cx - 3},${cy + 3}`}
        fill={colorPicker(counts, countsRange, COLORS)}
      />
    ) : (
      <circle
        cx={cx}
        cy={cy}
        r="3"
        fill={colorPicker(counts, countsRange, COLORS)}
      />
    );
  };

  return (
    <div className={classes.root} {...args}>
      <InputController
        tolerance={tolerance}
        changeTolerance={changeTolerance}
        axisCenter={axisCenter}
        changeAxisCenter={changeAxisCenter}
        disabled={disabled}
        onClickApply={onClickApply}
      />

      <div className={classes.chartContainer}>
        <div className={classes.zoomButtons}>
          <Button onClick={handleZoomIn} disabled={disableZoomIButton}>
            <ZoomIn />
          </Button>
          <Button
            disabled={zoomHistoryRef.current.length < 2}
            onClick={handleZoomOut}
          >
            <ZoomOut />
          </Button>
          <Button
            disabled={zoomHistoryRef.current.length < 2}
            onClick={handleZoomReset}
          >
            <Restore />
          </Button>
        </div>
        <div className={classes.chartWrapper}>
          <ScatterChart
            width={size - 76}
            height={size - 106}
            margin={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              fontSize: "12px",
              lineHeight: "16px",
              cursor: "crosshair",
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              name="labeledAngle"
              dataKey="labeled"
              domain={[zoomedArea.x1, zoomedArea.x2]}
              tickCount={7}
              type="number"
              tickFormatter={(tick) => convertTick180(tick + axisCenter)}
              tick={(e) => <CustomTick props={e} axisCenter={axisCenter} />}
              tickLine={false}
              interval={0}
            >
              <Label value="labeledAngle" position="insideBottom" offset={-8} />
            </XAxis>
            <YAxis
              name="predictedAngle"
              dataKey="predicted"
              domain={[zoomedArea.y1, zoomedArea.y2]}
              tickCount={7}
              type="number"
              tickFormatter={(tick) => convertTick180(tick + axisCenter)}
              tick={(e) => <CustomTick props={e} axisCenter={axisCenter} />}
              tickLine={false}
              interval={0}
            >
              <Label
                value="predictedAngle"
                position="insideLeft"
                offset={0}
                angle={-90}
                style={{ textAnchor: "middle" }}
              />
            </YAxis>
            <Legend />
            <ReferenceLine
              stroke="blue"
              opacity={0.5}
              segment={zoomedSegment}
              strokeWidth={(tolerance * scale) / Math.LN2}
              ifOverflow="hidden"
              vectorEffect="non-scaling-stroke"
            />
            <ReferenceLine
              stroke="blue"
              opacity={0.5}
              segment={[
                {
                  x: -360,
                  y: 0,
                },
                {
                  x: 360,
                  y: 720,
                },
              ]}
              strokeWidth={(tolerance * scale) / Math.LN2}
              ifOverflow="hidden"
              vectorEffect="non-scaling-stroke"
            />
            <ReferenceLine
              stroke="blue"
              opacity={0.5}
              segment={[
                {
                  x: -360,
                  y: -720,
                },
                {
                  x: 360,
                  y: 0,
                },
              ]}
              strokeWidth={(tolerance * scale) / Math.LN2}
              ifOverflow="hidden"
              vectorEffect="non-scaling-stroke"
            />
            <ReferenceLine
              stroke="rgba(0,0,0,1)"
              segment={DEFAULT_SEGMENT}
              ifOverflow="hidden"
            />

            <ZAxis dataKey="counts" name="counts" range={[28, 28]} />
            {zoomingRef.current ? (
              <ReferenceArea
                x1={zoomArea?.x1}
                x2={zoomArea?.x2}
                y1={zoomArea?.y1}
                y2={zoomArea?.y2}
              />
            ) : null}
            <Tooltip
              wrapperStyle={{ userSelect: "none" }}
              content={({ active, payload }) =>
                active ? (
                  <ul className={classes.tooltip}>
                    {payload?.map((payloadData) => {
                      const { name, unit, dataKey } = payloadData;
                      const { index } = payloadData.payload;
                      const originalInfo = originalRotData[index as number];
                      const pairOriginalRotData =
                        originalInfo?.[dataKey as keyof ScatterDatum];

                      return (
                        <li key={`${name}`} className={classes.tooltipContent}>
                          {`${name} : ${pairOriginalRotData}${unit}`}
                        </li>
                      );
                    })}
                  </ul>
                ) : null
              }
            />
            <Scatter
              name="predicted"
              dataKey="predicted"
              legendType="none"
              data={filteredData}
              shape={<ScatterShape />}
            >
              {filteredData.map((node) => (
                <Cell
                  key={`cell-${node.index}`}
                  fill={colorPicker(node.counts, countsRange, COLORS)}
                />
              ))}
            </Scatter>
          </ScatterChart>

          <div className={classes.colorBarWrapper}>
            <div className={classes.colorBar} />
            <div className={classes.scaleBar}>
              {countsRange.map((value) => (
                <span
                  className={classes.scaleUnit}
                  key={`countsRange-${value}`}
                >
                  - {value}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AngleDistribution;
