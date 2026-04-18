/**
 * Section header with an optional action link on the right.
 *
 * @param {{ title: string, actionLabel?: string, onAction?: () => void }} props
 */
export default function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-medium text-[#3A3830] dark:text-[#D8D4CC]">
        {title}
      </h3>

      {actionLabel && (
        <button
          onClick={onAction}
          className="text-xs text-[#8B6914] dark:text-[#F5F0E8]
                     hover:text-[#8B6914] dark:hover:text-[#F5F0E8]
                     cursor-pointer transition-colors duration-150"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
