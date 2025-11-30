import { useState } from 'react';
import { FiUser, FiMail, FiBriefcase, FiHash, FiPhone, FiEdit2, FiSave } from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import useAuthStore from '../redux/authStore';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile(formData);
    if (result.success) {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-white">My Profile</h1>
          <p className="text-slate-400 mt-1">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600" />
          
          {/* Profile Content */}
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-slate-800">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 pb-2">
                <h2 className="text-2xl font-display font-bold text-white">{user?.name}</h2>
                <p className="text-slate-400">{user?.email}</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors flex items-center gap-2"
              >
                {isEditing ? <FiSave className="w-4 h-4" /> : <FiEdit2 className="w-4 h-4" />}
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 rounded-xl font-semibold text-white gradient-primary hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              ) : (
                <>
                  <div className="p-4 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                      <FiHash className="w-4 h-4" />
                      <span className="text-sm">Employee ID</span>
                    </div>
                    <p className="text-white font-medium">{user?.employeeId}</p>
                  </div>
                  
                  <div className="p-4 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                      <FiMail className="w-4 h-4" />
                      <span className="text-sm">Email Address</span>
                    </div>
                    <p className="text-white font-medium">{user?.email}</p>
                  </div>
                  
                  <div className="p-4 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                      <FiBriefcase className="w-4 h-4" />
                      <span className="text-sm">Department</span>
                    </div>
                    <p className="text-white font-medium">{user?.department}</p>
                  </div>
                  
                  <div className="p-4 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                      <FiUser className="w-4 h-4" />
                      <span className="text-sm">Role</span>
                    </div>
                    <p className="text-white font-medium capitalize">{user?.role}</p>
                  </div>

                  <div className="p-4 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                      <FiPhone className="w-4 h-4" />
                      <span className="text-sm">Phone Number</span>
                    </div>
                    <p className="text-white font-medium">{user?.phone || 'Not provided'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-display font-semibold text-lg text-white mb-4">Account Information</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-700/50">
              <span className="text-slate-400">Account Created</span>
              <span className="text-white">{new Date(user?.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-700/50">
              <span className="text-slate-400">Account Status</span>
              <span className="text-emerald-400">Active</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
