import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  MessageSquare, 
  Instagram, 
  Facebook, 
  Send, 
  Music2, 
  LayoutGrid,
  Home,
  History,
  CreditCard,
  User,
  ChevronRight,
  Smartphone,
  Loader2,
  HeadphonesIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom';
import OTPScreen from './components/OTPScreen';
import AddMoneyModal from './components/AddMoneyModal';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import UserLogin from './components/UserLogin';

// --- Types ---
interface Service {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  apiName: string;
}

interface Order {
  id: string;
  service: string;
  number: string;
  status: 'active' | 'completed' | 'expired';
  price: string;
  time: string;
}



// --- Components ---

const ServiceCard = ({ service, onClick, loading }: { service: Service; onClick: () => void; loading: boolean; key?: React.Key }) => (
  <motion.div 
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl glass-card cursor-pointer relative overflow-hidden"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 text-white`}>
      {loading ? <Loader2 size={24} className="animate-spin text-app-accent" /> : service.icon}
    </div>
    <span className="text-xs font-medium text-white/70">{service.name}</span>
  </motion.div>
);

const OrderItem = ({ order, onClick }: { order: Order; onClick?: () => void; key?: React.Key }) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between p-4 mb-3 rounded-2xl glass-card cursor-pointer hover:bg-white/5 transition-colors"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-app-accent/10 flex items-center justify-center text-app-accent">
        <Smartphone size={20} />
      </div>
      <div>
        <h4 className="text-sm font-semibold">{order.service}</h4>
        <p className="text-xs text-white/50">{order.number}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-bold text-app-accent">₦{order.price}</p>
      <p className="text-[10px] text-white/40 uppercase tracking-wider">{order.time}</p>
    </div>
  </div>
);

// --- Auth Guards ---
function AdminGuard({ children }: { children: React.ReactNode }) {
  const isAdmin = localStorage.getItem('adminAuth') === 'true';
  const isUser = localStorage.getItem('userAuth') === 'true';

  if (!isAdmin) {
    if (isUser) return <Navigate to="/login" replace />;
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

function UserGuard({ children }: { children: React.ReactNode }) {
  const isAdmin = localStorage.getItem('adminAuth') === 'true';
  const isUser = localStorage.getItem('userAuth') === 'true';

  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (!isUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminGuard>
              <AdminDashboard />
            </AdminGuard>
          } 
        />

        {/* User Routes */}
        <Route path="/login" element={<UserLogin />} />
        <Route 
          path="/*" 
          element={
            <UserGuard>
              <UserApp />
            </UserGuard>
          } 
        />
      </Routes>
    </Router>
  );
}

function UserApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [view, setView] = useState<'dashboard' | 'otp' | 'more_services' | 'account_settings' | 'transactions'>('dashboard');
  const [buyingService, setBuyingService] = useState<string | null>(null);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [balance, setBalance] = useState(24500);
  
  const globalPrice = parseInt(localStorage.getItem('virtual_number_price') || '1200');

  // Active Order State
  const [activeOrder, setActiveOrder] = useState<{
    id: string;
    phone: string;
    service: string;
    price: string;
  } | null>(null);

  const services: Service[] = [
    { id: 'wa', name: 'WhatsApp', icon: <MessageSquare size={24} />, color: '#25D366', apiName: 'whatsapp' },
    { id: 'ig', name: 'Instagram', icon: <Instagram size={24} />, color: '#E4405F', apiName: 'instagram' },
    { id: 'fb', name: 'Facebook', icon: <Facebook size={24} />, color: '#1877F2', apiName: 'facebook' },
    { id: 'tg', name: 'Telegram', icon: <Send size={24} />, color: '#0088cc', apiName: 'telegram' },
    { id: 'tk', name: 'TikTok', icon: <Music2 size={24} />, color: '#000000', apiName: 'tiktok' },
    { id: 'more', name: 'More', icon: <LayoutGrid size={24} />, color: '#ffffff', apiName: 'other' },
  ];

  const [recentOrders, setRecentOrders] = useState<Order[]>([
    { id: '1', service: 'WhatsApp (USA)', number: '+1 (202) 555-0123', status: 'active', price: '1,200', time: '2 MINS AGO' },
    { id: '2', service: 'Telegram (UK)', number: '+44 7700 900123', status: 'completed', price: '850', time: '1 HOUR AGO' },
    { id: '3', service: 'Instagram (NG)', number: '+234 801 234 5678', status: 'expired', price: '400', time: '5 HOURS AGO' },
  ]);

  const buyNumber = async (service: Service) => {
    if (service.id === 'more') {
      setView('more_services');
      return;
    }

    if (balance < globalPrice) {
      alert("Insufficient balance. Please add money to your wallet.");
      setIsAddMoneyOpen(true);
      return;
    }

    setBuyingService(service.id);
    try {
      const response = await fetch(`/api/5sim/buy/${service.apiName}`);

      if (!response.ok) throw new Error('Failed to buy number');

      const data = await response.json();
      
      const newOrder: Order = {
        id: data.id.toString(),
        service: `${service.name} (Russia)`,
        number: data.phone,
        status: 'active',
        price: globalPrice.toLocaleString(),
        time: 'JUST NOW'
      };

      setRecentOrders(prev => [newOrder, ...prev]);
      
      setActiveOrder({
        id: data.id.toString(),
        phone: data.phone,
        service: service.name,
        price: globalPrice.toLocaleString()
      });
      
      setBalance(prev => prev - globalPrice);
      setView('otp');
    } catch (error) {
      alert("Failed to purchase number. Please check your balance.");
    } finally {
      setBuyingService(null);
    }
  };

  const handleAddMoneySuccess = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const contactCustomerService = () => {
    window.open('https://wa.me/2349121585744', '_blank');
  };

  if (view === 'more_services') {
    const moreServices: Service[] = [
      { id: 'wa', name: 'WhatsApp', icon: <MessageSquare size={24} />, color: '#25D366', apiName: 'whatsapp' },
      { id: 'ig', name: 'Instagram', icon: <Instagram size={24} />, color: '#E4405F', apiName: 'instagram' },
      { id: 'fb', name: 'Facebook', icon: <Facebook size={24} />, color: '#1877F2', apiName: 'facebook' },
      { id: 'tg', name: 'Telegram', icon: <Send size={24} />, color: '#0088cc', apiName: 'telegram' },
      { id: 'tk', name: 'TikTok', icon: <Music2 size={24} />, color: '#000000', apiName: 'tiktok' },
      { id: 'tw', name: 'Twitter', icon: <LayoutGrid size={24} />, color: '#1DA1F2', apiName: 'twitter' },
      { id: 'go', name: 'Google', icon: <LayoutGrid size={24} />, color: '#4285F4', apiName: 'google' },
      { id: 'nf', name: 'Netflix', icon: <LayoutGrid size={24} />, color: '#E50914', apiName: 'netflix' },
      { id: 'sp', name: 'Spotify', icon: <LayoutGrid size={24} />, color: '#1DB954', apiName: 'spotify' },
      { id: 'am', name: 'Amazon', icon: <LayoutGrid size={24} />, color: '#FF9900', apiName: 'amazon' },
      { id: 'sc', name: 'Snapchat', icon: <LayoutGrid size={24} />, color: '#FFFC00', apiName: 'snapchat' },
      { id: 'li', name: 'LinkedIn', icon: <LayoutGrid size={24} />, color: '#0077B5', apiName: 'linkedin' },
    ];

    return (
      <div className="min-h-screen bg-app-bg text-white p-6 max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView('dashboard')} className="w-10 h-10 rounded-full glass-card flex items-center justify-center">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <h3 className="text-xl font-bold">All Services</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {moreServices.map(service => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              onClick={() => buyNumber(service)}
              loading={buyingService === service.id}
            />
          ))}
        </div>
      </div>
    );
  }

  if (view === 'account_settings') {
    return (
      <div className="min-h-screen bg-app-bg text-white p-6 max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView('dashboard')} className="w-10 h-10 rounded-full glass-card flex items-center justify-center">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <h3 className="text-xl font-bold">Account Settings</h3>
        </div>
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Full Name</p>
              <p className="font-bold">David Prince</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Phone Number</p>
              <p className="font-bold">08116457480</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Email Address</p>
              <p className="font-bold">david@prince.com</p>
            </div>
          </div>
          <button className="w-full py-4 rounded-2xl bg-app-accent text-white font-bold">Update Profile</button>
          <button className="w-full py-4 rounded-2xl bg-white/5 text-white font-bold">Change Password</button>
        </div>
      </div>
    );
  }

  if (view === 'transactions') {
    return (
      <div className="min-h-screen bg-app-bg text-white p-6 max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView('dashboard')} className="w-10 h-10 rounded-full glass-card flex items-center justify-center">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <h3 className="text-xl font-bold">Transaction History</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl glass-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Plus size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">Wallet Top-up</p>
                <p className="text-[10px] text-white/40">Opay • Today</p>
              </div>
            </div>
            <p className="font-bold text-emerald-500">+₦5,000</p>
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl glass-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <Smartphone size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">WhatsApp Number</p>
                <p className="text-[10px] text-white/40">5SIM • Yesterday</p>
              </div>
            </div>
            <p className="font-bold text-red-500">-₦{globalPrice.toLocaleString()}</p>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'otp' && activeOrder) {
    return (
      <OTPScreen 
        orderID={activeOrder.id}
        phoneNumber={activeOrder.phone}
        serviceName={activeOrder.service}
        price={activeOrder.price}
        onBack={() => setView('dashboard')}
        onNewNumber={() => setView('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-white flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-app-accent/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[20%] left-[-10%] w-48 h-48 bg-app-accent/5 rounded-full blur-[80px]" />

      {/* Top Bar */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between z-10">
        <div>
          <h1 className="text-xl font-black tracking-tighter text-white">
            DOLOR D <span className="text-app-accent">PRINCE</span>
          </h1>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Virtual Numbers</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={contactCustomerService}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center relative"
          >
            <HeadphonesIcon size={20} className="text-white/80" />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center relative"
          >
            <Bell size={20} className="text-white/80" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-app-accent rounded-full border-2 border-app-bg" />
          </motion.button>
        </div>
      </header>

      <main className="flex-1 px-6 pb-24 overflow-y-auto z-10">
        {activeTab === 'home' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Wallet Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="teal-gradient p-6 rounded-[32px] mt-4 mb-8 shadow-2xl shadow-app-accent/20 relative overflow-hidden glow-accent"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <CreditCard size={120} strokeWidth={1} />
              </div>
              
              <div className="relative z-10">
                <p className="text-white/70 text-sm font-medium mb-1">Total Balance</p>
                <h2 className="text-4xl font-bold mb-6">₦{balance.toLocaleString()}.00</h2>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsAddMoneyOpen(true)}
                  className="bg-white text-app-accent px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg"
                >
                  <Plus size={18} />
                  Add Money
                </motion.button>
              </div>
            </motion.div>

            {/* Services Grid */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Services</h3>
                <button 
                  onClick={() => setView('more_services')}
                  className="text-app-accent text-sm font-medium flex items-center gap-1"
                >
                  View All <ChevronRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {services.map(service => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    onClick={() => buyNumber(service)}
                    loading={buyingService === service.id}
                  />
                ))}
              </div>
            </section>

            {/* Recent Orders */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Recent Orders</h3>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-white/40 text-sm font-medium"
                >
                  History
                </button>
              </div>
              <div>
                {recentOrders.slice(0, 3).map(order => (
                  <OrderItem key={order.id} order={order} />
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
            <h3 className="text-2xl font-bold mb-6">Order History</h3>
            {recentOrders.map(order => (
              <OrderItem key={order.id} order={order} />
            ))}
          </motion.div>
        )}

        {activeTab === 'wallet' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
            <h3 className="text-2xl font-bold mb-6">My Wallet</h3>
            <div className="glass-card p-8 rounded-[32px] text-center mb-8">
              <p className="text-white/40 text-sm mb-2">Available Balance</p>
              <h2 className="text-5xl font-black text-app-accent mb-8">₦{balance.toLocaleString()}</h2>
              <button 
                onClick={() => setIsAddMoneyOpen(true)}
                className="w-full py-4 rounded-2xl bg-app-accent text-white font-bold"
              >
                Add Funds
              </button>
            </div>
            
            <h4 className="font-bold mb-4">Transaction History</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl glass-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Plus size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Wallet Top-up</p>
                    <p className="text-[10px] text-white/40">Opay • Today</p>
                  </div>
                </div>
                <p className="font-bold text-emerald-500">+₦5,000</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4 pb-12">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-app-accent/20 flex items-center justify-center text-app-accent mb-4 border-2 border-app-accent/30">
                <User size={48} />
              </div>
              <h3 className="text-2xl font-bold">David Prince</h3>
              <p className="text-white/40 text-sm">8116457480 • Opay</p>
            </div>

            {/* Manual Account Details Card */}
            <div className="glass-card p-6 rounded-3xl mb-8 border border-app-accent/10">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Manual Account Details</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">Full Name</span>
                  <span className="font-bold text-sm">David Prince</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">Account Number</span>
                  <span className="font-bold text-sm">8116457480</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">Bank</span>
                  <span className="font-bold text-sm text-app-accent">Opay</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <ProfileItem icon={<User size={20} />} label="Account Settings" onClick={() => setView('account_settings')} />
              <ProfileItem icon={<CreditCard size={20} />} label="Payment Methods" onClick={() => setIsAddMoneyOpen(true)} />
              <ProfileItem icon={<History size={20} />} label="Transaction History" onClick={() => setView('transactions')} />
              <ProfileItem icon={<HeadphonesIcon size={20} />} label="Support" onClick={contactCustomerService} />
              <div className="pt-4">
                <button 
                  onClick={() => {
                    localStorage.removeItem('userAuth');
                    window.location.href = '/login';
                  }}
                  className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 font-bold"
                >
                  Log Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-app-bg/80 backdrop-blur-xl border-t border-white/5 px-8 py-4 flex items-center justify-between z-20">
        <NavButton 
          active={activeTab === 'home'} 
          onClick={() => { setActiveTab('home'); setView('dashboard'); }} 
          icon={<Home size={24} />} 
          label="Home" 
        />
        <NavButton 
          active={activeTab === 'orders'} 
          onClick={() => { setActiveTab('orders'); setView('dashboard'); }} 
          icon={<History size={24} />} 
          label="Orders" 
        />
        <NavButton 
          active={activeTab === 'wallet'} 
          onClick={() => { setActiveTab('wallet'); setView('dashboard'); }} 
          icon={<CreditCard size={24} />} 
          label="Wallet" 
        />
        <NavButton 
          active={activeTab === 'profile'} 
          onClick={() => { setActiveTab('profile'); setView('dashboard'); }} 
          icon={<User size={24} />} 
          label="Profile" 
        />
      </nav>

      <AddMoneyModal 
        isOpen={isAddMoneyOpen}
        onClose={() => setIsAddMoneyOpen(false)}
        onSuccess={handleAddMoneySuccess}
      />
    </div>
  );
}

function ProfileItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-2xl glass-card hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="text-app-accent">{icon}</div>
        <span className="font-bold text-sm">{label}</span>
      </div>
      <ChevronRight size={16} className="text-white/20" />
    </button>
  );
}

const NavButton = ({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-app-accent' : 'text-white/40'}`}
  >
    <motion.div
      animate={active ? { y: -2 } : { y: 0 }}
    >
      {icon}
    </motion.div>
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    {active && (
      <motion.div 
        layoutId="nav-indicator"
        className="w-1 h-1 bg-app-accent rounded-full mt-0.5"
      />
    )}
  </button>
);
