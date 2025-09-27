"use client";

import { useState, Fragment, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Icons } from "@/components/icons";
import { Button } from "@/components/elements";

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface BookingType {
  id: number;
  name: string;
  displayName: string;
}

interface Booking {
  id: string;
  userId: string;
  user: User;
  bookingDate: string;
  startTime: string;
  endTime: string;
  bookingType: BookingType;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  totalTurfFee: number;
  advancePaid: boolean;
  remainingPaid: boolean;
  isSharedSlot: boolean;
  turfSegment: null;
  specialRequests: string | null;
  createdAt: string;
}

interface TurfInfo {
  id: string;
  name: string;
  bookingMode: string;
}

interface Summary {
  totalBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  pendingPayments: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    turfInfo: TurfInfo;
    bookings: Booking[];
    summary: Summary;
    pagination: {
      page: number;
      limit: number;
      total: string;
      totalPages: number;
    };
  };
  message: string;
  timestamp: string;
}

const apiService = {
  baseURL: import.meta.env.VITE_BASE_API_URL || "https://api.theplayarena.co.in",
  
  async getTurfBookings(turfId: string, dateFrom?: string, dateTo?: string): Promise<ApiResponse> {
    try {
      let url = `${this.baseURL}/v1/turfs/${turfId}/bookings`;
      const params = new URLSearchParams();
      
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed");
        }
        if (response.status === 403) {
          throw new Error("Access forbidden");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }
  },

  async updateBookingStatus(turfId: string, bookingId: string, status: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/v1/dashboard/turfs/${turfId}/bookings/${bookingId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating booking status:", error);
      throw error;
    }
  }
};

// Utility functions for consistent date handling
const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseBookingDate = (dateString: string): string => {
  // Handle different date formats from the API
  let date: Date;
  
  if (dateString.includes('T')) {
    // ISO format with time
    date = new Date(dateString);
  } else if (dateString.includes('-')) {
    // YYYY-MM-DD format
    const [year, month, day] = dateString.split('-');
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } else {
    // Fallback
    date = new Date(dateString);
  }
  
  return formatDateToYYYYMMDD(date);
};

const BookingsHeader = ({ turfInfo }: { turfInfo?: TurfInfo }) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 bg-background-100 shadow-sm border-b border-background-300 z-50">
      <div className="px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/turfs")}
              className="p-2 border-text-200/20 hover:bg-primary-200"
            >
              <Icons.arrowLeft className="w-5 h-5" />
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <img 
              src="/logo.svg" 
              alt="Logo" 
              className="w-8 h-8"
            />
            <Icons.home className="w-5 h-5 text-primary-200 fallback-icon hidden" />
          </div>
            </Button>
            <div>
              <span className="text-md font-generalsans font-semibold text-text-100">
                {turfInfo ? `${turfInfo.name} Bookings` : 'Bookings'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const DateSelector = ({ selectedDate, onDateChange, bookingsByDate }: { 
  selectedDate: string; 
  onDateChange: (date: string) => void;
  bookingsByDate: Record<string, number>;
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const today = new Date();
  const selected = new Date(selectedDate + 'T00:00:00');

  const formatDisplayDate = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Normalize dates for comparison
    const normalizeDate = (date: Date) => {
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0);
      return normalized;
    };
    
    const normalizedD = normalizeDate(d);
    const normalizedToday = normalizeDate(today);
    const normalizedTomorrow = normalizeDate(tomorrow);
    
    if (normalizedD.getTime() === normalizedToday.getTime()) {
      return "Today";
    } else if (normalizedD.getTime() === normalizedTomorrow.getTime()) {
      return "Tomorrow";
    }
    
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const handleDateClick = (date: Date) => {
    const dateStr = formatDateToYYYYMMDD(date);
    onDateChange(dateStr);
    setShowCalendar(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="relative">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="outline"
          onClick={() => setShowCalendar(!showCalendar)}
          className="flex items-center gap-2 px-4 py-2"
        >
          <Icons.calendar className="w-4 h-4" />
          {formatDisplayDate(selectedDate)}
          <Icons.chevronDown className={`w-4 h-4 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateChange(formatDateToYYYYMMDD(today))}
            className={`${selectedDate === formatDateToYYYYMMDD(today) ? 'bg-primary-200 text-text-300' : ''}`}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              onDateChange(formatDateToYYYYMMDD(tomorrow));
            }}
            className={`${selectedDate === formatDateToYYYYMMDD(new Date(today.getTime() + 24 * 60 * 60 * 1000)) ? 'bg-primary-200 text-text-300' : ''}`}
          >
            Tomorrow
          </Button>
        </div>
      </div>

      {showCalendar && (
        <div className="absolute top-full left-0 z-50 bg-background-100 border border-background-300 rounded-xl shadow-lg p-4 min-w-80">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="p-1"
            >
              <Icons.chevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="font-semibold">
              {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="p-1"
            >
              <Icons.chevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-text-200">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((date, index) => {
              const dateStr = formatDateToYYYYMMDD(date);
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              
              // Normalize dates for comparison
              const normalizeDate = (d: Date) => {
                const normalized = new Date(d);
                normalized.setHours(0, 0, 0, 0);
                return normalized;
              };
              
              const normalizedDate = normalizeDate(date);
              const normalizedToday = normalizeDate(today);
              const normalizedSelected = normalizeDate(selected);
              
              const isToday = normalizedDate.getTime() === normalizedToday.getTime();
              const isSelected = normalizedDate.getTime() === normalizedSelected.getTime();
              const bookingCount = bookingsByDate[dateStr] || 0;
              const isPast = normalizedDate < normalizedToday;
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  disabled={isPast}
                  className={`
                    relative p-2 text-sm rounded-lg transition-colors
                    ${!isCurrentMonth ? 'text-text-300' : 'text-text-100'}
                    ${isToday ? 'bg-primary-100 text-primary-300 font-semibold' : ''}
                    ${isSelected ? 'bg-primary-200 text-text-300' : ''}
                    ${isPast ? 'opacity-50 cursor-not-allowed' : 'hover:bg-background-200'}
                    ${!isPast && !isSelected && !isToday ? 'hover:bg-background-200' : ''}
                  `}
                >
                  {date.getDate()}
                  {bookingCount > 0 && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-success rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const BookingCardSkeleton = () => (
  <div className="bg-background-100 shadow-down overflow-hidden rounded-xl animate-pulse">
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-6 bg-gray-300 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
        <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="h-4 bg-gray-300 rounded mb-1"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-300 rounded mb-1"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  </div>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
    <Icons.alertCircle className="w-12 h-12 text-error mb-4" />
    <h3 className="text-h6 font-generalsans font-semibold text-text-100 mb-2">
      Something went wrong
    </h3>
    <p className="text-body text-text-200 mb-4 max-w-md">
      {message}
    </p>
    <Button onClick={onRetry} variant="outline">
      <Icons.refreshCw className="w-4 h-4 mr-2" />
      Try Again
    </Button>
  </div>
);

const EmptyState = ({ selectedDate }: { selectedDate: string }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    
    const normalizeDate = (d: Date) => {
      const normalized = new Date(d);
      normalized.setHours(0, 0, 0, 0);
      return normalized;
    };
    
    if (normalizeDate(date).getTime() === normalizeDate(today).getTime()) {
      return "today";
    }
    
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
      <Icons.calendar className="w-12 h-12 text-text-200 mb-4" />
      <h3 className="text-h6 font-generalsans font-semibold text-text-100 mb-2">
        No Bookings Found
      </h3>
      <p className="text-body text-text-200 mb-4 max-w-md">
        There are no bookings for {formatDate(selectedDate)}. Select a different date to view other bookings.
      </p>
    </div>
  );
};

const BookingsManagement = () => {
  const navigate = useNavigate();
  const { turfId } = useParams<{ turfId: string }>();
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [turfInfo, setTurfInfo] = useState<TurfInfo | undefined>();
  const [summary, setSummary] = useState<Summary | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(formatDateToYYYYMMDD(new Date()));

  useEffect(() => {
    if (turfId) {
      fetchBookings();
    }
  }, [turfId]);

  const fetchBookings = async () => {
    if (!turfId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch bookings for a wider date range to populate calendar
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const response = await apiService.getTurfBookings(
        turfId, 
        formatDateToYYYYMMDD(thirtyDaysAgo),
        formatDateToYYYYMMDD(thirtyDaysLater)
      );
      
      console.log("API Response:", response);
      
      if (response.success && response.data) {
        const validBookings = (response.data.bookings || [])
          .filter(booking => 
            booking && 
            booking.user && 
            booking.bookingType
          );
        
        // Process bookings to normalize dates
        const processedBookings = validBookings.map(booking => ({
          ...booking,
          bookingDate: parseBookingDate(booking.bookingDate)
        }));
        
        // Sort bookings by date and time
        const sortedBookings = processedBookings.sort((a, b) => {
          const dateCompare = new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime();
          if (dateCompare !== 0) return dateCompare;
          
          const timeA = new Date(`2000-01-01T${a.startTime}`).getTime();
          const timeB = new Date(`2000-01-01T${b.startTime}`).getTime();
          return timeA - timeB;
        });
        
        setAllBookings(sortedBookings);
        setTurfInfo(response.data.turfInfo);
        setSummary(response.data.summary);
      } else {
        throw new Error(response.message || "Failed to fetch bookings");
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err instanceof Error ? err.message : "Failed to load bookings");
      
      if (err instanceof Error && (err.message.includes("Authentication") || err.message.includes("401"))) {
        navigate("/auth/login", { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filter bookings for selected date
  const selectedDateBookings = allBookings.filter(
    booking => booking.bookingDate === selectedDate
  );

  // Create booking count by date for calendar
  const bookingsByDate = allBookings.reduce((acc, booking) => {
    acc[booking.bookingDate] = (acc[booking.bookingDate] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const normalizeDate = (d: Date) => {
      const normalized = new Date(d);
      normalized.setHours(0, 0, 0, 0);
      return normalized;
    };
    
    const normalizedDate = normalizeDate(date);
    const normalizedToday = normalizeDate(today);
    const normalizedTomorrow = normalizeDate(tomorrow);
    
    if (normalizedDate.getTime() === normalizedToday.getTime()) {
      return "Today";
    } else if (normalizedDate.getTime() === normalizedTomorrow.getTime()) {
      return "Tomorrow";
    }
    
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours;
  };

  const calculateRemainingAmount = (booking: Booking) => {
    if (booking.remainingPaid) return 0;
    return booking.totalTurfFee;
  };

  return (
    <Fragment>
      <BookingsHeader turfInfo={turfInfo} />

      <section className="bg-background-200 min-h-screen py-4 sm:px-3 pt-20 sm:pt-36">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="grid">
              <p className="text-body-md text-h4 text-text-100 font-generalsans">
                View and manage bookings for this turf.
              </p>
            </div>
          </div>

          {/* Date Selector */}
          {!isLoading && !error && (
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              bookingsByDate={bookingsByDate}
            />
          )}

          {/* Stats Summary for selected date */}
          {!isLoading && !error && (
            <div className="flex gap-4 sm:flex-cols-2">
              <div className="bg-background-100 w-200 rounded-xl p-4">
                <p className="text-body text-md text-text-200 font-generalsans">Bookings for {formatDate(selectedDate)} </p>
                <p className="text-md font-generalsans font-semibold text-text-100">{selectedDateBookings.length}</p>
              </div>
              {/* <div className="bg-background-100 rounded-xl p-4">
                <p className="text-body text-md text-text-200 font-generalsans">Total Revenue</p>
                <p className="text-md font-generalsans font-semibold text-primary-200">
                  ₹{selectedDateBookings.reduce((sum, booking) => sum + booking.totalTurfFee, 0).toLocaleString()}
                </p>
              </div> */}
              {/* <div className="bg-background-100  w-45  rounded-xl p-4">
                <p className="text-body text-md text-text-200 font-generalsans">All Bookings</p>
                <p className="text-md font-generalsans font-semibold text-text-100">{summary?.totalBookings || 0}</p>
              </div> */}
            </div>
          )}

          {/* Content */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <BookingCardSkeleton key={index} />
              ))
            ) : error ? (
              <ErrorState message={error} onRetry={fetchBookings} />
            ) : selectedDateBookings.length === 0 ? (
              <EmptyState selectedDate={selectedDate} />
            ) : (
              selectedDateBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-background-100 shadow-down overflow-hidden rounded-xl"
                >
                  <div className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl text-text-100 font-generalsans font-semibold mb-1">
                          {booking.user.name}
                        </h3>
                        <p className="text-body-md text-text-100">
                          {booking.user.phone}
                        </p>
                        <p className="text-body-md text-text-100">
                          {booking.user.email}
                        </p>
                        <p className="text-body-md text-primary-200 font-medium mt-1">
                          {booking.bookingType.displayName}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          booking.status === 'confirmed' 
                            ? 'bg-success/10 text-success' 
                            : booking.status === 'pending' 
                            ? 'bg-warning/10 text-warning'
                            : 'bg-error/10 text-error'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-body-sm text-text-200 mb-1">Booking Date</p>
                        <p className="text-label text-text-100 font-medium flex items-center gap-2">
                          <Icons.calendar className="w-4 h-4" />
                          {formatDate(booking.bookingDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-body-sm text-text-200 mb-1">Time Slot</p>
                        <p className="text-label text-text-100 font-medium flex items-center gap-2">
                          <Icons.clock className="w-4 h-4" />
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-body-sm text-text-200 mb-1">Duration</p>
                        <p className="text-label text-text-100 font-medium">
                          {calculateDuration(booking.startTime, booking.endTime)} hour(s)
                        </p>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-3 bg-background-200 rounded-lg">
                      <div>
                        <p className="text-body-sm text-text-200">Total Turf Fee</p>
                        <p className="text-h6 text-primary-200 font-generalsans font-semibold">
                          ₹{booking.totalTurfFee.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-body-sm text-text-200">Advance Status</p>
                        <p className={`text-label font-medium ${booking.advancePaid ? 'text-success' : 'text-error'}`}>
                          {booking.advancePaid ? 'Paid' : 'Pending'}
                        </p>
                      </div>
                      <div>
                        <p className="text-body-sm text-text-200">Remaining Amount</p>
                        <p className="text-h6 text-error font-generalsans font-semibold">
                          ₹{calculateRemainingAmount(booking).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {booking.specialRequests && (
                      <div className="mb-4 p-3 bg-background-200 rounded-lg">
                        <p className="text-body-sm text-text-200 mb-1">Special Requests</p>
                        <p className="text-body text-text-100">{booking.specialRequests}</p>
                      </div>
                    )}

                    {/* Booking Metadata */}
                    <div className="mt-4 pt-4 border-t border-background-300">
                      <p className="text-body-sm text-text-200">
                        Booked on {formatDate(booking.createdAt)} • ID: {booking.id.slice(-8)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </Fragment>
  );
};

export default BookingsManagement; 