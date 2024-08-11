// react, redux
import React, { useRef } from "react";

// libraries
import { makeStyles, MenuItem } from "@material-ui/core";

// components
import ToleranceInput from "../ToleranceInput";
import MenuGroup from "./MenuGroup";

const AXIS_CENTER_OPTIONS = [-120, -60, 0, 60, 120];

const useStyles = makeStyles({
  root: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  axisSelectorWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
});

interface Props extends React.HtmlHTMLAttributes<HTMLDivElement> {
  tolerance: number;
  changeTolerance: (value: number) => void;
  axisCenter: number;
  changeAxisCenter: (value: number) => void;
  onClickApply?: () => void;
  disabled?: boolean;
}

const InputController: React.FC<React.PropsWithChildren<Props>> = ({
  tolerance,
  changeTolerance,
  axisCenter = 0,
  changeAxisCenter,
  disabled = false,
  onClickApply,
}) => {
  const classes = useStyles();
  const toggleMenuRef = useRef<{ toggleMenu: () => void }>(null);

  const handleChangeTolerance = (value: number) => {
    value = value > 30 ? 30 : value < 0 ? 0 : value;
    changeTolerance(value);
  };

  const handleClickAxisCenter = (value: number) => {
    if (toggleMenuRef.current) {
      toggleMenuRef.current.toggleMenu();
    }
    changeAxisCenter(value);
  };

  return (
    <div className={classes.root}>
      <div className={classes.axisSelectorWrapper}>
        <span>axisCenter</span>

        <MenuGroup
          ref={toggleMenuRef}
          value={`${axisCenter}º`}
          width={78}
          size="small"
          menuGroup={[
            {
              id: "axisMenuGroup",
              node: (
                <div>
                  {AXIS_CENTER_OPTIONS.map((axisCenterValue) => (
                    <MenuItem
                      key={`AXIS_CENTER_VALUE_${axisCenterValue}`}
                      onClick={() => handleClickAxisCenter(axisCenterValue)}
                    >
                      {`${axisCenterValue}º`}
                    </MenuItem>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </div>
      <ToleranceInput
        inputValue={tolerance}
        handleChange={handleChangeTolerance}
        onClickApply={onClickApply}
        disabled={disabled}
      />
    </div>
  );
};

export default InputController;
