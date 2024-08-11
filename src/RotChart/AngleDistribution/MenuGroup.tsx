import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import _ from "underscore";
import { makeStyles, TextField, Menu, Divider } from "@material-ui/core";
import type { StyleRules } from "@material-ui/core";
import { KeyboardArrowDown, KeyboardArrowUp } from "@material-ui/icons";

export interface MenuGroupProps {
  value: React.ReactNode | string | null;
  menuGroup: Array<{ id: string; node: React.ReactNode }>;
  disabled?: boolean;
  placeholder?: string;
  width: string | number;
  errorMessage?: string;
  size?: "small" | "medium";
  customClasses?: StyleRules<"root" | string>;
}

interface StylesProps {
  disabled: MenuGroupProps["disabled"];
  size: MenuGroupProps["size"];
  width: MenuGroupProps["width"];
  error: boolean;
  customClasses?: MenuGroupProps["customClasses"];
}

const useStyles = makeStyles({
  root: ({ width, disabled, customClasses }) => ({
    width,
    cursor: disabled ? "default" : "pointer",
    ...customClasses?.root,
  }),
  textFieldWrapper: {
    position: "relative",
    width: "100%",
  },
  input: {
    cursor: ({ disabled }: StylesProps) => (disabled ? "default" : "pointer"),
    width: 0,
    padding: 0,
  },
  notchedOutline: {
    border: "2px solid blue",
  },
  chevron: {
    position: "absolute",
    top: ({ size }: StylesProps) => (size === "small" ? 2 : 4),
    right: 6,
    fontSize: ({ size }: StylesProps) => (size === "small" ? 16 : 24),
    cursor: ({ disabled }: StylesProps) => (disabled ? "default" : "pointer"),
    opacity: ({ disabled }: StylesProps) => (disabled ? 0.38 : 1),
  },
  startAdornment: {
    width: ({ error, size }: StylesProps) =>
      error
        ? size === "small"
          ? "calc(100% - 48px)"
          : "calc(100% - 60px)"
        : size === "small"
          ? "calc(100% - 24px)"
          : "calc(100% - 32px)",
    padding: "6px 8px",
    paddingRight: ({ error, size }: StylesProps) =>
      error && size === "small" ? 4 : 0,
    cursor: ({ disabled }: StylesProps) => (disabled ? "default" : "pointer"),
    overflow: "hidden",
  },
  divider: {
    margin: "4px 0px",
    height: 1,
    backgroundColor: "#ddd",
  },
});

const MenuGroup = React.forwardRef(
  (
    {
      value,
      disabled = false,
      placeholder = "",
      width,
      errorMessage = "",
      size = "medium",
      menuGroup,
      customClasses,
      ...args
    }: MenuGroupProps,
    ref: React.ForwardedRef<{ toggleMenu: () => void }>
  ) => {
    const error = !_.isEmpty(errorMessage);
    const classes = useStyles({
      size,
      disabled,
      width,
      error,
      customClasses,
    });
    const textFieldRef = useRef<HTMLInputElement>(null);
    const toggleMenuRef = useRef<() => void>();

    const [anchorEl, setAnchorEl] = useState<HTMLInputElement | null>(null);

    const toggleMenu = () => {
      if (disabled) return;

      if (anchorEl) setAnchorEl(null);
      else setAnchorEl(textFieldRef.current);
    };
    toggleMenuRef.current = toggleMenu;

    useImperativeHandle(ref, () => ({
      toggleMenu: () => toggleMenuRef.current && toggleMenuRef.current(),
    }));

    useEffect(() => {
      setAnchorEl(null);
    }, [value]);

    return (
      <div className={classes.root}>
        <div
          className={classes.textFieldWrapper}
          ref={textFieldRef}
          onClick={toggleMenu}
        >
          <TextField
            disabled={disabled}
            error={error}
            helperText={errorMessage}
            FormHelperTextProps={{
              style: {
                opacity: disabled ? 0.38 : 1,
              },
            }}
            size={size}
            fullWidth={width === "100%"}
            inputProps={{
              readOnly: true,
            }}
            InputProps={{
              role: "combobox",
              "aria-expanded": Boolean(anchorEl),
              "aria-controls": "MenuGroup-listbox",
              "aria-label": value?.toString(),
              style: {
                width,
                backgroundColor: "#fff",
              },
              classes: {
                input: classes.input,
                ...(anchorEl && { notchedOutline: classes.notchedOutline }),
              },
              startAdornment: (
                <div className={classes.startAdornment}>
                  {value ? (
                    typeof value === "string" ? (
                      <span
                        style={{
                          width: "100%",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        }}
                      >
                        {value}
                      </span>
                    ) : (
                      value
                    )
                  ) : (
                    <span
                      style={{
                        color: "#ddd",
                        height: size === "small" ? 16 : 20,
                      }}
                    >
                      {placeholder}
                    </span>
                  )}
                </div>
              ),
            }}
            {...args}
          />
          <div className={classes.chevron}>
            {anchorEl ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </div>
        </div>

        {!_.isEmpty(menuGroup) && (
          <Menu
            id="MenuGroup-listbox"
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            style={{ marginTop: 4 }}
            onClose={() => setAnchorEl(null)}
          >
            {menuGroup.map(({ id, node }, index) => (
              <div key={`MENU_GROUP_${id}`}>
                {node}
                {index !== menuGroup.length - 1 && (
                  <Divider className={classes.divider} />
                )}
              </div>
            ))}
          </Menu>
        )}
      </div>
    );
  }
);

export default MenuGroup;
