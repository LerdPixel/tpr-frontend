// components/ui/select.tsx
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import classes from "./Select.module.css";

export const Select = ({ children }: { children: React.ReactNode }) => {
  return <div className="selectInput">{children}</div>;
};

export const SelectTrigger = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex justify-between items-center border px-3 py-2 rounded bg-white text-sm text-gray-700 focus:outline-none"
    >
      {children}
      <ChevronDown className="w-4 h-4 ml-2" />
    </button>
  );
};

export const SelectValue = ({ value, placeholder }: { value: string; placeholder: string }) => {
  return <span>{value || placeholder}</span>;
};

export const SelectContent = ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) => {
  return isOpen ? (
    <div className="selectInput">
      {children}
    </div>
  ) : null;
};

export const SelectItem = ({ value, onSelect }: { value: string; onSelect: (value: string) => void }) => {
  return (
    <div
      onClick={() => onSelect(value)}
      className="cursor-pointer px-3 py-2 hover:bg-blue-100"
    >
      {value}
    </div>
  );
};