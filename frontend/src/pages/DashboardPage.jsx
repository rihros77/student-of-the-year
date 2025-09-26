import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Layout from "@/components/common/Layout";

/* Example data */
const pointsData = [
  { category: "Academics", points: 120 },
  { category: "Sports", points: 90 },
  { category: "Cultural", points: 80 },
  { category: "Technical", points: 150 },
  { category: "Social", points: 60 },
];

const activities = [
  { icon: "🏆", text: "John Doe won Coding Platform - 1st place", date: "Today, 22:04" },
  { icon: "🏅", text: "Jane Doe earned technical star badge", date: "Today, 16:00" },
  { icon: "✨", text: "You received Extra Credit from Prof. Smith", date: "Today, 13:37" },
  { icon: "📌", text: "Joe Smith participated in the college marathon", date: "2nd Sep 2025, 10:15" },
  { icon: "🏆", text: "Emma Stone won Debate Competition – 2nd Place", date: "2nd Sep 2025, 09:20" },
  { icon: "📌", text: "You participated in Art Exhibition", date: "1st Sep 2025" },
];

export default function DashboardPage() {
  return (
    <Layout activePage="Dashboard">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Points" value="820/1000" progress={82} />
        <StatCard title="Badges Earned" value="5/10" progress={50} />
        <StatCard title="Events Participated" value="8/12" progress={66} />
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Points Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm p-4 col-span-2">
          <h2 className="text-sm font-medium mb-4">Your Points Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pointsData}>
              <defs>
                <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9F9FED" stopOpacity={1} />
                  <stop offset="100%" stopColor="#5B5B87" stopOpacity={1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="points" fill="url(#pointsGradient)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-medium mb-4">Recent Activity</h2>
          <ul className="space-y-4">
            {activities.map((a, i) => (
              <li key={i} className="flex flex-col text-sm">
                <span>{a.icon} {a.text}</span>
                <span className="text-gray-500 text-xs">{a.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}

/* StatCard with gradient */
function StatCard({ title, value, progress }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-xl font-semibold mt-1">{value}</p>
      <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
        <div
          className="h-2 rounded-full"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(to right, #5B5B87, #9F9FED)',
          }}
        ></div>
      </div>
    </div>
  );
}
