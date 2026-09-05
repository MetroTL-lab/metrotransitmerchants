import React, { useState, useRef } from 'react';
import { 
  Store, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  DollarSign, 
  Calendar, 
  ArrowLeft, 
  Send, 
  Award, 
  MapPin, 
  Phone, 
  Clock, 
  FileText,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  Zap,
  Layers,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Building,
  Check,
  Upload,
  Trash2,
  Image as ImageIcon,
  CreditCard,
  Hash,
  Building2,
  FileCheck
} from 'lucide-react';
import type { SellerApplicationForm, UploadedDocDetail } from './types';

interface SellerOnboardingPageProps {
  onBackToHome: () => void;
}

export const SellerOnboardingPage: React.FC<SellerOnboardingPageProps> = ({ onBackToHome }) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Drag-and-drop visual states
  const [dragActive, setDragActive] = useState<{ [key: string]: boolean }>({});

  // Hidden file input refs for click-to-upload
  const cacInputRef = useRef<HTMLInputElement | null>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const ownerIdInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<SellerApplicationForm>({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    businessCategory: 'Fashion & Apparel',
    monthlyVolume: '101 - 500 parcels / month (Growth Tier)',
    operatingCity: 'Lagos',
    pickupAddress: '',
    websiteOrSocial: '',
    servicesNeeded: ['Same-Day Urban Express', 'Cash on Delivery (COD) Remittance', 'Automated Scheduled Pickups'],
    notes: '',
    registrationNumber: '',
    taxIdNumber: '',
    bankName: 'Guaranty Trust Bank (GTBank)',
    bankAccountNumber: '',
    bankAccountName: '',
    documents: {
      cacCertificate: null,
      proofOfAddress: null,
      ownerId: null,
      storeLogoOrCatalog: null,
    }
  });

  // Helper to format file sizes
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Process uploaded files with size check and data URL reader
  const handleFileProcess = (
    file: File,
    key: 'cacCertificate' | 'proofOfAddress' | 'ownerId' | 'storeLogoOrCatalog',
    category: 'cac' | 'address' | 'owner_id' | 'logo_or_catalog'
  ) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(`File "${file.name}" exceeds the 10MB limit. Please upload a smaller file.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [key]: {
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl,
            category
          }
        }
      }));
      setErrorMessage('');
    };

    reader.onerror = () => {
      setErrorMessage(`Failed to read "${file.name}". Please select another file.`);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (key: 'cacCertificate' | 'proofOfAddress' | 'ownerId' | 'storeLogoOrCatalog') => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [key]: null
      }
    }));
  };

  const handleDrag = (e: React.DragEvent, slot: string, isOver: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [slot]: isOver }));
  };

  const handleDrop = (
    e: React.DragEvent,
    slotKey: 'cacCertificate' | 'proofOfAddress' | 'ownerId' | 'storeLogoOrCatalog',
    category: 'cac' | 'address' | 'owner_id' | 'logo_or_catalog'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [slotKey]: false }));
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0], slotKey, category);
    }
  };

  const availableServices = [
    'Same-Day Delivery',
    'Next-Day Inter-City Delivery',
    'Cash on Delivery (COD) Remittance',
    'Automated Scheduled Pickups',
    'Bulk Multi-Stop Dispatch',
  ];

  const handleToggleService = (service: string) => {
    setFormData(prev => {
      const exists = prev.servicesNeeded.includes(service);
      return {
        ...prev,
        servicesNeeded: exists 
          ? prev.servicesNeeded.filter(s => s !== service)
          : [...prev.servicesNeeded, service]
      };
    });
  };

  // Strips the "data:<mime>;base64," prefix FileReader's readAsDataURL
  // produces — the edge function wants raw base64, same shape
  // handleFileProcess already stored, just needs the prefix cut.
  const toDocumentPayload = (doc: UploadedDocDetail | null) =>
    doc
      ? {
          base64: doc.dataUrl.split(',')[1] ?? '',
          filename: doc.name,
          contentType: doc.type,
        }
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_FUNCTIONS_URL}/submit-seller-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName,
          contactName: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          businessCategory: formData.businessCategory,
          monthlyVolume: formData.monthlyVolume,
          operatingCity: formData.operatingCity,
          pickupAddress: formData.pickupAddress,
          websiteOrSocial: formData.websiteOrSocial,
          servicesNeeded: formData.servicesNeeded,
          notes: formData.notes,
          registrationNumber: formData.registrationNumber,
          taxIdNumber: formData.taxIdNumber,
          bankName: formData.bankName,
          bankAccountNumber: formData.bankAccountNumber,
          bankAccountName: formData.bankAccountName,
          documents: {
            cacCertificate: toDocumentPayload(formData.documents.cacCertificate),
            proofOfAddress: toDocumentPayload(formData.documents.proofOfAddress),
            ownerId: toDocumentPayload(formData.documents.ownerId),
            storeLogoOrCatalog: toDocumentPayload(formData.documents.storeLogoOrCatalog),
          },
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(
          data.error || 'Something went wrong submitting your application. Please try again.',
        );
        setLoading(false);
        return;
      }

      setApplicationId(data.applicationId ?? '');
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage('Could not reach the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const merchantPerks = [
    {
      icon: DollarSign,
      title: '24-Hour COD Remittance',
      desc: 'Never struggle with trapped cash flow. All Cash on Delivery payments are reconciled and settled directly to your corporate account within 24 hours.'
    },
    {
      icon: Calendar,
      title: 'Scheduled Daily Pickups',
      desc: 'Our couriers arrive at your store or fulfillment hub at agreed daily windows—no waiting around or repeatedly booking individual dispatch riders.'
    },
    {
      icon: Layers,
      title: 'Up to 35% Volume Savings',
      desc: 'Access exclusive corporate merchant rate cards that scale with your sales volume. Save thousands each month on logistics overhead.'
    },
    {
      icon: ShieldCheck,
      title: 'Full In-Transit Protection',
      desc: 'Every registered merchant shipment includes baseline liability coverage up to ₦1,000,000, with optional high-value goods insurance.'
    },
    {
      icon: Building,
      title: 'Micro-Warehousing & Storage',
      desc: 'Store bestsellers in our secure urban fulfillment centers in Lagos (Victoria Island & Ikeja) and Abuja for 2-hour delivery to your customers.'
    },
    {
      icon: Zap,
      title: 'Automated Buyer Tracking',
      desc: 'Reduce "Where is my order?" support calls. End buyers receive automated WhatsApp & SMS tracking links with live courier GPS coordinates.'
    }
  ];

  const onboardingSteps = [
    {
      step: '01',
      title: 'Submit Store Application',
      desc: 'Fill out the form below with your brand details, pickup address, and estimated dispatch volume.'
    },
    {
      step: '02',
      title: 'Account Verification & Custom Rate Card',
      desc: 'An SME Onboarding Specialist contacts you within 24 hours to assign your tailored discount tier.'
    },
    {
      step: '03',
      title: 'Pickup Window & Packaging Setup',
      desc: 'We set up your automated daily courier pickup schedule and issue branded tamper-proof packaging bags.'
    },
    {
      step: '04',
      title: 'Start Shipping & Growing Sales',
      desc: 'Dispatch orders with guaranteed on-time delivery, live telemetry, and rapid daily payment reconciliation.'
    }
  ];

  const faqs = [
    {
      q: 'How fast is Cash on Delivery (COD) remitted to our company bank account?',
      a: 'We reconcile and remit all COD payments within 24 hours of successful delivery directly to your verified bank account, accompanied by an itemized automated statement.'
    },
    {
      q: 'Is there a minimum monthly parcel volume required to onboard as a merchant?',
      a: 'No rigid minimums! We support boutique merchants shipping 20 parcels a month up to large retail enterprises shipping 5,000+ parcels weekly. Your discount tier automatically improves as your shipping volume expands.'
    },
    {
      q: 'What happens if a customer is unreachable or rejects the delivery?',
      a: 'Our dispatch riders follow a strict 3-attempt contact protocol with our central customer support desk. If the package cannot be delivered, it is safely checked back into our hub and returned to your store on the next scheduled pickup run with zero penalty fees.'
    },
    {
      q: 'Can Metro Transit pick up from multiple branch locations or warehouses?',
      a: 'Yes! Our merchant portal supports multi-origin pickups across Lagos, Abuja, Port Harcourt, Ibadan, Kano, Accra, and Nairobi.'
    }
  ];

  return (
    <div className="pt-28 pb-24 bg-[#090909] text-zinc-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
        {/* Hero Section */}
        <div className="relative rounded-3xl p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-[#141414] via-[#101010] to-[#180a0b] border border-zinc-800 shadow-2xl overflow-hidden mb-16">
          
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D61F26]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#D61F26]/15 border border-[#D61F26]/30 rounded-full">
              <Store className="w-3.5 h-3.5 text-[#D61F26]" />
              <span className="text-xs font-bold text-[#D61F26] uppercase tracking-wider">
                Merchant Onboarding
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.05]">
              Scale Your Sales with <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.9)' }}>
                Guaranteed Fulfillment
              </span> <br />
              <span className="text-[#D61F26]">
                & Express Courier.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
              Onboard your store with Metro Transit Logistics. Stop losing customers to late deliveries or delayed COD remittances. Get scheduled daily warehouse pickups, real-time GPS tracking for your buyers, and wholesale volume rates.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#apply-form"
                className="flex items-center gap-2.5 px-8 py-4 bg-[#D61F26] hover:bg-[#b8181e] text-white font-black text-sm rounded-xl shadow-xl shadow-[#D61F26]/30 transition-all hover:scale-[1.02]"
              >
                <span>Apply for Merchant Onboarding</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </a>

              <a
                href="#merchant-perks"
                className="flex items-center gap-2 px-6 py-4 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-white font-bold text-sm rounded-xl transition-all"
              >
                <span>Explore Merchant Benefits</span>
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8 border-t border-zinc-800/80 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <span className="text-2xl font-black text-white block">24h</span>
                <span className="text-xs text-zinc-400 font-medium">COD Cash Remittance</span>
              </div>
              <div>
                <span className="text-2xl font-black text-amber-400 block">35%</span>
                <span className="text-xs text-zinc-400 font-medium">Max Volume Savings</span>
              </div>
              <div>
                <span className="text-2xl font-black text-[#D61F26] block">99.4%</span>
                <span className="text-xs text-zinc-400 font-medium">On-Time SLA Guarantee</span>
              </div>
            </div>

          </div>
        </div>

        {/* Section 2: Why Onboard With Metro Transit */}
        <div id="merchant-perks" className="space-y-8 mb-20 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Merchant Growth Advantage</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Engineered for Brands That Value <span className="text-[#D61F26]">Reputation.</span>
            </h2>
            <p className="text-sm text-zinc-400">
              Your customer's unboxing experience is only as reliable as your last-mile courier. Here is why top merchants choose Metro Transit Logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {merchantPerks.map((perk, idx) => {
              const Icon = perk.icon;
              return (
                <div 
                  key={idx} 
                  className="p-6 bg-[#121212] border border-zinc-800/90 rounded-2xl space-y-3 hover:border-zinc-700 transition-all hover:bg-[#151515]"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#D61F26]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">{perk.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{perk.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: 4-Step Onboarding Process */}
        <div className="p-8 sm:p-12 bg-[#101010] border border-zinc-800 rounded-3xl mb-20 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#D61F26] uppercase tracking-wider block">Seamless Setup</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">How Merchant Onboarding Works</h2>
            <p className="text-xs text-zinc-400">From application to your first automated warehouse pickup in under 24 hours.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {onboardingSteps.map((s, idx) => (
              <div key={idx} className="p-6 bg-[#161616] border border-zinc-800/80 rounded-2xl space-y-3 relative overflow-hidden">
                <span className="text-3xl font-black text-[#D61F26]/30 font-mono block">
                  {s.step}
                </span>
                <h3 className="text-sm font-bold text-white">{s.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: The Application Form */}
        <div id="apply-form" className="scroll-mt-24 mb-20">
          <div className="max-w-3xl mx-auto bg-[#121212] border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D61F26] via-amber-500 to-[#D61F26]" />

            {!submitted ? (
              <div className="space-y-8">
                <div className="space-y-2 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#D61F26]/10 border border-[#D61F26]/30 flex items-center justify-center mx-auto text-[#D61F26]">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Merchant Onboarding Application
                  </h2>
                  <p className="text-xs text-zinc-400 max-w-lg mx-auto">
                    Provide your store and delivery details below. Our corporate SME desk will review and reach out within 24 hours with your custom rate card.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Part 1: Business Details */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#D61F26] border-b border-zinc-800 pb-2">
                      1. Brand & Store Overview
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Store / Company Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Lagos Artisan Shoes & Leather"
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          className="w-full bg-[#181818] border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D61F26]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Business Industry / Category
                        </label>
                        <select
                          value={formData.businessCategory}
                          onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                          className="w-full bg-[#181818] border border-zinc-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D61F26]"
                        >
                          <option value="Fashion & Apparel">Fashion & Apparel</option>
                          <option value="Electronics & Tech Gadgets">Electronics & Tech Gadgets</option>
                          <option value="Health, Beauty & Cosmetics">Health, Beauty & Cosmetics</option>
                          <option value="Food & Perishables (Cold-Chain)">Food & Perishables (Cold-Chain)</option>
                          <option value="Fast Moving Consumer Goods (FMCG)">Fast Moving Consumer Goods (FMCG)</option>
                          <option value="Auto Parts & Industrial">Auto Parts & Industrial</option>
                          <option value="Books, Art & Media">Books, Art & Media</option>
                          <option value="General Retail / Multi-Category">General Retail / Multi-Category</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Website or Social Store Handle
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. instagram.com/mystore or www.mystore.ng"
                          value={formData.websiteOrSocial}
                          onChange={(e) => setFormData({ ...formData, websiteOrSocial: e.target.value })}
                          className="w-full bg-[#181818] border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D61F26]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Estimated Monthly Dispatch Volume
                        </label>
                        <select
                          value={formData.monthlyVolume}
                          onChange={(e) => setFormData({ ...formData, monthlyVolume: e.target.value })}
                          className="w-full bg-[#181818] border border-zinc-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D61F26]"
                        >
                          <option value="20 - 100 parcels / month (Starter Tier)">20 - 100 parcels / month (Starter Tier)</option>
                          <option value="101 - 500 parcels / month (Growth Tier)">101 - 500 parcels / month (Growth Tier)</option>
                          <option value="501 - 2,000 parcels / month (Scale Tier)">501 - 2,000 parcels / month (Scale Tier)</option>
                          <option value="2,000+ parcels / month (Enterprise Priority)">2,000+ parcels / month (Enterprise Priority)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Part 2: Business Registration & Legal Entity */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#D61F26]">
                        2. Business Registration & Tax Details
                      </h3>
                      <span className="text-[11px] text-zinc-400">RC / BN & Tax Identification</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>CAC / RC / Business Name Reg Number</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. RC-1892044 or BN-394812"
                          value={formData.registrationNumber || ''}
                          onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                          className="w-full bg-[#181818] border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D61F26]"
                        />
                        <span className="text-[10px] text-zinc-400 mt-1 block">
                          Leave blank if operating as an unregistered social merchant
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-amber-400" />
                          <span>Tax Identification Number (TIN)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 23948192-0001"
                          value={formData.taxIdNumber || ''}
                          onChange={(e) => setFormData({ ...formData, taxIdNumber: e.target.value })}
                          className="w-full bg-[#181818] border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D61F26]"
                        />
                        <span className="text-[10px] text-zinc-400 mt-1 block">
                          Optional - used for corporate withholding tax & zero-stamp accounts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Part 3: COD Settlement Bank Account */}
                  <div className="space-y-4 pt-2">
                    <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>3. Cash on Delivery (COD) Remittance Account</span>
                          <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] rounded-full font-bold">24-Hour Settlement</span>
                        </h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          Provide your settlement account. When our riders collect cash or POS card payments from your buyers, funds are automatically remitted here on the next business morning.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Settlement Bank Name
                        </label>
                        <select
                          value={formData.bankName}
                          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                          className="w-full bg-[#181818] border border-zinc-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D61F26]"
                        >
                          <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank)</option>
                          <option value="Zenith Bank Plc">Zenith Bank Plc</option>
                          <option value="Access Bank Plc">Access Bank Plc</option>
                          <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                          <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                          <option value="Kuda Microfinance Bank">Kuda Microfinance Bank</option>
                          <option value="Moniepoint Microfinance Bank">Moniepoint Microfinance Bank</option>
                          <option value="OPay Digital Services">OPay Digital Services</option>
                          <option value="Stanbic IBTC Bank">Stanbic IBTC Bank</option>
                          <option value="Sterling Bank">Sterling Bank</option>
                          <option value="Fidelity Bank Plc">Fidelity Bank Plc</option>
                          <option value="First City Monument Bank (FCMB)">First City Monument Bank (FCMB)</option>
                          <option value="Wema Bank / ALAT">Wema Bank / ALAT</option>
                          <option value="Providus Bank">Providus Bank</option>
                          <option value="Ecobank Nigeria">Ecobank Nigeria</option>
                          <option value="Union Bank of Nigeria">Union Bank of Nigeria</option>
                          <option value="Other Commercial / MFB Bank">Other Commercial / MFB Bank</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Account Number (NUBAN)
                        </label>
                        <input
                          type="text"
                          maxLength={10}
                          placeholder="e.g. 0123456789"
                          value={formData.bankAccountNumber || ''}
                          onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                          className="w-full bg-[#181818] border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D61F26]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Account Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Lagos Artisan Enterprises"
                          value={formData.bankAccountName || ''}
                          onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                          className="w-full bg-[#181818] border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D61F26]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Part 4: Upload Business Details & Verification Documents */}
                  <div className="space-y-4 pt-2">
                    <div className="border-b border-zinc-800 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#D61F26] flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span>4. Upload Business Verification Documents</span>
                      </h3>
                      <span className="text-[11px] text-zinc-400">
                        Drag & drop or click &bull; PDF, JPG, PNG (Max 10MB)
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400">
                      Upload your registration documents for priority verification and immediate merchant account activation.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Document Slot 1: CAC Registration Certificate */}
                      <div 
                        onDragOver={(e) => handleDrag(e, 'cac', true)}
                        onDragLeave={(e) => handleDrag(e, 'cac', false)}
                        onDrop={(e) => handleDrop(e, 'cacCertificate', 'cac')}
                        className={`p-4 rounded-2xl border transition-all ${
                          dragActive['cac'] 
                            ? 'bg-emerald-500/10 border-emerald-500 scale-[1.01]' 
                            : formData.documents?.cacCertificate 
                            ? 'bg-[#151a17] border-emerald-500/50' 
                            : 'bg-[#151515] border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <input 
                          type="file" 
                          ref={cacInputRef} 
                          accept=".pdf,.jpg,.jpeg,.png,.webp" 
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileProcess(e.target.files[0], 'cacCertificate', 'cac');
                            }
                          }} 
                          className="hidden" 
                        />

                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              formData.documents?.cacCertificate 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              <FileCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">CAC Certificate / Status Report</h4>
                              <span className="text-[10px] text-zinc-400">Incorporation or Business Name Proof</span>
                            </div>
                          </div>
                          {formData.documents?.cacCertificate && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Ready
                            </span>
                          )}
                        </div>

                        {!formData.documents?.cacCertificate ? (
                          <div 
                            onClick={() => cacInputRef.current?.click()}
                            className="cursor-pointer border border-dashed border-zinc-700/80 rounded-xl p-4 text-center hover:border-amber-500/60 hover:bg-zinc-800/40 transition-all space-y-1.5"
                          >
                            <Upload className="w-5 h-5 mx-auto text-zinc-400" />
                            <p className="text-xs font-semibold text-zinc-200">
                              Drop CAC document here, or <span className="text-[#D61F26] underline">browse</span>
                            </p>
                            <p className="text-[10px] text-zinc-400">PDF, JPG, PNG up to 10MB</p>
                          </div>
                        ) : (
                          <div className="bg-zinc-900/90 rounded-xl p-2.5 border border-zinc-800 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                              <div className="truncate">
                                <p className="text-xs text-white font-medium truncate">{formData.documents.cacCertificate.name}</p>
                                <p className="text-[10px] text-zinc-400">{formatFileSize(formData.documents.cacCertificate.size)}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc('cacCertificate')}
                              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-lg transition-colors shrink-0"
                              title="Remove file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Document Slot 2: Proof of Business Address */}
                      <div 
                        onDragOver={(e) => handleDrag(e, 'address', true)}
                        onDragLeave={(e) => handleDrag(e, 'address', false)}
                        onDrop={(e) => handleDrop(e, 'proofOfAddress', 'address')}
                        className={`p-4 rounded-2xl border transition-all ${
                          dragActive['address'] 
                            ? 'bg-emerald-500/10 border-emerald-500 scale-[1.01]' 
                            : formData.documents?.proofOfAddress 
                            ? 'bg-[#151a17] border-emerald-500/50' 
                            : 'bg-[#151515] border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <input 
                          type="file" 
                          ref={addressInputRef} 
                          accept=".pdf,.jpg,.jpeg,.png,.webp" 
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileProcess(e.target.files[0], 'proofOfAddress', 'address');
                            }
                          }} 
                          className="hidden" 
                        />

                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              formData.documents?.proofOfAddress 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">Proof of Business Address</h4>
                              <span className="text-[10px] text-zinc-400">Utility bill, lease, or warehouse agreement</span>
                            </div>
                          </div>
                          {formData.documents?.proofOfAddress && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Ready
                            </span>
                          )}
                        </div>

                        {!formData.documents?.proofOfAddress ? (
                          <div 
                            onClick={() => addressInputRef.current?.click()}
                            className="cursor-pointer border border-dashed border-zinc-700/80 rounded-xl p-4 text-center hover:border-amber-500/60 hover:bg-zinc-800/40 transition-all space-y-1.5"
                          >
                            <Upload className="w-5 h-5 mx-auto text-zinc-400" />
                            <p className="text-xs font-semibold text-zinc-200">
                              Drop utility bill / lease here, or <span className="text-[#D61F26] underline">browse</span>
                            </p>
                            <p className="text-[10px] text-zinc-400">PDF, JPG, PNG up to 10MB</p>
                          </div>
                        ) : (
                          <div className="bg-zinc-900/90 rounded-xl p-2.5 border border-zinc-800 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                              <div className="truncate">
                                <p className="text-xs text-white font-medium truncate">{formData.documents.proofOfAddress.name}</p>
                                <p className="text-[10px] text-zinc-400">{formatFileSize(formData.documents.proofOfAddress.size)}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc('proofOfAddress')}
                              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-lg transition-colors shrink-0"
                              title="Remove file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Document Slot 3: Owner / Director ID */}
                      <div 
                        onDragOver={(e) => handleDrag(e, 'ownerId', true)}
                        onDragLeave={(e) => handleDrag(e, 'ownerId', false)}
                        onDrop={(e) => handleDrop(e, 'ownerId', 'owner_id')}
                        className={`p-4 rounded-2xl border transition-all ${
                          dragActive['ownerId'] 
                            ? 'bg-emerald-500/10 border-emerald-500 scale-[1.01]' 
                            : formData.documents?.ownerId 
                            ? 'bg-[#151a17] border-emerald-500/50' 
                            : 'bg-[#151515] border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <input 
                          type="file" 
                          ref={ownerIdInputRef} 
                          accept=".pdf,.jpg,.jpeg,.png,.webp" 
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileProcess(e.target.files[0], 'ownerId', 'owner_id');
                            }
                          }} 
                          className="hidden" 
                        />

                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              formData.documents?.ownerId 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">Owner / Director ID</h4>
                              <span className="text-[10px] text-zinc-400">NIN, Driver's License, or Int'l Passport</span>
                            </div>
                          </div>
                          {formData.documents?.ownerId && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Ready
                            </span>
                          )}
                        </div>

                        {!formData.documents?.ownerId ? (
                          <div 
                            onClick={() => ownerIdInputRef.current?.click()}
                            className="cursor-pointer border border-dashed border-zinc-700/80 rounded-xl p-4 text-center hover:border-amber-500/60 hover:bg-zinc-800/40 transition-all space-y-1.5"
                          >
                            <Upload className="w-5 h-5 mx-auto text-zinc-400" />
                            <p className="text-xs font-semibold text-zinc-200">
                              Drop Government ID here, or <span className="text-[#D61F26] underline">browse</span>
                            </p>
                            <p className="text-[10px] text-zinc-400">PDF, JPG, PNG up to 10MB</p>
                          </div>
                        ) : (
                          <div className="bg-zinc-900/90 rounded-xl p-2.5 border border-zinc-800 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                              <div className="truncate">
                                <p className="text-xs text-white font-medium truncate">{formData.documents.ownerId.name}</p>
                                <p className="text-[10px] text-zinc-400">{formatFileSize(formData.documents.ownerId.size)}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc('ownerId')}
                              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-lg transition-colors shrink-0"
                              title="Remove file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Document Slot 4: Brand Logo or Storefront / Catalog */}
                      <div 
                        onDragOver={(e) => handleDrag(e, 'logo', true)}
                        onDragLeave={(e) => handleDrag(e, 'logo', false)}
                        onDrop={(e) => handleDrop(e, 'storeLogoOrCatalog', 'logo_or_catalog')}
                        className={`p-4 rounded-2xl border transition-all ${
                          dragActive['logo'] 
                            ? 'bg-emerald-500/10 border-emerald-500 scale-[1.01]' 
                            : formData.documents?.storeLogoOrCatalog 
                            ? 'bg-[#151a17] border-emerald-500/50' 
                            : 'bg-[#151515] border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <input 
                          type="file" 
                          ref={logoInputRef} 
                          accept=".pdf,.jpg,.jpeg,.png,.webp" 
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileProcess(e.target.files[0], 'storeLogoOrCatalog', 'logo_or_catalog');
                            }
                          }} 
                          className="hidden" 
                        />

                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              formData.documents?.storeLogoOrCatalog 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              <ImageIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">Store Logo / Catalog (Optional)</h4>
                              <span className="text-[10px] text-zinc-400">Used for co-branded tracking waybills</span>
                            </div>
                          </div>
                          {formData.documents?.storeLogoOrCatalog && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Ready
                            </span>
                          )}
                        </div>

                        {!formData.documents?.storeLogoOrCatalog ? (
                          <div 
                            onClick={() => logoInputRef.current?.click()}
                            className="cursor-pointer border border-dashed border-zinc-700/80 rounded-xl p-4 text-center hover:border-amber-500/60 hover:bg-zinc-800/40 transition-all space-y-1.5"
                          >
                            <Upload className="w-5 h-5 mx-auto text-zinc-400" />
                            <p className="text-xs font-semibold text-zinc-200">
                              Drop logo image or catalog, or <span className="text-[#D61F26] underline">browse</span>
                            </p>
                            <p className="text-[10px] text-zinc-400">PNG, JPG, PDF up to 10MB</p>
                          </div>
                        ) : (
                          <div className="bg-zinc-900/90 rounded-xl p-2.5 border border-zinc-800 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {formData.documents.storeLogoOrCatalog.dataUrl && formData.documents.storeLogoOrCatalog.type.startsWith('image/') ? (
                                <img 
                                  src={formData.documents.storeLogoOrCatalog.dataUrl} 
                                  alt="Preview" 
                                  className="w-6 h-6 object-cover rounded shrink-0 border border-zinc-700" 
                                />
                              ) : (
                                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                              <div className="truncate">
                                <p className="text-xs text-white font-medium truncate">{formData.documents.storeLogoOrCatalog.name}</p>
                                <p className="text-[10px] text-zinc-400">{formatFileSize(formData.documents.storeLogoOrCatalog.size)}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc('storeLogoOrCatalog')}
                              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-lg transition-colors shrink-0"
                              title="Remove file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Part 5: Contact Person */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#D61F26] border-b border-zinc-800 pb-2">
                      5. Primary Contact Person
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Contact Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Chioma Okafor"
                          value={formData.contactName}
                          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                          className="w-full bg-[#181818] border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D61F26]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="chioma@store.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-[#181818] border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D61F26]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Phone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+234 800 000 0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-[#181818] border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D61F26]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Part 6: Location & Services */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#D61F26] border-b border-zinc-800 pb-2">
                      6. Dispatch Hub & Required Logistics Services
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Primary Operating Hub / City
                        </label>
                        <select
                          value={formData.operatingCity}
                          onChange={(e) => setFormData({ ...formData, operatingCity: e.target.value })}
                          className="w-full bg-[#181818] border border-zinc-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D61F26]"
                        >
                          <option value="Lagos (Greater Metro)">Lagos</option>
                          <option value="Abuja (FCT)">Abuja (FCT)</option>
                          <option value="Port Harcourt (Rivers)">Port Harcourt</option>
                          <option value="Ibadan (Oyo)">Ibadan</option>
                          <option value="Kano (Commercial Hub)">Kano</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Warehouse / Store Pickup Address
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 15 Admiralty Way, Lekki Phase 1, Lagos"
                          value={formData.pickupAddress}
                          onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                          className="w-full bg-[#181818] border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D61F26]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-2">
                        Select Services Needed (Click all that apply):
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {availableServices.map((service, idx) => {
                          const isSelected = formData.servicesNeeded.includes(service);
                          return (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => handleToggleService(service)}
                              className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                                isSelected 
                                  ? 'bg-[#D61F26]/15 border-[#D61F26] text-white' 
                                  : 'bg-[#161616] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                                isSelected ? 'bg-[#D61F26] border-[#D61F26] text-white' : 'border-zinc-600'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span>{service}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Specific Logistics Needs / Delivery Notes (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Need daily 4 PM pickup, fragile packaging supplies, or chilled skincare transport..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full bg-[#181818] border border-zinc-700/80 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D61F26]"
                      />
                    </div>
                  </div>

                  {/* Submission CTA */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-[#D61F26] hover:bg-[#b8181e] disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#D61F26]/30 hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {loading ? (
                        <span className="animate-pulse flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Processing Application...</span>
                        </span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Onboarding Application</span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-zinc-500 text-center mt-2.5">
                      By submitting, you agree to receive onboarding communications from Metro Transit Logistics. No upfront setup fees.
                    </p>
                  </div>

                </form>
              </div>
            ) : (
              /* Success Confirmation Card */
              <div className="py-10 text-center space-y-6 animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#D61F26] uppercase tracking-wider block">
                    Application Successfully Dispatched
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    Welcome to Metro Transit, {formData.businessName}!
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    Your merchant application has been recorded under reference ticket:
                  </p>
                  <div className="inline-block px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl font-mono text-sm font-black text-amber-400">
                    {applicationId}
                  </div>
                </div>

                {/* What Happens Next Checklist */}
                <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl max-w-md mx-auto text-left space-y-4 text-xs">
                  
                  {/* Submitted Business Details Summary */}
                  <div className="space-y-2 pb-3 border-b border-zinc-800">
                    <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center justify-between">
                      <span>Store Verification Profile</span>
                      <span className="text-[10px] text-emerald-400 font-normal">Pending Compliance Check</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
                      <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80">
                        <span className="text-zinc-500 block text-[10px]">CAC / Reg ID:</span>
                        <span className="font-mono font-medium text-white">{formData.registrationNumber || 'Social / Unregistered'}</span>
                      </div>
                      <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80">
                        <span className="text-zinc-500 block text-[10px]">COD Settlement:</span>
                        <span className="font-medium text-white truncate block">
                          {formData.bankAccountNumber ? `${formData.bankName.split(' ')[0]} - ${formData.bankAccountNumber}` : 'Pending Setup'}
                        </span>
                      </div>
                    </div>

                    {/* Uploaded Documents List */}
                    {formData.documents && Object.values(formData.documents).some(Boolean) && (
                      <div className="mt-2 pt-2 border-t border-zinc-800/60 space-y-1.5">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Attached Verification Documents:
                        </span>
                        <div className="space-y-1">
                          {formData.documents.cacCertificate && (
                            <div className="flex items-center justify-between text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                              <span className="flex items-center gap-1.5 truncate">
                                <FileCheck className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">CAC Certificate: {formData.documents.cacCertificate.name}</span>
                              </span>
                              <span className="text-[10px] text-emerald-500/80 shrink-0 ml-2">Attached</span>
                            </div>
                          )}
                          {formData.documents.proofOfAddress && (
                            <div className="flex items-center justify-between text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                              <span className="flex items-center gap-1.5 truncate">
                                <FileCheck className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">Address Proof: {formData.documents.proofOfAddress.name}</span>
                              </span>
                              <span className="text-[10px] text-emerald-500/80 shrink-0 ml-2">Attached</span>
                            </div>
                          )}
                          {formData.documents.ownerId && (
                            <div className="flex items-center justify-between text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                              <span className="flex items-center gap-1.5 truncate">
                                <FileCheck className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">Owner ID: {formData.documents.ownerId.name}</span>
                              </span>
                              <span className="text-[10px] text-emerald-500/80 shrink-0 ml-2">Attached</span>
                            </div>
                          )}
                          {formData.documents.storeLogoOrCatalog && (
                            <div className="flex items-center justify-between text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                              <span className="flex items-center gap-1.5 truncate">
                                <FileCheck className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">Logo / Catalog: {formData.documents.storeLogoOrCatalog.name}</span>
                              </span>
                              <span className="text-[10px] text-emerald-500/80 shrink-0 ml-2">Attached</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Next Steps for Your Store:</h4>
                  
                  <div className="flex items-start gap-2.5 text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Our SME logistics specialist will contact you via WhatsApp/phone to finalize your volume discount card.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Your daily warehouse pickup window will be mapped to our nearest fleet hub.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>You will receive login credentials for the Merchant Tracking Portal & digital waybills.</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        businessName: '',
                        contactName: '',
                        email: '',
                        phone: '',
                        businessCategory: 'Fashion & Apparel',
                        monthlyVolume: '101 - 500 parcels / month (Growth Tier)',
                        operatingCity: 'Lagos (Greater Metro)',
                        pickupAddress: '',
                        websiteOrSocial: '',
                        servicesNeeded: ['Same-Day Urban Express', 'Cash on Delivery (COD) Remittance', 'Automated Scheduled Pickups'],
                        notes: '',
                        registrationNumber: '',
                        taxIdNumber: '',
                        bankName: 'Guaranty Trust Bank (GTBank)',
                        bankAccountNumber: '',
                        bankAccountName: '',
                        documents: {
                          cacCertificate: null,
                          proofOfAddress: null,
                          ownerId: null,
                          storeLogoOrCatalog: null,
                        }
                      });
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-[#D61F26] hover:bg-[#b8181e] text-white font-bold text-xs rounded-xl transition-all shadow-md"
                  >
                    Submit Another Application
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* Section 5: Merchant FAQs */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
              <HelpCircle className="w-3.5 h-3.5 text-[#D61F26]" />
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Merchant Help Desk</span>
            </div>
            <h3 className="text-2xl font-bold text-white">Frequently Asked Questions for Merchants</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-[#121212] border border-zinc-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-[#D61F26] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${activeFaq === idx ? 'rotate-180 text-[#D61F26]' : 'text-zinc-500'}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
