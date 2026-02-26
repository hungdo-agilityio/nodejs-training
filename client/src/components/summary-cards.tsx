interface SummaryCardsProps {
  total: number;
  checkedIn: number;
  completed: number;
  totalRevenue: number;
}

export function SummaryCards({
  total,
  checkedIn,
  completed,
  totalRevenue,
}: SummaryCardsProps) {
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-4">
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h3 className="text-sm font-medium text-sky-600">Total Bookings</h3>
        <p className="mt-1 text-3xl font-bold text-sky-900">{total}</p>
      </div>
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h3 className="text-sm font-medium text-sky-600">Checked In</h3>
        <p className="mt-1 text-3xl font-bold text-yellow-600">{checkedIn}</p>
      </div>
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h3 className="text-sm font-medium text-sky-600">Completed</h3>
        <p className="mt-1 text-3xl font-bold text-green-600">{completed}</p>
      </div>
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h3 className="text-sm font-medium text-sky-600">Revenue</h3>
        <p className="mt-1 text-3xl font-bold text-emerald-600">
          ${totalRevenue.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
