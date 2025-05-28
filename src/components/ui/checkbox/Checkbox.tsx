import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, className = "", ...props }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <input
        type="checkbox"
        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        {...props}
      />
      {label && <label htmlFor={props.id} className="text-sm text-gray-700">{label}</label>}
    </div>
  );
};
