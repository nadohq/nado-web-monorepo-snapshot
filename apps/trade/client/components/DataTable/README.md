# DataTable Column Width Guidelines

Prefer to set `cellContainerClassName` for the column to a member of `TABLE_CELL_CONTAINER_CLASSNAME`.
This should be the first choice if there is an appropriate matching content type for the column.

If there is no match for reuse, you can define width minimum and maximum bounds using `min-w-*` and `max-w-*` Tailwind classes.
Think of the shortest and longest content that might appear in the column and set the min and max widths accordingly.
`flex-1` is automatically added so the column expand, within min and max, to fill available space.

If the content has fixed size and column does not need to be expand, it is fine to use `w-*` standalone.
