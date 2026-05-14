"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Chart({ data }: { data: { createdAt: string; total: number }[] }) {
  const chartData = data.reduce((acc: any[], item) => {
    const date = new Date(item.createdAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
    const existing = acc.find(d => d.date === date);
    if (existing) { existing.revenue += item.total; existing.count += 1; }
    else { acc.push({ date, revenue: item.total, count: 1 }); }
    return acc;
  }, []);

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip />
          <Line type="monotone" dataKey="revenue" stroke="#4c6ef5" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
