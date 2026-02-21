import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Bell, 
  Settings, 
  LogOut, 
  Search, 
  TrendingUp, 
  TrendingDown,
  Smartphone,
  Building2,
  History,
  ShieldCheck,
  MessageSquare,
  Plus,
  X,
  Copy,
  Check
} from 'lucide-react';

// --- Types ---
interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  balance: number;
  status: 'active' | 'suspended' | 'pending';
  joined: string;
  orders: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Strict Route Guard
  if (localStorage.getItem('adminAuth') !== 'true') {
    window.location.replace('/admin');
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    window.location.replace('/admin');
    window.history.pushState(null, '', '/admin');
    window.addEventListener('popstate', function() {
      window.location.replace('/admin');
    });
  };

  const users: UserData[] = [
    { id: 1, name: 'Super Administrator', email: 'admin@dolordprince.com', phone: '08000000000', role: 'superadmin', balance: 0, status: 'active', joined: '2024-01-01', orders: 0 },
    { id: 2, name: 'Chukwuemeka Obi', email: 'chukwu@email.com', phone: '08031234567', role: 'customer', balance: 12500, status: 'active', joined: '2024-02-10', orders: 14 },
    { id: 3, name: 'Amina Bello', email: 'amina@email.com', phone: '07051234567', role: 'agent', balance: 84200, status: 'active', joined: '2024-02-12', orders: 87 },
    { id: 4, name: 'Tunde Adeyemi', email: 'tunde@email.com', phone: '09021234567', role: 'admin', balance: 0, status: 'active', joined: '2024-02-15', orders: 0 },
    { id: 5, name: 'Ngozi Eze', email: 'ngozi@email.com', phone: '08091234567', role: 'customer', balance: 3100, status: 'active', joined: '2024-02-18', orders: 6 },
    { id: 6, name: 'Ibrahim Musa', email: 'ibrahim@email.com', phone: '08161234567', role: 'customer', balance: 800, status: 'suspended', joined: '2024-02-20', orders: 2 },
  ];

  return (
    <div className="min-h-screen bg-[#07070d] text-[#f1f1f8] flex font-['Bricolage_Grotesque']">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-[#12121e] border-r border-white/5 z-50 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-8">
          <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] bg-clip-text text-transparent">
            DOLOR D PRINCE
          </h1>
        </div>

        <nav className="px-4 space-y-8">
          <div>
            <p className="px-4 text-[10px] font-bold text-[#9999b8] uppercase tracking-widest mb-4">Overview</p>
            <NavItem active={activePanel === 'dashboard'} onClick={() => setActivePanel('dashboard')} icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <NavItem active={activePanel === 'activity'} onClick={() => setActivePanel('activity')} icon={<History size={20} />} label="Activity Log" />
          </div>

          <div>
            <p className="px-4 text-[10px] font-bold text-[#9999b8] uppercase tracking-widest mb-4">User Management</p>
            <NavItem active={activePanel === 'users'} onClick={() => setActivePanel('users')} icon={<Users size={20} />} label="All Users" badge="3" />
            <NavItem active={activePanel === 'roles'} onClick={() => setActivePanel('roles')} icon={<ShieldCheck size={20} />} label="Roles" />
          </div>

          <div>
            <p className="px-4 text-[10px] font-bold text-[#9999b8] uppercase tracking-widest mb-4">Finance</p>
            <NavItem active={activePanel === 'bank-accounts'} onClick={() => setActivePanel('bank-accounts')} icon={<Building2 size={20} />} label="Bank Accounts" />
            <NavItem active={activePanel === 'wallets'} onClick={() => setActivePanel('wallets')} icon={<Wallet size={20} />} label="Wallets" />
          </div>

          <div>
            <p className="px-4 text-[10px] font-bold text-[#9999b8] uppercase tracking-widest mb-4">System</p>
            <NavItem active={activePanel === 'settings'} onClick={() => setActivePanel('settings')} icon={<Settings size={20} />} label="Settings" />
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 bg-[#1a1a2a] rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#00d4aa] flex items-center justify-center text-[#07070d] font-black">SA</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">Super Admin</p>
              <p className="text-[10px] text-[#9999b8] truncate">admin@dolor.com</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-[#f43f5e] hover:bg-[#f43f5e]/10 rounded-lg transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Top Nav */}
        <header className="sticky top-0 h-[70px] bg-[#07070d]/80 backdrop-blur-xl border-b border-white/5 px-8 flex items-center justify-between z-40">
          <h2 className="text-lg font-bold capitalize">{activePanel.replace('-', ' ')}</h2>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9999b8]" size={18} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-[#12121e] border border-white/5 rounded-xl py-2 pl-12 pr-4 text-sm w-64 focus:outline-none focus:border-[#00d4aa] transition-colors"
              />
            </div>
            <button className="relative p-2 text-[#9999b8] hover:text-[#f1f1f8] transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00d4aa] rounded-full border-2 border-[#07070d]" />
            </button>
          </div>
        </header>

        {/* Panel Container */}
        <div className="p-8 flex-1">
          {activePanel === 'dashboard' && <DashboardPanel />}
          {activePanel === 'users' && <UsersPanel users={users} />}
          {activePanel === 'settings' && <SettingsPanel />}
          {activePanel !== 'dashboard' && activePanel !== 'users' && activePanel !== 'settings' && (
            <div className="flex flex-col items-center justify-center h-full text-[#9999b8] space-y-4">
              <div className="p-6 bg-[#12121e] rounded-full">
                <LayoutDashboard size={48} className="opacity-20" />
              </div>
              <p className="font-medium">Panel "{activePanel}" is under construction</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function NavItem({ active, icon, label, onClick, badge }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void, badge?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${active ? 'bg-[#00d4aa]/5 text-[#00d4aa]' : 'text-[#9999b8] hover:text-[#f1f1f8] hover:bg-white/5'}`}
    >
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#00d4aa] rounded-r-full" />}
      {icon}
      <span className="text-sm font-medium">{label}</span>
      {badge && <span className="ml-auto bg-[#f43f5e] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
  );
}

function DashboardPanel() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Users" value="12,847" trend="+12%" up={true} icon={<Users size={20} />} />
        <StatCard label="Monthly Revenue" value="₦4.2M" trend="+8%" up={true} icon={<Wallet size={20} />} />
        <StatCard label="Numbers Sold" value="8,341" trend="-2%" up={false} icon={<Smartphone size={20} />} />
        <StatCard label="Pending Approvals" value="3" trend="New" up={true} icon={<History size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#12121e] border border-white/5 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold">Revenue (Last 7 Days)</h3>
            <div className="flex gap-2">
               <div className="w-3 h-3 rounded-full bg-[#00d4aa]" />
               <span className="text-[10px] font-bold text-[#9999b8] uppercase">Growth</span>
            </div>
          </div>
          <div className="h-64 flex items-end gap-4">
            {[65, 40, 85, 55, 90, 70, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="w-full bg-[#00d4aa] rounded-t-xl relative group cursor-pointer"
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1a1a2a] text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₦{(h * 10000).toLocaleString()}
                  </div>
                </motion.div>
                <span className="text-[10px] font-bold text-[#9999b8]">Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#12121e] border border-white/5 rounded-3xl p-8">
          <h3 className="font-bold mb-6">Recent Activity</h3>
          <div className="space-y-6">
            <ActivityItem text="<b>Admin</b> updated permissions" time="2 mins ago" color="#8b5cf6" />
            <ActivityItem text="New user <b>Biodun</b> registered" time="1 hour ago" color="#00d4aa" />
            <ActivityItem text="<b>Admin</b> credited ₦5,000" time="3 hours ago" color="#00d4aa" />
            <ActivityItem text="<b>Ibrahim</b> was suspended" time="Yesterday" color="#f43f5e" />
          </div>
          <button className="w-full mt-8 py-3 rounded-xl bg-white/5 text-sm font-bold hover:bg-white/10 transition-colors">View All Logs</button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, up, icon }: { label: string, value: string, trend: string, up: boolean, icon: React.ReactNode }) {
  return (
    <div className="bg-[#12121e] border border-white/5 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/5 rounded-xl text-[#00d4aa]">{icon}</div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${up ? 'bg-[#00d4aa]/10 text-[#00d4aa]' : 'bg-[#f43f5e]/10 text-[#f43f5e]'}`}>
          {trend}
        </span>
      </div>
      <p className="text-2xl font-black tracking-tight mb-1">{value}</p>
      <p className="text-xs text-[#9999b8] font-medium">{label}</p>
    </div>
  );
}

function ActivityItem({ text, time, color }: { text: string, time: string, color: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
      <div>
        <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />
        <p className="text-[10px] text-[#9999b8] mt-1">{time}</p>
      </div>
    </div>
  );
}

function SettingsPanel() {
  const [price, setPrice] = useState(() => {
    return localStorage.getItem('virtual_number_price') || '1200';
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('virtual_number_price', price);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div className="bg-[#12121e] border border-white/5 rounded-3xl p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <Smartphone className="text-[#00d4aa]" />
          Virtual Number Pricing
        </h3>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#9999b8]">Global Price (₦)</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9999b8] font-bold">₦</div>
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#07070d] border border-white/10 rounded-2xl py-4 pl-10 pr-6 text-white focus:outline-none focus:border-[#00d4aa] transition-colors"
                placeholder="1200"
              />
            </div>
            <p className="text-[10px] text-[#9999b8]">This price will be applied to all virtual number services across the platform.</p>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#00d4aa] text-[#07070d] py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-[#00d4aa]/20 hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Save Settings'}
          </button>

          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-[#00d4aa]/10 border border-[#00d4aa]/20 rounded-2xl flex items-center gap-3 text-[#00d4aa] text-sm"
              >
                <Check size={18} />
                Pricing updated successfully!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-[#12121e] border border-white/5 rounded-3xl p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <ShieldCheck className="text-[#3b82f6]" />
          System Status
        </h3>
        <div className="space-y-4">
          <StatusRow label="API Connection" status="Operational" color="#00d4aa" />
          <StatusRow label="Payment Gateway" status="Operational" color="#00d4aa" />
          <StatusRow label="Database" status="Operational" color="#00d4aa" />
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, status, color }: { label: string, status: string, color: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{status}</span>
      </div>
    </div>
  );
}

function Loader2({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`animate-spin ${className}`}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function UsersPanel({ users }: { users: UserData[] }) {
  return (
    <div className="bg-[#12121e] border border-white/5 rounded-3xl overflow-hidden">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl bg-[#00d4aa] text-[#07070d] text-xs font-bold">All Users</button>
          <button className="px-4 py-2 rounded-xl bg-white/5 text-[#9999b8] text-xs font-bold hover:text-white transition-colors">Customers</button>
          <button className="px-4 py-2 rounded-xl bg-white/5 text-[#9999b8] text-xs font-bold hover:text-white transition-colors">Agents</button>
        </div>
        <button className="bg-[#00d4aa] text-[#07070d] px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
          <Plus size={18} />
          Add User
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-bold text-[#9999b8] uppercase tracking-widest">
              <th className="px-8 py-6">User</th>
              <th className="px-8 py-6">Role</th>
              <th className="px-8 py-6">Wallet</th>
              <th className="px-8 py-6">Status</th>
              <th className="px-8 py-6">Joined</th>
              <th className="px-8 py-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1a1a2a] flex items-center justify-center font-bold text-xs">{user.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-bold">{user.name}</p>
                      <p className="text-[10px] text-[#9999b8]">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                    user.role === 'superadmin' ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]' :
                    user.role === 'admin' ? 'bg-[#3b82f6]/10 text-[#3b82f6]' :
                    'bg-white/5 text-[#9999b8]'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-5 font-bold text-sm">₦{user.balance.toLocaleString()}</td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-[#00d4aa]' : 'bg-[#f43f5e]'}`} />
                    <span className="text-xs font-medium capitalize">{user.status}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-xs text-[#9999b8]">{user.joined}</td>
                <td className="px-8 py-5">
                  <div className="flex gap-2">
                    <button className="p-2 bg-white/5 rounded-lg text-[#9999b8] hover:text-white transition-colors">
                      <Smartphone size={16} />
                    </button>
                    <button className="p-2 bg-white/5 rounded-lg text-[#9999b8] hover:text-white transition-colors">
                      <Settings size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
