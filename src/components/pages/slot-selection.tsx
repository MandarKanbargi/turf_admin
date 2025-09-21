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
    availableSlots: AvailableSlot[];
    unavailablePeriods: any[];
    pricingInfo: {
      peakHours: string[];
      offPeakHours: string[];
    };
  };
}

interface BookingRequest {
  turfId: string;
  bookingDate: string; 
  startTime: string;
  endTime: string;
  bookingTypeId: number;
}

// API Service
const apiService = {
  baseURL: import.meta.env.VITE_BASE_API_URL || "play-arena-app-production.up.railway.app",

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

  async createBooking(request: BookingRequest): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/v1/bookings`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating booking:", error);
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
    const fullDate = date.toISOString().split('T')[0];
    
    days.push({
      day: dayName,
      date: dayDate,
      month: monthName,
      fullDate
    });
  }
  
  return days;
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
            
          </Button>
        <span className="text-xl font-generalsans font-semibold text-text-100">
          Book Slot
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
    if (!isBookingReady) return;

    try {
      setLoading(prev => ({ ...prev, booking: true }));
      setErrors(prev => ({ ...prev, booking: null }));

      const bookingRequest: BookingRequest = {
        turfId: bookingState.turfId,
        bookingDate: bookingState.date,
        startTime: bookingState.startTime,
        endTime: bookingState.endTime,
        bookingTypeId: bookingState.bookingTypeId!,
      };

      const response = await apiService.createBooking(bookingRequest);
      
      if (response.success) {
        // Show success and navigate back
        alert('Booking created successfully!');
        navigate(-1);
      } else {
        throw new Error(response.message || 'Failed to create booking');
      }
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        booking: error instanceof Error ? error.message : 'Failed to create booking' 
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
            {isBookingReady ? "Confirm Booking" : "Select a Slot & Booking Type"}
          </Button>
        </div>
      </section>
    </Fragment>
  );
};