import React, { useState, useEffect } from 'react';
import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import {
  Building2, Mail, Phone, MapPin, Zap, Globe,
  Search, Loader2, Star, CheckCircle2, Navigation,
  ExternalLink, Sparkles, X, ChevronDown
} from 'lucide-react';
import { businessSetupAPI } from '../../../api/businessSetup';

// --- Reusable Styled Components (Editorial/Neubrutalist Aesthetic) ---

// --- Reusable Styled Components (Modern/Clean Aesthetic) ---

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input
    ref={ref}
    {...props}
    className={`
      w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-xl
      focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white
      transition-all duration-200 placeholder:text-slate-400
      disabled:opacity-50 disabled:cursor-not-allowed
      ${props.className || ''}
    `}
  />
));
Input.displayName = 'Input';

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>((props, ref) => (
  <select
    ref={ref}
    {...props}
    className={`
      w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-xl
      focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white
      transition-all duration-200 cursor-pointer appearance-none
      disabled:opacity-50 disabled:cursor-not-allowed
      ${props.className || ''}
    `}
  />
));
Select.displayName = 'Select';

const TextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => (
  <textarea
    ref={ref}
    {...props}
    className={`
      w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-xl
      focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white
      transition-all duration-200 placeholder:text-slate-400 resize-none
      disabled:opacity-50 disabled:cursor-not-allowed
      ${props.className || ''}
    `}
  />
));
TextArea.displayName = 'TextArea';

const Label = ({ children, optional }: { children: React.ReactNode, optional?: boolean }) => (
  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900 block mb-2">
    {children}
    {optional && <span className="ml-2 font-normal text-slate-500 text-xs">(Optional)</span>}
  </label>
);

// --- Search Result Component (Matches User Image Design) ---

interface SearchResultProps {
  business: any;
  onSelect: (placeId: string) => void;
}

const SearchResultCard = ({ business, onSelect }: SearchResultProps) => (
  <button
    onClick={() => onSelect(business.place_id)}
    className="w-full bg-white text-left rounded-xl border border-slate-200 hover:border-indigo-400 p-2 flex items-start gap-4 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 group"
  >
    {/* Image Section */}
    <div className="w-24 h-24 rounded-lg bg-slate-100 overflow-hidden shrink-0 relative border border-slate-100">
      {business.photo_url ? (
        <img src={business.photo_url} alt={business.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#F2E3DB] text-slate-300">
          <Building2 className="w-8 h-8 opacity-50" />
        </div>
      )}
      <div className="absolute top-1 right-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
        <span className="text-[10px] font-bold text-slate-900">{business.rating || 'N/A'}</span>
      </div>
    </div>

    {/* Content Section */}
    <div className="flex-1 py-1 min-w-0">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-base font-bold text-slate-900 truncate pr-2 group-hover:text-indigo-700 transition-colors">{business.name}</h3>
        {business.types?.[0] && (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0">
            {business.types[0].replace(/_/g, ' ')}
          </span>
        )}
      </div>

      <div className="flex items-start gap-2 mb-1.5">
        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
        <p className="text-xs font-medium text-slate-500 line-clamp-1">{business.formatted_address}</p>
      </div>

      <div className="flex items-center gap-4 mt-2">
        <span className="text-xs font-bold text-slate-400">
          {business.user_ratings_total ? `(${business.user_ratings_total} reviews)` : '(New)'}
        </span>
        <div className="flex items-center gap-1.5 ml-auto mr-2">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            Select <Sparkles className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  </button>
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

  // Auto-hide success message immediately after setup
  useEffect(() => {
    if (data.business.auto_setup && showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 0); // Hide immediately
      return () => clearTimeout(timer);
    }
  }, [data.business.auto_setup, showSuccessMessage]);

  // Helper function to parse Google Places hours
  const parseGoogleHours = (openingHours: any) => {
    if (!openingHours?.periods) return [];

    const dayMap: { [key: number]: any } = {};

    openingHours.periods.forEach((period: any) => {
      const day = period.open.day; // 0=Sunday, 1=Monday, etc.
      const openTime = formatGoogleTime(period.open.time);
      const closeTime = period.close ? formatGoogleTime(period.close.time) : '';

      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[day];

      dayMap[day] = {
        day_of_week: dayName,
        open_time: openTime,
        close_time: closeTime,
        enabled: true
      };
    });

    // Return all 7 days in order (Monday-Sunday)
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNumbers: { [key: string]: number } = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
      'thursday': 4, 'friday': 5, 'saturday': 6
    };

    return days.map(day => dayMap[dayNumbers[day]] || {
      day_of_week: day,
      open_time: '',
      close_time: '',
      enabled: false
    });
  };

  // Helper to format Google time (0900 -> 09:00)
  const formatGoogleTime = (time: string): string => {
    if (!time || time.length !== 4) return '';
    return `${time.slice(0, 2)}:${time.slice(2)}`;
  };

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

      // Auto-populate business fields and mark setup as complete
      actions.updateBusiness({
        business_name: details.name,
        address: details.formatted_address,
        phone: details.formatted_phone_number || details.international_phone_number,
        website: details.website,
        category: mapCategory(details.types),
        place_id: details.place_id,
        rating: details.rating,
        auto_setup: true,  // Mark AI setup as complete
        image_url: searchResults.find(r => r.place_id === placeId)?.photo_url || '' // Use photo from search results
      });

      // Parse and update business hours if available
      if (details.opening_hours) {
        const businessHours = parseGoogleHours(details.opening_hours);
        if (businessHours.length > 0) {
          actions.updateBusinessHours(businessHours);
        }
      }

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
    <div className="w-full font-sans relative">

      {/* Search Result Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">

            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Search Businesses</h3>
                  <p className="text-xs text-slate-500">Select your business to sync details.</p>
                </div>
              </div>
              <button
                onClick={() => setShowSearch(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50">
              {isSearching ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 flex gap-4 animate-pulse">
                      <div className="w-20 h-20 bg-slate-100 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-slate-100 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium py-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Scanning Google Places...
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((business, i) => (
                    <SearchResultCard
                      key={i}
                      business={business}
                      onSelect={handleSelectBusiness}
                    />
                  ))}
                  <p className="text-center text-[10px] text-slate-400 font-medium py-2">Showing top 5 results for relevance</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="text-slate-900 font-bold mb-1">No businesses found</h4>
                  <p className="text-slate-500 text-xs max-w-[200px] mb-6">We couldn't find any matches for "{searchQuery}". Try a different spelling or location.</p>
                  <button
                    onClick={() => setShowSearch(false)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Close & Enter Manually
                  </button>
                </div>
              )}
            </div>
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

        {/* AI Smart Connect Section - Simple Design */}
        {/* AI Smart Connect Section - Premium Design */}
        {!data.business.auto_setup || (data.business.auto_setup && showSuccessMessage) ? (
          !data.business.auto_setup ? (
            <div className="relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500 rounded-2xl" />
              <div className="relative bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-indigo-100 shadow-xl shadow-indigo-100/50 transition-all duration-300 hover:shadow-indigo-100/80 hover:border-indigo-200">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-2xl border border-indigo-100 shadow-md shadow-indigo-100/50 text-indigo-600 shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="scroll-m-20 text-lg font-semibold tracking-tight text-slate-900">AI Smart Connect</h4>
                      <p className="text-sm text-slate-500 mt-1">
                        Instantly populate your business profile by syncing directly with Google Places.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search input */}
                <div className="relative max-w-2xl">
                  <div className="relative group/search">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search for your business (e.g. 'Coffee Shop New York')"
                      className="w-full pl-12 pr-32 py-4 bg-white border border-slate-200 rounded-xl text-base text-slate-900 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                    />
                    <div className="absolute right-2 top-2 bottom-2">
                      <button
                        onClick={handleSearch}
                        disabled={isSearching || !searchQuery.trim()}
                        className="h-full px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 disabled:shadow-none translate-y-0 active:translate-y-0.5"
                      >
                        {isSearching ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="hidden sm:inline">Searching...</span>
                          </>
                        ) : (
                          <>
                            <span>Connect</span>
                            <Sparkles className="w-4 h-4 opacity-70" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Success State - Show when setup is complete */
            <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 flex items-center gap-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="w-12 h-12 rounded-full bg-white border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm shrink-0 z-10">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1 z-10">
                <h4 className="scroll-m-20 text-lg font-semibold tracking-tight text-slate-900">Setup Complete!</h4>
                <p className="text-sm text-slate-600 mt-1">Your business profile successfully connected to Google Places.</p>
              </div>
              <div className="px-4 py-2 bg-white rounded-xl border border-emerald-100 shadow-sm z-10">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Synced
                </span>
              </div>
            </div>
          )
        ) : null}

        <div className="space-y-8">
          {/* Business Name Section */}
          <div className="group">
            <Label>Company Name</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Building2 size={18} />
              </div>
              <Input
                type="text"
                name="businessName"
                value={data.business.business_name}
                onChange={handleChange}
                placeholder="e.g. Nexus Automations"
                className="pl-11"
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500">
                <ChevronDown size={14} strokeWidth={2} />
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
    </div >
  );
};

export default BusinessDetails;