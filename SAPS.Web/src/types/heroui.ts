import type { ListboxItemProps, SelectProps } from "@heroui/react";
import type { ReactNode } from "react";

export type CustomListboxItemProps = {
  children?: ReactNode;
  value: string;
  key: string;
  className?: string;
};

export type CustomSelectProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
  placeholder?: string;
  className?: string;
};

export type { SelectProps, ListboxItemProps };
