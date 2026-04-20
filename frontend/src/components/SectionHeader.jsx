/**
 * Section header with an optional action link on the right.
 *
 * @param {{ title: string, actionLabel?: string, onAction?: () => void }} props
 */
export default function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-extrabold text-gray-900">
        {title}
      </h3>

      {actionLabel && (
        <button
          onClick={onAction}
          className="text-xs text-indigo-700 hover:text-indigo-800 cursor-pointer transition-colors duration-150"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
