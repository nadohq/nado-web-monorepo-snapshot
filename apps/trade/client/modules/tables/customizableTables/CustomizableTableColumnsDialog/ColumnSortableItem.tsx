import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { joinClassNames } from '@nadohq/web-common';
import { Icons, Switch, TextButton } from '@nadohq/web-ui';
import { useTranslation } from 'react-i18next';

interface ColumnSortableItemProps {
  id: string;
  label: string;
  isVisible: boolean;
  onVisibilityChange: (isVisible: boolean) => void;
}

export function ColumnSortableItem({
  id,
  label,
  isVisible,
  onVisibilityChange,
}: ColumnSortableItemProps) {
  const { t } = useTranslation();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={joinClassNames(
        'flex items-center gap-x-2 rounded-sm py-1 transition-colors',
        isDragging && 'opacity-50',
      )}
    >
      <TextButton
        as="button"
        title={t(($) => $.buttons.dragToReorder)}
        colorVariant="secondary"
        {...listeners}
        {...attributes}
      >
        <Icons.DotsSixVertical size={18} />
      </TextButton>
      <Switch.Row className="flex-1 justify-between">
        <Switch.Label
          id={`column-${id}`}
          className={!isVisible ? 'text-text-tertiary' : undefined}
        >
          {label}
        </Switch.Label>
        <Switch.Toggle
          id={`column-${id}`}
          checked={isVisible}
          onCheckedChange={onVisibilityChange}
        />
      </Switch.Row>
    </div>
  );
}
