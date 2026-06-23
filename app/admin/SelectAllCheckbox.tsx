"use client";

/**
 * Row checkboxes live in `<td>`s, not inside the bulk-send `<form>` (forms can't
 * nest); they're linked to it via the `form` attribute instead. So toggling
 * "select all" has to reach them by query, not by walking a shared DOM parent.
 */
export function SelectAllCheckbox() {
  return (
    <input
      type="checkbox"
      aria-label="Select all unsent orders"
      onChange={(e) => {
        document
          .querySelectorAll<HTMLInputElement>('input[name="orderIds"]')
          .forEach((cb) => (cb.checked = e.currentTarget.checked));
      }}
    />
  );
}
