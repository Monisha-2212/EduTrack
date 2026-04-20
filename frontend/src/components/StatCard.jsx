/**
 * Summary metric card shown in dashboard stat rows.
 *
 * @param {{ label: string, value: string | number, sub?: string, role?: string }} props
 */
export default function StatCard({ label, value, sub, role }) {
  const borderColor = role === 'faculty' ? 'border-emerald-200' : 'border-indigo-100';
  return (
    <div className={`bg-white ${borderColor} rounded-lg p-4 border`}>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 leading-none">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-gray-600 mt-1">{sub}</p>
      )}
    </div>
  );
}
