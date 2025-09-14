'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export type ComboboxOption = {
  value: string;
  label: string;
};

interface MultiSelectComboboxProps {
  options: ComboboxOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
  placeholder?: string;
}

export function MultiSelectCombobox({
  options,
  selected,
  onChange,
  className,
  placeholder = 'Select options...',
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [container, setContainer] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (open) {
      setContainer(document.getElementById('create-notice-dialog'));
    }
  }, [open]);

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };
  
  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map((option) => option.value));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between h-auto', className)}
        >
          <div className="flex gap-1 flex-wrap">
            {selected.length > 0 ? (
              options
                .filter((option) => selected.includes(option.value))
                .map((option) => (
                  <Badge
                    variant="secondary"
                    key={option.value}
                    className="mr-1 mb-1"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(option.value);
                    }}
                  >
                    {option.label}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        container={container}
        className="w-[--radix-popover-trigger-width] p-0"
      >
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
                <CommandItem
                    onSelect={handleSelectAll}
                    className="cursor-pointer"
                >
                    <Check
                        className={cn(
                        'mr-2 h-4 w-4',
                        selected.length === options.length ? 'opacity-100' : 'opacity-0'
                        )}
                    />
                    {selected.length === options.length ? 'Unselect all' : 'Select all'}
                </CommandItem>
                <CommandSeparator />
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    handleSelect(option.value);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selected.includes(option.value) ? 'opacity-100' : 'opacity-0'
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
  );
}
