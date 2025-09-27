"use client";

import { useNavigate, useParams, useSearchParams } from "react-router";
import { useState, useEffect, Fragment } from "react";
import { Icons } from "@/components/icons";
import { Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/elements";

// Types
interface TurfMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  isPrimary: boolean;
  caption?: string;
  uploadedAt: string;
}

interface AvailableBookingType {
  id: number;
  name: string;
  displayName?: string;
  hourlyRate: number;
  description?: string;
  isActive?: boolean;
  availableSlots: number;
  maxConcurrent: number;
}

interface AvailableSlot {
  startTime: string;
  endTime: string;
  bookingTypes: AvailableBookingType[];
}

interface TurfDetailsResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    city: string;
    address: string;
    description?: string;
    isActive: boolean;
    media: TurfMedia[];
  };
}

interface TurfAvailabilityResponse {
  success: boolean;
  data: {
    date: string;
    turfId: string;
    turfInfo?: {
      name: string;
      bookingMode: string;
      totalCapacity: number;
      pricingType: string;
      averageRating: number;
      totalReviews: number;
      socialLinks: any[];
      primaryImageUrl: string;
    };
    operatingHours: {
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    };
    availableSlots: AvailableSlot[];
    unavailablePeriods: {
      startTime: string;
      endTime: string;
      reason: string;
      description: string;
      type: string;
    }[];
    pricingInfo?: {
      peakHours: string[];
      offPeakHours: string[];
    };
  };
}

interface OfflineBookingRequest {
  bookingTypeId: number;
  bookingDate: string; 
  startTime: string;
  endTime: string;
  notes?: string;
}

interface OfflineBookingResponse {
  success: boolean;
  data: {
    id: string;
    turfId: string;
    bookingTypeId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    durationHours: number;
    numberOfSlots: number;
    status: string;
    bookingSource: string;
    isSharedSlot: boolean;
    turfSegment: string;
    paymentStatus: string;
    totalTurfFee: number;
    advanceAmount: number;
    remainingAmount: number;
    notes?: string;
    createdBy: string;
    createdAt: string;
  };
  message: string;
}

// API Service
const apiService = {
  baseURL: import.meta.env.VITE_BASE_API_URL || "https://api.theplayarena.co.in",

  async getTurfDetails(turfId: string): Promise<TurfDetailsResponse> {
    try {
      const response = await fetch(`${this.baseURL}/v1/turfs/${turfId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching turf details:", error);
      throw error;
    }
  },

  
  async getTurfAvailability(turfId: string, date: string, bookingTypeId?: number): Promise<TurfAvailabilityResponse> {
    try {
      const params = new URLSearchParams({ date });
      if (bookingTypeId) {
        params.append('bookingTypeId', bookingTypeId.toString());
      }

      const response = await fetch(`${this.baseURL}/v1/turfs/${turfId}/availability?${params}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching availability:", error);
      throw error;
    }
  },

  async createOfflineBooking(turfId: string, request: OfflineBookingRequest): Promise<OfflineBookingResponse> {
    try {
      // Try different possible endpoint formats
      const possibleEndpoints = [
        `${this.baseURL}/v1/turfs/${turfId}/offline-booking`,
        `${this.baseURL}/api/turfs/${turfId}/offline-booking`,
        `${this.baseURL}/turfs/${turfId}/offline-booking`,
        `${this.baseURL}/v1/dashboard/turfs/${turfId}/offline-booking`
      ];

      let response;
      let lastError;

      for (const endpoint of possibleEndpoints) {
        try {
          response = await fetch(endpoint, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
          });

          if (response.ok) {
            break; // Success, exit the loop
          } else if (response.status !== 404) {
            // If it's not a 404, this might be the correct endpoint but with another error
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          lastError = error;
          if (error instanceof Error && !error.message.includes('404')) {
            throw error; // Re-throw non-404 errors immediately
          }
        }
      }

      if (!response || !response.ok) {
        throw new Error(`All endpoints failed. Last error: ${lastError || 'Unknown error'}. Please check the API documentation for the correct endpoint.`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating offline booking:", error);
      throw error;
    }
  }
};

// Utility functions
const getNext7Days = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayDate = date.getDate().toString();
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    // Fix timezone issue by using local date string format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const fullDate = `${year}-${month}-${day}`;
    
    days.push({
      day: dayName,
      date: dayDate,
      month: monthName,
      fullDate
    });
  }
  
  return days;
};

// Add this component for closed turf message
const TurfClosedMessage = ({ operatingHours, unavailablePeriods }: {
  operatingHours: any;
  unavailablePeriods: any[];
}) => {
  const closedPeriod = unavailablePeriods?.find(period => period.type === 'closed');
  
  return (
    <div className="text-center py-12 px-4">
      <Icons.clock className="w-16 h-16 text-text-300 mx-auto mb-4" />
      <h3 className="text-h6 font-generalsans font-semibold text-text-100 mb-2">
        Turf is Currently Closed
      </h3>
      <p className="text-body text-text-200 mb-4">
        {closedPeriod?.description || 'This turf is not accepting bookings at the moment.'}
      </p>
      {!operatingHours?.isOpen && (
        <div className="bg-background-200 rounded-xl p-4 max-w-sm mx-auto">
          <p className="text-body-sm text-text-200">
            Operating Hours: {operatingHours?.openTime === '00:00:00' && operatingHours?.closeTime === '00:00:00' 
              ? 'Not Set' 
              : `${operatingHours?.openTime} - ${operatingHours?.closeTime}`}
          </p>
        </div>
      )}
    </div>
  );
};

const getCurrentPeriod = (periods: typeof dayPeriods) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  for (const period of periods) {
    const startMinutes = timeToMinutes(period.start);
    const endMinutes = timeToMinutes(period.end);
    
    if (period.name === "Night") {
      if (currentTime >= startMinutes || currentTime < endMinutes) {
        return period;
      }
    } else {
      if (currentTime >= startMinutes && currentTime < endMinutes) {
        return period;
      }
    }
  }
  
  return periods[0];
};

const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatTime12Hour = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const isTimeInPeriod = (timeString: string, period: typeof dayPeriods[0]) => {
  const timeMinutes = timeToMinutes(timeString);
  const startMinutes = timeToMinutes(period.start);
  const endMinutes = timeToMinutes(period.end);

  if (period.name === "Night") {
    return timeMinutes >= startMinutes || timeMinutes < endMinutes;
  }

  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
};

// Helper function to check if a slot has available booking types
const isSlotAvailable = (slot: AvailableSlot): boolean => {
  return slot.bookingTypes && slot.bookingTypes.length > 0 && 
         slot.bookingTypes.some(bt => bt.availableSlots > 0);
};

// Day periods configuration
const dayPeriods = [
  { id: 1, name: "Morning", start: "06:00", end: "12:00" },
  { id: 2, name: "Afternoon", start: "12:00", end: "17:00" },
  { id: 3, name: "Evening", start: "17:00", end: "21:00" },
  { id: 4, name: "Night", start: "21:00", end: "06:00" },
];

// Components
const AppHeaderWithBack = ({ onBack }: { onBack: () => void }) => (
  <header className="fixed top-0 left-0 right-0 bg-background-100 shadow-sm border-b border-background-300 z-50">
    <div className="px-4 py-4 sm:px-5">
      <div className="flex items-center gap-3">
        <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="border-background-300"
          >
            <Icons.arrowLeft className="w-4 h-5 mr-1" />
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            
            <Icons.home className="w-5 h-5 text-primary-200 fallback-icon hidden" />
          </div>
          </Button>
        <span className="text-xl font-generalsans font-semibold text-text-100">
          Mark Slot as Offline
        </span>
      </div>
    </div>
  </header>
);

const TurfDetailsHeader = ({ 
  media, 
  name 
}: { 
  media?: TurfMedia; 
  name: string; 
}) => (
  <div className="flex items-center gap-4">
    {media && (
      <div className="w-20 h-18 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={media.url}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <h2 className="text-h5 font-generalsans font-semibold text-text-100 truncate">
        {name}
      </h2>
    </div>
  </div>
);

const BookingTypeList = ({
  selectedSlot,
  bookingTypes,
  onBookingTypeSelect,
  selectedBookingTypeId
}: {
  selectedSlot: AvailableSlot;
  bookingTypes: AvailableBookingType[];
  onBookingTypeSelect: (bookingType: AvailableBookingType) => void;
  selectedBookingTypeId?: number;
}) => (
  <div className="p-4 space-y-4">
    <div className="text-center">
      <h3 className="text-h6 font-generalsans font-semibold text-text-100 mb-2">
        Select Booking Type
      </h3>
      <p className="text-body-sm text-text-200">
        {formatTime12Hour(selectedSlot.startTime)} - {formatTime12Hour(selectedSlot.endTime)}
      </p>
    </div>
    
    <div className="space-y-3">
      {bookingTypes.map((bookingType) => (
        <button
          key={bookingType.id}
          onClick={() => onBookingTypeSelect(bookingType)}
          disabled={bookingType.availableSlots === 0}
          className={`w-full p-4 rounded-xl border transition-all text-left ${
            bookingType.availableSlots === 0
              ? 'border-background-300 bg-gray-100 text-gray-400 cursor-not-allowed'
              : selectedBookingTypeId === bookingType.id
              ? 'border-primary-200 bg-primary-200/10'
              : 'border-background-300 bg-background-100'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="text-body font-medium text-text-100 mb-1">
                {bookingType.displayName || bookingType.name}
              </h4>
              {bookingType.description && (
                <p className="text-body-sm text-text-200 mb-2">
                  {bookingType.description}
                </p>
              )}
              <p className="text-body-sm text-text-200">
                {bookingType.availableSlots} of {bookingType.maxConcurrent} available
              </p>
            </div>
            <div className="text-right">
              <p className="text-h6 font-generalsans font-semibold text-primary-200">
                ₹{bookingType.hourlyRate}
              </p>
              <p className="text-body-sm text-text-200">per hour</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
);

const Loader = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-200"></div>
  </div>
);

const ErrorMessage = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="text-center py-8">
    <Icons.alertCircle className="w-12 h-12 text-error mx-auto mb-4" />
    <p className="text-body text-text-200 mb-4">{message}</p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline">
        <Icons.refreshCw className="w-4 h-4 mr-2" />
        Retry
      </Button>
    )}
  </div>
);

// Main component
export const SlotSelection = () => {
  const navigate = useNavigate();
  const { turfId } = useParams<{ turfId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const days = getNext7Days();
  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    getCurrentPeriod(dayPeriods)?.name.toLowerCase() || dayPeriods[0].name.toLowerCase()
  );

  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [showBookingTypeDrawer, setShowBookingTypeDrawer] = useState(false);

  const [bookingState, setBookingState] = useState({
    turfId: turfId || "",
    date: searchParams.get("date") || days[0].fullDate,
    startTime: "",
    endTime: "",
    bookingTypeId: undefined as number | undefined,
  });

  // API states
  const [turfDetails, setTurfDetails] = useState<TurfDetailsResponse['data'] | null>(null);
  const [availability, setAvailability] = useState<TurfAvailabilityResponse['data'] | null>(null);
  
  const [loading, setLoading] = useState({
    details: true,
    availability: true,
    price: false,
    booking: false
  });
  
  const [errors, setErrors] = useState({
    details: null as string | null,
    availability: null as string | null,
    price: null as string | null,
    booking: null as string | null
  });

  // Fetch turf details
  useEffect(() => {
    if (!turfId) return;

    const fetchTurfDetails = async () => {
      try {
        setLoading(prev => ({ ...prev, details: true }));
        setErrors(prev => ({ ...prev, details: null }));
        
        const response = await apiService.getTurfDetails(turfId);
        if (response.success) {
          setTurfDetails(response.data);
        } else {
          throw new Error('Failed to fetch turf details');
        }
      } catch (error) {
        setErrors(prev => ({ 
          ...prev, 
          details: error instanceof Error ? error.message : 'Failed to load turf details' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, details: false }));
      }
    };

    fetchTurfDetails();
  }, [turfId]);

  // Fetch availability when date or bookingTypeId changes
  useEffect(() => {
    if (!turfId || !bookingState.date) return;

    const fetchAvailability = async () => {
      try {
        setLoading(prev => ({ ...prev, availability: true }));
        setErrors(prev => ({ ...prev, availability: null }));
        
        const response = await apiService.getTurfAvailability(
          turfId, 
          bookingState.date, 
          bookingState.bookingTypeId
        );
        
        if (response.success) {
          setAvailability(response.data);
        } else {
          throw new Error('Failed to fetch availability');
        }
      } catch (error) {
        setErrors(prev => ({ 
          ...prev, 
          availability: error instanceof Error ? error.message : 'Failed to load availability' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, availability: false }));
      }
    };

    fetchAvailability();
  }, [turfId, bookingState.date, bookingState.bookingTypeId]);

  // Update booking state when URL params change
  useEffect(() => {
    const currentDate = searchParams.get("date") || days[0].fullDate;
    if (bookingState.date !== currentDate) {
      setBookingState(prev => ({
        ...prev,
        date: currentDate,
        startTime: "",
        endTime: "",
        bookingTypeId: undefined
      }));
      setSelectedSlot(null);
    }
  }, [searchParams]);

  const primaryMedia = turfDetails?.media.find(({ isPrimary }) => isPrimary) || turfDetails?.media[0];

  const filteredSlots = availability?.availableSlots?.filter(slot => {
    const selectedPeriodData = dayPeriods.find(p => p.name.toLowerCase() === selectedPeriod);
    if (!selectedPeriodData) return true;
    return isTimeInPeriod(slot.startTime, selectedPeriodData);
  }) || [];

  const handleSlotClick = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setBookingState(prev => {
      const isSameSlot = prev.startTime === slot.startTime && prev.endTime === slot.endTime;
      return {
        ...prev,
        startTime: slot.startTime,
        endTime: slot.endTime,
        ...(isSameSlot ? {} : { bookingTypeId: undefined })
      };
    });
    setShowBookingTypeDrawer(true);
  };

  const handleBookingTypeSelect = async (bookingType: AvailableBookingType) => {
    const updatedState = {
      ...bookingState,
      bookingTypeId: bookingType.id
    };
    
    setBookingState(updatedState);
    setShowBookingTypeDrawer(false);
  };

  const handleConfirmBooking = async () => {
    if (!isBookingReady || !turfId) return;

    try {
      setLoading(prev => ({ ...prev, booking: true }));
      setErrors(prev => ({ ...prev, booking: null }));

      // Ensure date is in correct format and log for debugging
      console.log('Booking details:', {
        selectedDate: bookingState.date,
        startTime: bookingState.startTime,
        endTime: bookingState.endTime,
        bookingTypeId: bookingState.bookingTypeId
      });

      const bookingRequest: OfflineBookingRequest = {
        bookingTypeId: bookingState.bookingTypeId!,
        bookingDate: bookingState.date, // This should be YYYY-MM-DD format
        startTime: bookingState.startTime,
        endTime: bookingState.endTime,
        notes: "Walk-in customer booking", // Default note for offline booking
      };

      const response = await apiService.createOfflineBooking(turfId, bookingRequest);
      
      if (response.success) {
        // Show success message with booking details including the date
        const selectedDateObj = new Date(bookingState.date + 'T00:00:00'); // Add time to avoid timezone issues
        const formattedDate = selectedDateObj.toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        alert(`Offline booking created successfully!\n\nBooking ID: ${response.data.id}\nDate: ${formattedDate}\nTime: ${formatTime12Hour(response.data.startTime)} - ${formatTime12Hour(response.data.endTime)}\n\nSlot is now unavailable for online bookings.`);
        navigate(-1);
      } else {
        throw new Error(response.message || 'Failed to create offline booking');
      }
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        booking: error instanceof Error ? error.message : 'Failed to create offline booking' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, booking: false }));
    }
  };

  const isBookingReady = bookingState.turfId && 
    bookingState.bookingTypeId && 
    bookingState.date && 
    bookingState.startTime && 
    bookingState.endTime;

  return (
    <Fragment>
      <AppHeaderWithBack onBack={() => navigate(-1)} />

      <section className="flex flex-col min-h-screen pt-12 sm:pt-20">
        {loading.details ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader />
          </div>
        ) : errors.details ? (
          <div className="flex-1 flex items-center justify-center">
            <ErrorMessage message={errors.details} />
          </div>
        ) : (
          <div className="flex-1 py-4 space-y-4">
            {/* Turf Details Header */}
            {turfDetails && (
              <TurfDetailsHeader 
                media={primaryMedia} 
                name={turfDetails.name}
              />
            )}

            <div className="border-b border-background-300" />

            {/* Date Selection */}
            <div className="space-y-3">
              <h6 className="text-body font-medium">Select Booking Date:</h6>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {days.map((day) => (
                  <button
                    key={day.fullDate}
                    type="button"
                    className={`flex flex-col items-center justify-center h-20 w-16 rounded-xl transition-all flex-shrink-0 ${
                      day.fullDate === bookingState.date
                        ? "bg-primary-200 text-background-100"
                        : "bg-background-100 border border-background-300 text-text-100"
                    }`}
                    onClick={() => {
                      setSearchParams(prev => {
                        const next = new URLSearchParams(prev);
                        next.set("date", day.fullDate);
                        return next;
                      }, { replace: true });
                    }}
                  >
                    <span className="text-body font-medium">{day.day}</span>
                    <span className="text-body-sm font-normal">{day.date}</span>
                    <span className="text-body-xs font-normal opacity-95">{day.month}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Period Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h6 className="text-body font-medium">Select Part of the Day:</h6>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dayPeriods.map((period) => (
                      <SelectItem key={period.id} value={period.name.toLowerCase()}>
                        {period.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Slots Grid */}
             {loading.availability ? (
  <Loader />
) : errors.availability ? (
  <ErrorMessage message={errors.availability} />
) : !availability?.operatingHours?.isOpen ? (
  <TurfClosedMessage 
    operatingHours={availability?.operatingHours}
    unavailablePeriods={availability?.unavailablePeriods || []}
  />
) : (
  <div className="grid grid-cols-2 gap-3">
    {filteredSlots.length > 0 ? (
      filteredSlots.map((slot, index) => {
        const slotIsAvailable = isSlotAvailable(slot);
        return (
          <button
            key={index}
            type="button"
            onClick={() => slotIsAvailable && handleSlotClick(slot)}
            disabled={!slotIsAvailable}
            className={`p-1 rounded-xl border transition-all text-center ${
              !slotIsAvailable
                ? "border-background-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                : bookingState.startTime === slot.startTime &&
                  bookingState.endTime === slot.endTime &&
                  bookingState.bookingTypeId
                ? "border-primary-200 bg-primary-200/10"
                : "border-background-300 bg-background-100 hover:border-primary-200/50"
            }`}
          >
            <div className="text-body-sm font-medium mb-1">
              {formatTime12Hour(slot.startTime)} – {formatTime12Hour(slot.endTime)}
            </div>
            <div className="text-body-sm text-text-200">
              {(() => {
                if (!slotIsAvailable) return "Not Available";
                
                if (
                  bookingState.startTime === slot.startTime &&
                  bookingState.endTime === slot.endTime &&
                  bookingState.bookingTypeId
                ) {
                  const selectedType = slot.bookingTypes.find(
                    (bt) => bt.id === bookingState.bookingTypeId
                  );
                  if (selectedType) {
                    return `${selectedType.displayName || selectedType.name} - ₹${selectedType.hourlyRate}/hr`;
                  }
                }

                const rates = slot.bookingTypes?.map((b) => Number(b.hourlyRate)) ?? [];
                if (rates.length === 0) return "-";
                const minRate = Math.min(...rates);
                return `From ₹${minRate}/hr`;
              })()}
            </div>
          </button>
        );
      })
    ) : (
      <div className="col-span-2 text-center py-8">
        <span className="text-text-200 text-body-sm">
          No slots available for the selected time period
        </span>
      </div>
    )}
  </div>
)}
            </div>

            {/* Error Display */}
            {errors.price && (
              <div className="bg-error/10 border border-error/20 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <Icons.alertCircle className="w-4 h-4 text-error" />
                  <span className="text-body-sm text-error">{errors.price}</span>
                </div>
              </div>
            )}

            {errors.booking && (
              <div className="bg-error/10 border border-error/20 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <Icons.alertCircle className="w-4 h-4 text-error" />
                  <span className="text-body-sm text-error">{errors.booking}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Booking Type Drawer */}
        {showBookingTypeDrawer && selectedSlot && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-background-100 rounded-t-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-background-100 p-4 border-b border-background-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-h6 font-generalsans font-semibold">Select Booking Type</h3>
                  <Button
                    size="icon"
                    variant="icon-outline"
                    onClick={() => setShowBookingTypeDrawer(false)}
                  >
                    <Icons.x className="size-4" />
                  </Button>
                </div>
              </div>
              <BookingTypeList
                selectedSlot={selectedSlot}
                bookingTypes={selectedSlot.bookingTypes}
                onBookingTypeSelect={handleBookingTypeSelect}
                selectedBookingTypeId={bookingState.bookingTypeId}
              />
            </div>
          </div>
        )}

        {/* Bottom Action Bar */}
        <div className="sticky bottom-0 bg-background-100 border-t border-background-300 p-5">
          <Button
            type="button"
            className="w-full"
            onClick={handleConfirmBooking}
            disabled={!isBookingReady || loading.price || loading.booking}
          >
            {(loading.price || loading.booking) && <Icons.loader className="size-4 animate-spin mr-2" />}
            {isBookingReady ? "Mark Slot as Offline" : "Select a Slot & Booking Type"}
          </Button>
        </div>
      </section>
    </Fragment>
  );
};