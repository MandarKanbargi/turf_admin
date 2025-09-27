
"use client";

import { useState, Fragment, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Icons } from "@/components/icons";
import { Button } from "@/components/elements";


interface Customer {
  name: string;
  phone: string;
  email: string;
}

interface BookingType {
  name: string;
}

interface Booking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  totalTurfFee: number;
  advancePaid: boolean;
  remainingPaid: boolean;
  remainingAmount: number;
  specialRequests?: string | null;
  bookingNotes?: string | null;
  createdAt: string;
  customer: Customer;
  bookingType: BookingType;
}

interface TurfInfo {
  id: string;
  name: string;
  city: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    bookings: Booking[];
    turfInfo: TurfInfo;
  };
  message?: string;
}


const apiService = {
  baseURL: import.meta.env.VITE_BASE_API_URL || "play-arena-app-production.up.railway.app",
  
  async getTurfBookings(turfId: string): Promise<ApiResponse> {
    try {
      
      const today = new Date();
      const dateFrom = today.toISOString().split('T')[0];
      
      const response = await fetch(`${this.baseURL}/v1/turfs/${turfId}/bookings?date_from=${dateFrom}`, {
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
              <Icons.arrowLeft className="w-4 h-5" />
            </Button>
            <div>
              <span className="text-sm font-generalsans font-semibold text-text-100">
                {turfInfo ? `${turfInfo.name} Bookings` : 'Bookings'}
              </span>
              {turfInfo && (
                <p className="text-body-sm text-text-200">
                  {turfInfo.city}
                </p>
              )}
            </div>
          </div>
{/* 
          <Button
            onClick={handleLogout}
            className="bg-primary-200 text-background-100 flex w-auto items-center justify-center gap-2 font-medium"
          >
            <Icons.logOut className="size-4" />
            Logout
          </Button> */}
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


const EmptyState = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
    <Icons.calendar className="w-12 h-12 text-text-200 mb-4" />
    <h3 className="text-h6 font-generalsans font-semibold text-text-100 mb-2">
      No Upcoming Bookings
    </h3>
    <p className="text-body text-text-200 mb-4 max-w-md">
      This turf doesn't have any upcoming bookings. New bookings will appear here once customers make reservations.
    </p>
  </div>
);

const isUpcomingOrToday = (bookingDate: string) => {
  const today = new Date();
  const booking = new Date(bookingDate);

  today.setHours(0, 0, 0, 0);
  booking.setHours(0, 0, 0, 0);
  
  return booking >= today;
};


const BookingsManagement = () => {
  const navigate = useNavigate();
  const { turfId } = useParams<{ turfId: string }>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [turfInfo, setTurfInfo] = useState<TurfInfo | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter] = useState<string>("all");

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
      
      const response = await apiService.getTurfBookings(turfId);
      
      if (response.success && response.data) {
       
        const upcomingBookings = (response.data.bookings || []).filter(booking => 
          isUpcomingOrToday(booking.bookingDate)
        );
        
      
        const sortedBookings = upcomingBookings.sort((a, b) => {
          const dateCompare = new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime();
          if (dateCompare !== 0) return dateCompare;
          
     
          const timeA = new Date(`2000-01-01T${a.startTime}`).getTime();
          const timeB = new Date(`2000-01-01T${b.startTime}`).getTime();
          return timeA - timeB;
        });
        
        setBookings(sortedBookings);
        setTurfInfo(response.data.turfInfo);
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
    if (filter === "all") return true;
    return booking.status === filter;
  });

 

  return (
    <Fragment>
      <BookingsHeader turfInfo={turfInfo} />

      <section className="bg-background-200 min-h-screen py-4 sm:px-5 pt-23 sm:pt-36">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="grid ">
             
              <p className="text-body-md text-h4 text-text-100 font-generalsans ">
                View and manage upcoming bookings for this turf.
              </p>
            </div>
          </div>

          {/* Stats Summary */}
          {!isLoading && !error && (
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="bg-background-100 rounded-xl p-2">
                <p className="text-body text-h8 text-text-200 font-generalsans">Upcoming Bookings : {bookings.length}</p>
                {/* <p className="text-h5 font-generalsans font-semibold text-text-100"></p> */}
              </div>
             
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
            ) : filteredBookings.length === 0 ? (
              <EmptyState />
            ) : (
              filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-background-100 shadow-down overflow-hidden rounded-xl"
                >
                  <div className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl text-text-100 font-generalsans font-semibold mb-1">
                          {booking.customer.name}
                        </h3>
                        <p className="text-body-md text-text-100">
                          {booking.customer.phone}
                        </p>
                        <p className="text-body-md text-text-100">
                          {booking.customer.email}
                        </p>
                        <p className="text-body-md text-primary-200 font-medium mt-1">
                          {booking.bookingType.name}
                        </p>
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

                    {/* Amount and Payment */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-3 bg-background-200 rounded-lg">
                      <div>
                        <p className="text-body-sm text-text-200">Total Turf Fee</p>
                        <p className="text-h6 text-primary-200 font-generalsans font-semibold">
                          ₹{booking.totalTurfFee.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-body-sm text-text-200">Remaining Amount</p>
                        <p className="text-h6 text-error font-generalsans font-semibold">
                          ₹{booking.remainingAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

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