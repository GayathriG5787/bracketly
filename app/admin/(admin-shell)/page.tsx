// "use client"

// import React, { useEffect, useState } from "react"
// import { createClient } from "@supabase/supabase-js"
// import { 
//   Users, 
//   Trophy, 
//   TrendingUp, 
//   Loader2, 
//   PieChart, 
//   Activity 
// } from "lucide-react"
// import {
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   Tooltip, 
//   ResponsiveContainer,
//   LineChart, 
//   Line, 
//   PieChart as RePie, 
//   Pie, 
//   Cell, 
//   Legend
// } from 'recharts'

// // --- TYPES ---
// interface RegHistoryData {
//   day: string;
//   count: number;
// }

// interface StatusDistData {
//   name: string;
//   value: number;
// }

// interface DashboardStats {
//   tournaments: number;
//   players: number;
//   registrations: number;
// }

// // Initialize Supabase
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// )

// const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

// // --- DUMMY DATA FOR VISUALIZATION ---
// const DUMMY_REG_HISTORY: RegHistoryData[] = [
//   { day: "Mon", count: 12 },
//   { day: "Tue", count: 19 },
//   { day: "Wed", count: 15 },
//   { day: "Thu", count: 22 },
//   { day: "Fri", count: 30 },
//   { day: "Sat", count: 25 },
//   { day: "Sun", count: 18 },
// ];

// const DUMMY_STATUS_DIST: StatusDistData[] = [
//   { name: "Approved", value: 45 },
//   { name: "Pending", value: 25 },
//   { name: "Waitlisted", value: 15 },
//   { name: "Rejected", value: 5 },
// ];

// export default function AdminDashboard() {
//   const [loading, setLoading] = useState(true)
//   const [stats, setStats] = useState<DashboardStats>({
//     tournaments: 0,
//     players: 0,
//     registrations: 0,
//   })
  
//   const [charts, setCharts] = useState<{
//     regHistory: RegHistoryData[];
//     statusDist: StatusDistData[];
//   }>({
//     regHistory: [],
//     statusDist: [],
//   })

//   useEffect(() => {
//     async function fetchDashboardData() {
//       try {
//         setLoading(true)
        
//         // 1. Fetch REAL Basic Counts from DB
//         const [tournaments, players, regs] = await Promise.all([
//           supabase.from('tournaments').select('*', { count: 'exact', head: true }),
//           supabase.from('players').select('*', { count: 'exact', head: true }),
//           supabase.from('registrations').select('*', { count: 'exact', head: true }),
//         ])

//         setStats({
//           tournaments: tournaments.count || 0,
//           players: players.count || 0,
//           registrations: regs.count || 0
//         })

//         // 2. Set DUMMY data for charts (to showcase the UI)
//         setCharts({
//           regHistory: DUMMY_REG_HISTORY,
//           statusDist: DUMMY_STATUS_DIST
//         })

//       } catch (error) {
//         console.error("Dashboard Error:", error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchDashboardData()
//   }, [])

//   if (loading) return (
//     <div className="h-96 flex flex-col items-center justify-center text-slate-400">
//       <Loader2 className="animate-spin mb-2" size={32} />
//       <p className="text-sm font-medium">Analyzing data...</p>
//     </div>
//   )

//   return (
//     <div className="max-w-7xl mx-auto p-4">
//       <div className="mb-10">
//         <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics Dashboard</h1>
//         <p className="text-slate-500 text-sm mt-1">Real-time platform performance and user engagement.</p>
//       </div>

//       {/* --- REAL DATA STAT CARDS --- */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//         {[
//           { label: "Total Players", val: stats.players, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
//           { label: "Active Tournaments", val: stats.tournaments, icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
//           { label: "Total Enrollments", val: stats.registrations, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
//         ].map((s, i) => (
//           <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-slate-200 flex items-center gap-5 shadow-sm">
//             <div className={`p-4 rounded-2xl ${s.bg} ${s.color}`}>
//               <s.icon size={24} />
//             </div>
//             <div>
//               <p className="text-sm text-slate-500 font-medium">{s.label}</p>
//               <h2 className="text-2xl font-bold text-slate-900">{s.val.toLocaleString()}</h2>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* --- DUMMY DATA CHARTS SECTION --- */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
//         {/* Registration Trend - Line Chart */}
//         <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
//           <div className="flex items-center gap-3 mb-8">
//             <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
//               <Activity size={18} />
//             </div>
//             <div>
//               <h3 className="font-bold text-slate-800">Registration Activity (7D)</h3>
//               <p className="text-xs text-slate-400 font-medium">Weekly growth trends</p>
//             </div>
//           </div>
//           <div className="h-[300px] w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={charts.regHistory}>
//                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                 <XAxis 
//                   dataKey="day" 
//                   axisLine={false} 
//                   tickLine={false} 
//                   tick={{fill: '#94a3b8', fontSize: 12}} 
//                   dy={10}
//                 />
//                 <YAxis 
//                   axisLine={false} 
//                   tickLine={false} 
//                   tick={{fill: '#94a3b8', fontSize: 12}} 
//                 />
//                 <Tooltip 
//                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
//                 />
//                 <Line 
//                   type="monotone" 
//                   dataKey="count" 
//                   stroke="#6366f1" 
//                   strokeWidth={4} 
//                   dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} 
//                   activeDot={{ r: 6, strokeWidth: 0 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Status Distribution - Donut Chart */}
//         <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
//           <div className="flex items-center gap-3 mb-8">
//             <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
//               <PieChart size={18} />
//             </div>
//             <div>
//               <h3 className="font-bold text-slate-800">Enrollment Status</h3>
//               <p className="text-xs text-slate-400 font-medium">Breakdown of all entries</p>
//             </div>
//           </div>
//           <div className="h-[300px] w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <RePie>
//                 <Pie
//                   data={charts.statusDist}
//                   innerRadius={70}
//                   outerRadius={100}
//                   paddingAngle={8}
//                   dataKey="value"
//                   stroke="none"
//                 >
//                   {charts.statusDist.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip 
//                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
//                 />
//                 <Legend 
//                   verticalAlign="bottom" 
//                   align="center"
//                   iconType="circle"
//                   wrapperStyle={{ paddingTop: '20px' }}
//                 />
//               </RePie>
//             </ResponsiveContainer>
//           </div>
//         </div>

//       </div>
//     </div>
//   )
// }

"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { 
  Users, 
  Trophy, 
  TrendingUp, 
  Loader2, 
  PieChart, 
  Activity,
  Filter
} from "lucide-react"
import {
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart, 
  Line, 
  PieChart as RePie, 
  Pie, 
  Cell, 
  Legend
} from 'recharts'

// --- TYPES ---
interface RegHistoryData {
  day: string;
  count: number;
}

interface StatusDistData {
  name: string;
  value: number;
}

interface DashboardStats {
  tournaments: number;
  players: number;
  registrations: number;
}

interface TournamentOption {
  id: string;
  name: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Green for Approved, Amber for Pending
const COLORS = ['#10b981', '#f59e0b', '#6366f1', '#ef4444'];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    tournaments: 0,
    players: 0,
    registrations: 0,
  })
  
  const [charts, setCharts] = useState<{
    regHistory: RegHistoryData[];
    statusDist: StatusDistData[];
  }>({
    regHistory: [],
    statusDist: [],
  })

  const [tournaments, setTournaments] = useState<TournamentOption[]>([])
  const [selectedTournament, setSelectedTournament] = useState<string>("all")

  // --- DATA PROCESSING HELPERS ---
  const processHistory = (data: any[]): RegHistoryData[] => {
    const groups = data.reduce((acc: any, curr) => {
      if (!curr.created_at) return acc;
      const date = new Date(curr.created_at).toLocaleDateString('en-US', { weekday: 'short' })
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})
    
    // Simple sort for weekdays
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days
      .filter(d => groups[d])
      .map(day => ({ day, count: groups[day] }))
  }

  const processStatus = (data: any[]): StatusDistData[] => {
    const groups = data.reduce((acc: any, curr) => {
      // Map boolean 'approved' to readable labels
      const label = curr.approved === true ? 'Approved' : 'Pending';
      acc[label] = (acc[label] || 0) + 1
      return acc
    }, {})
    return Object.keys(groups).map(name => ({ name, value: groups[name] }))
  }

  // Initial load of counts and tournament list
  useEffect(() => {
    async function fetchMetadata() {
      try {
        const [tList, tCount, pCount, rCount] = await Promise.all([
          supabase.from('tournaments').select('id, name'),
          supabase.from('tournaments').select('*', { count: 'exact', head: true }),
          supabase.from('players').select('*', { count: 'exact', head: true }),
          supabase.from('registrations').select('*', { count: 'exact', head: true }),
        ])

        if (tList.data) setTournaments(tList.data)
        setStats({
          tournaments: tCount.count || 0,
          players: pCount.count || 0,
          registrations: rCount.count || 0
        })
      } catch (error) {
        console.error("Metadata fetch error:", error)
      }
    }
    fetchMetadata()
  }, [])

  // Chart data fetcher
  useEffect(() => {
    async function fetchChartData() {
      try {
        setLoading(true)
        
        // Fetching 'approved' boolean column instead of 'status' string
        let query = supabase
          .from('registrations')
          .select('created_at, approved, tournament_id')

        if (selectedTournament !== "all") {
          query = query.eq('tournament_id', selectedTournament)
        }

        const { data: regData, error } = await query

        if (error) throw error;

        if (regData && regData.length > 0) {
          setCharts({
            regHistory: processHistory(regData),
            statusDist: processStatus(regData)
          })
        } else {
          setCharts({ regHistory: [], statusDist: [] })
        }
      } catch (error) {
        console.error("Chart data error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [selectedTournament])

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Reviewing platform-wide enrollment and approvals.</p>
        </div>

        {/* --- TOURNAMENT SELECTOR --- */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 p-2 rounded-xl shadow-sm">
          <Filter size={18} className="text-slate-400 ml-2" />
          <select 
            value={selectedTournament}
            onChange={(e) => setSelectedTournament(e.target.value)}
            className="text-sm font-semibold bg-transparent border-none focus:ring-0 cursor-pointer text-slate-700 min-w-[200px] outline-none"
          >
            <option value="all">All Tournaments</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: "Total Players", val: stats.players, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Active Tournaments", val: stats.tournaments, icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Total Enrollments", val: stats.registrations, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-slate-200 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-2xl ${s.bg} ${s.color}`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{s.label}</p>
              <h2 className="text-2xl font-bold text-slate-900">{s.val.toLocaleString()}</h2>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p className="text-sm font-medium">Fetching chart data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Enrollment Timeline */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                <Activity size={18} />
              </div>
              <h3 className="font-bold text-slate-800">Enrollment Timeline</h3>
            </div>
            <div className="h-[300px] w-full">
              {charts.regHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.regHistory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">No time-series data found for this selection.</div>
              )}
            </div>
          </div>

          {/* Approval Distribution */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                <PieChart size={18} />
              </div>
              <h3 className="font-bold text-slate-800">Approval Status</h3>
            </div>
            <div className="h-[300px] w-full">
              {charts.statusDist.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RePie>
                    <Pie data={charts.statusDist} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                      {charts.statusDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  </RePie>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">No approval data found.</div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}