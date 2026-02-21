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
  HeadphonesIcon,
  Search,
  X,
  ChevronDown,
  Globe,
  Star,
  Check
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
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserLogin from './components/UserLogin';
import { SERVICE_CATALOG } from './constants';
import { Analytics } from '@vercel/analytics/react';

// --- Types ---
interface Service {
  id: string;
  name: string;
  icon?: React.ReactNode;
  color?: string;
  apiName: string;
  price: number;
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

const ServiceCard = ({ service, onClick, loading, availableCount = 45 }: { service: Service; onClick: () => void | Promise<void>; loading: boolean; availableCount?: number; key?: React.Key }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="flex flex-col p-4 rounded-2xl glass-card relative overflow-hidden h-full"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 text-white">
        {service.icon || <Smartphone size={20} />}
      </div>
      {availableCount === 0 ? (
        <span className="text-[8px] font-bold bg-white/10 text-white/40 px-2 py-0.5 rounded-full uppercase tracking-tighter">Out of Stock</span>
      ) : (
        <span className="text-[8px] font-bold bg-app-accent/10 text-app-accent px-2 py-0.5 rounded-full uppercase tracking-tighter">{availableCount} Available</span>
      )}
    </div>
    
    <h4 className="text-xs font-bold text-white mb-1 truncate">{service.name}</h4>
    <p className="text-xs font-black text-app-accent mb-4">₦{service.price.toLocaleString()}</p>
    
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={loading}
      className={`mt-auto w-full py-2 rounded-xl text-[10px] font-bold transition-all ${
        availableCount === 0 
          ? 'bg-white/5 text-white/20 hover:bg-white/10' 
          : 'bg-app-accent/10 text-app-accent hover:bg-app-accent hover:text-white'
      }`}
    >
      {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : availableCount === 0 ? 'Notify Me' : 'Buy Number'}
    </button>
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
      <p className="text-sm font-bold text-app-accent">Active</p>
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
      <Analytics />
    </Router>
  );
}

function UserApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [view, setView] = useState<'dashboard' | 'otp' | 'more_services' | 'account_settings' | 'transactions'>('dashboard');
  const [buyingService, setBuyingService] = useState<string | null>(null);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [balance, setBalance] = useState(24500);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('Russia');
  
  const globalPrice = parseInt(localStorage.getItem('virtual_number_price') || '1200');

  // Active Order State
  const [activeOrder, setActiveOrder] = useState<{
    id: string;
    phone: string;
    service: string;
  } | null>(null);

  const services: Service[] = [
    { id: 'wa', name: 'WhatsApp', icon: <MessageSquare size={24} />, color: '#25D366', apiName: 'whatsapp', price: 800 },
    { id: 'ig', name: 'Instagram', icon: <Instagram size={24} />, color: '#E4405F', apiName: 'instagram', price: 1000 },
    { id: 'fb', name: 'Facebook', icon: <Facebook size={24} />, color: '#1877F2', apiName: 'facebook', price: 800 },
    { id: 'tg', name: 'Telegram', icon: <Send size={24} />, color: '#0088cc', apiName: 'telegram', price: 600 },
    { id: 'tk', name: 'TikTok', icon: <Music2 size={24} />, color: '#000000', apiName: 'tiktok', price: 1000 },
    { id: 'more', name: 'More', icon: <LayoutGrid size={24} />, color: '#ffffff', apiName: 'other', price: 0 },
  ];

  const [recentOrders, setRecentOrders] = useState<Order[]>([
    { id: '1', service: 'WhatsApp (USA)', number: '+1 (202) 555-0123', status: 'active', price: '1,200', time: '2 MINS AGO' },
    { id: '2', service: 'Telegram (UK)', number: '+44 7700 900123', status: 'completed', price: '850', time: '1 HOUR AGO' },
    { id: '3', service: 'Instagram (NG)', number: '+234 801 234 5678', status: 'expired', price: '400', time: '5 HOURS AGO' },
  ]);

  const categories = ["All", "Social Media", "Banking", "Email", "Rides", "Shopping", "Dating", "Streaming", "Gaming", "Crypto", "Nigerian Apps"];

  const popularServices = [
    { name: "WhatsApp", price: 800, apiName: "whatsapp", icon: <MessageSquare size={24} /> },
    { name: "Instagram", price: 1000, apiName: "instagram", icon: <Instagram size={24} /> },
    { name: "Facebook", price: 800, apiName: "facebook", icon: <Facebook size={24} /> },
    { name: "Telegram", price: 600, apiName: "telegram", icon: <Send size={24} /> },
    { name: "Gmail", price: 1500, apiName: "gmail" },
    { name: "TikTok", price: 1000, apiName: "tiktok", icon: <Music2 size={24} /> },
    { name: "Binance", price: 2000, apiName: "binance" },
    { name: "PayPal", price: 2500, apiName: "paypal" },
  ];

  const countries = ["Russia", "USA", "UK", "Indonesia", "India", "Ghana", "Kenya", "South Africa", "Brazil", "Others"];

  const getFilteredServices = () => {
    let all: Service[] = [];
    Object.entries(SERVICE_CATALOG).forEach(([cat, items]) => {
      items.forEach((item, idx) => {
        all.push({
          id: `${cat}-${idx}`,
          name: item.name,
          apiName: item.apiName,
          price: item.price,
          icon: item.icon
        });
      });
    });

    return all.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeCategory === 'All') return matchesSearch;
      
      // Category mapping
      const catMap: Record<string, string> = {
        "Social Media": "SOCIAL MEDIA APPS",
        "Banking": "MOBILE BANKING & FINTECH",
        "Email": "EMAIL & GOOGLE SERVICES",
        "Rides": "RIDE & DELIVERY APPS",
        "Shopping": "SHOPPING",
        "Dating": "DATING",
        "Streaming": "STREAMING",
        "Gaming": "GAMING",
        "Crypto": "CRYPTO",
        "Nigerian Apps": "NIGERIAN APPS"
      };

      const targetCat = catMap[activeCategory];
      const isInCat = Object.entries(SERVICE_CATALOG).find(([cat, items]) => {
        return cat === targetCat && items.some(i => i.apiName === s.apiName && i.name === s.name);
      });

      return matchesSearch && isInCat;
    });
  };

  const buyNumber = async (service: Service) => {
    if (balance < service.price) {
      alert("Unable to complete purchase. Please top up your account.");
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
        service: `${service.name} (${selectedCountry})`,
        number: data.phone,
        status: 'active',
        price: service.price.toLocaleString(),
        time: 'JUST NOW'
      };

      setRecentOrders(prev => [newOrder, ...prev]);
      
      setActiveOrder({
        id: data.id.toString(),
        phone: data.phone,
        service: service.name
      });
      
      setBalance(prev => prev - service.price);
      setView('otp');
      setIsBottomSheetOpen(false);
    } catch (error) {
      alert("Failed to purchase number. Please try again later.");
    } finally {
      setBuyingService(null);
    }
  };

  const openServiceDetail = (service: Service) => {
    setSelectedService(service);
    setIsBottomSheetOpen(true);
  };

  const handleAddMoneySuccess = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const contactCustomerService = () => {
    window.open('https://wa.me/2349121585744', '_blank');
  };

  if (view === 'more_services') {
    return (
      <div className="min-h-screen bg-app-bg text-white p-6 max-w-md mx-auto pb-24">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView('dashboard')} className="w-10 h-10 rounded-full glass-card flex items-center justify-center">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <h3 className="text-xl font-bold">All Services</h3>
        </div>
        
        <div className="space-y-10">
          {Object.entries(SERVICE_CATALOG).map(([category, items]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-[10px] font-black text-app-accent uppercase tracking-[0.2em] border-l-2 border-app-accent pl-3">
                {category}
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {items.map((item, idx) => {
                  const serviceObj: Service = {
                    id: `${category}-${idx}`,
                    name: item.name,
                    apiName: item.apiName,
                    price: item.price,
                    icon: item.icon
                  };
                  return (
                    <ServiceCard 
                      key={serviceObj.id} 
                      service={serviceObj} 
                      onClick={() => buyNumber(serviceObj)}
                      loading={buyingService === serviceObj.id}
                    />
                  );
                })}
              </div>
            </div>
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
            <p className="font-bold text-emerald-500">Success</p>
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
            <p className="font-bold text-red-500">Processed</p>
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
            {/* Search Bar */}
            <div className="relative mt-4 mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-app-accent transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Popular Services */}
            {!searchQuery && activeCategory === 'All' && (
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Star size={18} className="text-app-accent fill-app-accent" />
                  <h3 className="text-lg font-bold">Popular</h3>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {popularServices.map((s, idx) => {
                    const serviceObj: Service = {
                      id: `popular-${idx}`,
                      name: s.name,
                      apiName: s.apiName,
                      price: s.price,
                      icon: s.icon
                    };
                    return (
                      <motion.button
                        key={serviceObj.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openServiceDetail(serviceObj)}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center text-white border border-white/5">
                          {s.icon || <Smartphone size={24} />}
                        </div>
                        <span className="text-[10px] font-bold text-white/60 text-center truncate w-full">{s.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-8 -mx-6 px-6">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat 
                      ? 'bg-app-accent text-white shadow-lg shadow-app-accent/20' 
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Services Grid */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  {searchQuery ? 'Search Results' : activeCategory === 'All' ? 'All Services' : activeCategory}
                </h3>
              </div>
              
              {getFilteredServices().length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {getFilteredServices().map(service => (
                    <ServiceCard 
                      key={service.id} 
                      service={service} 
                      onClick={() => openServiceDetail(service)}
                      loading={buyingService === service.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-white/10" />
                  </div>
                  <p className="text-white/40 font-medium">Service not available yet</p>
                </div>
              )}
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
              <p className="text-white/40 text-sm mb-2">Wallet Status</p>
              <h2 className="text-5xl font-black text-app-accent mb-8">Active</h2>
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
                <p className="font-bold text-emerald-500">Success</p>
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

      {/* Service Detail Bottom Sheet */}
      <AnimatePresence>
        {isBottomSheetOpen && selectedService && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBottomSheetOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#12121e] rounded-t-[40px] z-[70] p-8 border-t border-white/10"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-3xl glass-card flex items-center justify-center text-app-accent border border-app-accent/20">
                  {selectedService.icon || <Smartphone size={40} />}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">{selectedService.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-app-accent font-black text-xl">₦{selectedService.price.toLocaleString()}</span>
                    <span className="text-[10px] font-bold bg-app-accent/10 text-app-accent px-2 py-0.5 rounded-full uppercase">45 Available</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Select Country</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-app-accent" size={20} />
                    <select 
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-10 text-sm font-bold appearance-none focus:outline-none focus:border-app-accent transition-colors"
                    >
                      {countries.map(c => (
                        <option key={c} value={c} className="bg-[#12121e]">{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-app-accent/20 flex items-center justify-center text-app-accent mt-0.5">
                    <Check size={12} />
                  </div>
                  <p className="text-[10px] text-white/50 leading-relaxed">
                    You will be charged <span className="text-white font-bold">₦{selectedService.price.toLocaleString()}</span> for this number. 
                    If no OTP is received within 20 minutes, you will be automatically refunded.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => buyNumber(selectedService)}
                disabled={buyingService === selectedService.id}
                className="w-full py-5 rounded-2xl bg-app-accent text-white font-black uppercase tracking-widest shadow-xl shadow-app-accent/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
              >
                {buyingService === selectedService.id ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>Get Number — ₦{selectedService.price.toLocaleString()}</>
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
