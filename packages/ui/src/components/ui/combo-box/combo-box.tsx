"use client";

import * as React from "react";
import { Check, ChevronsUpDown, GripVertical, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AbstractStatefulDataModel } from "@meta/validation-core";

import { cn } from "../../../lib/utils";
import { Button } from "../button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../command";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Badge } from "../badge";

export interface ComboBoxOption<T extends string> {
  label: string;
  value: T;
}

export interface ComboBoxProps<T extends string | string[]> {
  options: ComboBoxOption<T extends string ? T : T[number]>[];
  value?: T;
  onChange?: (value: T) => void;
  multiple?: boolean;
  reorderable?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  errorMessage?: string;
  className?: string;
  disabled?: boolean;
}

function SortableBadge<T extends string[]>({
  option,
  onRemove,
  reorderable,
}: {
  option: ComboBoxOption<T[number]>;
  onRemove: (value: string) => void;
  reorderable?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.value });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Badge
      ref={setNodeRef}
      style={style}
      variant="secondary"
      className={cn(
        "flex items-center gap-1 pr-1 pl-1.5",
        reorderable && "cursor-default",
      )}
    >
      {reorderable && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing hover:text-foreground/80 transition-colors"
        >
          <GripVertical className="h-3 w-3" />
        </div>
      )}
      <span className="max-w-[100px] truncate">{option.label}</span>
      <button
        type="button"
        className="ml-1 rounded-full outline-none hover:bg-muted-foreground/20 focus:ring-2 focus:ring-ring focus:ring-offset-2"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(option.value);
        }}
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Remove {option.label}</span>
      </button>
    </Badge>
  );
}

export function ComboBox<T extends string | string[]>({
  options,
  value,
  onChange,
  multiple = false,
  reorderable = false,
  placeholder = "Select option...",
  searchPlaceholder = "Search options...",
  emptyMessage = "No option found.",
  className,
  disabled = false,
}: ComboBoxProps<T>) {
  type OptionValue = T extends string ? T : T[number];
  const [open, setOpen] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleUnselect = (itemValue: string) => {
    if (!multiple || !Array.isArray(value)) return;
    const newValue = value.filter((v) => v !== itemValue);
    onChange?.(newValue as T);
  };

  const handleSelect = (currentValue: string) => {
    if (multiple) {
      const currentValues = (Array.isArray(value) ? value : []) as string[];
      const newValue = currentValues.includes(currentValue)
        ? currentValues.filter((v) => v !== currentValue)
        : [...currentValues, currentValue];
      onChange?.(newValue as T);
    } else {
      onChange?.(currentValue as T);
      setOpen(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && Array.isArray(value)) {
      const oldIndex = value.indexOf(active.id as string);
      const newIndex = value.indexOf(over.id as string);
      const newValue = arrayMove(value, oldIndex, newIndex);
      onChange?.(newValue as T);
    }
  };

  const selectedOptions = React.useMemo(() => {
    if (!value) return [];
    if (multiple && Array.isArray(value)) {
      return value
        .map((v) => options.find((opt) => opt.value === v))
        .filter((opt): opt is ComboBoxOption<OptionValue> => !!opt);
    }
    const singleOpt = options.find((opt) => opt.value === value);
    return singleOpt ? [singleOpt] : [];
  }, [value, options, multiple]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-9 px-3 py-2"
            disabled={disabled}
          >
            <div className="flex flex-wrap gap-1 items-center overflow-hidden">
              {selectedOptions.length > 0 ? (
                multiple && reorderable ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={selectedOptions.map((o) => o.value)}
                      strategy={horizontalListSortingStrategy}
                    >
                      {selectedOptions.map((option) => (
                        <SortableBadge
                          key={option.value}
                          option={option}
                          onRemove={handleUnselect}
                          reorderable={reorderable}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                ) : multiple ? (
                  selectedOptions.map((option) => (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1 pl-1.5"
                    >
                      <span className="max-w-[100px] truncate">
                        {option.label}
                      </span>
                      <button
                        type="button"
                        className="ml-1 rounded-full outline-none hover:bg-muted-foreground/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnselect(option.value);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  selectedOptions[0].label
                )
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        (
                          Array.isArray(value)
                            ? value.includes(option.value)
                            : value === option.value
                        )
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
