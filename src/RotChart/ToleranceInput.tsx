// react, redux
import React from "react";

// libraries
import { Button, TextField, makeStyles } from "@material-ui/core";

// utils

// components

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputWrapper: {
    width: 72,
    height: 28,
    display: "flex",
    padding: "6px !important",
    background: "#fff",
  },
  input: {
    textAlign: "end",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    padding: "0 !important",
  },
});

type Props = {
  inputValue: number;
  handleChange: (value: number) => void;
  disabled?: boolean;
  onClickApply?: () => void;
};

const ToleranceInput: React.FC<React.PropsWithChildren<Props>> = ({
  inputValue,
  handleChange,
  disabled = false,
  onClickApply,
}) => {
  const classes = useStyles();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = Math.trunc(Number(e.target.value));
    handleChange(input);
  };

  return (
    <div className={classes.root}>
      <span>tolerance</span>
      <TextField
        value={inputValue}
        onChange={onChange}
        inputProps={{
          type: "number",
          step: 1,
          min: 0,
          max: 30,
        }}
        size="small"
        disabled={disabled}
        InputProps={{
          startAdornment: <span>±</span>,
          endAdornment: <span>º</span>,
          classes: {
            root: classes.inputWrapper,
            input: classes.input,
          },
        }}
      />
      {onClickApply && !disabled && (
        <Button onClick={onClickApply}>apply</Button>
      )}
    </div>
  );
};

export default ToleranceInput;
