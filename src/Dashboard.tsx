import { useState } from 'react';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    Settings,
    Search,
    Bell,
    Filter,
    ArrowUpRight,
    Linkedin,
    Clock,
    ChevronDown,
    LogOut,
    Plus,
    Calendar,
    CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const dummyJobs = [
    {
        id: 1,
        title: 'Senior Product Designer',
        company: 'Notion',
        postedBy: 'Rachel Kim',
        time: '2 hours ago',
        status: 'Active',
        logo: 'https://logo.clearbit.com/notion.so'
    },
    {
        id: 2,
        title: 'Software Engineer',
        company: 'Stripe',
        postedBy: 'Michael Chen',
        time: '5 hours ago',
        status: 'Active',
        logo: 'https://logo.clearbit.com/stripe.com'
    },
    {
        id: 3,
        title: 'UX Researcher',
        company: 'Spotify',
        postedBy: 'Sarah Johnson',
        time: '1 day ago',
        status: 'Reviewed',
        logo: 'https://logo.clearbit.com/spotify.com'
    },
    {
        id: 4,
        title: 'Product Manager',
        company: 'Figma',
        postedBy: 'David Park',
        time: '1 day ago',
        status: 'Active',
        logo: 'https://logo.clearbit.com/figma.com'
    },
    {
        id: 5,
        title: 'Data Scientist',
        company: 'Netflix',
        postedBy: 'Emily Wong',
        time: '2 days ago',
        status: 'Expired',
        logo: 'https://logo.clearbit.com/netflix.com'
    }
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-slate-100 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                            W
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-800">WhoPosted</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <NavItem icon={LayoutDashboard} label="Overview" active />
                    <NavItem icon={Briefcase} label="Job Postings" />
                    <NavItem icon={Users} label="Referrals" />
                    <NavItem icon={Calendar} label="Schedule" />
                    <NavItem icon={Settings} label="Settings" />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 min-h-screen pb-12">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 lg:px-10 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex-1 max-w-xl relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search jobs, posters, or companies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/10 transition-all outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-4 ml-6">
                            <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                            </button>
                            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />
                            <div className="flex items-center gap-3 bg-slate-50 p-1.5 pr-3 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-100 transition-all">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                    JD
                                </div>
                                <div className="hidden sm:block">
                                    <div className="text-xs font-semibold text-slate-800">John Doe</div>
                                    <div className="text-[10px] text-slate-500">Premium Plan</div>
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto space-y-8">
                    {/* Welcome & Stats */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Welcome Back, John! 👋</h1>
                            <p className="text-slate-500 mt-1">Here's what happened with your job tracked since you last checked.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                                <Plus className="w-4 h-4" />
                                Custom Alert
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all">
                                <Filter className="w-4 h-4" />
                                Filters
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard label="Total Tracked" value="1,284" trend="+12%" icon={Briefcase} color="indigo" />
                        <StatCard label="Active Posters" value="856" trend="+5%" icon={Users} color="emerald" />
                        <StatCard label="Recent Updates" value="48" trend="+24%" icon={Clock} color="amber" />
                        <StatCard label="Response Rate" value="32%" trend="+8%" icon={CheckCircle2} color="rose" />
                    </div>

                    {/* Job List */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800">Recent Postings with Context</h2>
                            <button className="text-sm text-indigo-600 font-semibold hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Job Title</th>
                                        <th className="px-6 py-4 font-semibold">Posted By</th>
                                        <th className="px-6 py-4 font-semibold">Platform</th>
                                        <th className="px-6 py-4 font-semibold">Time</th>
                                        <th className="px-6 py-4 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {dummyJobs.map((job) => (
                                        <tr key={job.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={job.logo} alt={job.company} className="w-10 h-10 rounded-xl border border-slate-100" />
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900">{job.title}</div>
                                                        <div className="text-xs text-slate-500">{job.company}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-slate-700">{job.postedBy}</span>
                                                    <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                                                    LINKEDIN
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {job.time}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                                    <ArrowUpRight className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
    return (
        <a
            href="#"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
        >
            <Icon className="w-5 h-5" />
            {label}
        </a>
    );
}

function StatCard({ label, value, trend, icon: Icon, color }: { label: string, value: string, trend: string, icon: any, color: string }) {
    const colors: Record<string, string> = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        rose: 'bg-rose-50 text-rose-600'
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-600/20 transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl ${colors[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    {trend}
                </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">{label}</div>
        </div>
    );
}
