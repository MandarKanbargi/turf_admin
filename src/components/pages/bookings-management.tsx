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
  turfSegment: string | null;
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
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  pendingPayments: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: string;
  totalPages: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    bookings: Booking[];
    turfInfo: TurfInfo;
    summary: Summary;
    pagination: Pagination;
  };
  message?: string;
  timestamp: string;
}

const apiService = {
  baseURL: import.meta.env.VITE_BASE_API_URL || "play-arena-app-production.up.railway.app",
  
  async getTurfBookings(turfId: string, dateFrom?: string): Promise<ApiResponse> {
    try {
      // Use provided date or default to today
      const date = dateFrom || new Date().toISOString().split('T')[0];
      
      const response = await fetch(`${this.baseURL}/v1/turfs/${turfId}/bookings?date_from=${date}`, {
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

const BookingsHeader = ({ turfInfo }: { turfInfo?: TurfInfo }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${apiService.baseURL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout API error:", error);
    }

    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    sessionStorage.clear();
    
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    navigate("/auth/login", { replace: true });
  };

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
            </Button>
            <div className="flex-1 flex justify-center pl-14">
            <img 
              src="/brand-mark.svg" 
              alt="Brand Logo" 
              className="h-8 w-auto"
              
            />
          </div>
          </div>
        </div>
      </div>
    </header>
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

const EmptyState = ({ selectedDate }: { selectedDate: Date }) => {
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
      <Icons.calendar className="w-12 h-12 text-text-200 mb-4" />
      <h3 className="text-h6 font-generalsans font-semibold text-text-100 mb-2">
        {isToday ? "No Bookings Today" : "No Bookings Found"}
      </h3>
      <p className="text-body text-text-200 mb-4 max-w-md">
        {isToday 
          ? "There are no bookings scheduled for today. New bookings will appear here once customers make reservations."
          : `No bookings found for ${selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`
        }
      </p>
    </div>
  );
};

const isSameDate = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const calculateRemainingAmount = (booking: Booking): number => {
  const { totalTurfFee, advancePaid, remainingPaid } = booking;
  const PLATFORM_FEE = 100;
  
  const actualTurfFee = totalTurfFee - PLATFORM_FEE;
  
  if (advancePaid && remainingPaid) {
    return 0;
  }
  
  if (advancePaid && !remainingPaid) {
    const advanceAmount = actualTurfFee * 0.5;
    return actualTurfFee - advanceAmount;
  }
  
  if (!advancePaid && !remainingPaid) {
    return actualTurfFee; 
  }
  
  if (!advancePaid && remainingPaid) {
    const advanceAmount = actualTurfFee * 0.5;
    return advanceAmount; 
  }
  
  return 0;
};

const BookingsManagement = () => {
  const navigate = useNavigate();
  const { turfId } = useParams<{ turfId: string }>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [turfInfo, setTurfInfo] = useState<TurfInfo | undefined>();
  const [summary, setSummary] = useState<Summary | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (turfId) {
      fetchBookings();
    }
  }, [turfId, selectedDate]); // Added selectedDate as dependency

  const fetchBookings = async () => {
    if (!turfId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Format selected date for API call
      const dateString = formatDateForInput(selectedDate);
      const response = await apiService.getTurfBookings(turfId, dateString);
      
      if (response.success && response.data) {
        const allBookings = response.data.bookings || [];
        
        // Sort bookings by date and time
        const sortedBookings = allBookings.sort((a, b) => {
          const dateCompare = new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime();
          if (dateCompare !== 0) return dateCompare;
          
          const timeA = new Date(`2000-01-01T${a.startTime}`).getTime();
          const timeB = new Date(`2000-01-01T${b.startTime}`).getTime();
          return timeA - timeB;
        });
        
        setBookings(sortedBookings);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    
    if (bookingDate.getTime() === today.getTime()) {
      return "Today";
    } else if (bookingDate.getTime() === tomorrow.getTime()) {
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

   const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.bookingDate);
    const matchesDate = isSameDate(bookingDate, selectedDate);
    const matchesFilter = filter === "all" || booking.status === filter;
    const isDisplayableStatus = booking.status === "confirmed";
    return matchesDate && matchesFilter && isDisplayableStatus;
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <Fragment>
      <BookingsHeader turfInfo={turfInfo} />

      <section className="bg-background-200 min-h-screen py-4 sm:px-5 pt-20 sm:pt-36">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="grid">
              <div>
                <span className="text-2xl font-generalsans font-semibold text-text-100">
                  <u>{turfInfo ? `${turfInfo.name} Bookings` : 'Bookings'}</u>
                </span>
                {turfInfo && (
                  <p className="text-body-lg text-text-200">
                    Booking Mode: {turfInfo.bookingMode}
                  </p>
                )}
              </div>
              <p className="text-body-md text-h4 text-text-100 pt-3 font-generalsans">
                View and manage bookings for this turf.
              </p>
            </div>
          </div>

          {/* Date Picker Section */}
          {/* <div className="bg-background-100 shadow-down rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 w-full sm:w-auto">
                <label className="block text-body-sm text-text-200 mb-2">
                  Select Date
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="date"
                      value={formatDateForInput(selectedDate)}
                      onChange={handleDateChange}
                      className="w-full pl-5 pr-4 py-2 bg-background-200 border border-text-200 rounded-lg text-text-100"
                    />
                  </div>
                  <Button
                    onClick={goToToday}
                    variant="outline"
                    className="whitespace-nowrap bg-primary-200 text-text-300 w-30"
                  >
                    Today
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col items-start sm:items-end">
                <p className="text-body-sm text-text-200 mb-1">Viewing bookings for</p>
                <p className="text-h6 font-generalsans font-semibold text-primary-200">
                  {selectedDate.toLocaleDateString('en-IN', { 
                    weekday: 'long',
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div> */}

          {/* Date Picker Section */}
          <div className="bg-background-100 shadow-down rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 w-full sm:w-auto">
                <label className="block text-body-sm text-text-200 mb-2">
                  Select Date
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    
                    <input
                      type="date"
                      value={formatDateForInput(selectedDate)}
                      onChange={handleDateChange}
                      className="w-full pl-5 pr-4 py-2 bg-background-200 border border-text-200 rounded-lg text-text-100"
                    />
                  </div>
                  <Button
                    onClick={goToToday}
                    variant="outline"
                    className="whitespace-nowrap bg-primary-200 text-text-300 w-30"
                  >
                    Today
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col items-start sm:items-end">
                <p className="text-body-sm text-text-200 mb-1">Viewing bookings for</p>
                <p className="text-h6 font-generalsans font-semibold text-primary-200">
                  {selectedDate.toLocaleDateString('en-IN', { 
                    weekday: 'long',
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                
              </div>
              
            </div>
            
          </div>
          <div className="bg-background-100 shadow-down rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm text-text-200 mb-1">Today's Bookings</p>
                <p className="text-h4 font-generalsans font-semibold text-text-100">
                  {filteredBookings.length} {filteredBookings.length === 1 ? 'Booking' : 'Bookings'}
                </p>
              </div>
              {/* <div className="bg-primary-200/10 p-3 rounded-full">
                <Icons.calendar className="w-6 h-6 text-primary-200" />
              </div> */}
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <BookingCardSkeleton key={index} />
              ))
            ) : error ? (
              <ErrorState message={error} onRetry={fetchBookings} />
            ) : filteredBookings.length === 0 ? (
              <EmptyState selectedDate={selectedDate} />
            ) : (
              filteredBookings.map((booking) => {
                const remainingAmount = calculateRemainingAmount(booking);
                
                return (
                  <div
                    key={booking.id}
                    className="bg-background-100 shadow-down overflow-hidden rounded-xl"
                  >
                    <div className="p-4 sm:p-6">
                      {/* Header - Customer Info */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl text-text-100 font-generalsans font-semibold mb-1">
                            {booking.user.name}
                          </h3>
                          <div className="space-y-1">
                            <p className="text-body-md text-text-100 flex items-center gap-2">
                              <Icons.phone className="w-4 h-4" />
                              {booking.user.phone}
                            </p>
                            <p className="text-body-md text-text-100 flex items-center gap-2">
                              <Icons.mail className="w-4 h-4" />
                              {booking.user.email}
                            </p>
                            {booking.bookingType && (
                              <p className="text-body-md text-primary-200 font-medium mt-1">
                                {booking.bookingType.displayName}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          booking.status === 'confirmed' ? 'bg-success/10 text-success' :
                          booking.status === 'pending' ? 'bg-warning/10 text-warning' :
                          booking.status === 'cancelled' ? 'bg-error/10 text-error' :
                          booking.status === 'completed' ? 'bg-primary-200/10 text-primary-200' :
                          'bg-text-200/10 text-text-200'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
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

                      {/* Amount and Payment Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4 p-3 bg-background-200 rounded-lg">
                        <div>
                          <p className="text-body-sm text-text-200">Total Turf Fee</p>
                          <p className="text-h6 text-primary-200 font-generalsans font-semibold">
                            ₹{booking.totalTurfFee.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-body-sm text-text-200">Advance Amount</p>
                          <p className="text-h6 text-primary-200 font-generalsans font-semibold">
                            ₹100
                          </p>
                        </div>
                        <div>
                          <p className="text-body-sm text-text-200">Remaining Amount </p>
                          <p className="text-h6 text-primary-200 font-generalsans font-semibold">
                            ₹{(booking.totalTurfFee - 100).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {/* Payment Status */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-3 bg-background-200 rounded-lg">
                        <div>
                          <p className="text-body-sm text-text-200 mb-2">Payment Status</p>
                          <div className="flex flex-col gap-1">
                            <p className={`text-sm font-medium ${booking.advancePaid ? 'text-success' : 'text-error'}`}>
                              Advance: {booking.advancePaid ? 'Paid' : 'Pending'}
                            </p>
                            <p className={`text-sm font-medium ${booking.remainingPaid ? 'text-success' : 'text-error'}`}>
                              Remaining: {booking.remainingPaid ? 'Paid' : 'Pending'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Special Requests */}
                      {booking.specialRequests && (
                        <div className="mb-4 p-3 bg-background-200 rounded-lg">
                          <div className="mb-2">
                            <p className="text-body-sm text-text-200 mb-1">Special Requests</p>
                            <p className="text-body text-text-100">{booking.specialRequests}</p>
                          </div>
                        </div>
                      )}

                      {/* Booking Metadata */}
                      <div className="mt-4 pt-4 border-t border-background-300">
                        <div className="flex items-center justify-between">
                          <p className="text-body-sm text-text-200">
                            Booked on {formatDate(booking.createdAt)} • ID: {booking.id.slice(-8)}
                          </p>
                          {booking.isSharedSlot && (
                            <span className="px-2 py-1 bg-info/10 text-info text-xs rounded-full">
                              Shared Slot
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </Fragment>
  );
};

export default BookingsManagement;
