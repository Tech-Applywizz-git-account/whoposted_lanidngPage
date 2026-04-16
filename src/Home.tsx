import { useState, useEffect } from 'react';
import { ArrowRight, Check, X, Linkedin, User, Clock, Shield, Eye, ArrowUpRight, Menu, X as CloseIcon, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import PayPalPayment from './components/PayPalPayment';

import './App.css';

const navLinks = [
    { name: 'How it works', href: '#how-it-works' },
    { name: 'Featured', href: '#featured' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Testimonial', href: '#testimonial' },
    { name: 'Contact Us', href: '#contact' },
];

const testimonials = [
    {
        quote: "I was tired of applying into black holes. Knowing who posted the job helped me tailor my approach and actually get responses. It's not magic—it's just context I didn't have before.",
        name: "Rachel Kim",
        role: "Product Designer",
        company: "Hired at Notion",
        avatar: "RK"
    },
    {
        quote: "This platform saved me weeks of searching. Instead of browsing hundreds of sites, I got direct access to jobs with poster info. Totally worth the monthly subscription!",
        name: "Michael Chen",
        role: "Software Engineer",
        company: "Hired at Stripe",
        avatar: "MC"
    },
    {
        quote: "The daily updates keep the job list fresh and relevant. I found several new opportunities that weren't available on other platforms. Highly recommend!",
        name: "Sarah Johnson",
        role: "UX Researcher",
        company: "Hired at Spotify",
        avatar: "SJ"
    },
    {
        quote: "For less than the cost of a coffee per month, I got a monthly subscription. The ROI is incredible - I received multiple interview calls within the first week!",
        name: "David Park",
        role: "Product Manager",
        company: "Hired at Figma",
        avatar: "DP"
    },
    {
        quote: "Knowing who posted the job gave me the confidence to reach out directly. I landed my dream role at a top tech company within 3 weeks of signing up.",
        name: "Emily Wong",
        role: "Data Scientist",
        company: "Hired at Netflix",
        avatar: "EW"
    }
];

const companyLogos = [
    'Google', 'Meta', 'Amazon', 'Netflix', 'Airbnb', 'Uber',
    'Microsoft', 'Apple', 'Adobe', 'Salesforce', 'Twitter', 'Slack'
];

function Home() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [showPaymentModal, setShowPaymentModal] = useState(false);


    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-rotate testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);



    const nextTestimonial = () => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <div className="min-h-screen bg-white text-stripe-navy overflow-x-hidden font-sans selection:bg-brand-500/10 selection:text-brand-500">
            {/* Nav with subtle glass effect and border */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-brand-500/10 shadow-soft' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between">
                    {/* Logo - Updated to Brand Blue */}
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                            <span className="text-white font-bold text-lg">W</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-stripe-navy group-hover:text-brand-500 transition-colors">WhoPosted</span>
                    </div>

                    {/* Desktop Nav - Refined Spacing & Hover */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="px-5 py-2 rounded-full text-sm text-stripe-navy/70 hover:text-brand-500 hover:bg-brand-500/5 transition-all duration-300 font-medium cursor-pointer active:scale-95"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    <div className="hidden md:block">
                        <a
                            href="https://whoposted-main.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-brand-500 text-white px-7 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 hover:bg-brand-600 hover:shadow-premium flex items-center gap-2 active:scale-95 group"
                        >
                            Sign In
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-stripe-navy p-2 hover:bg-brand-500/5 rounded-full transition-colors active:scale-90"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu - Updated with premium scaling */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-brand-500/10 py-8 px-6 flex flex-col gap-4 shadow-elevated animate-in slide-in-from-top duration-300">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-stripe-navy hover:text-brand-500 hover:bg-brand-500/5 py-4 px-6 rounded-2xl text-base font-semibold transition-all duration-300 active:scale-[0.98]"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                        <a
                            href="https://whoposted-main.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsMenuOpen(false)}
                            className="bg-brand-500 text-white px-6 py-4 rounded-2xl text-sm font-bold mt-4 w-full text-center block shadow-lg shadow-brand-500/20 active:scale-[0.98]"
                        >
                            Sign In
                        </a>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6 overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <div className="relative z-10 space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/5 border border-brand-500/10 text-xs text-brand-500 font-bold uppercase tracking-wider animate-in zoom-in-95 delay-300 duration-500">
                            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                            Daily US Job Updates
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-stripe-navy animate-in slide-in-from-bottom-6 delay-400 duration-700">
                            Stop Applying Blind.
                            <span className="block text-gradient mt-2 pb-1">
                                See Who Posted it.
                            </span>
                        </h1>

                        <p className="text-xl text-stripe-slate max-w-lg leading-relaxed font-normal animate-in fade-in delay-600 duration-1000">
                            Daily US job postings with the name and LinkedIn profile of the person who shared them — context you won&apos;t find anywhere else.
                        </p>

                        <div className="flex flex-wrap items-center gap-6 animate-in slide-in-from-bottom-10 delay-700 duration-1000">
                            <a
                                href="#pricing"
                                className="bg-brand-500 text-white px-10 py-5 rounded-2xl font-bold text-base hover:bg-brand-600 transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex items-center gap-3 shadow-premium shadow-brand-500/20 active:scale-95"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5" />
                            </a>

                            <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white border border-brand-500/10 shadow-soft transition-all hover:scale-105 duration-300">
                                <div className="flex -space-x-3">
                                    <div className="w-9 h-9 rounded-full bg-brand-200 border-2 border-white flex items-center justify-center text-xs font-bold text-brand-700">J</div>
                                    <div className="w-9 h-9 rounded-full bg-brand-300 border-2 border-white flex items-center justify-center text-xs font-bold text-brand-700">M</div>
                                    <div className="w-9 h-9 rounded-full bg-brand-400 border-2 border-white flex items-center justify-center text-xs font-bold text-brand-700">S</div>
                                </div>
                                <span className="text-sm font-semibold text-stripe-slate">2,000+ job seekers</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 text-sm text-stripe-slate/80 pt-4 animate-in fade-in delay-800 duration-1000">
                            <div className="flex items-center gap-2 group cursor-default">
                                <Check className="w-4 h-4 text-emerald-500 transition-transform group-hover:scale-125" />
                                <span className="font-medium">Cancel anytime</span>
                            </div>
                            <div className="flex items-center gap-2 group cursor-default">
                                <Check className="w-4 h-4 text-emerald-500 transition-transform group-hover:scale-125" />
                                <span className="font-medium">No guarantees</span>
                            </div>
                            <div className="flex items-center gap-2 group cursor-default">
                                <Check className="w-4 h-4 text-emerald-500 transition-transform group-hover:scale-125" />
                                <span className="font-medium">Just context</span>
                            </div>
                        </div>
                    </div>

                    {/* Orbital Job Cards Visualization - Refined with Brand Blue */}
                    <div className="relative h-[500px] lg:h-[600px] hidden md:block animate-in zoom-in-95 duration-1000 delay-300">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-full h-full">
                                {/* Center Element */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 animate-in zoom-in-50 duration-1000 delay-500">
                                    <div className="w-40 h-40 rounded-full bg-white border border-black/20 shadow-elevated flex items-center justify-center hover:scale-110 hover:shadow-black/30 transition-all duration-500 cursor-pointer group">
                                        <div className="text-center">
                                            <div className="text-4xl font-bold text-stripe-navy group-hover:text-brand-500 transition-colors">20k+</div>
                                            <div className="text-[10px] text-brand-500 uppercase tracking-[0.2em] mt-1 font-bold">Jobs tracked</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Orbital Rings - More Visible Black */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-black/30 animate-in zoom-in-90 duration-1000" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-black/30 animate-in zoom-in-90 duration-1200" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-black/30 animate-in zoom-in-90 duration-1500" />

                                {/* Orbiting Job Cards - Refactored with premium elevation */}
                                <div className="orbit-card absolute w-56 bg-white border border-black/20 rounded-2xl p-5 shadow-premium hover:scale-110 hover:-translate-y-2 hover:shadow-elevated hover:border-black/40 transition-all duration-300 cursor-pointer group" style={{ animation: 'orbit1 25s linear infinite', top: '15%', left: '55%' }}>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] text-brand-500 font-bold uppercase tracking-wider px-2 py-1 bg-brand-50 rounded-lg group-hover:bg-brand-100 transition-colors border border-black/10">Posted 2h ago</span>
                                        <Linkedin className="w-5 h-5 text-brand-500 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="font-bold text-sm mb-1 text-stripe-navy group-hover:text-brand-500 transition-colors">Product Designer</div>
                                    <div className="text-xs text-stripe-slate font-medium mb-4">Notion Labs</div>
                                    <div className="flex items-center gap-3 pt-4 border-t border-black/10">
                                        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-[10px] font-bold text-white transition-transform group-hover:rotate-12 group-hover:scale-110">SJ</div>
                                        <span className="text-xs text-stripe-navy font-bold">Sarah Johnson</span>
                                    </div>
                                </div>

                                <div className="orbit-card absolute w-56 bg-white border border-black/20 rounded-2xl p-5 shadow-premium hover:scale-110 hover:-translate-y-2 hover:shadow-elevated hover:border-black/40 transition-all duration-300 cursor-pointer group" style={{ animation: 'orbit2 30s linear infinite', top: '55%', left: '15%' }}>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] text-brand-500 font-bold uppercase tracking-wider px-2 py-1 bg-brand-50 rounded-lg group-hover:bg-brand-100 transition-colors border border-black/10">Posted 5h ago</span>
                                        <Linkedin className="w-5 h-5 text-brand-500 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="font-bold text-sm mb-1 text-stripe-navy group-hover:text-brand-500 transition-colors">Engineering Lead</div>
                                    <div className="text-xs text-stripe-slate font-medium mb-4">Stripe</div>
                                    <div className="flex items-center gap-3 pt-4 border-t border-black/10">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white transition-transform group-hover:rotate-12 group-hover:scale-110">MC</div>
                                        <span className="text-xs text-stripe-navy font-bold">Mike Chen</span>
                                    </div>
                                </div>

                                <div className="orbit-card absolute w-56 bg-white border border-black/20 rounded-2xl p-5 shadow-premium hover:scale-110 hover:-translate-y-2 hover:shadow-elevated hover:border-black/40 transition-all duration-300 cursor-pointer group" style={{ animation: 'orbit3 28s linear infinite', top: '65%', left: '65%' }}>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] text-brand-500 font-bold uppercase tracking-wider px-2 py-1 bg-brand-50 rounded-lg group-hover:bg-brand-100 transition-colors border border-black/10">Posted 1d ago</span>
                                        <Linkedin className="w-5 h-5 text-brand-500 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="font-bold text-sm mb-1 text-stripe-navy group-hover:text-brand-500 transition-colors">UX Researcher</div>
                                    <div className="text-xs text-stripe-slate font-medium mb-4">Spotify</div>
                                    <div className="flex items-center gap-3 pt-4 border-t border-black/10">
                                        <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center text-[10px] font-bold text-white transition-transform group-hover:rotate-12 group-hover:scale-110">AL</div>
                                        <span className="text-xs text-stripe-navy font-bold">Anna Lee</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured/Trust Logos - Premium Refined */}
            <section id="featured" className="py-14 border-y border-brand-500/5 bg-brand-50/20 overflow-hidden animate-in fade-in duration-1000">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 text-center animate-in slide-in-from-bottom-4 delay-200 duration-700">
                    <p className="text-xs text-brand-500 uppercase tracking-[0.3em] font-bold opacity-60">Trusted by job seekers from</p>
                </div>

                {/* Marquee Container */}
                <div className="relative animate-in fade-in delay-300 duration-1000">
                    {/* Gradient Masks - Refined for brand-50 bg */}
                    <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-brand-50/20 to-transparent z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-brand-50/20 to-transparent z-10" />

                    {/* Scrolling Track */}
                    <div className="flex animate-marquee">
                        {[...companyLogos, ...companyLogos].map((company, idx) => {
                            // Define Brand Styles (Color or Gradient)
                            const getBrandStyles = (name: string) => {
                                switch (name) {
                                    case 'Google':
                                        return 'bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] bg-clip-text text-transparent opacity-80 group-hover:opacity-100';
                                    case 'Microsoft':
                                        return 'bg-gradient-to-r from-[#F25022] via-[#7FBA00] to-[#00A4EF] bg-clip-text text-transparent opacity-80 group-hover:opacity-100';
                                    case 'Slack':
                                        return 'bg-gradient-to-r from-[#E01E5A] via-[#36C5F0] to-[#2EB67D] bg-clip-text text-transparent opacity-80 group-hover:opacity-100';
                                    case 'Meta':
                                        return 'text-[#0668E1] opacity-70 group-hover:opacity-100';
                                    case 'Amazon':
                                        return 'text-[#FF9900] opacity-70 group-hover:opacity-100';
                                    case 'Netflix':
                                        return 'text-[#E50914] opacity-70 group-hover:opacity-100';
                                    case 'Airbnb':
                                        return 'text-[#FF5A5F] opacity-70 group-hover:opacity-100';
                                    case 'Uber':
                                        return 'text-stripe-navy opacity-70 group-hover:opacity-100';
                                    case 'Apple':
                                        return 'text-[#555555] opacity-70 group-hover:opacity-100';
                                    case 'Adobe':
                                        return 'text-[#FF0000] opacity-70 group-hover:opacity-100';
                                    case 'Salesforce':
                                        return 'bg-gradient-to-r from-[#00A1E0] to-[#0176D3] bg-clip-text text-transparent opacity-70 group-hover:opacity-100';
                                    case 'Twitter':
                                        return 'text-[#1DA1F2] opacity-70 group-hover:opacity-100';
                                    default:
                                        return 'text-stripe-slate opacity-70 group-hover:opacity-100';
                                }
                            };

                            return (
                                <div
                                    key={`${idx}`}
                                    className="group flex-shrink-0 px-16 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                                >
                                    <span className={`text-2xl font-bold ${getBrandStyles(company)} transition-all whitespace-nowrap cursor-default px-1 tracking-tight`}>
                                        {company}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How it Works - Premium Refined */}
            <section id="how-it-works" className="py-20 px-4 sm:px-6 relative bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-brand-500 font-bold text-xs tracking-[0.2em] uppercase mb-4">The Workflow</div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-stripe-navy tracking-tight">
                            How seekers use WhoPosted
                        </h2>
                        <p className="text-stripe-slate font-medium text-lg">No onboarding required. The product explains itself through context.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            {
                                step: '01',
                                title: 'Discover with context',
                                desc: 'See the job, posting recency, and the name and role of the person who shared it.',
                                icon: Eye,
                                gradient: 'from-brand-500 to-indigo-500',
                                delay: 'delay-100'
                            },
                            {
                                step: '02',
                                title: 'Prepare intentionally',
                                desc: 'Review the poster\'s role and company context. Tailor your approach based on who they are.',
                                icon: User,
                                gradient: 'from-brand-600 to-brand-400',
                                delay: 'delay-300'
                            },
                            {
                                step: '03',
                                title: 'Act or move on',
                                desc: 'Apply with context, reach out professionally, or skip if it\'s not right. You decide.',
                                icon: ArrowUpRight,
                                gradient: 'from-brand-700 to-indigo-600',
                                delay: 'delay-500'
                            }
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className={`group relative p-10 rounded-3xl bg-white border border-brand-500/5 hover:border-brand-500/20 shadow-premium hover:shadow-elevated transition-all duration-500 animate-in fade-in slide-in-from-bottom-12 ${item.delay}`}
                            >
                                {/* Large Step Number Background */}
                                <div className="absolute top-4 right-8 text-7xl font-bold text-brand-500/5 select-none pointer-events-none group-hover:scale-110 group-hover:text-brand-500/10 transition-all duration-700">
                                    {item.step}
                                </div>

                                <div className="relative z-10">
                                    {/* Icon in rounded square with gradient */}
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-8 shadow-lg group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <item.icon className="w-6 h-6 text-white" />
                                    </div>

                                    <h3 className="text-2xl font-bold mb-4 text-stripe-navy group-hover:text-brand-500 transition-colors uppercase tracking-tight">{item.title}</h3>
                                    <p className="text-stripe-slate leading-relaxed text-base font-medium opacity-80">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust & Boundaries - Refined with brand-soft accent */}
            <section className="py-16 px-4 sm:px-6 bg-brand-50/30 relative overflow-hidden">
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="text-center mb-16 animate-in fade-in duration-1000">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-stripe-navy tracking-tight">Clear boundaries</h2>
                        <p className="text-stripe-slate font-medium text-lg">WhoPosted supports common job-search behaviors without overpromising.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-10 rounded-[32px] bg-white border border-brand-500/5 shadow-premium hover:shadow-elevated transition-all duration-500 animate-in slide-in-from-left-8 group">
                            <h3 className="flex items-center gap-3 text-emerald-600 font-bold text-xl mb-8">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Check className="w-5 h-5" />
                                </div>
                                What we provide
                            </h3>
                            <ul className="space-y-5">
                                {[
                                    'Name of the job poster',
                                    'Link to public LinkedIn profile',
                                    'Posting recency (real-time data)',
                                    'Daily updates every 24 hours',
                                    'Context for outreach decisions'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-stripe-slate group-hover:text-stripe-navy transition-colors cursor-default">
                                        <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mt-0.5 shrink-0">
                                            <Check className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <span className="text-base font-semibold">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-10 rounded-[32px] bg-white border border-brand-500/5 shadow-premium hover:shadow-elevated transition-all duration-500 opacity-90 hover:opacity-100 animate-in slide-in-from-right-8 group">
                            <h3 className="flex items-center gap-3 text-stripe-slate font-bold text-xl mb-8">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <X className="w-5 h-5" />
                                </div>
                                What we do not provide
                            </h3>
                            <ul className="space-y-5">
                                {[
                                    'Email addresses or private info',
                                    'Automated messaging services',
                                    'Resume submission services',
                                    'Referral guarantees',
                                    'Hiring outcome guarantees'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-stripe-slate/70 group-hover:text-stripe-navy transition-colors cursor-default">
                                        <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mt-0.5 shrink-0">
                                            <X className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <span className="text-base font-normal">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>            {/* Email Preview - Premium Refined */}
            <section className="py-20 px-4 sm:px-6 bg-white overflow-hidden">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="animate-in slide-in-from-left-12 duration-1000">
                            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-stripe-navy leading-[1.1] tracking-tight">
                                One email per day.
                                <span className="block text-brand-500/40 mt-2 font-medium">No spam. No upsells.</span>
                            </h2>
                            <p className="text-lg text-stripe-slate mb-10 leading-relaxed font-medium opacity-90">
                                Get a daily digest of new job postings with poster information delivered to your inbox.
                                Unsubscribe anytime. No marketing banners. Just jobs and context.
                            </p>
                            <div className="space-y-6">
                                <div className="flex items-center gap-5 text-sm group cursor-default">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-500/5 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6 border border-brand-500/10 shadow-sm">
                                        <Clock className="w-6 h-6 text-brand-500" />
                                    </div>
                                    <span className="text-stripe-navy font-bold text-base">Daily at 9 AM EST</span>
                                </div>
                                <div className="flex items-center gap-5 text-sm group cursor-default">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-500/5 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-rotate-6 border border-brand-500/10 shadow-sm">
                                        <Shield className="w-6 h-6 text-brand-500" />
                                    </div>
                                    <span className="text-stripe-navy font-bold text-base">No spam, ever</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative animate-in slide-in-from-right-12 duration-1000 delay-200">
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-indigo-500/5 blur-3xl opacity-50" />
                            {/* Browser Mockup - Premium Refined */}
                            <div className="relative bg-white border border-brand-500/10 rounded-[32px] overflow-hidden shadow-elevated hover:shadow-2xl hover:scale-[1.02] transition-all duration-700 cursor-default group p-1">
                                <div className="bg-brand-50/50 px-8 py-5 border-b border-brand-500/5 flex items-center gap-4">
                                    <div className="flex gap-2.5">
                                        <div className="w-3.5 h-3.5 rounded-full bg-red-400/20 group-hover:bg-red-400 transition-colors" />
                                        <div className="w-3.5 h-3.5 rounded-full bg-amber-400/20 group-hover:bg-amber-400 transition-colors" />
                                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-400/20 group-hover:bg-emerald-400 transition-colors" />
                                    </div>
                                    <span className="text-xs text-stripe-slate ml-4 font-bold uppercase tracking-widest opacity-60">WhoPosted Daily Digest</span>
                                </div>
                                <div className="p-10 space-y-8 bg-white">
                                    <div className="animate-in fade-in duration-1000 delay-500">
                                        <h4 className="text-2xl font-bold mb-1 text-stripe-navy tracking-tight">12 new roles today</h4>
                                        <p className="text-sm text-stripe-slate font-bold uppercase tracking-wider opacity-60">United States & Remote</p>
                                    </div>

                                    {[
                                        { role: 'Senior Product Manager', company: 'Figma', poster: 'Alex Chen', time: '2h ago' },
                                        { role: 'UX Researcher', company: 'Spotify', poster: 'Maria Garcia', time: '5h ago' },
                                        { role: 'Engineering Lead', company: 'Stripe', poster: 'James Wilson', time: '8h ago' }
                                    ].map((job, i) => (
                                        <div key={i} className="flex items-center justify-between py-5 border-b border-brand-500/5 last:border-0 hover:bg-brand-500/5 transition-all -mx-6 px-6 rounded-2xl cursor-pointer group/item animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: `${700 + i * 100}ms` }}>
                                            <div>
                                                <div className="font-bold text-base text-stripe-navy group-hover/item:text-brand-500 transition-colors">{job.role}</div>
                                                <div className="text-sm text-stripe-slate font-semibold opacity-70">{job.company}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-brand-500 font-bold mb-1 group-hover/item:scale-105 transition-transform origin-right">{job.poster}</div>
                                                <div className="text-xs text-stripe-slate/60 font-bold uppercase tracking-wider">{job.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Pricing Section - Premium Card Refined */}
            <section id="pricing" className="py-24 px-4 sm:px-6 bg-brand-50/20 relative">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block px-6 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 text-xs font-bold uppercase tracking-widest mb-10 animate-in zoom-in-95 duration-500">
                        Limited Time Offer
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 text-stripe-navy tracking-[ -0.02em] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        Monthly subscription. <br></br><span className="text-brand-500">Get full access.</span>
                    </h2>
                    <p className="text-stripe-slate mb-16 font-semibold text-xl animate-in fade-in duration-1000 delay-300 opacity-80">
                        Low friction. Low regret. Just clarity.
                    </p>

                    <div className="relative inline-block animate-in zoom-in-90 duration-1000 delay-400">
                        <div className="absolute inset-0 bg-brand-500/10 blur-[100px] rounded-full animate-pulse" />
                        <div className="relative bg-white border border-brand-500/10 rounded-[48px] p-16 md:p-24 max-w-xl mx-auto shadow-elevated hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-4 transition-all duration-700 group cursor-default">
                            <div className="text-8xl font-black mb-6 text-stripe-navy tracking-tighter group-hover:scale-110 group-hover:text-brand-500 transition-all duration-500 flex items-center justify-center gap-1">
                                <span className="text-4xl font-bold opacity-30 mt-4">$</span>
                                4.99
                            </div>
                            <div className="text-brand-500 text-xs mb-14 uppercase tracking-[0.3em] font-black opacity-80">per month</div>

                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-16">
                                {[
                                    'Daily US jobs',
                                    'Poster profile links',
                                    'Daily email digest',
                                    'Regular updates',
                                    'Cancel anytime',
                                    'Priority Support'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-4 text-base text-stripe-navy font-bold group/feat">
                                        <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover/feat:scale-125 transition-transform">
                                            <Check className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => setShowPaymentModal(true)}
                                className="w-full bg-brand-500 text-white py-6 rounded-[24px] font-black text-xl hover:bg-brand-600 transition-all duration-300 hover:scale-[1.05] hover:-translate-y-2 shadow-elevated shadow-brand-500/30 active:scale-95 flex items-center justify-center gap-4 group/btn"
                            >
                                Get monthly subscription
                                <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                            </button>

                            <p className="mt-10 text-xs text-stripe-slate/50 italic font-bold uppercase tracking-widest">
                                Tools for clarity, not promises.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials - Premium Card Refined */}
            <section id="testimonial" className="py-24 px-4 sm:px-6 bg-white overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-24 animate-in fade-in duration-1000">
                        <p className="text-brand-500 text-xs font-bold uppercase tracking-[0.4em] mb-4">Testimonials</p>
                        <h2 className="text-4xl md:text-5xl font-bold text-stripe-navy tracking-tight">
                            Real seekers. <span className="text-brand-500">Real outcomes.</span>
                        </h2>
                    </div>

                    <div className="relative">
                        <button
                            onClick={prevTestimonial}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-10 z-20 w-16 h-16 rounded-full bg-white hover:bg-brand-50 border border-brand-500/10 flex items-center justify-center transition-all hover:scale-110 shadow-premium hover:shadow-elevated hidden md:flex active:scale-90 group"
                        >
                            <ChevronLeft className="w-8 h-8 text-stripe-navy group-hover:text-brand-500 transition-colors" />
                        </button>
                        <button
                            onClick={nextTestimonial}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-10 z-20 w-16 h-16 rounded-full bg-white hover:bg-brand-50 border border-brand-500/10 flex items-center justify-center transition-all hover:scale-110 shadow-premium hover:shadow-elevated hidden md:flex active:scale-90 group"
                        >
                            <ChevronRight className="w-8 h-8 text-stripe-navy group-hover:text-brand-500 transition-colors" />
                        </button>

                        <div className="grid md:grid-cols-3 gap-10">
                            {[0, 1, 2].map((offset) => {
                                const index = (currentTestimonial + offset) % testimonials.length;
                                const testimonial = testimonials[index];
                                return (
                                    <div
                                        key={index}
                                        className="bg-white border border-brand-500/5 rounded-[40px] p-12 hover:border-brand-400/20 transition-all duration-500 shadow-premium hover:shadow-elevated hover:scale-[1.03] hover:-translate-y-3 group animate-in zoom-in-95 duration-700 relative overflow-hidden"
                                        style={{ animationDelay: `${offset * 150}ms` }}
                                    >
                                        <div className="flex gap-1.5 mb-8">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400 group-hover:scale-125 transition-transform duration-300" style={{ transitionDelay: `${i * 50}ms` }} />
                                            ))}
                                        </div>

                                        <p className="text-stripe-navy text-lg leading-relaxed mb-10 font-medium italic opacity-85 group-hover:opacity-100 transition-opacity relative z-10">
                                            &ldquo;{testimonial.quote}&rdquo;
                                        </p>

                                        <div className="flex items-center gap-5 pt-8 border-t border-brand-500/5 mt-auto">
                                            <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center text-lg font-bold text-white shadow-lg group-hover:rotate-6 group-hover:scale-110 transition-transform">
                                                {testimonial.avatar}
                                            </div>
                                            <div>
                                                <div className="font-bold text-base text-stripe-navy">{testimonial.name}</div>
                                                <div className="text-sm text-brand-500 font-bold uppercase tracking-wider">{testimonial.role}</div>
                                                <div className="text-xs text-stripe-slate font-medium mt-0.5">{testimonial.company}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-center gap-4 mt-16">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentTestimonial(i)}
                                    className={`h-2.5 rounded-full transition-all duration-500 ${i === currentTestimonial ? 'bg-brand-500 w-16' : 'bg-brand-500/10 w-4 hover:bg-brand-500/30'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ - Premium Modern Accordion-inspired items */}
            <section className="py-24 px-4 sm:px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 text-stripe-navy tracking-tight animate-in fade-in duration-1000">Support & FAQ</h2>
                    <div className="grid md:grid-cols-1 gap-6">
                        {[
                            {
                                q: 'How is this different from LinkedIn job alerts?',
                                a: 'Job alerts tell you a job exists. WhoPosted reveals the identity behind the post. Top career strategists always recommend identifying or connecting with the poster—we just automate that discovery for you.'
                            },
                            {
                                q: 'Do you provide email addresses?',
                                a: 'No. We respect privacy and professional boundaries. We only provide public LinkedIn profile links. How you proceed (engaging, following, or applying) is your tactical decision.'
                            },
                            {
                                q: 'Does this guarantee I\'ll get hired?',
                                a: 'No. WhoPosted provides competitive context, not a guaranteed outcome. Hiring relies on your skills and performance; we just ensure you\'re not applying blind.'
                            },
                            {
                                q: 'Is this available outside the USA?',
                                a: 'WhoPosted is tailored specifically for the high-density US tech and corporate job markets. We currently serve customers operating within the United States.'
                            }
                        ].map((faq, i) => (
                            <div key={i} className="group border border-brand-500/5 rounded-[32px] p-10 hover:border-brand-500/20 transition-all duration-500 bg-white hover:bg-brand-50/50 shadow-premium hover:shadow-elevated hover:translate-x-3 animate-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: `${i * 100}ms` }}>
                                <h3 className="font-bold mb-5 text-2xl text-stripe-navy leading-tight group-hover:text-brand-500 transition-colors tracking-tight">{faq.q}</h3>
                                <p className="text-stripe-slate text-lg leading-relaxed font-medium opacity-80">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact/Footer - Premium Refined */}
            <footer id="contact" className="py-24 px-4 sm:px-6 border-t border-brand-500/10 bg-white animate-in fade-in duration-1000">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center gap-4 group cursor-pointer transition-transform hover:scale-105 duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-elevated shadow-brand-500/20 group-hover:rotate-12 transition-transform">
                            <span className="text-white font-bold text-xl">W</span>
                        </div>
                        <span className="font-bold text-2xl text-stripe-navy tracking-tight group-hover:text-brand-500 transition-colors">WhoPosted</span>
                    </div>

                    <div className="flex gap-12 text-base text-stripe-navy/60 font-bold uppercase tracking-wider">
                        <a href="#" className="hover:text-brand-500 transition-all hover:scale-105">Privacy</a>
                        <a href="#" className="hover:text-brand-500 transition-all hover:scale-105">Terms</a>
                        <a href="#" className="hover:text-brand-500 transition-all hover:scale-105">Contact Us</a>
                    </div>

                    <div className="text-sm text-stripe-slate/50 font-bold tracking-[0.2em] uppercase">
                        © 2024 WhoPosted. All rights reserved.
                    </div>
                </div>
            </footer>

            {showPaymentModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
                    <div className="relative w-full max-w-2xl my-8">
                        <PayPalPayment onClose={() => setShowPaymentModal(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;


// import { useState, useEffect } from 'react';
// import { ArrowRight, Check, X, Linkedin, User, Clock, Shield, Eye, ArrowUpRight, Menu, X as CloseIcon, Star, ChevronLeft, ChevronRight } from 'lucide-react';
// import PayPalPayment from './components/PayPalPayment';

// import './App.css';

// const navLinks = [
//     { name: 'How it works', href: '#how-it-works' },
//     { name: 'Featured', href: '#featured' },
//     { name: 'Pricing', href: '#pricing' },
//     { name: 'Testimonial', href: '#testimonial' },
//     { name: 'Contact Us', href: '#contact' },
// ];

// const testimonials = [
//     {
//         quote: "I was tired of applying into black holes. Knowing who posted the job helped me tailor my approach and actually get responses. It's not magic—it's just context I didn't have before.",
//         name: "Rachel Kim",
//         role: "Product Designer",
//         company: "Hired at Notion",
//         avatar: "RK"
//     },
//     {
//         quote: "This platform saved me weeks of searching. Instead of browsing hundreds of sites, I got direct access to jobs with poster info. Totally worth the monthly subscription!",
//         name: "Michael Chen",
//         role: "Software Engineer",
//         company: "Hired at Stripe",
//         avatar: "MC"
//     },
//     {
//         quote: "The daily updates keep the job list fresh and relevant. I found several new opportunities that weren't available on other platforms. Highly recommend!",
//         name: "Sarah Johnson",
//         role: "UX Researcher",
//         company: "Hired at Spotify",
//         avatar: "SJ"
//     },
//     {
//         quote: "For less than the cost of a coffee per month, I got a monthly subscription. The ROI is incredible - I received multiple interview calls within the first week!",
//         name: "David Park",
//         role: "Product Manager",
//         company: "Hired at Figma",
//         avatar: "DP"
//     },
//     {
//         quote: "Knowing who posted the job gave me the confidence to reach out directly. I landed my dream role at a top tech company within 3 weeks of signing up.",
//         name: "Emily Wong",
//         role: "Data Scientist",
//         company: "Hired at Netflix",
//         avatar: "EW"
//     }
// ];

// const companyLogos = [
//     'Google', 'Meta', 'Amazon', 'Netflix', 'Airbnb', 'Uber',
//     'Microsoft', 'Apple', 'Adobe', 'Salesforce', 'Twitter', 'Slack'
// ];

// function Home() {
//     const [isMenuOpen, setIsMenuOpen] = useState(false);
//     const [scrolled, setScrolled] = useState(false);
//     const [currentTestimonial, setCurrentTestimonial] = useState(0);
//     const [showPaymentModal, setShowPaymentModal] = useState(false);


//     useEffect(() => {
//         const handleScroll = () => setScrolled(window.scrollY > 50);
//         window.addEventListener('scroll', handleScroll);
//         return () => window.removeEventListener('scroll', handleScroll);
//     }, []);

//     // Auto-rotate testimonials
//     useEffect(() => {
//         const interval = setInterval(() => {
//             setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
//         }, 5000);
//         return () => clearInterval(interval);
//     }, []);



//     const nextTestimonial = () => {
//         setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
//     };

//     const prevTestimonial = () => {
//         setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
//     };

//     return (
//         <div className="min-h-screen bg-white text-stripe-navy overflow-x-hidden font-sans selection:bg-brand-500/10 selection:text-brand-500">
//             {/* Nav with subtle glass effect and border */}
//             <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-brand-500/10 shadow-soft' : 'bg-transparent'}`}>
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between">
//                     {/* Logo - Updated to Brand Blue */}
//                     <div className="flex items-center gap-3 group cursor-pointer">
//                         <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
//                             <span className="text-white font-bold text-lg">W</span>
//                         </div>
//                         <span className="font-bold text-xl tracking-tight text-stripe-navy group-hover:text-brand-500 transition-colors">WhoPosted</span>
//                     </div>

//                     {/* Desktop Nav - Refined Spacing & Hover */}
//                     <div className="hidden md:flex items-center gap-1">
//                         {navLinks.map((link) => (
//                             <a
//                                 key={link.name}
//                                 href={link.href}
//                                 className="px-5 py-2 rounded-full text-sm text-stripe-navy/70 hover:text-brand-500 hover:bg-brand-500/5 transition-all duration-300 font-medium cursor-pointer active:scale-95"
//                             >
//                                 {link.name}
//                             </a>
//                         ))}
//                     </div>

//                     <div className="hidden md:block">
//                         <a
//                             href="http://localhost:8000/login"
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="bg-brand-500 text-white px-7 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 hover:bg-brand-600 hover:shadow-premium flex items-center gap-2 active:scale-95 group"
//                         >
//                             Sign In
//                             <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
//                         </a>
//                     </div>

//                     {/* Mobile Menu Button */}
//                     <button
//                         className="md:hidden text-stripe-navy p-2 hover:bg-brand-500/5 rounded-full transition-colors active:scale-90"
//                         onClick={() => setIsMenuOpen(!isMenuOpen)}
//                     >
//                         {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//                     </button>
//                 </div>

//                 {/* Mobile Menu - Updated with premium scaling */}
//                 {isMenuOpen && (
//                     <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-brand-500/10 py-8 px-6 flex flex-col gap-4 shadow-elevated animate-in slide-in-from-top duration-300">
//                         {navLinks.map((link) => (
//                             <a
//                                 key={link.name}
//                                 href={link.href}
//                                 className="text-stripe-navy hover:text-brand-500 hover:bg-brand-500/5 py-4 px-6 rounded-2xl text-base font-semibold transition-all duration-300 active:scale-[0.98]"
//                                 onClick={() => setIsMenuOpen(false)}
//                             >
//                                 {link.name}
//                             </a>
//                         ))}
//                         <a
//                             href="http://localhost:8000/login"
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             onClick={() => setIsMenuOpen(false)}
//                             className="bg-brand-500 text-white px-6 py-4 rounded-2xl text-sm font-bold mt-4 w-full text-center block shadow-lg shadow-brand-500/20 active:scale-[0.98]"
//                         >
//                             Sign In
//                         </a>
//                     </div>
//                 )}
//             </nav>

//             {/* Hero Section */}
//             <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6 overflow-hidden bg-white">
//                 <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
//                     <div className="relative z-10 space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
//                         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/5 border border-brand-500/10 text-xs text-brand-500 font-bold uppercase tracking-wider animate-in zoom-in-95 delay-300 duration-500">
//                             <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
//                             Daily US Job Updates
//                         </div>

//                         <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-stripe-navy animate-in slide-in-from-bottom-6 delay-400 duration-700">
//                             Stop Applying Blind.
//                             <span className="block text-gradient mt-2 pb-1">
//                                 See Who Posted it.
//                             </span>
//                         </h1>

//                         <p className="text-xl text-stripe-slate max-w-lg leading-relaxed font-normal animate-in fade-in delay-600 duration-1000">
//                             Daily US job postings with the name and LinkedIn profile of the person who shared them — context you won&apos;t find anywhere else.
//                         </p>

//                         <div className="flex flex-wrap items-center gap-6 animate-in slide-in-from-bottom-10 delay-700 duration-1000">
//                             <a
//                                 href="#pricing"
//                                 className="bg-brand-500 text-white px-10 py-5 rounded-2xl font-bold text-base hover:bg-brand-600 transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex items-center gap-3 shadow-premium shadow-brand-500/20 active:scale-95"
//                             >
//                                 Get Started
//                                 <ArrowRight className="w-5 h-5" />
//                             </a>

//                             <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white border border-brand-500/10 shadow-soft transition-all hover:scale-105 duration-300">
//                                 <div className="flex -space-x-3">
//                                     <div className="w-9 h-9 rounded-full bg-brand-200 border-2 border-white flex items-center justify-center text-xs font-bold text-brand-700">J</div>
//                                     <div className="w-9 h-9 rounded-full bg-brand-300 border-2 border-white flex items-center justify-center text-xs font-bold text-brand-700">M</div>
//                                     <div className="w-9 h-9 rounded-full bg-brand-400 border-2 border-white flex items-center justify-center text-xs font-bold text-brand-700">S</div>
//                                 </div>
//                                 <span className="text-sm font-semibold text-stripe-slate">2,000+ job seekers</span>
//                             </div>
//                         </div>

//                         <div className="flex items-center gap-8 text-sm text-stripe-slate/80 pt-4 animate-in fade-in delay-800 duration-1000">
//                             <div className="flex items-center gap-2 group cursor-default">
//                                 <Check className="w-4 h-4 text-emerald-500 transition-transform group-hover:scale-125" />
//                                 <span className="font-medium">Cancel anytime</span>
//                             </div>
//                             <div className="flex items-center gap-2 group cursor-default">
//                                 <Check className="w-4 h-4 text-emerald-500 transition-transform group-hover:scale-125" />
//                                 <span className="font-medium">No guarantees</span>
//                             </div>
//                             <div className="flex items-center gap-2 group cursor-default">
//                                 <Check className="w-4 h-4 text-emerald-500 transition-transform group-hover:scale-125" />
//                                 <span className="font-medium">Just context</span>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Orbital Job Cards Visualization - Refined with Brand Blue */}
//                     <div className="relative h-[500px] lg:h-[600px] hidden md:block animate-in zoom-in-95 duration-1000 delay-300">
//                         <div className="absolute inset-0 flex items-center justify-center">
//                             <div className="relative w-full h-full">
//                                 {/* Center Element */}
//                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 animate-in zoom-in-50 duration-1000 delay-500">
//                                     <div className="w-40 h-40 rounded-full bg-white border border-black/20 shadow-elevated flex items-center justify-center hover:scale-110 hover:shadow-black/30 transition-all duration-500 cursor-pointer group">
//                                         <div className="text-center">
//                                             <div className="text-4xl font-bold text-stripe-navy group-hover:text-brand-500 transition-colors">20k+</div>
//                                             <div className="text-[10px] text-brand-500 uppercase tracking-[0.2em] mt-1 font-bold">Jobs tracked</div>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Orbital Rings - More Visible Black */}
//                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-black/30 animate-in zoom-in-90 duration-1000" />
//                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-black/30 animate-in zoom-in-90 duration-1200" />
//                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-black/30 animate-in zoom-in-90 duration-1500" />

//                                 {/* Orbiting Job Cards - Refactored with premium elevation */}
//                                 <div className="orbit-card absolute w-56 bg-white border border-black/20 rounded-2xl p-5 shadow-premium hover:scale-110 hover:-translate-y-2 hover:shadow-elevated hover:border-black/40 transition-all duration-300 cursor-pointer group" style={{ animation: 'orbit1 25s linear infinite', top: '15%', left: '55%' }}>
//                                     <div className="flex items-center justify-between mb-4">
//                                         <span className="text-[10px] text-brand-500 font-bold uppercase tracking-wider px-2 py-1 bg-brand-50 rounded-lg group-hover:bg-brand-100 transition-colors border border-black/10">Posted 2h ago</span>
//                                         <Linkedin className="w-5 h-5 text-brand-500 group-hover:scale-110 transition-transform" />
//                                     </div>
//                                     <div className="font-bold text-sm mb-1 text-stripe-navy group-hover:text-brand-500 transition-colors">Product Designer</div>
//                                     <div className="text-xs text-stripe-slate font-medium mb-4">Notion Labs</div>
//                                     <div className="flex items-center gap-3 pt-4 border-t border-black/10">
//                                         <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-[10px] font-bold text-white transition-transform group-hover:rotate-12 group-hover:scale-110">SJ</div>
//                                         <span className="text-xs text-stripe-navy font-bold">Sarah Johnson</span>
//                                     </div>
//                                 </div>

//                                 <div className="orbit-card absolute w-56 bg-white border border-black/20 rounded-2xl p-5 shadow-premium hover:scale-110 hover:-translate-y-2 hover:shadow-elevated hover:border-black/40 transition-all duration-300 cursor-pointer group" style={{ animation: 'orbit2 30s linear infinite', top: '55%', left: '15%' }}>
//                                     <div className="flex items-center justify-between mb-4">
//                                         <span className="text-[10px] text-brand-500 font-bold uppercase tracking-wider px-2 py-1 bg-brand-50 rounded-lg group-hover:bg-brand-100 transition-colors border border-black/10">Posted 5h ago</span>
//                                         <Linkedin className="w-5 h-5 text-brand-500 group-hover:scale-110 transition-transform" />
//                                     </div>
//                                     <div className="font-bold text-sm mb-1 text-stripe-navy group-hover:text-brand-500 transition-colors">Engineering Lead</div>
//                                     <div className="text-xs text-stripe-slate font-medium mb-4">Stripe</div>
//                                     <div className="flex items-center gap-3 pt-4 border-t border-black/10">
//                                         <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white transition-transform group-hover:rotate-12 group-hover:scale-110">MC</div>
//                                         <span className="text-xs text-stripe-navy font-bold">Mike Chen</span>
//                                     </div>
//                                 </div>

//                                 <div className="orbit-card absolute w-56 bg-white border border-black/20 rounded-2xl p-5 shadow-premium hover:scale-110 hover:-translate-y-2 hover:shadow-elevated hover:border-black/40 transition-all duration-300 cursor-pointer group" style={{ animation: 'orbit3 28s linear infinite', top: '65%', left: '65%' }}>
//                                     <div className="flex items-center justify-between mb-4">
//                                         <span className="text-[10px] text-brand-500 font-bold uppercase tracking-wider px-2 py-1 bg-brand-50 rounded-lg group-hover:bg-brand-100 transition-colors border border-black/10">Posted 1d ago</span>
//                                         <Linkedin className="w-5 h-5 text-brand-500 group-hover:scale-110 transition-transform" />
//                                     </div>
//                                     <div className="font-bold text-sm mb-1 text-stripe-navy group-hover:text-brand-500 transition-colors">UX Researcher</div>
//                                     <div className="text-xs text-stripe-slate font-medium mb-4">Spotify</div>
//                                     <div className="flex items-center gap-3 pt-4 border-t border-black/10">
//                                         <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center text-[10px] font-bold text-white transition-transform group-hover:rotate-12 group-hover:scale-110">AL</div>
//                                         <span className="text-xs text-stripe-navy font-bold">Anna Lee</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* Featured/Trust Logos - Premium Refined */}
//             <section id="featured" className="py-14 border-y border-brand-500/5 bg-brand-50/20 overflow-hidden animate-in fade-in duration-1000">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 text-center animate-in slide-in-from-bottom-4 delay-200 duration-700">
//                     <p className="text-xs text-brand-500 uppercase tracking-[0.3em] font-bold opacity-60">Trusted by job seekers from</p>
//                 </div>

//                 {/* Marquee Container */}
//                 <div className="relative animate-in fade-in delay-300 duration-1000">
//                     {/* Gradient Masks - Refined for brand-50 bg */}
//                     <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-brand-50/20 to-transparent z-10" />
//                     <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-brand-50/20 to-transparent z-10" />

//                     {/* Scrolling Track */}
//                     <div className="flex animate-marquee">
//                         {[...companyLogos, ...companyLogos].map((company, idx) => {
//                             // Define Brand Styles (Color or Gradient)
//                             const getBrandStyles = (name: string) => {
//                                 switch (name) {
//                                     case 'Google':
//                                         return 'bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] bg-clip-text text-transparent opacity-80 group-hover:opacity-100';
//                                     case 'Microsoft':
//                                         return 'bg-gradient-to-r from-[#F25022] via-[#7FBA00] to-[#00A4EF] bg-clip-text text-transparent opacity-80 group-hover:opacity-100';
//                                     case 'Slack':
//                                         return 'bg-gradient-to-r from-[#E01E5A] via-[#36C5F0] to-[#2EB67D] bg-clip-text text-transparent opacity-80 group-hover:opacity-100';
//                                     case 'Meta':
//                                         return 'text-[#0668E1] opacity-70 group-hover:opacity-100';
//                                     case 'Amazon':
//                                         return 'text-[#FF9900] opacity-70 group-hover:opacity-100';
//                                     case 'Netflix':
//                                         return 'text-[#E50914] opacity-70 group-hover:opacity-100';
//                                     case 'Airbnb':
//                                         return 'text-[#FF5A5F] opacity-70 group-hover:opacity-100';
//                                     case 'Uber':
//                                         return 'text-stripe-navy opacity-70 group-hover:opacity-100';
//                                     case 'Apple':
//                                         return 'text-[#555555] opacity-70 group-hover:opacity-100';
//                                     case 'Adobe':
//                                         return 'text-[#FF0000] opacity-70 group-hover:opacity-100';
//                                     case 'Salesforce':
//                                         return 'bg-gradient-to-r from-[#00A1E0] to-[#0176D3] bg-clip-text text-transparent opacity-70 group-hover:opacity-100';
//                                     case 'Twitter':
//                                         return 'text-[#1DA1F2] opacity-70 group-hover:opacity-100';
//                                     default:
//                                         return 'text-stripe-slate opacity-70 group-hover:opacity-100';
//                                 }
//                             };

//                             return (
//                                 <div
//                                     key={`${idx}`}
//                                     className="group flex-shrink-0 px-16 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
//                                 >
//                                     <span className={`text-2xl font-bold ${getBrandStyles(company)} transition-all whitespace-nowrap cursor-default px-1 tracking-tight`}>
//                                         {company}
//                                     </span>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>
//             </section>

//             {/* How it Works - Premium Refined */}
//             <section id="how-it-works" className="py-20 px-4 sm:px-6 relative bg-white">
//                 <div className="max-w-6xl mx-auto">
//                     <div className="text-center max-w-2xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
//                         <div className="text-brand-500 font-bold text-xs tracking-[0.2em] uppercase mb-4">The Workflow</div>
//                         <h2 className="text-4xl md:text-5xl font-bold mb-6 text-stripe-navy tracking-tight">
//                             How seekers use WhoPosted
//                         </h2>
//                         <p className="text-stripe-slate font-medium text-lg">No onboarding required. The product explains itself through context.</p>
//                     </div>

//                     <div className="grid md:grid-cols-3 gap-10">
//                         {[
//                             {
//                                 step: '01',
//                                 title: 'Discover with context',
//                                 desc: 'See the job, posting recency, and the name and role of the person who shared it.',
//                                 icon: Eye,
//                                 gradient: 'from-brand-500 to-indigo-500',
//                                 delay: 'delay-100'
//                             },
//                             {
//                                 step: '02',
//                                 title: 'Prepare intentionally',
//                                 desc: 'Review the poster\'s role and company context. Tailor your approach based on who they are.',
//                                 icon: User,
//                                 gradient: 'from-brand-600 to-brand-400',
//                                 delay: 'delay-300'
//                             },
//                             {
//                                 step: '03',
//                                 title: 'Act or move on',
//                                 desc: 'Apply with context, reach out professionally, or skip if it\'s not right. You decide.',
//                                 icon: ArrowUpRight,
//                                 gradient: 'from-brand-700 to-indigo-600',
//                                 delay: 'delay-500'
//                             }
//                         ].map((item, idx) => (
//                             <div
//                                 key={idx}
//                                 className={`group relative p-10 rounded-3xl bg-white border border-brand-500/5 hover:border-brand-500/20 shadow-premium hover:shadow-elevated transition-all duration-500 animate-in fade-in slide-in-from-bottom-12 ${item.delay}`}
//                             >
//                                 {/* Large Step Number Background */}
//                                 <div className="absolute top-4 right-8 text-7xl font-bold text-brand-500/5 select-none pointer-events-none group-hover:scale-110 group-hover:text-brand-500/10 transition-all duration-700">
//                                     {item.step}
//                                 </div>

//                                 <div className="relative z-10">
//                                     {/* Icon in rounded square with gradient */}
//                                     <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-8 shadow-lg group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300`}>
//                                         <item.icon className="w-6 h-6 text-white" />
//                                     </div>

//                                     <h3 className="text-2xl font-bold mb-4 text-stripe-navy group-hover:text-brand-500 transition-colors uppercase tracking-tight">{item.title}</h3>
//                                     <p className="text-stripe-slate leading-relaxed text-base font-medium opacity-80">{item.desc}</p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* Trust & Boundaries - Refined with brand-soft accent */}
//             <section className="py-16 px-4 sm:px-6 bg-brand-50/30 relative overflow-hidden">
//                 <div className="max-w-4xl mx-auto relative z-10">
//                     <div className="text-center mb-16 animate-in fade-in duration-1000">
//                         <h2 className="text-3xl md:text-5xl font-bold mb-4 text-stripe-navy tracking-tight">Clear boundaries</h2>
//                         <p className="text-stripe-slate font-medium text-lg">WhoPosted supports common job-search behaviors without overpromising.</p>
//                     </div>

//                     <div className="grid md:grid-cols-2 gap-8">
//                         <div className="p-10 rounded-[32px] bg-white border border-brand-500/5 shadow-premium hover:shadow-elevated transition-all duration-500 animate-in slide-in-from-left-8 group">
//                             <h3 className="flex items-center gap-3 text-emerald-600 font-bold text-xl mb-8">
//                                 <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
//                                     <Check className="w-5 h-5" />
//                                 </div>
//                                 What we provide
//                             </h3>
//                             <ul className="space-y-5">
//                                 {[
//                                     'Name of the job poster',
//                                     'Link to public LinkedIn profile',
//                                     'Posting recency (real-time data)',
//                                     'Daily updates every 24 hours',
//                                     'Context for outreach decisions'
//                                 ].map((item, i) => (
//                                     <li key={i} className="flex items-start gap-4 text-stripe-slate group-hover:text-stripe-navy transition-colors cursor-default">
//                                         <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mt-0.5 shrink-0">
//                                             <Check className="w-4 h-4 text-emerald-500" />
//                                         </div>
//                                         <span className="text-base font-semibold">{item}</span>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>

//                         <div className="p-10 rounded-[32px] bg-white border border-brand-500/5 shadow-premium hover:shadow-elevated transition-all duration-500 opacity-90 hover:opacity-100 animate-in slide-in-from-right-8 group">
//                             <h3 className="flex items-center gap-3 text-stripe-slate font-bold text-xl mb-8">
//                                 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
//                                     <X className="w-5 h-5" />
//                                 </div>
//                                 What we do not provide
//                             </h3>
//                             <ul className="space-y-5">
//                                 {[
//                                     'Email addresses or private info',
//                                     'Automated messaging services',
//                                     'Resume submission services',
//                                     'Referral guarantees',
//                                     'Hiring outcome guarantees'
//                                 ].map((item, i) => (
//                                     <li key={i} className="flex items-start gap-4 text-stripe-slate/70 group-hover:text-stripe-navy transition-colors cursor-default">
//                                         <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mt-0.5 shrink-0">
//                                             <X className="w-4 h-4 text-slate-400" />
//                                         </div>
//                                         <span className="text-base font-normal">{item}</span>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     </div>
//                 </div>
//             </section>            {/* Email Preview - Premium Refined */}
//             <section className="py-20 px-4 sm:px-6 bg-white overflow-hidden">
//                 <div className="max-w-5xl mx-auto">
//                     <div className="grid lg:grid-cols-2 gap-16 items-center">
//                         <div className="animate-in slide-in-from-left-12 duration-1000">
//                             <h2 className="text-4xl md:text-5xl font-bold mb-8 text-stripe-navy leading-[1.1] tracking-tight">
//                                 One email per day.
//                                 <span className="block text-brand-500/40 mt-2 font-medium">No spam. No upsells.</span>
//                             </h2>
//                             <p className="text-lg text-stripe-slate mb-10 leading-relaxed font-medium opacity-90">
//                                 Get a daily digest of new job postings with poster information delivered to your inbox.
//                                 Unsubscribe anytime. No marketing banners. Just jobs and context.
//                             </p>
//                             <div className="space-y-6">
//                                 <div className="flex items-center gap-5 text-sm group cursor-default">
//                                     <div className="w-12 h-12 rounded-2xl bg-brand-500/5 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6 border border-brand-500/10 shadow-sm">
//                                         <Clock className="w-6 h-6 text-brand-500" />
//                                     </div>
//                                     <span className="text-stripe-navy font-bold text-base">Daily at 9 AM EST</span>
//                                 </div>
//                                 <div className="flex items-center gap-5 text-sm group cursor-default">
//                                     <div className="w-12 h-12 rounded-2xl bg-brand-500/5 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-rotate-6 border border-brand-500/10 shadow-sm">
//                                         <Shield className="w-6 h-6 text-brand-500" />
//                                     </div>
//                                     <span className="text-stripe-navy font-bold text-base">No spam, ever</span>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="relative animate-in slide-in-from-right-12 duration-1000 delay-200">
//                             <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-indigo-500/5 blur-3xl opacity-50" />
//                             {/* Browser Mockup - Premium Refined */}
//                             <div className="relative bg-white border border-brand-500/10 rounded-[32px] overflow-hidden shadow-elevated hover:shadow-2xl hover:scale-[1.02] transition-all duration-700 cursor-default group p-1">
//                                 <div className="bg-brand-50/50 px-8 py-5 border-b border-brand-500/5 flex items-center gap-4">
//                                     <div className="flex gap-2.5">
//                                         <div className="w-3.5 h-3.5 rounded-full bg-red-400/20 group-hover:bg-red-400 transition-colors" />
//                                         <div className="w-3.5 h-3.5 rounded-full bg-amber-400/20 group-hover:bg-amber-400 transition-colors" />
//                                         <div className="w-3.5 h-3.5 rounded-full bg-emerald-400/20 group-hover:bg-emerald-400 transition-colors" />
//                                     </div>
//                                     <span className="text-xs text-stripe-slate ml-4 font-bold uppercase tracking-widest opacity-60">WhoPosted Daily Digest</span>
//                                 </div>
//                                 <div className="p-10 space-y-8 bg-white">
//                                     <div className="animate-in fade-in duration-1000 delay-500">
//                                         <h4 className="text-2xl font-bold mb-1 text-stripe-navy tracking-tight">12 new roles today</h4>
//                                         <p className="text-sm text-stripe-slate font-bold uppercase tracking-wider opacity-60">United States & Remote</p>
//                                     </div>

//                                     {[
//                                         { role: 'Senior Product Manager', company: 'Figma', poster: 'Alex Chen', time: '2h ago' },
//                                         { role: 'UX Researcher', company: 'Spotify', poster: 'Maria Garcia', time: '5h ago' },
//                                         { role: 'Engineering Lead', company: 'Stripe', poster: 'James Wilson', time: '8h ago' }
//                                     ].map((job, i) => (
//                                         <div key={i} className="flex items-center justify-between py-5 border-b border-brand-500/5 last:border-0 hover:bg-brand-500/5 transition-all -mx-6 px-6 rounded-2xl cursor-pointer group/item animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: `${700 + i * 100}ms` }}>
//                                             <div>
//                                                 <div className="font-bold text-base text-stripe-navy group-hover/item:text-brand-500 transition-colors">{job.role}</div>
//                                                 <div className="text-sm text-stripe-slate font-semibold opacity-70">{job.company}</div>
//                                             </div>
//                                             <div className="text-right">
//                                                 <div className="text-sm text-brand-500 font-bold mb-1 group-hover/item:scale-105 transition-transform origin-right">{job.poster}</div>
//                                                 <div className="text-xs text-stripe-slate/60 font-bold uppercase tracking-wider">{job.time}</div>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>
//             {/* Pricing Section - Premium Card Refined */}
//             <section id="pricing" className="py-24 px-4 sm:px-6 bg-brand-50/20 relative">
//                 <div className="max-w-4xl mx-auto text-center">
//                     <div className="inline-block px-6 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 text-xs font-bold uppercase tracking-widest mb-10 animate-in zoom-in-95 duration-500">
//                         Limited Time Offer
//                     </div>
//                     <h2 className="text-4xl md:text-6xl font-bold mb-8 text-stripe-navy tracking-[ -0.02em] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
//                         Monthly subscription. <br></br><span className="text-brand-500">Get full access.</span>
//                     </h2>
//                     <p className="text-stripe-slate mb-16 font-semibold text-xl animate-in fade-in duration-1000 delay-300 opacity-80">
//                         Low friction. Low regret. Just clarity.
//                     </p>

//                     <div className="relative inline-block animate-in zoom-in-90 duration-1000 delay-400">
//                         <div className="absolute inset-0 bg-brand-500/10 blur-[100px] rounded-full animate-pulse" />
//                         <div className="relative bg-white border border-brand-500/10 rounded-[48px] p-16 md:p-24 max-w-xl mx-auto shadow-elevated hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-4 transition-all duration-700 group cursor-default">
//                             <div className="text-8xl font-black mb-6 text-stripe-navy tracking-tighter group-hover:scale-110 group-hover:text-brand-500 transition-all duration-500 flex items-center justify-center gap-1">
//                                 <span className="text-4xl font-bold opacity-30 mt-4">$</span>
//                                 4.99
//                             </div>
//                             <div className="text-brand-500 text-xs mb-14 uppercase tracking-[0.3em] font-black opacity-80">per month</div>

//                             <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-16">
//                                 {[
//                                     'Daily US jobs',
//                                     'Poster profile links',
//                                     'Daily email digest',
//                                     'Regular updates',
//                                     'Cancel anytime',
//                                     'Priority Support'
//                                 ].map((feature, i) => (
//                                     <li key={i} className="flex items-center gap-4 text-base text-stripe-navy font-bold group/feat">
//                                         <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover/feat:scale-125 transition-transform">
//                                             <Check className="w-4 h-4 text-emerald-600" />
//                                         </div>
//                                         {feature}
//                                     </li>
//                                 ))}
//                             </ul>

//                             <button
//                                 onClick={() => setShowPaymentModal(true)}
//                                 className="w-full bg-brand-500 text-white py-6 rounded-[24px] font-black text-xl hover:bg-brand-600 transition-all duration-300 hover:scale-[1.05] hover:-translate-y-2 shadow-elevated shadow-brand-500/30 active:scale-95 flex items-center justify-center gap-4 group/btn"
//                             >
//                                 Get monthly subscription
//                                 <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
//                             </button>

//                             <p className="mt-10 text-xs text-stripe-slate/50 italic font-bold uppercase tracking-widest">
//                                 Tools for clarity, not promises.
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* Testimonials - Premium Card Refined */}
//             <section id="testimonial" className="py-24 px-4 sm:px-6 bg-white overflow-hidden">
//                 <div className="max-w-6xl mx-auto">
//                     <div className="text-center mb-24 animate-in fade-in duration-1000">
//                         <p className="text-brand-500 text-xs font-bold uppercase tracking-[0.4em] mb-4">Testimonials</p>
//                         <h2 className="text-4xl md:text-5xl font-bold text-stripe-navy tracking-tight">
//                             Real seekers. <span className="text-brand-500">Real outcomes.</span>
//                         </h2>
//                     </div>

//                     <div className="relative">
//                         <button
//                             onClick={prevTestimonial}
//                             className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-10 z-20 w-16 h-16 rounded-full bg-white hover:bg-brand-50 border border-brand-500/10 flex items-center justify-center transition-all hover:scale-110 shadow-premium hover:shadow-elevated hidden md:flex active:scale-90 group"
//                         >
//                             <ChevronLeft className="w-8 h-8 text-stripe-navy group-hover:text-brand-500 transition-colors" />
//                         </button>
//                         <button
//                             onClick={nextTestimonial}
//                             className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-10 z-20 w-16 h-16 rounded-full bg-white hover:bg-brand-50 border border-brand-500/10 flex items-center justify-center transition-all hover:scale-110 shadow-premium hover:shadow-elevated hidden md:flex active:scale-90 group"
//                         >
//                             <ChevronRight className="w-8 h-8 text-stripe-navy group-hover:text-brand-500 transition-colors" />
//                         </button>

//                         <div className="grid md:grid-cols-3 gap-10">
//                             {[0, 1, 2].map((offset) => {
//                                 const index = (currentTestimonial + offset) % testimonials.length;
//                                 const testimonial = testimonials[index];
//                                 return (
//                                     <div
//                                         key={index}
//                                         className="bg-white border border-brand-500/5 rounded-[40px] p-12 hover:border-brand-400/20 transition-all duration-500 shadow-premium hover:shadow-elevated hover:scale-[1.03] hover:-translate-y-3 group animate-in zoom-in-95 duration-700 relative overflow-hidden"
//                                         style={{ animationDelay: `${offset * 150}ms` }}
//                                     >
//                                         <div className="flex gap-1.5 mb-8">
//                                             {[...Array(5)].map((_, i) => (
//                                                 <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400 group-hover:scale-125 transition-transform duration-300" style={{ transitionDelay: `${i * 50}ms` }} />
//                                             ))}
//                                         </div>

//                                         <p className="text-stripe-navy text-lg leading-relaxed mb-10 font-medium italic opacity-85 group-hover:opacity-100 transition-opacity relative z-10">
//                                             &ldquo;{testimonial.quote}&rdquo;
//                                         </p>

//                                         <div className="flex items-center gap-5 pt-8 border-t border-brand-500/5 mt-auto">
//                                             <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center text-lg font-bold text-white shadow-lg group-hover:rotate-6 group-hover:scale-110 transition-transform">
//                                                 {testimonial.avatar}
//                                             </div>
//                                             <div>
//                                                 <div className="font-bold text-base text-stripe-navy">{testimonial.name}</div>
//                                                 <div className="text-sm text-brand-500 font-bold uppercase tracking-wider">{testimonial.role}</div>
//                                                 <div className="text-xs text-stripe-slate font-medium mt-0.5">{testimonial.company}</div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 );
//                             })}
//                         </div>

//                         <div className="flex justify-center gap-4 mt-16">
//                             {testimonials.map((_, i) => (
//                                 <button
//                                     key={i}
//                                     onClick={() => setCurrentTestimonial(i)}
//                                     className={`h-2.5 rounded-full transition-all duration-500 ${i === currentTestimonial ? 'bg-brand-500 w-16' : 'bg-brand-500/10 w-4 hover:bg-brand-500/30'
//                                         }`}
//                                 />
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* FAQ - Premium Modern Accordion-inspired items */}
//             <section className="py-24 px-4 sm:px-6 bg-white">
//                 <div className="max-w-4xl mx-auto">
//                     <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 text-stripe-navy tracking-tight animate-in fade-in duration-1000">Support & FAQ</h2>
//                     <div className="grid md:grid-cols-1 gap-6">
//                         {[
//                             {
//                                 q: 'How is this different from LinkedIn job alerts?',
//                                 a: 'Job alerts tell you a job exists. WhoPosted reveals the identity behind the post. Top career strategists always recommend identifying or connecting with the poster—we just automate that discovery for you.'
//                             },
//                             {
//                                 q: 'Do you provide email addresses?',
//                                 a: 'No. We respect privacy and professional boundaries. We only provide public LinkedIn profile links. How you proceed (engaging, following, or applying) is your tactical decision.'
//                             },
//                             {
//                                 q: 'Does this guarantee I\'ll get hired?',
//                                 a: 'No. WhoPosted provides competitive context, not a guaranteed outcome. Hiring relies on your skills and performance; we just ensure you\'re not applying blind.'
//                             },
//                             {
//                                 q: 'Is this available outside the USA?',
//                                 a: 'WhoPosted is tailored specifically for the high-density US tech and corporate job markets. We currently serve customers operating within the United States.'
//                             }
//                         ].map((faq, i) => (
//                             <div key={i} className="group border border-brand-500/5 rounded-[32px] p-10 hover:border-brand-500/20 transition-all duration-500 bg-white hover:bg-brand-50/50 shadow-premium hover:shadow-elevated hover:translate-x-3 animate-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: `${i * 100}ms` }}>
//                                 <h3 className="font-bold mb-5 text-2xl text-stripe-navy leading-tight group-hover:text-brand-500 transition-colors tracking-tight">{faq.q}</h3>
//                                 <p className="text-stripe-slate text-lg leading-relaxed font-medium opacity-80">{faq.a}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* Contact/Footer - Premium Refined */}
//             <footer id="contact" className="py-24 px-4 sm:px-6 border-t border-brand-500/10 bg-white animate-in fade-in duration-1000">
//                 <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
//                     <div className="flex items-center gap-4 group cursor-pointer transition-transform hover:scale-105 duration-300">
//                         <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-elevated shadow-brand-500/20 group-hover:rotate-12 transition-transform">
//                             <span className="text-white font-bold text-xl">W</span>
//                         </div>
//                         <span className="font-bold text-2xl text-stripe-navy tracking-tight group-hover:text-brand-500 transition-colors">WhoPosted</span>
//                     </div>

//                     <div className="flex gap-12 text-base text-stripe-navy/60 font-bold uppercase tracking-wider">
//                         <a href="#" className="hover:text-brand-500 transition-all hover:scale-105">Privacy</a>
//                         <a href="#" className="hover:text-brand-500 transition-all hover:scale-105">Terms</a>
//                         <a href="#" className="hover:text-brand-500 transition-all hover:scale-105">Contact Us</a>
//                     </div>

//                     <div className="text-sm text-stripe-slate/50 font-bold tracking-[0.2em] uppercase">
//                         © 2024 WhoPosted. All rights reserved.
//                     </div>
//                 </div>
//             </footer>

//             {showPaymentModal && (
//                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
//                     <div className="relative w-full max-w-2xl my-8">
//                         <PayPalPayment onClose={() => setShowPaymentModal(false)} />
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default Home;
