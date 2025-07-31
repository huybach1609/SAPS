import { Button, ButtonGroup, Input } from "@heroui/react";
import { PlusIcon, RefreshCcw, Users } from "lucide-react";

type WhitelistSearchBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onAddUser: () => void;
  onAddFile: () => void;
};

export function WhitelistSearchBar({
  searchValue,
  onSearchChange,
  onSearch,
  onReset,
  onAddUser,
  onAddFile,
}: WhitelistSearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex gap-2 items-center justify-between w-full">
      <div className="flex gap-2 items-center w-full">
        <Input
          className="w-1/2"
          color="primary"
          placeholder="Search by name, email, or ID..."
          size="sm"
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          className="text-background"
          color="primary"
          size="sm"
          onPress={onSearch}
        >
          Search
        </Button>
        <Button
          data-testid="reset-button"
          isIconOnly
          className="text-background"
          color="primary"
          size="sm"
          onPress={onReset}
        >
          <RefreshCcw size={16} />
        </Button>
      </div>
      <ButtonGroup>
        <Button
          className="text-background"
          color="secondary"
          radius="sm"
          size="sm"
          startContent={<PlusIcon size={16} />}
          onPress={onAddUser}
        >
          Add User
        </Button>
        <Button
          className="text-background"
          color="success"
          radius="sm"
          size="sm"
          startContent={<Users size={16} />}
          onPress={onAddFile}
        >
          Add File
        </Button>
      </ButtonGroup>
    </div>
  );
}
