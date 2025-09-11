import React from "react";
import classes from "./Select.module.css";

type Option = {
  label: string;
  value: string;
};

interface SelectListProps {
  options: Option[];
  placeholder?: string;
  onChange?: (value: string) => void;
  textColor?: string;
  className?: string;
  name?: string;
  value?: number | string;
}

export const SelectList: React.FC<SelectListProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  textColor,
  ...props
}) => {
  const [selected, setSelected] = React.useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelected(e.target.value);
    if (onChange) onChange(e.target.value);
  };

  return (
    <div className={classes.selectContainer}>
      <select
        className={`${textColor} ${classes.selectInput}`}
        value={selected}
        onChange={handleChange}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
