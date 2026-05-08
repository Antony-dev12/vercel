import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, User, Zap, AlertTriangle, Gavel } from 'lucide-react';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-slate-50 flex flex-col'>
      {/* Sticky Header with Blur */}
      <header className='sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200'>
        <div className='max-w-4xl mx-auto px-4 h-16 flex items-center justify-between'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-all font-bold group'
          >
            <div className='p-1.5 rounded-lg group-hover:bg-teal-50 transition-colors'>
              <ArrowLeft size={20} />
            </div>
            Back
          </button>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-200'>
              <span className='text-white font-black text-xs'>D</span>
            </div>
            <span className='font-black text-slate-800 text-sm tracking-tight'>RadaBiz</span>
          </div>
        </div>
      </header>

      <main className='flex-1 py-12 px-4'>
        <div className='max-w-4xl mx-auto'>
          {/* Main Content Card */}
          <div className='bg-white p-8 md:p-16 rounded-[2.5rem] shadow-sm border border-slate-100'>

            {/* Title Section */}
            <div className='mb-16'>
              <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-600 text-xs font-bold uppercase tracking-wider mb-4'>
                <CheckCircle size={14} />
                Agreement
              </div>
              <h1 className='text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight'>Terms of Service</h1>
              <p className='text-slate-400 font-semibold'>Last updated: March 31, 2026</p>
            </div>

            <div className='space-y-16'>
              {/* Section 1 */}
              <section>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-2.5 rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-100'>
                    <CheckCircle size={22} />
                  </div>
                  <h2 className='text-2xl font-black text-slate-900 tracking-tight'>1. Acceptance of Terms</h2>
                </div>
                <p className='text-slate-600 leading-relaxed text-lg'>
                  By accessing the <span className='text-teal-600 font-bold'>Digital Presence Tracker</span>, you agree to be bound by these terms. If you are using this on behalf of a business, you represent that you have the authority to bind that entity.
                </p>
              </section>

              {/* Section 2 */}
              <section>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-2.5 rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-100'>
                    <User size={22} />
                  </div>
                  <h2 className='text-2xl font-black text-slate-900 tracking-tight'>2. User Accounts</h2>
                </div>
                <p className='text-slate-600 leading-relaxed text-lg'>
                  You are responsible for maintaining the confidentiality of your account and the <span className='text-teal-600 font-bold'>"L-arrow" logout security protocol</span>. You must notify us immediately of any unauthorized use of your account.
                </p>
              </section>

              {/* Section 3 */}
              <section>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-2.5 rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-100'>
                    <Zap size={22} />
                  </div>
                  <h2 className='text-2xl font-black text-slate-900 tracking-tight'>3. Use of Analytics & Recommendations</h2>
                </div>
                <p className='text-slate-600 leading-relaxed text-lg'>
                  The "Insights" and "Recommendations" provided by the app are for informational purposes. While we track market trends (including <span className='text-teal-600 font-bold'>EPRA reviews</span>), Digital Presence Tracker is not responsible for financial losses incurred based on automated suggestions.
                </p>
              </section>

              {/* Section 4 */}
              <section>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-2.5 rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-100'>
                    <AlertTriangle size={22} />
                  </div>
                  <h2 className='text-2xl font-black text-slate-900 tracking-tight'>4. Limitation of Liability</h2>
                </div>
                <p className='text-slate-600 leading-relaxed text-lg'>
                  To the maximum extent permitted by <span className='text-teal-600 font-bold'>Kenyan law</span>, Larrow shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the service.
                </p>
              </section>

              {/* Section 5 */}
              <section>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-2.5 rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-100'>
                    <Gavel size={22} />
                  </div>
                  <h2 className='text-2xl font-black text-slate-900 tracking-tight'>5. Governing Law</h2>
                </div>
                <p className='text-slate-600 leading-relaxed text-lg'>
                  These terms are governed by the laws of the <span className='text-teal-600 font-bold'>Republic of Kenya</span>. Any disputes shall be resolved in the courts of Kenya.
                </p>
              </section>
            </div>

            {/* Footer Note */}
            <div className='mt-24 pt-12 border-t border-slate-100 text-center text-slate-400 text-sm font-medium'>
              © 2026 RadaBiz. All rights reserved. Registered under Kenyan Law.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
