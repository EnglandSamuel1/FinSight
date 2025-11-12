import { LandingNav } from '@/components/landing/LandingNav';
import { WaitlistForm } from '@/components/landing/WaitlistForm';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Landing Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-24">
        {/* Animated Background */}
        <div className="absolute top-[-300px] right-[-300px] w-[1200px] h-[1200px] bg-gradient-radial from-teal-500/12 to-transparent rounded-full pointer-events-none animate-float" />
        <div className="absolute bottom-[-200px] left-[-200px] w-[800px] h-[800px] bg-gradient-radial from-cyan-500/10 to-transparent rounded-full pointer-events-none animate-float-reverse" />

        <div className="max-w-[1400px] mx-auto px-8 py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Hero Content */}
            <div className="relative z-10 max-w-2xl animate-fadeInUp">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20 rounded-full text-sm font-semibold text-teal-600 mb-8 backdrop-blur-sm animate-fadeIn">
                ✨ AI-Powered Budgeting
              </div>

              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-semibold leading-[1.05] tracking-tight mb-8 animate-fadeInUp animation-delay-200">
                <span className="bg-gradient-to-r from-slate-900 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Budgeting
                </span>
                <br />
                that actually
                <br />
                works.
              </h1>

              <p className="text-xl lg:text-2xl text-slate-600 leading-relaxed mb-12 max-w-xl animate-fadeInUp animation-delay-400">
                No spreadsheets. No manual entry. Just upload, review, and see your finances clearly.
                Transform financial planning from stressful to empowering.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fadeInUp animation-delay-600">
                <a
                  href="#signup"
                  className="group relative inline-flex items-center justify-center gap-2 px-10 py-5 bg-slate-900 text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-teal-600 hover:-translate-y-1 hover:shadow-2xl hover:shadow-teal-600/30 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10">Join the Waitlist</span>
                  <span className="relative z-10">→</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 animate-fadeInUp animation-delay-1000">
                {[
                  { number: '90%+', label: 'Accuracy' },
                  { number: '<2 min', label: 'Complete' },
                  { number: 'Zero', label: 'Manual Entry' },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:-translate-y-1 hover:shadow-lg hover:border-teal-600 transition-all duration-300"
                  >
                    <div className="text-4xl font-semibold bg-gradient-to-br from-teal-600 to-cyan-600 bg-clip-text text-transparent leading-none mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative z-10 flex items-center justify-center animate-fadeIn animation-delay-800">
              <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform perspective-1000 rotate-y-minus-5 rotate-x-5 hover:rotate-y-0 hover:rotate-x-0 hover:scale-105 transition-all duration-500">
                <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-6 text-white">
                  <h4 className="text-xl font-semibold mb-1">Monthly Budget Overview</h4>
                  <p className="text-white/90 text-sm">December 2025</p>
                </div>
                <div className="p-8 space-y-4">
                  {[
                    { name: 'Groceries', spent: 450, budget: 500, color: 'teal' },
                    { name: 'Dining Out', spent: 380, budget: 400, color: 'yellow' },
                    { name: 'Entertainment', spent: 250, budget: 200, color: 'red' },
                  ].map((item, index) => (
                    <div key={index} className="bg-slate-50 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-slate-900">{item.name}</span>
                        <span className="text-slate-600">
                          ${item.spent} / ${item.budget}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full ${
                            item.color === 'teal'
                              ? 'bg-gradient-to-r from-teal-500 to-teal-600'
                              : item.color === 'yellow'
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                              : 'bg-gradient-to-r from-red-400 to-red-500'
                          }`}
                          style={{ width: `${Math.min((item.spent / item.budget) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-600">
                        {item.spent < item.budget
                          ? `$${item.budget - item.spent} remaining`
                          : `$${item.spent - item.budget} over budget`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-white relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        <div className="max-w-[1400px] mx-auto px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-24">
            <div className="inline-block text-sm font-semibold text-teal-600 tracking-wider uppercase mb-4">
              Features
            </div>
            <h2 className="text-5xl lg:text-6xl font-semibold text-slate-900 mb-6 leading-tight">
              Everything you need to take control
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              FinSight automates the entire budgeting workflow, making financial planning effortless and stress-free.
            </p>
          </div>

          {/* Feature Items */}
          <div className="space-y-32">
            {/* Feature 1: Upload */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="text-sm font-semibold text-teal-600 tracking-wider uppercase mb-4">
                  01
                </div>
                <h3 className="text-4xl lg:text-5xl font-semibold text-slate-900 mb-6 leading-tight">
                  Super Easy Upload
                </h3>
                <p className="text-xl text-slate-600 leading-relaxed mb-8">
                  Upload transactions from any bank in CSV or PDF format. Our bank-agnostic parser handles
                  different formats automatically — no manual data entry required.
                </p>
                <ul className="space-y-4">
                  {[
                    'Drag and drop multiple files at once',
                    'Supports all major bank formats',
                    'Automatic parsing and validation',
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                        ✓
                      </span>
                      <span className="text-lg text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative bg-slate-50 rounded-3xl p-12 border-2 border-dashed border-slate-300 hover:border-teal-500 transition-all duration-300 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 rounded-3xl animate-shimmer" />
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center text-6xl mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                      📤
                    </div>
                    <div className="text-center">
                      <h4 className="text-xl font-semibold text-slate-900 mb-2">Drop files here</h4>
                      <p className="text-slate-600">or click to browse</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: AI Categorization */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
                  <div className="space-y-4">
                    {[
                      { icon: '🛒', name: 'Whole Foods Market', amount: '$127.43', category: 'Groceries' },
                      { icon: '🍕', name: 'Pizza Palace', amount: '$28.50', category: 'Dining Out' },
                      { icon: '🎬', name: 'Netflix', amount: '$15.99', category: 'Entertainment' },
                    ].map((transaction, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 hover:translate-x-2 transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center text-2xl shadow-md">
                          {transaction.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900">{transaction.name}</div>
                          <div className="text-sm text-slate-600">Just now</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">{transaction.amount}</div>
                          <div className="inline-block px-3 py-1 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20 rounded-full text-xs font-semibold text-teal-600">
                            {transaction.category}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-teal-600 tracking-wider uppercase mb-4">
                  02
                </div>
                <h3 className="text-4xl lg:text-5xl font-semibold text-slate-900 mb-6 leading-tight">
                  Intelligent Categorization
                </h3>
                <p className="text-xl text-slate-600 leading-relaxed mb-8">
                  AI automatically categorizes your transactions with 90%+ accuracy. The system learns from
                  your corrections, getting smarter over time.
                </p>
                <ul className="space-y-4">
                  {[
                    '90%+ accuracy on first pass',
                    'Learns from your preferences',
                    'Quick inline corrections',
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                        ✓
                      </span>
                      <span className="text-lg text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feature 3: Dashboard */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="text-sm font-semibold text-teal-600 tracking-wider uppercase mb-4">
                  03
                </div>
                <h3 className="text-4xl lg:text-5xl font-semibold text-slate-900 mb-6 leading-tight">
                  Clean Dashboard
                </h3>
                <p className="text-xl text-slate-600 leading-relaxed mb-8">
                  See your spending vs budget at a glance with color-coded status indicators. Visual progress
                  bars show exactly where you stand in each category.
                </p>
                <ul className="space-y-4">
                  {[
                    'Real-time budget tracking',
                    'Color-coded status indicators',
                    'Visual progress bars',
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                        ✓
                      </span>
                      <span className="text-lg text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 transform hover:scale-105 transition-all duration-500">
                  <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl p-6 text-white mb-8">
                    <h4 className="text-lg font-semibold mb-1">Monthly Budget Overview</h4>
                    <p className="text-white/90 text-sm">December 2025</p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { name: 'Groceries', spent: 450, budget: 500 },
                      { name: 'Dining Out', spent: 380, budget: 400 },
                      { name: 'Entertainment', spent: 250, budget: 200 },
                    ].map((item, index) => (
                      <div key={index} className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-slate-900">{item.name}</span>
                          <span className="text-slate-600 text-sm">
                            ${item.spent} / ${item.budget}
                          </span>
                        </div>
                        <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.spent / item.budget < 0.8
                                ? 'bg-gradient-to-r from-teal-500 to-teal-600'
                                : item.spent / item.budget < 1
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                                : 'bg-gradient-to-r from-red-400 to-red-500'
                            }`}
                            style={{ width: `${Math.min((item.spent / item.budget) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-600">
                          {item.spent < item.budget
                            ? `$${item.budget - item.spent} remaining`
                            : `$${item.spent - item.budget} over budget`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Waitlist Section */}
      <section id="signup" className="relative py-32 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-cyan-600" />

        {/* Animated Blobs */}
        <div className="absolute top-[-50%] right-[-20%] w-[800px] h-[800px] bg-white/15 rounded-full animate-float" />
        <div className="absolute bottom-[-50%] left-[-20%] w-[800px] h-[800px] bg-white/10 rounded-full animate-float-reverse" />

        <div className="relative z-10 max-w-[800px] mx-auto px-8 text-center">
          <h2 className="text-5xl lg:text-6xl font-semibold text-white mb-6 leading-tight">
            Join the waitlist
          </h2>
          <p className="text-xl lg:text-2xl text-white/95 leading-relaxed mb-12">
            Be the first to know when FinSight launches. Get early access and exclusive updates.
          </p>

          <WaitlistForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <h4 className="text-2xl font-semibold mb-4">FinSight</h4>
              <p className="text-white/70 leading-relaxed">
                Effortless personal finance management powered by AI. Transform financial planning from
                stressful to empowering.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-white/70 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#signup" className="text-white/70 hover:text-white transition-colors">
                    Join Waitlist
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-white/70 hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <a href="mailto:hello@finsight.app" className="text-white/70 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-white/60 text-sm">
            <p>&copy; 2025 FinSight. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
