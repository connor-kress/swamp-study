// The SwampStudy logo text
export default function SwampStudy({ className = "" }: { className?: string; }) {
  return (
    <span className={`font-bold ${className}`}>
      <span className="text-blue-600 dark:text-blue-400">Swamp</span>
      <span className="text-red-500 dark:text-red-400">Study</span>
    </span>
  );
}
