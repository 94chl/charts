import { hexToRgb } from "@material-ui/core";

export type DataType = {
  [key: string]: number;
};

type StatusResultDataType = {
  "-1": "# of images";
  good: number;
  bad: number;
};

export const extractStatusData = (
  good_bad_matrix: DataType
): StatusResultDataType[] => {
  const { good, bad } = good_bad_matrix;
  const rotStatusData = [
    {
      "-1": "# of images" as const,
      good: good || 0,
      bad: bad || 0,
    },
  ];
  return rotStatusData;
};

export const convertData = (data: DataType): DataType[] => {
  const result = Object.entries(data).map(([key, value]) => ({
    angle: Number(key),
    counts: value,
  }));
  return result.sort((a, b) => a.angle - b.angle);
};

const convert180 = (number: number) => {
  if (number === -180) return 180;
  return number;
};

export const get180Degree = (degree: number, digits: number): number => {
  degree = Number(degree.toFixed(digits));
  degree %= 360;
  degree = (degree + 360) % 360;
  if (degree > 180) degree -= 360;
  return degree;
};

export const getAngleDifference = (num1: number, num2: number): number =>
  Math.abs(get180Degree(num1 - num2, 0));

type AngleKey = `${number}, ${number}`;

const getAngleKey = (predicted: number, labeled: number): AngleKey =>
  `${predicted}, ${labeled}`;

export type ScatterDatum = {
  predicted: number;
  labeled: number;
  counts: number;
  index?: number;
  x?: number;
  y?: number;
};

type ScatterRecord = {
  [angleKey: AngleKey]: ScatterDatum;
};

export const convertScatterData = (
  data: [labeled: number, predicted: number][],
  difference = 0
): { originalData: ScatterDatum[]; convertedData: ScatterDatum[] } => {
  const originalData: ScatterRecord = {};
  const convertedData: ScatterRecord = {};
  data.forEach((node) => {
    const [labeled, predicted] = node;
    const angleKey = getAngleKey(predicted, labeled);
    const originalDatum = originalData[angleKey];
    const convertedDatum = convertedData[angleKey];
    if (originalDatum && convertedDatum) {
      originalDatum.counts += 1;
      convertedDatum.counts += 1;
    } else {
      const convertedPredicted = convert180(predicted) - difference;
      const convertedLabeled = convert180(labeled) - difference;
      convertedData[angleKey] = {
        predicted: get180Degree(convertedPredicted, 0),
        labeled: get180Degree(convertedLabeled, 0),
        counts: 1,
      };
      originalData[angleKey] = {
        predicted,
        labeled,
        counts: 1,
      };
    }
  });
  const result = {
    originalData: Object.values(originalData)
      .sort((a, b) => a.counts - b.counts)
      .map((node, index) => ({ ...node, index })),
    convertedData: Object.values(convertedData)
      .sort((a, b) => a.counts - b.counts)
      .map((node, index) => ({ ...node, index })),
  };

  return result;
};

export const filterDataInRange = (
  data: ScatterDatum[],
  range: { x1: number; y1: number; x2: number; y2: number }
): ScatterDatum[] => {
  const { x1, y1, x2, y2 } = range;
  const result = data.filter(
    (d) =>
      d.labeled >= x1 &&
      d.labeled <= x2 &&
      d.predicted >= y1 &&
      d.predicted <= y2
  );
  return result;
};

const hexToRgba = (color: string, opacity = 1): string => {
  if (color.indexOf("#") === 0) color = hexToRgb(color);
  const [r = 0, g = 0, b = 0] = color
    .replace(/[^0-9,]/g, "")
    .split(",")
    .map((v) => Number(v));
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const getGradientColor = (
  color1: string,
  color2: string,
  ratio: number
): string => {
  // 2개의 hex color 사이의 값을 ratio로 계산하여 hex로 리턴
  color1 = color1.replace(/#/g, "");
  color2 = color2.replace(/#/g, "");

  const hex = (x: number) => x.toString(16).padStart(2, "0");
  const newRatio = Number(ratio.toFixed(2));

  const r = Math.ceil(
    parseInt(color1.substring(0, 2), 16) * newRatio +
      parseInt(color2.substring(0, 2), 16) * (1 - newRatio)
  );
  const g = Math.ceil(
    parseInt(color1.substring(2, 4), 16) * newRatio +
      parseInt(color2.substring(2, 4), 16) * (1 - newRatio)
  );
  const b = Math.ceil(
    parseInt(color1.substring(4, 6), 16) * newRatio +
      parseInt(color2.substring(4, 6), 16) * (1 - newRatio)
  );
  const middle = `#${hex(r) + hex(g) + hex(b)}`;

  return hexToRgba(middle);
};

export const colorPicker = (
  number: number,
  countsRange: number[],
  colors: string[]
): string | undefined => {
  let targetColorIndex = 0;
  let ratio = 1;
  if (countsRange?.length < 6) return;

  switch (true) {
    case number >= countsRange[1]:
      targetColorIndex = 0;
      ratio = (number - countsRange[1]) / (countsRange[0] - countsRange[1]);
      break;
    case number >= countsRange[2]:
      targetColorIndex = 1;
      ratio = (number - countsRange[2]) / (countsRange[1] - countsRange[2]);
      break;
    case number >= countsRange[3]:
      targetColorIndex = 2;
      ratio = (number - countsRange[3]) / (countsRange[2] - countsRange[3]);
      break;
    case number >= countsRange[4]:
      targetColorIndex = 3;
      ratio = (number - countsRange[4]) / (countsRange[3] - countsRange[4]);
      break;
    default:
      targetColorIndex = 4;
      ratio = (number - countsRange[5]) / (countsRange[4] - countsRange[5]);
      break;
  }

  const targetColor = colors[targetColorIndex];
  const nextColor = colors[targetColorIndex + 1];

  const result =
    targetColor && nextColor && getGradientColor(targetColor, nextColor, ratio);

  return result;
};

export const convertTick180 = (tick: number): string => {
  const convertedTick = get180Degree(tick, 0);
  const plusMinus = Math.abs(convertedTick) === 180 ? "±" : "";
  return `${plusMinus}${convertedTick}`;
};
