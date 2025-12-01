import { useEffect } from 'react';
import { FiUsers, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/common/StatCard';
import Loading from '../../components/common/Loading';
import useDashboardStore from '../../redux/dashboardStore';
import useAuthStore from '../../redux/authStore';
import { formatTime } from '../../utils/dateHelpers';

const ManagerDashboard = () => {
  const { user } = useAuthStore();
  const { managerStats, getManagerDashboard, isLoading } = useDashboardStore();

  useEffect(() => {
    getManagerDashboard();
  }, []);

  if (isLoading || !managerStats) {
    return (
      <Layout>
        <Loading text="Loading dashboard..." />
      </Layout>
    );
  }

  const { overview, absentEmployees, lateArrivals, weeklyTrend, departmentStats } = managerStats;

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

  const pieData = [
    { name: 'Present', value: overview.presentToday },
    { name: 'Absent', value: overview.absentToday },
    { name: 'Late', value: overview.lateToday }
  ].filter(d => d.value > 0);

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Manager Dashboard
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-1">
            Welcome back, {user?.name?.split(' ')[0]}!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total Employees"
            value={overview.totalEmployees}
            icon={FiUsers}
            color="blue"
          />
          <StatCard
            title="Present Today"
            value={overview.presentToday}
            subtitle={`${((overview.presentToday / overview.totalEmployees) * 100).toFixed(0)}%`}
            icon={FiCheckCircle}
            color="green"
          />
          <StatCard
            title="Absent Today"
            value={overview.absentToday}
            icon={FiXCircle}
            color="red"
          />
          <StatCard
            title="Late Today"
            value={overview.lateToday}
            icon={FiAlertCircle}
            color="yellow"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Weekly Trend Chart */}
          <div className="bg-slate-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700/50">
            <h3 className="font-display font-semibold text-base sm:text-lg text-white mb-4">
              Weekly Attendance Trend
            </h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Today's Distribution */}
          <div className="bg-slate-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700/50">
            <h3 className="font-display font-semibold text-base sm:text-lg text-white mb-4">
              Today's Distribution
            </h3>
            <div className="h-48 sm:h-64 flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500">No data available</p>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs sm:text-sm text-slate-400">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs sm:text-sm text-slate-400">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-xs sm:text-sm text-slate-400">Late</span>
              </div>
            </div>
          </div>
        </div>

        {/* Department Stats - Mobile Scrollable */}
        <div className="bg-slate-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700/50">
          <h3 className="font-display font-semibold text-base sm:text-lg text-white mb-4">
            Department-wise Attendance
          </h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis 
                  dataKey="department" 
                  type="category" 
                  stroke="#94a3b8" 
                  width={70} 
                  tick={{ fontSize: 10 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="present" fill="#10b981" stackId="a" />
                <Bar dataKey="absent" fill="#ef4444" stackId="a" />
                <Bar dataKey="late" fill="#f59e0b" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row - Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Absent Employees */}
          <div className="bg-slate-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700/50">
            <h3 className="font-display font-semibold text-base sm:text-lg text-white mb-4">
              Absent Today ({absentEmployees.length})
            </h3>
            <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
              {absentEmployees.length > 0 ? (
                absentEmployees.map((employee, index) => (
                  <div key={index} className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-700/30 rounded-lg sm:rounded-xl">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-semibold text-xs sm:text-sm flex-shrink-0">
                        {employee.name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">{employee.name}</p>
                        <p className="text-slate-400 text-xs truncate">{employee.employeeId}</p>
                      </div>
                    </div>
                    <span className="text-slate-500 text-xs hidden sm:block">{employee.department}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4 text-sm">All employees are present! 🎉</p>
              )}
            </div>
          </div>

          {/* Late Arrivals */}
          <div className="bg-slate-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700/50">
            <h3 className="font-display font-semibold text-base sm:text-lg text-white mb-4">
              Late Arrivals Today ({lateArrivals.length})
            </h3>
            <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
              {lateArrivals.length > 0 ? (
                lateArrivals.map((employee, index) => (
                  <div key={index} className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-700/30 rounded-lg sm:rounded-xl">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-semibold text-xs sm:text-sm flex-shrink-0">
                        {employee.name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">{employee.name}</p>
                        <p className="text-slate-400 text-xs truncate">{employee.employeeId}</p>
                      </div>
                    </div>
                    <span className="text-amber-400 text-xs flex-shrink-0">{formatTime(employee.checkInTime)}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4 text-sm">No late arrivals today! 👏</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManagerDashboard;