export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // for today
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  // for yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  // for last 7 days
  const last7Days = new Date(today);
  last7Days.setDate(today.getDate() - 7);
  if (date >= last7Days) {
    return "Last 7 Days";
  }
  //for last 30 days
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);
  if (date >= lastMonth) {
    return "Last Month";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
