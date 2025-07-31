import React from "react";
import { Menu, MenuItem } from "@heroui/react";

interface SelectProps {
  value?: string;
  onChange?: (value: string) => void;
  children?: React.ReactNode;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  children,
  label,
  placeholder,
  className,
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block mb-2 text-sm font-medium">{label}</label>
      )}
      <Menu value={value} onChange={onChange} className="w-full">
        {children}
      </Menu>
    </div>
  );
};

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  return <MenuItem value={value}>{children}</MenuItem>;
};
