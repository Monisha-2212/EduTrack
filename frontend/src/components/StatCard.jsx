/**
 * Summary metric card shown in dashboard stat rows.
 *
 * @param {{ label: string, value: string | number, sub?: string }} props
 */
export default function StatCard({ label, value, sub }) {
  return (
    <div className="bg-[#FAF8F5] dark:bg-[#1C1A17]/60 rounded-lg p-4">
      <p className="text-xs text-[#9A9288] dark:text-[#6B6660] mb-1">{label}</p>
      <p className="text-2xl font-medium text-[#2C2A26] dark:text-[#F5F0E8] leading-none">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-[#9A9288] dark:text-[#6B6660] mt-1">{sub}</p>
      )}
    </div>
  );
}
