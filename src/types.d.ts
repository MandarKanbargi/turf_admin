// ==================== COMMON TYPES ====================
export {}; // This makes the file a module

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
  timestamp: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ==================== MASTER DATA TYPES ====================

export interface Sport {
  id: number;
  name: string;
  icon: string | null;
  description?: string | null;
  typicalDurationHours?: string | null;
  minPlayers?: number | null;
  maxPlayers?: number | null;
  isActive: boolean;
}

export interface BookingType {
  id: number;
  name: string;
  displayName: string;
  minPlayers: number;
  maxPlayers: number;
  typicalDurationHours?: string | null;
  turfCapacityRequired: string;
  description?: string | null;
  isActive?: boolean;
}

export interface Amenity {
  id: number;
  name: string;
  icon?: string | null;
  description?: string | null;
}

export interface City {
  id: string;
  name: string;
  state: string;
}

export interface State {
  id: string;
  name: string;
}

// ==================== TURF TYPES ====================

export interface TurfMedia {
  id: string;
  type: "image" | "video";
  url: string;
  altText?: string | null;
  displayOrder: number;
  isPrimary: boolean;
}

export interface TurfOperatingHours {
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface PricingShift {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  hourlyRate: string;
  shiftName?: string | null;
}

export interface TurfBookingType {
  id: number;
  name: string;
  displayName: string;
  minPlayers: number;
  maxPlayers: number;
  turfCapacityRequired: string;
  baseHourlyRate: string;
  isExclusive: boolean;
  maxConcurrent: number;
}

export interface TurfAmenity {
  id: number;
  name: string;
  icon?: string | null;
  description?: string | null;
}

export interface TurfSport {
  id: number;
  name: string;
  icon?: string | null;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface RatingBreakdown {
  "5": number;
  "4": number;
  "3": number;
  "2": number;
  "1": number;
}

// Turf summary for search results
export interface TurfSummary {
  id: string;
  name: string;
  description?: string | null;
  city: string;
  address: string;
  latitude?: string | null;
  longitude?: string | null;
  averageRating: number;
  totalReviews: number;
  primaryImageUrl?: string | null;
  amenities: TurfAmenity[];
  sports: TurfSport[];
  startingPrice: string;
  bookingMode: "exclusive" | "shared";
}

// Full turf details
export interface TurfDetails {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  lengthMeters?: number | null;
  widthMeters?: number | null;
  surfaceType?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  socialLinks: SocialLink[];
  maxConcurrentBookings: number;
  bookingMode: "exclusive" | "shared";
  averageRating: string;
  totalReviews: number;
  ratingBreakdown: RatingBreakdown;
  media: TurfMedia[];
  amenities: TurfAmenity[];
  sports: TurfSport[];
  bookingTypes: TurfBookingType[];
  operatingHours: TurfOperatingHours[];
  pricingShifts: PricingShift[];
}

// ==================== SEARCH TYPES ====================

export interface SearchFilters {
  availableSports: TurfSport[];
  availableAmenities: TurfAmenity[];
  priceRange: {
    min: string;
    max: string;
  };
}

export interface TurfSearchParams {
  q?: string;
  sportId?: number;
  amenityIds?: string[]; // comma-separated
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: "price_low" | "price_high" | "rating" | "name";
}

export interface TurfSearchResponse {
  turfs: TurfSummary[];
  pagination: Pagination;
  filters: SearchFilters;
}

// ==================== AVAILABILITY TYPES ====================

export interface AvailableBookingType {
  id: number;
  name: string;
  displayName: string;
  hourlyRate: string;
  availableSlots: number;
  maxConcurrent: number;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  bookingTypes: AvailableBookingType[];
}

export interface UnavailablePeriod {
  startTime: string;
  endTime: string;
  reason: string;
  type: "blackout" | "booked";
}

export interface PricingInfo {
  peakHours: string[];
  offPeakHours: string[];
}

export interface AvailabilityParams {
  date: string; // YYYY-MM-DD
  bookingTypeId?: number;
  durationHours?: number;
}

export interface AvailabilityResponse {
  date: string;
  turfId: string;
  availableSlots: AvailableSlot[];
  unavailablePeriods: UnavailablePeriod[];
  pricingInfo: PricingInfo;
}

// ==================== BOOKING TYPES ====================

export interface PriceBreakdown {
  period: string;
  rate: string;
  amount: string;
  shift: string;
}

export interface ApplicableTaxes {
  gst: string;
  platformFee: string;
}

export interface PricingData {
  durationHours: string;
  numberOfSlots: number;
  hourlyRate: string;
  totalTurfFee: string;
  advanceAmount: string;
  remainingAmount: string;
  breakdown: PriceBreakdown[];
  applicableTaxes: ApplicableTaxes;
}

export interface TurfSummaryForBooking {
  turfName: string;
  address: string;
  city: string;
  socialLinks: SocialLink[];
  totalReviews: number;
  averageRating: string;
  media: TurfMedia[];
  sports: TurfSport[];
}

export interface BookingTypeForCalculation {
  id: number;
  name: string;
  displayName: string;
  sportName: string;
  sportIcon: string;
  minPlayers: number;
  maxPlayers: number;
  isExclusive: boolean;
  maxConcurrent: number;
}

export interface BookingRequestData {
  turfId: string;
  bookingTypeId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
}

export interface SlotInfo {
  isAvailable: boolean;
  availableConcurrentSlots: number;
  isPeakHours: boolean;
  shiftName: string;
  turfSegment: string;
}

export interface CalculatePriceRequest {
  turfId: string;
  bookingTypeId: number;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
}

export interface CalculatePriceResponse {
  pricing: PricingData;
  turf: TurfSummaryForBooking;
  bookingType: BookingTypeForCalculation;
  bookingRequestData: BookingRequestData;
  slotInfo: SlotInfo;
}

export interface CreateBookingRequest {
  turfId: string;
  bookingTypeId: number;
  bookingDate: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  specialRequests?: string;
}

export interface CreateBookingResponse {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationHours: string;
  totalTurfFee: string;
  advanceAmount: string;
  remainingAmount: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  razorpayOrderId?: string | null;
  paymentDeadline?: string | null;
}

export interface BookingSummary {
  id: string;
  turfName: string;
  turfAddress: string;
  turfCity: string;
  turfPhone?: string | null;
  bookingDate: string;
  startTime: string;
  endTime: string;
  bookingTypeName: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  totalTurfFee: string;
  advancePaid: boolean;
  remainingPaid: boolean;
  remainingAmount: string;
  isSharedSlot: boolean;
  turfSegment?: string | null;
  createdAt: string;
}

export interface BookingDetails extends BookingSummary {
  userId: string;
  turfId: string;
  bookingTypeId: number;
  durationHours: string;
  numberOfSlots: number;
  advanceAmount: string;
  razorpayPaymentId?: string | null;
  razorpayOrderId?: string | null;
  specialRequests?: string | null;
  bookingNotes?: string | null;
  updatedAt: string;
}

export interface UserBookingsParams {
  status?: "pending" | "confirmed" | "completed" | "cancelled";
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  page?: number;
  limit?: number;
}

export interface UserBookingsResponse {
  bookings: BookingSummary[];
  pagination: Pagination;
}

export interface CancelBookingResponse {
  bookingId: string;
  status: "cancelled";
  refundAmount: string;
  refundTimeline: string;
  cancellationFee: string;
}

// ==================== PAYMENT TYPES ====================

export interface ProcessPaymentRequest {
  paymentType: "advance" | "remaining";
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentStatusResponse {
  bookingId: string;
  advancePaid: boolean;
  remainingPaid: boolean;
  advanceAmount: string;
  remainingAmount: string;
  totalTurfFee: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
}

// ==================== REVIEW TYPES ====================

export interface CreateReviewRequest {
  bookingId?: string;
  rating: number; // 1-5
  reviewText?: string;
}

export interface Review {
  id: string;
  userId: string;
  rating: number;
  reviewText?: string | null;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  bookingDate?: string | null; // if verified
}

export interface ReviewSummary {
  totalReviews: number;
  averageRating: string;
  ratingBreakdown: RatingBreakdown;
  verifiedReviewsCount: number;
}

export interface TurfReviewsParams {
  rating?: number; // 1-5
  verifiedOnly?: boolean;
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest" | "rating_high" | "rating_low" | "helpful";
}

export interface TurfReviewsResponse {
  reviews: Review[];
  summary: ReviewSummary;
  pagination: Pagination;
}

export interface UserReviewsResponse {
  reviews: (Review & {
    turfName: string;
    turfId: string;
    bookingId?: string | null;
  })[];
  pagination: Pagination;
}

// ==================== CONNECT & PLAY TYPES ====================

export interface CreateConnectPlayRequest {
  turfId: string;
  sportId?: number | null;
  bookingTypeId?: number | null;
  eventDate: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  currentPlayers: number;
  neededPlayers: number;
  phoneNumber: string;
  description?: string;
  skillLevel?: "beginner" | "intermediate" | "advanced" | "any" | null;
  ageGroup?: string | null;
  preferredPositions?: string | null;
}

export interface CreateConnectPlayResponse {
  id: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  expiresAt: string;
  isActive: boolean;
}

export interface ConnectPlayListing {
  id: string;
  userId: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  currentPlayers: number;
  neededPlayers: number;
  totalPlayersRequired: number;
  phoneNumber: string;
  description?: string | null;
  skillLevel?: "beginner" | "intermediate" | "advanced" | "any" | null;
  ageGroup?: string | null;
  preferredPositions?: string | null;
  turfName: string;
  turfCity: string;
  turfAddress: string;
  sportName?: string | null;
  sportIcon?: string | null;
  gameType?: string | null;
  pendingResponses: number;
  createdAt: string;
  expiresAt: string;
}

export interface ConnectPlayListingsParams {
  city?: string;
  sportId?: number;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  skillLevel?: "beginner" | "intermediate" | "advanced" | "any";
  page?: number;
  limit?: number;
  sort?: "newest" | "date" | "players_needed";
}

export interface ConnectPlayListingsResponse {
  listings: ConnectPlayListing[];
  pagination: Pagination;
}

export interface ConnectPlayResponse {
  id: string;
  responderUserId: string;
  responderPhone: string;
  message?: string | null;
  playersBringing: number;
  status: "pending" | "accepted" | "declined" | "withdrawn";
  createdAt: string;
}

export interface ResponseSummary {
  totalResponses: number;
  pending: number;
  accepted: number;
  declined: number;
  totalInterestedPlayers: number;
}

export interface ListingResponsesResponse {
  responses: ConnectPlayResponse[];
  summary: ResponseSummary;
}

export interface RespondToListingRequest {
  responderPhone: string;
  message?: string;
  playersBringing: number;
}

export interface UpdateResponseRequest {
  status: "accepted" | "declined";
}

export interface MyConnectPlayResponse {
  id: string;
  listingId: string;
  turfName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  message?: string | null;
  playersBringing: number;
  status: "pending" | "accepted" | "declined" | "withdrawn";
  createdAt: string;
  updatedAt: string;
}

export interface MyConnectPlayResponsesResponse {
  responses: MyConnectPlayResponse[];
  pagination: Pagination;
}

// ==================== NOTIFICATION TYPES ====================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "booking" | "payment" | "review" | "connect_play" | "general";
  isRead: boolean;
  data?: Record<string, any> | null;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: Pagination;
  unreadCount: number;
}

// ==================== API ENDPOINT export interfaceS ====================

// Turf Discovery & Search
export interface TurfSearchAPI {
  "/turfs/search": {
    GET: {
      params: TurfSearchParams;
      response: ApiResponse<TurfSearchResponse>;
    };
  };
  "/turfs/{turfId}": {
    GET: {
      response: ApiResponse<TurfDetails>;
    };
  };
}

// Availability & Booking
export interface BookingAPI {
  "/turfs/{turfId}/availability": {
    GET: {
      params: AvailabilityParams;
      response: ApiResponse<AvailabilityResponse>;
    };
  };
  "/bookings/calculate-price": {
    POST: {
      body: CalculatePriceRequest;
      response: ApiResponse<CalculatePriceResponse>;
    };
  };
  "/bookings": {
    POST: {
      body: CreateBookingRequest;
      response: ApiResponse<CreateBookingResponse>;
    };
  };
  "/bookings/my-bookings": {
    GET: {
      params: UserBookingsParams;
      response: ApiResponse<UserBookingsResponse>;
    };
  };
  "/bookings/{bookingId}": {
    GET: {
      response: ApiResponse<BookingDetails>;
    };
    DELETE: {
      response: ApiResponse<CancelBookingResponse>;
    };
  };
  "/bookings/{bookingId}/payment": {
    POST: {
      body: ProcessPaymentRequest;
      response: ApiResponse<PaymentStatusResponse>;
    };
  };
  "/bookings/{bookingId}/payment-status": {
    GET: {
      response: ApiResponse<PaymentStatusResponse>;
    };
  };
}

// Connect & Play
export interface ConnectPlayAPI {
  "/connect-play/listings": {
    GET: {
      params: ConnectPlayListingsParams;
      response: ApiResponse<ConnectPlayListingsResponse>;
    };
    POST: {
      body: CreateConnectPlayRequest;
      response: ApiResponse<CreateConnectPlayResponse>;
    };
  };
  "/connect-play/my-listings": {
    GET: {
      params: Pagination;
      response: ApiResponse<ConnectPlayListingsResponse>;
    };
  };
  "/connect-play/listings/{listingId}": {
    PUT: {
      body: Partial<CreateConnectPlayRequest>;
      response: ApiResponse<CreateConnectPlayResponse>;
    };
    DELETE: {
      response: ApiResponse<{ success: boolean }>;
    };
  };
  "/connect-play/listings/{listingId}/responses": {
    GET: {
      response: ApiResponse<ListingResponsesResponse>;
    };
    POST: {
      body: RespondToListingRequest;
      response: ApiResponse<ConnectPlayResponse>;
    };
  };
  "/connect-play/responses/{responseId}": {
    PUT: {
      body: UpdateResponseRequest;
      response: ApiResponse<ConnectPlayResponse>;
    };
  };
  "/connect-play/my-responses": {
    GET: {
      params: Pagination;
      response: ApiResponse<MyConnectPlayResponsesResponse>;
    };
  };
}

// Reviews & Ratings
export interface ReviewAPI {
  "/turfs/{turfId}/reviews": {
    GET: {
      params: TurfReviewsParams;
      response: ApiResponse<TurfReviewsResponse>;
    };
    POST: {
      body: CreateReviewRequest;
      response: ApiResponse<Review>;
    };
  };
  "/reviews/{reviewId}/helpful": {
    POST: {
      response: ApiResponse<{ success: boolean }>;
    };
  };
  "/reviews/my-reviews": {
    GET: {
      params: Pagination;
      response: ApiResponse<UserReviewsResponse>;
    };
  };
}

// Master Data
export interface MasterDataAPI {
  "/sports": {
    GET: {
      response: ApiResponse<Sport[]>;
    };
  };
  "/booking-types": {
    GET: {
      response: ApiResponse<BookingType[]>;
    };
  };
  "/amenities": {
    GET: {
      response: ApiResponse<Amenity[]>;
    };
  };
  "/locations/cities": {
    GET: {
      response: ApiResponse<City[]>;
    };
  };
  "/locations/states": {
    GET: {
      response: ApiResponse<State[]>;
    };
  };
}

// Notifications
export interface NotificationAPI {
  "/notifications": {
    GET: {
      params: Pagination;
      response: ApiResponse<NotificationsResponse>;
    };
  };
  "/notifications/{notificationId}/read": {
    PUT: {
      response: ApiResponse<{ success: boolean }>;
    };
  };
  "/notifications/read-all": {
    PUT: {
      response: ApiResponse<{ success: boolean }>;
    };
  };
}

// ==================== COMBINED API TYPE ====================

export interface TurfBookingAPI
  extends TurfSearchAPI,
    BookingAPI,
    ConnectPlayAPI,
    ReviewAPI,
    MasterDataAPI,
    NotificationAPI {}
