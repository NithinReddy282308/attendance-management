import { useEffect, useState } from "react";
import {
  FiMonitor,
  FiSmartphone,
  FiGlobe,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";
import Layout from "../../components/layout/Layout";
import Loading from "../../components/common/Loading";
import api from "../../utils/api";

const LoginMonitoring = () => {
  const [loginHistory, setLoginHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchLoginHistory();
    // eslint-disable-next-line
  }, [filter]);

  const fetchLoginHistory = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filter !== "all") params.status = filter;

      const response = await api.get("/auth/login-history", { params });
      setLoginHistory(response.data.data || []);
      setStats(response.data.stats || null);
    } catch (error) {
      console.error("Error fetching login history:", error);
    }
    setIsLoading(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDeviceIcon = (device = "") => {
    const d = String(device).toLowerCase();

    if (d.includes("mobile") || d.includes("android") || d.includes("iphone") || d.includes("ipad")) {
      return <FiSmartphone className="w-5 h-5" />;
    }
    return <FiMonitor className="w-5 h-5" />;
  };

  const getDeviceLabel = (device = "") => {
    const d = String(device).toLowerCase();
    if (d.includes("iphone")) return "iPhone";
    if (d.includes("ipad")) return "iPad";
    if (d.includes("android")) return "Android";
    if (d.includes("mobile")) return "Mobile";
    if (d.includes("mac")) return "Mac";
    if (d.includes("windows")) return "Windows PC";
    return device || "Unknown";
  };

  if (isLoading) {
    return (
      <Layout>
        <Loading text="Loading login history..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Login Monitoring</h1>
          <p className="text-slate-400 mt-1">Track all user login activities</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <FiCheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">{stats.totalLogins}</p>
                  <p className="text-sm text-emerald-400/70">Total Successful Logins</p>
                </div>
              </div>
            </div>

            <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <FiXCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">{stats.failedLogins}</p>
                  <p className="text-sm text-red-400/70">Failed Attempts</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <FiClock className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">{stats.todayLogins}</p>
                  <p className="text-sm text-blue-400/70">Today's Logins</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("success")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "success" ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Successful
          </button>
          <button
            onClick={() => setFilter("failed")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "failed" ? "bg-red-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Failed
          </button>
        </div>

        {/* Table */}
        {/* Table */}
<div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
  <h3 className="font-semibold text-white mb-4">Login History ({loginHistory.length} records)</h3>

  <div className="overflow-x-auto">
    <table className="w-full table-auto min-w-[900px]">
      <thead>
        <tr className="text-left text-slate-400 text-sm">
          <th className="pb-3 pr-4 pl-2 font-medium border-r border-slate-700/30">User</th>
          <th className="pb-3 pr-4 font-medium border-r border-slate-700/30">IP Address</th>
          <th className="pb-3 pr-4 font-medium border-r border-slate-700/30">Device</th>
          <th className="pb-3 pr-4 font-medium border-r border-slate-700/30">Browser</th>
          <th className="pb-3 pr-4 font-medium border-r border-slate-700/30">Login Time</th>
          <th className="pb-3 pl-4 font-medium">Status</th>
        </tr>
      </thead>

      <tbody className="text-slate-300 divide-y divide-slate-700/40">
        {loginHistory.length > 0 ? (
          loginHistory.map((record, index) => (
            <tr key={index} className="last:border-0">
              {/* User */}
              <td className="py-4 pl-2 pr-4 align-top">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold text-sm shrink-0">
                    {record.userId?.name?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white">{record.userId?.name || "Unknown"}</p>
                    <p className="text-xs text-slate-500">{record.userId?.email || ""}</p>
                  </div>
                </div>
              </td>

              {/* IP Address: allow wrapping / full visibility */}
              <td className="py-4 pr-4 align-top">
                <div className="flex items-center gap-2">
                  <FiGlobe className="w-4 h-4 text-slate-500 shrink-0" />
                  <span
                    className="font-mono text-sm break-all"
                    title={Array.isArray(record.ipAddress) ? record.ipAddress.join(', ') : record.ipAddress}
                  >
                    {Array.isArray(record.ipAddress) ? record.ipAddress.join(', ') : record.ipAddress}
                  </span>
                </div>
              </td>

              {/* Device */}
              <td className="py-4 pr-4 align-top">
                <div className="flex items-center gap-2">
                  {getDeviceIcon(record.device)}
                  <span className="text-sm text-slate-300 whitespace-nowrap" title={record.device}>
                    {getDeviceLabel(record.device)}
                  </span>
                </div>
              </td>

              {/* Browser */}
              <td className="py-4 pr-4 align-top">
                <span className="text-sm" title={record.browser}>
                  {record.browser}
                </span>
              </td>

              {/* Login Time */}
              <td className="py-4 pr-4 align-top text-sm">
                {formatDate(record.loginTime)}
              </td>

              {/* Status */}
              <td className="py-4 pl-4 align-top">
                {record.status === "success" ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">
                    Success
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                    Failed
                  </span>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="py-8 text-center text-slate-500">
              No login records found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>


export default LoginMonitoring;
