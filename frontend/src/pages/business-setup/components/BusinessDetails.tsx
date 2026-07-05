import React, { useState, useEffect } from 'react';

import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import {
  Building2, Mail, Phone, MapPin, Globe, Info,
  Search, Loader2, Star, AlertCircle,
  Check, X, ChevronDown
} from 'lucide-react';
import { businessSetupAPI } from '../../../api/businessSetup';

interface GoogleBusinessResult {
  place_id: string;
  name: string;
  formatted_address: string;
  website?: string;
  formatted_phone_number?: string;
  types?: string[];
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    periods?: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
    weekday_text?: string[];
  };
  photo_url?: string;
}

type BusinessHours = {
  day_of_week: string;
  open_time: string;
  close_time: string;
  enabled: boolean;
}[];

const defaultBusinessHours: BusinessHours = [
  { day_of_week: 'monday', open_time: '09:00', close_time: '17:00', enabled: true },
  { day_of_week: 'tuesday', open_time: '09:00', close_time: '17:00', enabled: true },
  { day_of_week: 'wednesday', open_time: '09:00', close_time: '17:00', enabled: true },
  { day_of_week: 'thursday', open_time: '09:00', close_time: '17:00', enabled: true },
  { day_of_week: 'friday', open_time: '09:00', close_time: '17:00', enabled: true },
  { day_of_week: 'saturday', open_time: '', close_time: '', enabled: false },
  { day_of_week: 'sunday', open_time: '', close_time: '', enabled: false }
];

// --- Reusable Styled Components (Editorial/Neubrutalist Aesthetic) ---

// --- Reusable Styled Components (Modern/Clean Aesthetic) ---

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input
    ref={ref}
    {...props}
    className={`
      w-full px-4 py-3 bg-white border border-slate-200 text-slate-950 text-sm font-medium rounded-lg
      focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white
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
      w-full px-4 py-3 bg-white border border-slate-200 text-slate-950 text-sm font-medium rounded-lg
      focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white
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
      w-full px-4 py-3 bg-white border border-slate-200 text-slate-950 text-sm font-medium rounded-lg
      focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white
      transition-all duration-200 placeholder:text-slate-400 resize-none
      disabled:opacity-50 disabled:cursor-not-allowed
      ${props.className || ''}
    `}
  />
));
TextArea.displayName = 'TextArea';

const Label = ({ children, optional }: { children: React.ReactNode, optional?: boolean }) => (
  <label className="mb-2 block text-sm font-bold leading-none text-slate-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
    {children}
    {optional && <span className="ml-2 text-xs font-semibold text-slate-400">(Optional)</span>}
  </label>
);

// --- Search Result Component (Matches User Image Design) ---

interface SearchResultProps {
  business: GoogleBusinessResult;
  onSelect: (business: GoogleBusinessResult) => void;
  isSelected: boolean;
}

const SearchResultCard = ({ business, onSelect }: SearchResultProps) => (
  <button
    onClick={() => onSelect(business)}
    className="group flex w-full items-start gap-4 rounded-lg border border-slate-200 bg-white p-2 text-left transition-colors hover:border-cyan-300 hover:bg-cyan-50/30"
  >
    {/* Image Section */}
    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
      {business.photo_url ? (
        <img src={business.photo_url} alt={business.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#F2E3DB] text-slate-300">
          <Building2 className="h-8 w-8 opacity-50" />
        </div>
      )}
      <div className="absolute right-1 top-1 flex items-center gap-0.5 rounded bg-white/90 px-1.5 py-0.5 shadow-sm backdrop-blur-sm">
        <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
        <span className="text-[10px] font-bold text-slate-900">{business.rating || 'N/A'}</span>
      </div>
    </div>

    {/* Content Section */}
    <div className="min-w-0 flex-1 py-1">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="truncate pr-2 text-base font-bold text-slate-950 transition-colors group-hover:text-cyan-800">{business.name}</h3>
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
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-700 opacity-0 transition-opacity group-hover:opacity-100">
            Select <Check className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  </button>
);

// --- Main Component ---

export const BusinessDetails: React.FC = () => {
  const { state, actions } = useBusinessSetup();
  const { data, initialLoaded, loading } = state;

  // Business is already set up via AI — lock the setup section permanently
  const isAlreadySetup = initialLoaded && data.business.auto_setup === true;

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GoogleBusinessResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchError, setSearchError] = useState('');
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
  const parseGoogleHours = (openingHours: GoogleBusinessResult['opening_hours']) => {
    if (!openingHours || !openingHours.periods) return defaultBusinessHours;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dayMap: { [key: number]: any } = {};



    openingHours.periods.forEach((period) => {
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
    setSearchError('');
    try {
      const results = await businessSetupAPI.searchGooglePlaces(searchQuery);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setSearchError(error instanceof Error ? error.message : 'Could not search Google Places. Try again or enter details manually.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBusiness = async (business: GoogleBusinessResult) => {
    const placeId = business.place_id;
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
        if (primary.includes('restaurant') || primary.includes('cafe') || primary.includes('bakery') || primary.includes('meal') || primary.includes('food')) return 'dining';
        if (primary.includes('lodging') || primary.includes('hotel') || primary.includes('bar')) return 'hospitality';
        if (primary.includes('car') || primary.includes('automotive')) return 'automotive';
        if (primary.includes('software') || primary.includes('tech')) return 'saas';
        if (primary.includes('agency') || primary.includes('consulting') || primary.includes('insurance_agency') || primary.includes('travel_agency')) return 'agency';
        if (primary.includes('liquor_store') || primary.includes('wine') || primary.includes('beer')) return 'liquor';
        if (primary.includes('vape') || primary.includes('tobacco')) return 'vape';
        if (primary.includes('car_repair') || primary.includes('car_wash') || primary.includes('auto_repair')) return 'autocare';

        return 'other';
      };

      // Clean website URL (remove query params)
      const cleanWebsiteUrl = (url?: string): string => {
        if (!url) return '';
        try {
          // If URL doesn't have protocol, add https:// to parse it correctly
          const urlToParse = url.startsWith('http') ? url : `https://${url}`;
          const urlObj = new URL(urlToParse);
          return `${urlObj.origin}${urlObj.pathname}`;
        } catch (error) {
          console.error('Failed to resolve photo URL', error);
          return url;
        }
      };


      // Build the updated business data directly (avoids stale stateRef race condition)
      const updatedBusiness = {
        ...data.business,
        business_name: details.name,
        address: details.formatted_address,
        phone: details.formatted_phone_number || details.international_phone_number || data.business.phone,
        website: cleanWebsiteUrl(details.website),
        category: mapCategory(details.types),
        place_id: details.place_id,
        rating: details.rating,
        user_ratings_total: details.user_ratings_total,
        auto_setup: true,
        image_url: searchResults.find(r => r.place_id === placeId)?.photo_url || ''
      };

      // Parse business hours from Google Places
      let updatedHours = data.business_hours || [];
      if (details.opening_hours) {
        const parsedHours = parseGoogleHours(details.opening_hours);
        if (parsedHours.length > 0) {
          updatedHours = parsedHours;
        }
      }

      // Build the complete data payload to save directly
      const dataToSave = {
        ...data,
        business: updatedBusiness,
        business_hours: updatedHours,
      };

      // Also update React state for UI
      actions.updateBusiness(updatedBusiness);
      if (updatedHours.length > 0) {
        actions.updateBusinessHours(updatedHours);
      }

      // Save directly with the explicit data (bypasses stale stateRef)
      await actions.saveDataDirect(dataToSave);

      // Reviews are handled directly by the backend cron/sync jobs instead of the UI

      // Clear search
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
      setSearchError('');
    } catch (error) {
      console.error('Failed to fetch business details:', error);
      setSearchError(error instanceof Error ? error.message : 'Could not sync this business. Try another result or enter details manually.');
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
    <div className="relative w-full font-sans">

      {/* Search Result Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-white/75 px-4 pt-[12vh] backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex max-h-[74vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/70 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-cyan-50 p-2 text-cyan-700">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950">Search Businesses</h3>
                  <p className="text-xs font-medium text-slate-500">Select your business to sync details.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchError('');
                }}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Area */}
            <div className="scrollbar-hide flex-1 overflow-y-auto bg-slate-50/70 p-4">
              {isSearching ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex animate-pulse gap-4 rounded-lg border border-slate-200 bg-white p-3">
                      <div className="w-20 h-20 bg-slate-100 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-slate-100 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Scanning Google Places...
                  </div>
                </div>
              ) : searchError ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-rose-100 bg-white px-6 py-12 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                    <AlertCircle className="h-7 w-7" />
                  </div>
                  <h4 className="mb-1 font-bold text-slate-950">Connection did not complete</h4>
                  <p className="mb-5 max-w-md text-sm font-medium leading-6 text-slate-500">{searchError}</p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery.trim()}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-cyan-700 px-4 text-xs font-bold text-white transition-colors hover:bg-cyan-800 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {isSearching && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Try Again
                    </button>
                    <button
                      onClick={() => {
                        setShowSearch(false);
                        setSearchError('');
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Enter Manually
                    </button>
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((business, i) => (
                    <SearchResultCard
                      key={i}
                      business={business}
                      onSelect={(b) => { handleSelectBusiness(b); }}
                      isSelected={false}
                    />
                  ))}
                  <p className="py-2 text-center text-[10px] font-medium text-slate-400">Showing top 5 results for relevance</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="mb-1 font-bold text-slate-950">No businesses found</h4>
                  <p className="mb-6 max-w-[220px] text-xs font-medium text-slate-500">We could not find any matches for "{searchQuery}". Try a different spelling or location.</p>
                  <button
                    onClick={() => {
                      setShowSearch(false);
                      setSearchError('');
                    }}
                    className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Enter Manually
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isPopulating && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-cyan-700" />
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-950">Syncing Business Data...</p>
          </div>
        </div>
      )}

      <div className="space-y-5">

        {/* AI Smart Connect Section — guarded by initialLoaded to prevent race condition on refresh */}
        {!initialLoaded || loading ? (
          /* Still loading from API — show skeleton placeholder, NOT the setup form */
          <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-8 animate-pulse">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-200" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-40 bg-slate-200 rounded" />
                <div className="h-4 w-64 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="h-12 w-full max-w-2xl bg-slate-200 rounded-xl" />
          </div>
        ) : isAlreadySetup ? (
          /* Business already set up — never show the search form again */
          null
        ) : (
          /* First-time setup — show AI Smart Connect search */
          <div className="rounded-lg border border-cyan-100 bg-white p-5 shadow-sm">

              {/* Header */}
              <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 rounded-md border border-cyan-100 bg-cyan-50 p-3 text-cyan-700">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black tracking-tight text-slate-950">Google Business Connect</h4>
                    <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                      Pull in verified business details, contact info, and hours from Google Places.
                    </p>
                  </div>
                </div>
              </div>

              {/* Search input */}
              <div className="relative max-w-3xl">
                <div className="grid gap-2 sm:block group/search">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within/search:text-cyan-600" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search for your business (e.g. 'Coffee Shop New York')"
                      className="w-full rounded-lg border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-base text-slate-950 shadow-sm transition-all placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 sm:pr-32"
                    />
                  </div>
                  <div className="sm:absolute sm:bottom-2 sm:right-2 sm:top-2">
                    <button
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery.trim()}
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cyan-700 px-5 text-sm font-bold text-white transition-colors hover:bg-cyan-800 disabled:bg-slate-100 disabled:text-slate-400 sm:h-full sm:w-auto"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="hidden sm:inline">Searching...</span>
                        </>
                      ) : (
                        <>
                          <span>Connect</span>
                          <Globe className="h-4 w-4 opacity-70" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
                placeholder="e.g. Joe's Pizza"
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
                <option value="dining">Restaurants & Dining</option>
                <option value="automotive">Automotive</option>
                <option value="liquor">Wine & Spirits</option>
                <option value="vape">Vape & Smoke Specialty</option>
                <option value="autocare">Auto Repair & Care</option>
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
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:col-span-2">

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
          <div className="group lg:col-span-2">
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
            <p className="mt-2 text-xs font-medium text-slate-400">
              Used for location context, caller directions, and regional routing.
            </p>
          </div>

          {/* Configuration Tip */}
          <div className="flex gap-4 rounded-lg border border-cyan-100 bg-cyan-50/70 p-4 text-slate-700 lg:col-span-2">
            <div className="shrink-0 rounded-md border border-cyan-100 bg-white p-2 text-cyan-700">
              <Info size={18} />
            </div>
            <div>
              <h4 className="mb-1 text-sm font-bold text-slate-950">Agent context</h4>
              <p className="text-xs font-medium leading-relaxed text-slate-600">
                Customizing the AI personality and knowledge base happens in the upcoming configuration stages.
              </p>
            </div>
          </div>

          </div>
        </div>
      </div>
    </div >
  );
};

export default BusinessDetails;
