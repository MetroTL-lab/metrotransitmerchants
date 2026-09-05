import React, { useState } from 'react';
import { ArrowRight, Bike, CheckCircle2, Mail, Phone, ShieldCheck, Store } from 'lucide-react';

export const Footer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText('+234 801 456 0989');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.location.href = 'tel:+2348014560989';
    }
  };

  return (
    <footer id="contact" className="bg-[#131313] border-t border-zinc-800 text-zinc-400 pt-14 pb-10 scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-7 sm:p-8 bg-gradient-to-r from-zinc-900 via-[#121212] to-zinc-900 border border-zinc-800 rounded-2xl mb-14 flex flex-col lg:flex-row items-center justify-between gap-7 shadow-2xl">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#D61F26]">
              <Store className="w-3.5 h-3.5 text-[#D61F26]" />Merchant Onboarding
            </div>
            <h3 className="text-xl font-bold text-white">Ready to be a Merchant?</h3>
            <p className="text-xs text-zinc-400 max-w-xl">
              Complete your application and our merchant success team will review your profile for the next onboarding stage.
            </p>
          </div>

          <button
            type="button"
            onClick={() => scrollTo('apply-form')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#D61F26] hover:bg-[#b8181e] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-[#D61F26]/20 hover:scale-[1.02] whitespace-nowrap"
          >
            <span>Start Onboarding Application</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-zinc-800">
          <div className="lg:col-span-2 space-y-4">
            <button type="button" onClick={() => scrollTo('rider-portal')} className="flex items-center gap-3 text-left group">
              <div className="relative flex items-center justify-center w-10 h-10 overflow-hidden shadow-lg shadow-black/20 group-hover:scale-105 transition-transform">
                {/* Vite will successfully serve this from your public folder */}
                <img 
                  src="/images/favicon.svg" 
                  alt="Metro Transit Logistics Logo" 
                />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white block uppercase leading-none">
                  Metro Transit <span className="text-[#D61F26]">Logistics</span>
                </span>
                <span className="text-[9px] font-semibold tracking-widest text-zinc-400 block uppercase mt-0.5">
                  RIDER & DRIVER PORTAL
                </span>
              </div>
            </button>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Join a professional dispatch and logistics network built around steady delivery opportunities, safety, and reliable rider support.
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Safety & verification focused</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Merchant Success Desk</h4>
            <div className="space-y-3 text-xs">
              <a href="mailto:careers@metrotransit.com.ng" className="flex items-start gap-2.5 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-[#D61F26] shrink-0 mt-0.5" />
                <span>merchantsuccess@metrotransit.com.ng</span>
              </a>
              <button onClick={copyPhone} className="flex items-start gap-2.5 hover:text-white transition-colors text-left">
                <Phone className="w-4 h-4 text-[#D61F26] shrink-0 mt-0.5" />
                <span>{copied ? 'Number copied!' : '+234 801 456 0989'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} Metro Transit Logistics. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="mailto:merchantsuccess@metrotransit.com.ng" className="hover:text-zinc-300 transition-colors">Merchant Success</a>
            <button onClick={() => scrollTo('requirements')} className="hover:text-zinc-300 transition-colors">Merchant Requirements</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
