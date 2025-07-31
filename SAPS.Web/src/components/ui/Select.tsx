import React from "react";
import { Select as HeroSelect, ListboxItem } from "@heroui/react";
import { CustomSelectProps } from "@/types/heroui";

export const Select = React.forwardRef<HTMLSelectElement, CustomSelectProps>(
  ({ children, value, onValueChange, placeholder, className }, ref) => {
    return (
      <HeroSelect
        ref={ref}
        classNames={{
          trigger: className,
        }}
        selectedKeys={value ? [value] : undefined}
        onChange={(e) => onValueChange?.(e.target.value)}
      >
        {children}
      </HeroSelect>
    );
  }
);

export const SelectItem = ListboxItem;
