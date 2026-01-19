import React, { useState, useEffect } from 'react';
import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import {
  Building2, Mail, Phone, MapPin, Zap, Globe,
  Search, Loader2, Star, CheckCircle2, Navigation,
  ExternalLink, Sparkles, X
} from 'lucide-react';
import { businessSetupAPI } from '../../../api/businessSetup';

// --- Reusable Styled Components (Editorial/Neubrutalist Aesthetic) ---

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`
      w-full px-4 py-3 bg-white border-2 border-slate-200 text-slate-900 text-sm font-medium rounded-lg
      focus:ring-0 focus:border-slate-800 focus:bg-slate-50
      transition-all duration-200 placeholder:text-slate-400
      ${props.className || ''}
    `}
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={`
      w-full px-4 py-3 bg-white border-2 border-slate-200 text-slate-900 text-sm font-medium rounded-lg
      focus:ring-0 focus:border-slate-800 focus:bg-slate-50
      transition-all duration-200 cursor-pointer appearance-none
      ${props.className || ''}
    `}
  />
);

const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`
      w-full px-4 py-3 bg-white border-2 border-slate-200 text-slate-900 text-sm font-medium rounded-lg
      focus:ring-0 focus:border-slate-800 focus:bg-slate-50
      transition-all duration-200 placeholder:text-slate-400 resize-none
      ${props.className || ''}
    `}
  />
);

const Label = ({ children, optional }: { children: React.ReactNode, optional?: boolean }) => (
  <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
    {children}
    {optional && <span className="ml-2 font-normal text-slate-400 text-[10px]">(Optional)</span>}
  </label>
);

// --- Search Result Component (Matches User Image Design) ---

interface SearchResultProps {
  business: any;
  onSelect: (placeId: string) => void;
}

const SearchResultCard = ({ business, onSelect }: SearchResultProps) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 p-1 flex flex-col sm:flex-row items-stretch group hover:border-indigo-200 transition-all duration-300">
    <div className="w-full sm:w-48 h-48 sm:h-auto bg-[#F2E3DB] rounded-xl flex items-center justify-center relative overflow-hidden shrink-0">
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="bg-white p-4 shadow-lg border border-slate-100 rotate-2 group-hover:rotate-0 transition-transform duration-500">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mb-1">Business Image</p>
        <div className="w-24 h-32 bg-slate-50 border border-slate-100 flex items-center justify-center">
          <Building2 className="w-8 h-8 text-slate-200" />
        </div>
      </div>
      <div className="absolute bottom-3 left-3 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100 flex items-center gap-1.5">
        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
        <span className="text-[10px] font-black text-slate-900">{business.rating || '4.8'}</span>
      </div>
    </div>

    <div className="flex-1 p-6 flex flex-col">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-2">{business.name}</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-3 h-3 ${s <= (business.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-400">({business.user_ratings_total || '124'} reviews)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wider">{business.types?.[0]?.replace(/_/g, ' ') || 'Service'}</span>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Open now</span>
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
          <p className="text-sm font-medium text-slate-500 leading-tight">{business.formatted_address}</p>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="w-4 h-4 text-slate-400" />
          <p className="text-sm font-medium text-slate-500">{business.formatted_phone_number || '(555) 012-3456'}</p>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-50 flex flex-wrap gap-2">
        <button
          onClick={() => onSelect(business.place_id)}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Connect AI
        </button>
        <button className="px-4 py-2.5 bg-white border border-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all">
          <Navigation className="w-3.5 h-3.5" />
          View on Maps
        </button>
        <button className="px-4 py-2.5 bg-white border border-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all">
          <ExternalLink className="w-3.5 h-3.5" />
          Website
        </button>
      </div>
    </div>
  </div>
);

// --- Main Component ---

export const BusinessDetails: React.FC = () => {
  const { state, actions } = useBusinessSetup();
  const { data } = state;

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(true);

  // Auto-hide success message after 2 seconds
  useEffect(() => {
    if (data.business.auto_setup && showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [data.business.auto_setup, showSuccessMessage]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setShowSearch(true);
    try {
      const results = await businessSetupAPI.searchGooglePlaces(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBusiness = async (placeId: string) => {
    setIsPopulating(true);
    try {
      const details = await businessSetupAPI.getGooglePlaceDetails(placeId);

      // Map Google types to our categories
      const mapCategory = (types: string[]): string => {
        if (!types || types.length === 0) return 'other';
        const primary = types[0];

        if (primary.includes('health') || primary.includes('doctor') || primary.includes('dentist') || primary.includes('hospital') || primary.includes('pharmacy') || primary.includes('physiotherapist')) return 'healthcare';
        if (primary.includes('real_estate') || primary.includes('moving_company')) return 'realestate';
        if (primary.includes('lawyer') || primary.includes('courthouse')) return 'legal';
        if (primary.includes('store') || primary.includes('shopping') || primary.includes('clothing') || primary.includes('electronics') || primary.includes('furniture')) return 'retail';
        if (primary.includes('lodging') || primary.includes('hotel') || primary.includes('restaurant') || primary.includes('cafe') || primary.includes('bar')) return 'hospitality';
        if (primary.includes('car') || primary.includes('automotive')) return 'automotive';
        if (primary.includes('software') || primary.includes('tech')) return 'saas';
        if (primary.includes('agency') || primary.includes('consulting') || primary.includes('insurance_agency') || primary.includes('travel_agency')) return 'agency';

        return 'other';
      };

      // Auto-populate fields and mark setup as complete
      actions.updateBusiness({
        business_name: details.name,
        address: details.formatted_address,
        phone: details.formatted_phone_number || details.international_phone_number,
        website: details.website,
        category: mapCategory(details.types),
        place_id: details.place_id,
        rating: details.rating,
        auto_setup: true  // Mark AI setup as complete
      });

      // Auto-save to backend
      await actions.saveData();

      // Clear search
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to fetch business details:', error);
    } finally {
      setIsPopulating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    const fieldMap: { [key: string]: string } = {
      businessName: 'business_name',
      industry: 'category',
      address: 'address',
      phone: 'phone',
      email: 'email',
      website: 'website',
      timezone: 'timezone'
    };

    const fieldName = fieldMap[name];
    if (fieldName) {
      actions.updateBusiness({ [fieldName]: value });
    }
  };

  return (
    <div className="max-w-3xl font-sans relative">

      {/* Search Result Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar space-y-4 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-black uppercase tracking-widest text-xs">Search Results</h3>
              <button
                onClick={() => setShowSearch(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isSearching ? (
              <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center border border-slate-100 shadow-2xl">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Scanning Google Places...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((business, i) => (
                  <SearchResultCard
                    key={i}
                    business={business}
                    onSelect={handleSelectBusiness}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center border border-slate-100 shadow-2xl">
                <Search className="w-12 h-12 text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No businesses found</p>
                <button
                  onClick={() => setShowSearch(false)}
                  className="mt-6 text-indigo-600 font-bold text-sm hover:underline"
                >
                  Back to manual entry
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isPopulating && (
        <div className="fixed inset-0 z-[60] bg-white/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-900 font-black uppercase tracking-widest text-[11px]">Syncing Business Data...</p>
          </div>
        </div>
      )}

      <div className="space-y-10">

        {/* AI Smart Connect Section - Only show if not set up */}
        {!data.business.auto_setup || (data.business.auto_setup && showSuccessMessage) ? (
          !data.business.auto_setup ? (
            <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-8 border-2 border-indigo-200 overflow-hidden group hover:border-indigo-400 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-indigo-100">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 via-purple-100/50 to-pink-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-200/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />

              <div className="relative z-10">
                {/* Header with badges */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2">AI Smart Connect</h4>
                      <p className="text-slate-600 text-sm font-medium">Auto-populate your profile in seconds</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col gap-2">
                    <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 flex items-center gap-1.5 animate-pulse">
                      <Zap className="w-3 h-3" />
                      NEW
                    </div>
                    <div className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 flex items-center gap-1.5">
                      <Zap className="w-3 h-3" />
                      Low Latency
                    </div>
                  </div>
                </div>

                {/* Features list */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-indigo-100">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-700">Google Places</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-purple-100">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-700">Auto-Fill Data</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-pink-100">
                    <CheckCircle2 className="w-4 h-4 text-pink-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-700">One-Click Setup</span>
                  </div>
                </div>

                {/* Search input */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 group/input">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search your business name..."
                      className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-2 border-white rounded-2xl text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400 shadow-sm hover:shadow-md"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl flex items-center justify-center gap-2 min-w-[140px]"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Searching
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Connect AI
                      </>
                    )}
                  </button>
                </div>

                {/* Helper text */}
                <p className="mt-4 text-xs text-slate-500 font-medium text-center">
                  Powered by Google Places • Instant setup • No manual entry required
                </p>
              </div>
            </div>
          ) : (
            /* Success State - Show when setup is complete */
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200 flex items-center gap-4 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-black text-slate-900 tracking-tight mb-1">AI Setup Complete!</h4>
                <p className="text-sm text-slate-600 font-medium">Your business profile has been automatically configured.</p>
              </div>
              <div className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-emerald-200">
                <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">✓ Connected</span>
              </div>
            </div>
          ) : null
        ) : null}

        <div className="space-y-8">
          {/* Business Name Section */}
          <div className="group">
            <Label>Company Name</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Building2 size={18} />
              </div>
              <Input
                type="text"
                name="businessName"
                value={data.business.business_name}
                onChange={handleChange}
                placeholder="e.g. Nexus Automations"
                className="pl-10"
              />
            </div>
          </div>

          {/* Industry Section */}
          <div className="group">
            <Label>Industry Vertical</Label>
            <div className="relative">
              <Select
                name="industry"
                value={data.business.category}
                onChange={handleChange}
                className="pl-4 pr-10"
              >
                <option value="" disabled>Select your domain...</option>
                <option value="saas">Software & SaaS</option>
                <option value="agency">Agency & Consulting</option>
                <option value="healthcare">Healthcare & Telehealth</option>
                <option value="realestate">Real Estate</option>
                <option value="legal">Legal Services</option>
                <option value="retail">E-Commerce & Retail</option>
                <option value="hospitality">Hospitality & Travel</option>
                <option value="automotive">Automotive</option>
                <option value="other">Other</option>
              </Select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Website Section */}
          <div className="group">
            <Label optional>Business Website</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Globe size={18} />
              </div>
              <Input
                type="url"
                name="website"
                value={data.business.website || ''}
                onChange={handleChange}
                placeholder="www.yourcompany.com"
                className="pl-10"
              />
            </div>
          </div>

          {/* Contact Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Phone */}
            <div className="group">
              <Label>Support Line</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <Phone size={18} />
                </div>
                <Input
                  type="tel"
                  name="phone"
                  value={data.business.phone}
                  onChange={handleChange}
                  placeholder="(555) 000-0000"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Email */}
            <div className="group">
              <Label>Email Contact</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <Mail size={18} />
                </div>
                <Input
                  type="email"
                  name="email"
                  value={data.business.email || ''}
                  onChange={handleChange}
                  placeholder="hello@company.com"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Timezone */}
            <div className="group">
              <Label>Business Timezone</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <Globe size={18} />
                </div>
                <Select
                  name="timezone"
                  value={data.business.timezone || 'America/New_York'}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                >
                  <option value="America/New_York">Eastern Time (ET) - Default</option>
                  <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>Local Time ({Intl.DateTimeFormat().resolvedOptions().timeZone})</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Anchorage">Alaska Time (AKT)</option>
                  <option value="Pacific/Honolulu">Hawaii-Aleutian Time (HAT)</option>
                  <option value="Europe/London">London (GMT/BST)</option>
                  <option value="Europe/Paris">Paris (CET/CEST)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Australia/Sydney">Sydney (AET)</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="UTC">UTC</option>
                </Select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

          </div>

          {/* Address */}
          <div className="group">
            <Label optional>Physical Address</Label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <MapPin size={18} />
              </div>
              <TextArea
                name="address"
                rows={2}
                value={data.business.address}
                onChange={handleChange}
                placeholder="123 Tech Blvd, San Francisco, CA 94107"
                className="pl-10"
              />
            </div>
            <p className="mt-2 text-xs text-slate-400 font-mono">
              Determines regional voice accent settings.
            </p>
          </div>

          {/* Configuration Tip */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex gap-4 text-slate-300 shadow-lg">
            <div className="p-2 bg-slate-800 rounded-lg text-slate-100 shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Next Step</h4>
              <p className="text-xs leading-relaxed text-slate-400">
                Customizing the AI personality and knowledge base happens in the upcoming configuration stages.
              </p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default BusinessDetails;