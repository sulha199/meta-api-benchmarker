# ComboBox Component

A generic, reusable combo-box component built with Radix UI, `cmdk`, and `@dnd-kit`. It supports single selection, standard multiselect, and re-orderable multiselect.

## Features

- **Single Selection:** Standard dropdown with search.
- **Multiselect:** Select multiple items rendered as badges.
- **Re-orderable:** Drag and drop badges to change the order of selection.
- **Accessible:** Built on Radix UI and `cmdk` for keyboard navigation and ARIA support.
- **Themed:** Styled using Tailwind CSS and CSS variables.

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `options` | `ComboBoxOption[]` | `[]` | Array of `{ label: string, value: string }`. |
| `value` | `string \| string[]` | `undefined` | The currently selected value(s). |
| `onChange` | `(value: T) => void` | `undefined` | Callback fired when selection changes. |
| `multiple` | `boolean` | `false` | Enable multiple selection. |
| `reorderable` | `boolean` | `false` | Enable drag-and-drop reordering (requires `multiple`). |
| `placeholder` | `string` | `"Select option..."` | Placeholder text for the trigger. |
| `searchPlaceholder` | `string` | `"Search options..."`| Placeholder for the search input. |
| `emptyMessage` | `string` | `"No option found."` | Message shown when no results are found. |
| `disabled` | `boolean` | `false` | Disable the component. |

## Usage Examples

### Single Selection

```tsx
import { ComboBox } from "@repo/ui"

const options = [
  { label: "Option 1", value: "opt1" },
  { label: "Option 2", value: "opt2" },
]

export function SingleSelect() {
  const [value, setValue] = useState<string>("")
  
  return (
    <ComboBox 
      options={options} 
      value={value} 
      onChange={setValue} 
    />
  )
}
```

### Re-orderable Multiselect

This is particularly useful for scenarios like selecting GraphQL AST fields where the order might imply priority or display order.

```tsx
import { ComboBox } from "@repo/ui"

const fieldOptions = [
  { label: "ID", value: "id" },
  { label: "Title", value: "title" },
  { label: "Content", value: "contentBody" },
  { label: "Comments", value: "comments" },
]

export function AstFieldSelector() {
  const [fields, setFields] = useState<string[]>(["id", "title"])
  
  return (
    <ComboBox 
      multiple
      reorderable
      options={fieldOptions} 
      value={fields} 
      onChange={setFields} 
      placeholder="Select fields..."
    />
  )
}
```

## Internal Dependencies

- `@radix-ui/react-popover`
- `cmdk`
- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`
- `lucide-react`
