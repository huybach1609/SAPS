import { FC, useState, useEffect } from "react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { SwitchProps, useSwitch } from "@heroui/switch";
import clsx from "clsx";
import { useTheme } from "@heroui/use-theme";
import { Moon, Sun } from "lucide-react";


export interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
  darkTheme?: boolean; // New prop to control which theme to show
  showLabel?: boolean; // Option to show/hide the text label
  variant?: "switch" | "button"; // New variant for different display modes
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
  className,
  classNames,
  darkTheme,
  showLabel = true,
  variant = "switch",
}) => {
  const [isMounted, setIsMounted] = useState(false);

  const { theme, setTheme } = useTheme();

  // Determine the display theme based on props or current theme
  const displayTheme = darkTheme !== undefined ? (darkTheme ? "dark" : "light") : theme;
  const isSelected = displayTheme === "light";

  const handleThemeChange = () => {
    if (darkTheme !== undefined) {
      // If darkTheme prop is provided, toggle based on that
      setTheme(darkTheme ? "light" : "dark");
    } else {
      // Default behavior - toggle current theme
      setTheme(theme === "light" ? "dark" : "light");
    }
  };

  const {
    Component,
    slots,
    getBaseProps,
    getInputProps,
    getWrapperProps,
  } = useSwitch({
    isSelected,
    onChange: handleThemeChange,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent Hydration Mismatch
  if (!isMounted) return <div className="w-6 h-6" />;

  // For button variant (better for DropdownItem)
  if (variant === "button") {
    return (
      <button
        onClick={handleThemeChange}
        className={clsx(
          "flex items-center gap-2 w-full text-left transition-opacity hover:opacity-80",
          className
        )}
        aria-label={isSelected ? "Switch to dark mode" : "Switch to light mode"}
      >
        {isSelected ? <Sun size={16} /> : <Moon size={16} />}
        {showLabel && (
          <span>{isSelected ? "Light Mode" : "Dark Mode"}</span>
        )}
      </button>
    );
  }

  // Original switch variant
  return (
    <Component
      aria-label={isSelected ? "Switch to dark mode" : "Switch to light mode"}
      {...getBaseProps({
        className: clsx(
          "px-px transition-opacity hover:opacity-80 cursor-pointer",
          className,
          classNames?.base,
        ),
      })}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <div
        {...getWrapperProps()}
        className={slots.wrapper({
          class: clsx(
            [
              "w-auto h-auto",
              "bg-transparent",
              "rounded-lg",
              "flex items-center justify-center",
              "group-data-[selected=true]:bg-transparent",
              "!text-default-500",
              "pt-px",
              "px-0",
              "mx-0",
            ],
            classNames?.wrapper,
          ),
        })}
      >
        <div className="flex items-center gap-2">
          {isSelected ? <SunFilledIcon size={16} /> : <MoonFilledIcon size={16} />}
          {showLabel && (
            <p>{isSelected ? "Light" : "Dark"}</p>
          )}
        </div>
      </div>
    </Component>
  );
};