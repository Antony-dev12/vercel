import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
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
            <span className='font-black text-slate-800 text-sm tracking-tight'>Vercel</span>
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
                <Shield size={14} />
                Trust & Safety
              </div>
              <h1 className='text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight'>Privacy Policy</h1>
              <p className='text-slate-400 font-semibold'>Last updated: March 31, 2026</p>
            </div>

            <div className='space-y-16'>
              {/* Section 1 */}
              <section>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-2.5 rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-100'>
                    <Eye size={22} />
                  </div>
                  <h2 className='text-2xl font-black text-slate-900 tracking-tight'>1. Information We Collect</h2>
                </div>
                <div className='space-y-6 text-slate-600 leading-relaxed text-lg'>
                  <p>
                    We collect information to provide better services to our <span className='text-teal-600 font-bold'>Kenyan SME partners</span>. This includes:
                  </p>
                  <ul className='space-y-4'>
                    <li className='flex gap-3'>
                      <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0' />
                      <span><strong className='text-slate-900'>Account Information:</strong> Name (e.g., Amina Hassan), email address, and business details.</span>
                    </li>
                    <li className='flex gap-3'>
                      <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0' />
                      <span><strong className='text-slate-900'>Business Data:</strong> Digital presence metrics and history uploaded to the tracker.</span>
                    </li>
                    <li className='flex gap-3'>
                      <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0' />
                      <span><strong className='text-slate-900'>Technical Data:</strong> IP addresses, browser type, and usage patterns stored in our <span className='text-teal-600 font-bold'>PostgreSQL database</span>.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-2.5 rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-100'>
                    <FileText size={22} />
                  </div>
                  <h2 className='text-2xl font-black text-slate-900 tracking-tight'>2. How We Use Data</h2>
                </div>
                <div className='space-y-4 text-slate-600 leading-relaxed text-lg'>
                  <p>Your data helps us empower your business growth through:</p>
                  <ul className='space-y-4'>
                    <li className='flex gap-3'>
                      <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0' />
                      <span>Providing <span className='text-teal-600 font-bold'>personalized business recommendations</span> and growth analysis.</span>
                    </li>
                    <li className='flex gap-3'>
                      <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0' />
                      <span>Maintaining the security and integrity of your data using <span className='text-teal-600 font-bold'>cryptographic hashing</span>.</span>
                    </li>
                    <li className='flex gap-3'>
                      <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0' />
                      <span>Communicating updates regarding <span className='text-teal-600 font-bold'>EPRA fuel price impacts</span> or market trends relevant to your business.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-2.5 rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-100'>
                    <Lock size={22} />
                  </div>
                  <h2 className='text-2xl font-black text-slate-900 tracking-tight'>3. Data Storage & Security</h2>
                </div>
                <p className='text-slate-600 leading-relaxed text-lg'>
                  Your data is stored securely. We implement industry-standard encryption to protect against unauthorized access, specifically addressing risks like <span className='text-teal-600 font-bold'>ransomware</span> that affect local SMEs.
                </p>
              </section>

              {/* Section 4 */}
              <section>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-2.5 rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-100'>
                    <Shield size={22} />
                  </div>
                  <h2 className='text-2xl font-black text-slate-900 tracking-tight'>4. Data Protection Rights (Kenya DPA 2019)</h2>
                </div>
                <div className='space-y-6 text-slate-600 leading-relaxed text-lg'>
                  <p>
                    In compliance with the <span className='text-teal-600 font-bold'>Kenya Data Protection Act</span>, you have the right to:
                  </p>
                  <ul className='space-y-4'>
                    <li className='flex gap-3'>
                      <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0' />
                      <span>Access your personal data.</span>
                    </li>
                    <li className='flex gap-3'>
                      <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0' />
                      <span>Request correction or deletion of your information.</span>
                    </li>
                    <li className='flex gap-3'>
                      <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0' />
                      <span>Object to the processing of your data.</span>
                    </li>
                  </ul>
                </div>
              </section>
            </div>

            {/* Footer Note */}
            <div className='mt-24 pt-12 border-t border-slate-100 text-center text-slate-400 text-sm font-medium'>
              © 2026 Vercel. All rights reserved. Registered under Kenyan Law.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
