---
'wc-datepicker': minor
---

Add `selection-mode` prop with support for `'single' | 'range' | 'multiple'`.

- New `'multiple'` mode allows toggling any number of non-consecutive dates; `selectDate` emits an ascending-sorted array of ISO strings.
- New `dateSelected`, `dateDeselected` and `datesSelected` labels are announced by screen readers in `'multiple'` mode. `datesSelected` supports a `{count}` placeholder.
- `aria-multiselectable` is now `true` in both `'range'` and `'multiple'` mode.
- Changing `selection-mode` at runtime clears the current selection and emits `selectDate` with `undefined`.

> **Note**: The `range` prop is deprecated. Use `selection-mode="range"` instead. `range` still works but is ignored when `selection-mode` is set.
