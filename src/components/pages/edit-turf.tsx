"use client";

import { useState, useEffect, Fragment } from "react";
import { useNavigate, useParams } from "react-router";
import { Icons } from "@/components/icons";
import { Button } from "@/components/elements";
import { Switch } from "@/components/elements";


interface Media {
  id: string;
  type: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  displayOrder: number;
}

interface Amenity {
  id: number;
  name: string;
  icon: string;
  description: string;
}

interface BookingType {
  id: number;
  name: string;
  displayName: string;
  minPlayers: number;
  maxPlayers: number;
  turfCapacityRequired: number;
  baseHourlyRate: number;
  isExclusive: boolean;
  maxConcurrent: number;
}

interface OperatingHour {
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface PricingShift {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  hourlyRate: number;
  shiftName: string;
}

interface SocialLink {
  url: string;
  platform: string;
}

interface Turf {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  contactEmail: string;
  socialLinks: SocialLink[];
  maxConcurrentBookings: number;
  bookingMode: string;
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: Record<string, number>;
  media: Media[];
  amenities: Amenity[];
  sports: any[];
  bookingTypes: BookingType[];
  operatingHours: OperatingHour[];
  pricingShifts: PricingShift[];
  isActive?: boolean;
}

interface ApiResponse {
  success: boolean;
  data: Turf;
  message?: string;
  timestamp: string;
}

const turfApiService = {
  baseURL: import.meta.env.VITE_BASE_API_URL || "play-arena-app-production.up.railway.app",

  async getTurfById(turfId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/v1/turfs/${turfId}`, {
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
        if (response.status === 404) {
          throw new Error("Turf not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching turf:", error);
      throw error;
    }
  },

  async updateTurf(turfId: string, turfData: Partial<Turf>): Promise<ApiResponse> {
    try {
      
      const apiData: any = {};

      if (turfData.name !== undefined) apiData.name = turfData.name;
      if (turfData.description !== undefined) apiData.description = turfData.description;
      if (turfData.address !== undefined) apiData.address = turfData.address;
      if (turfData.city !== undefined) apiData.city = turfData.city;
      if (turfData.state !== undefined) apiData.state = turfData.state;
      if (turfData.postalCode !== undefined) apiData.postalCode = turfData.postalCode;
      if (turfData.contactPhone !== undefined) {
        
        const cleanPhone = turfData.contactPhone.replace(/\D/g, '');
        if (cleanPhone.length === 10) {
          apiData.contactPhone = `+91-${cleanPhone}`;
        } else {
          apiData.contactPhone = turfData.contactPhone;  
        }
      }
      if (turfData.contactEmail !== undefined) apiData.contactEmail = turfData.contactEmail;
    
      if (turfData.maxConcurrentBookings !== undefined) apiData.maxConcurrentBookings = turfData.maxConcurrentBookings;
      if (turfData.bookingMode !== undefined) apiData.bookingMode = turfData.bookingMode;
      
      if (turfData.isActive !== undefined) apiData.is_active = turfData.isActive;

      // Add amenities to API data if provided
      if (turfData.amenities !== undefined) apiData.amenities = turfData.amenities.map(a => a.id);

      console.log("Updating turf with data:", apiData);

      const response = await fetch(`${this.baseURL}/v1/turfs/${turfId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed");
        }
        if (response.status === 403) {
          throw new Error("Access forbidden");
        }
        if (response.status === 404) {
          throw new Error("Turf not found");
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating turf:", error);
      throw error;
    }
  },

  // New method to fetch all available amenities
  async getAllAmenities(): Promise<{ success: boolean; data: Amenity[] }> {
    try {
      const response = await fetch(`${this.baseURL}/v1/amenities`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching amenities:", error);
      throw error;
    }
  }
};


const EditTurfHeader = ({ turfName, onBack }: { turfName: string; onBack: () => void }) => (
  <header className="fixed top-0 left-0 right-0 bg-background-100 shadow-sm border-b border-background-300 z-50">
    <div className="px-4 py-4 sm:px-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="border-background-300"
          >
            <Icons.arrowLeft className="w-4 h-5 mr-1" />
            
          </Button>
          <div>
            <h1 className="text-xl font-generalsans font-semibold text-text-100">
              Edit Turf
            </h1>
            {turfName && (
              <p className="text-body-sm text-text-200">{turfName}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  </header>
);


const Toast = ({ 
  message, 
  type = "success", 
  onClose 
}: { 
  message: string; 
  type?: "success" | "error"; 
  onClose: () => void;
}) => (
  <div className={`fixed top-18 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
    type === "success" ? "bg-white-900 text-primary-100" : "bg-red-100 text-red-800 border border-red-200"
  }`}>
    {type === "success" ? (
      <Icons.check className="w-5 h-5" />
    ) : (
      <Icons.alertCircle className="w-5 h-5" />
    )}
    <span className="font-medium">{message}</span>
    <Button
      onClick={onClose}
      size="sm"
      className="p-1 h-auto"
    >
      <Icons.x className="w-4 h-4" />
    </Button>
  </div>
);


const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="space-y-4">
      <div className="h-6 bg-gray-300 rounded w-1/4"></div>
      <div className="h-10 bg-gray-300 rounded"></div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="h-10 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
    <div className="h-32 bg-gray-300 rounded"></div>
    <div className="flex gap-4">
      <div className="h-10 bg-gray-300 rounded flex-1"></div>
      <div className="h-10 bg-gray-300 rounded flex-1"></div>
    </div>
  </div>
);


const FormField = ({ 
  label, 
  id, 
  children, 
  required = false,
  error 
}: { 
  label: string; 
  id: string; 
  children: React.ReactNode; 
  required?: boolean;
  error?: string;
}) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-body-sm font-medium text-text-100">
      {label}
      {required && <span className="text-error ml-1">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-body-sm text-error">{error}</p>
    )}
  </div>
);


const Input = ({ 
  className = "", 
  error = false,
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) => (
  <input
    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
      error 
        ? 'border-error focus:ring-error/20' 
        : 'border-background-300 focus:ring-primary-200/20 focus:border-primary-200'
    } ${className}`}
    {...props}
  />
);


const Textarea = ({ 
  className = "", 
  error = false,
  ...props 
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) => (
  <textarea
    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-vertical ${
      error 
        ? 'border-error focus:ring-error/20' 
        : 'border-background-300 focus:ring-primary-200/20 focus:border-primary-200'
    } ${className}`}
    {...props}
  />
);


const formatPhoneForDisplay = (phone: string): string => {
  if (!phone) return "";
  
  const cleanPhone = phone.replace(/^\+91-?/, '').replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{5})(\d{5})/, '$1 $2');
  }
  return phone;
};


export const EditTurf = () => {
  const navigate = useNavigate();
  const { turfId } = useParams<{ turfId: string }>();
  
  
  const [turf, setTurf] = useState<Turf | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // New state for amenities
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([]);
  const [isLoadingAmenities, setIsLoadingAmenities] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    
    contactPhone: "",
    contactEmail: "",
    
    maxConcurrentBookings: "",
    bookingMode: "",
    isActive: true,
  });

 
  useEffect(() => {
    if (turfId) {
      fetchTurf();
      fetchAllAmenities();
    }
  }, [turfId]);

  const fetchTurf = async () => {
    if (!turfId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await turfApiService.getTurfById(turfId);

      if (response.success && response.data) {
        const turfData = response.data;
        setTurf(turfData);
        
        
        setFormData({
          name: turfData.name || "",
          description: turfData.description || "",
          address: turfData.address || "",
          city: turfData.city || "",
          state: turfData.state || "",
          postalCode: turfData.postalCode || "",
          
          contactPhone: formatPhoneForDisplay(turfData.contactPhone || ""),
          contactEmail: turfData.contactEmail || "",
          
          maxConcurrentBookings: turfData.maxConcurrentBookings?.toString() || "",
          bookingMode: turfData.bookingMode || "",
          isActive: turfData.isActive !== undefined ? turfData.isActive : true,
        });

        // Set selected amenities
        setSelectedAmenities(turfData.amenities || []);
      } else {
        throw new Error(response.message || "Failed to fetch turf data");
      }
    } catch (err) {
      console.error("Error fetching turf:", err);
      setError(err instanceof Error ? err.message : "Failed to load turf data");

      if (err instanceof Error && (err.message.includes("Authentication") || err.message.includes("401"))) {
        navigate("/auth/login", { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllAmenities = async () => {
    try {
      setIsLoadingAmenities(true);
      const response = await turfApiService.getAllAmenities();
      if (response.success) {
        setAllAmenities(response.data);
      }
    } catch (err) {
      console.error("Error fetching amenities:", err);
      // Don't show error for amenities fetch failure, just log it
    } finally {
      setIsLoadingAmenities(false);
    }
  };

 
  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
  
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Handle amenity selection/deselection
  const handleAmenityToggle = (amenity: Amenity) => {
    setSelectedAmenities(prev => {
      const isSelected = prev.some(a => a.id === amenity.id);
      if (isSelected) {
        return prev.filter(a => a.id !== amenity.id);
      } else {
        return [...prev, amenity];
      }
    });
  };

 
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Turf name is required";
    }

    if (!formData.city.trim()) {
      errors.city = "City is required";
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }

    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      errors.contactEmail = "Please enter a valid email address";
    }

    if (formData.contactPhone && !/^\d{5}\s\d{5}$/.test(formData.contactPhone)) {
      errors.contactPhone = "Please enter a valid 10-digit phone number (format: XXXXX XXXXX)";
    }

    if (formData.maxConcurrentBookings && (isNaN(Number(formData.maxConcurrentBookings)) || Number(formData.maxConcurrentBookings) < 1)) {
      errors.maxConcurrentBookings = "Please enter a valid number of concurrent bookings";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setToast({ message: "Please fix the validation errors", type: "error" });
      return;
    }

    if (!turfId) return;

    try {
      setIsSaving(true);
      setError(null);

      const updateData: Partial<Turf> = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        
        maxConcurrentBookings: formData.maxConcurrentBookings ? Number(formData.maxConcurrentBookings) : undefined,
        bookingMode: formData.bookingMode,
        isActive: formData.isActive,
        amenities: selectedAmenities, // Include selected amenities
      };

      
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined || updateData[key as keyof typeof updateData] === '') {
          delete updateData[key as keyof typeof updateData];
        }
      });

      const response = await turfApiService.updateTurf(turfId, updateData);

      if (response.success) {
        setToast({ message: "Turf updated successfully!", type: "success" });
        
        
        if (response.data) {
          setTurf(response.data);
        }
        
        
        setTimeout(() => {
          navigate("/dashboard/turfs");
        }, 1500);
      } else {
        throw new Error(response.message || "Failed to update turf");
      }
    } catch (err) {
      console.error("Error updating turf:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update turf";
      setError(errorMessage);
      setToast({ message: errorMessage, type: "error" });
      
      if (err instanceof Error && (err.message.includes("Authentication") || err.message.includes("401"))) {
        navigate("/auth/login", { replace: true });
      }
    } finally {
      setIsSaving(false);
    }
  };

 
  const handleBack = () => {
    navigate("/dashboard/turfs");
  };

  
  const closeToast = () => {
    setToast(null);
  };

  if (isLoading) {
    return (
      <Fragment>
        <EditTurfHeader turfName="" onBack={handleBack} />
        <section className="bg-background-200 min-h-screen pt-20 px-4 sm:px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <LoadingSkeleton />
          </div>
        </section>
      </Fragment>
    );
  }

  if (error && !turf) {
    return (
      <Fragment>
        <EditTurfHeader turfName="" onBack={handleBack} />
        <section className="bg-background-200 min-h-screen pt-20 px-4 sm:px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <Icons.alertCircle className="w-12 h-12 text-error mb-4 mx-auto" />
              <h3 className="text-h6 font-generalsans font-semibold text-text-100 mb-2">
                Error Loading Turf
              </h3>
              <p className="text-body text-text-200 mb-4">
                {error}
              </p>
              <Button onClick={fetchTurf} variant="outline">
                <Icons.refreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </section>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <EditTurfHeader turfName={formData.name} onBack={handleBack} />
      
      {/* Toast notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}
      
      <section className="bg-background-200 overflow-auto min-h-screen py-6 sm:px-5 pt-18 sm:pt-28">
        <div className="max-w-4xl mx-auto">
          <div className="bg-background-100 rounded-xl shadow-down p-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-start gap-3">
                  <Icons.alertCircle className="w-5 h-5 text-error mt-0.5" />
                  <div>
                    <h4 className="font-medium text-error">Error</h4>
                    <p className="text-body-sm text-error">{error}</p>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-generalsans font-semibold text-text-100">
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Turf Name" id="name" required error={formErrors.name}>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter turf name"
                      error={!!formErrors.name}
                    />
                  </FormField>
                </div>

                <FormField label="Description" id="description">
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your turf facilities and features"
                    rows={4}
                  />
                </FormField>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-h6 font-generalsans font-semibold text-text-100">
                  Location Information
                </h3>
                
                <FormField label="Address" id="address" required error={formErrors.address}>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter complete address"
                    rows={3}
                    error={!!formErrors.address}
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="City" id="city" required error={formErrors.city}>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="Enter city"
                      error={!!formErrors.city}
                    />
                  </FormField>

                  <FormField label="State" id="state" error={formErrors.state}>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="Enter state"
                      error={!!formErrors.state}
                    />
                  </FormField>

                  <FormField label="Postal Code" id="postalCode" error={formErrors.postalCode}>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      placeholder="Enter postal code"
                      error={!!formErrors.postalCode}
                    />
                  </FormField>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-h6 font-generalsans font-semibold text-text-100">
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Manager Contact " id="contactPhone" error={formErrors.contactPhone}>
                    <Input
                      id="contactPhone" 
                      value={formData.contactPhone}
                      onChange={(e) => {
                        
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) {
                          const formatted = value.length > 5 ? 
                            value.replace(/(\d{5})(\d{0,5})/, '$1 $2') : 
                            value;
                          handleInputChange("contactPhone", formatted);
                        }
                      }}
                      placeholder="XXXXXXXXXX"
                      maxLength={11}  
                      error={!!formErrors.contactPhone}
                    />
                  </FormField>

                  <FormField label="Manager Email" id="contactEmail" error={formErrors.contactEmail}>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                      placeholder="Enter email address"
                      error={!!formErrors.contactEmail}
                    />
                  </FormField>
                </div>
              </div>

              {/* Editable Amenities Section */}
              <div className="space-y-4">
                <h3 className="text-h6 font-generalsans font-semibold text-text-100">
                  Amenities
                </h3>
                
                {isLoadingAmenities ? (
                  <div className="text-center py-4">
                    <Icons.loader2 className="w-6 h-6 animate-spin mx-auto text-primary-200" />
                    <p className="text-body-sm text-text-200 mt-2">Loading amenities...</p>
                  </div>
                ) : allAmenities.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-body-sm text-text-200">
                      Select amenities available at your turf:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-3">
                      {allAmenities.map((amenity) => {
                        const isSelected = selectedAmenities.some(a => a.id === amenity.id);
                        return (
                          <div 
                            key={amenity.id} 
                            className={`flex items-center gap-3 p-2 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-primary-200/10 text-primary-200' 
                                : 'bg-background-200 border-background-300 hover:border-background-400'
                            }`}
                            onClick={() => handleAmenityToggle(amenity)}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isSelected ? ' text-white' : 'bg-background-300'
                            }`}>
                              {isSelected ? (
                                <Icons.check className="w-6 h-5" />
                              ) : (
                                <Icons.plus className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-text-100">{amenity.name}</div>
                              <div className="text-body-sm text-text-200">{amenity.description}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-body-sm text-text-200 mt-2">
                      Selected: {selectedAmenities.length} of {allAmenities.length} amenities
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-body-sm text-text-200">No amenities available to select.</p>
                  </div>
                )}
              </div>

              {/* Additional Information Display (Read-only) */}
              <div className="space-y-4">
                <h3 className="text-h6 font-generalsans font-semibold text-text-100">
                  Additional Information
                </h3>
                
                <div className="bg-background-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-body-sm">
                    <div>
                      <span className="text-text-200">Average Rating:</span>
                      <span className="ml-2 font-medium text-text-100">
                        {turf?.averageRating || 0} / 5
                      </span>
                    </div>
                    <div>
                      <span className="text-text-200">Total Reviews:</span>
                      <span className="ml-2 font-medium text-text-100">
                        {turf?.totalReviews || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-200">Total Media:</span>
                      <span className="ml-2 font-medium text-text-100">
                        {turf?.media?.length || 0} images
                      </span>
                    </div>
                    <div>
                      <span className="text-text-200">Selected Amenities:</span>
                      <span className="ml-2 font-medium text-text-100">
                        {selectedAmenities.length} selected
                      </span>
                    </div>
                    <div>
                      <span className="text-text-200">Booking Types:</span>
                      <span className="ml-2 font-medium text-text-100">
                        {turf?.bookingTypes?.length || 0} types
                      </span>
                    </div>
                    <div>
                      <span className="text-text-200">Pricing Shifts:</span>
                      <span className="ml-2 font-medium text-text-100">
                        {turf?.pricingShifts?.length || 0} shifts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selected Amenities Preview */}
                {selectedAmenities.length > 0 && (
                  <div>
                    <h4 className="font-medium text-text-100 mb-3">Selected Amenities ({selectedAmenities.length})</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-3">
                      {selectedAmenities.map((amenity) => (
                        <div key={amenity.id} className="flex items-center gap-2 p-2 bg-primary-100/10 border border-primary-100/20 rounded-lg">
                          <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                            <Icons.check className="w-6 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-text-100">{amenity.name}</div>
                            <div className="text-body-sm text-text-200">{amenity.description}</div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="p-1 h-auto border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleAmenityToggle(amenity)}
                          >
                            <Icons.x className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Booking Types Display */}
                {turf?.bookingTypes && turf.bookingTypes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-text-100 mb-3">Available Booking Types</h4>
                    <div className="space-y-3">
                      {turf.bookingTypes.map((bookingType) => (
                        <div key={bookingType.id} className="p-4 bg-background-200 rounded-lg">
                          <div className="grid gap-1 justify-between items-start mb-2">
                            <h5 className="font-medium text-text-100">{bookingType.displayName}</h5>
                            <span className="text-primary-200 font-semibold">₹{bookingType.baseHourlyRate}/hour</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-body-sm text-text-200">
                            <div>
                              <span className="block">Min Players:</span>
                              <span className="font-medium text-text-100">{bookingType.minPlayers}</span>
                            </div>
                            <div>
                              <span className="block">Max Players:</span>
                              <span className="font-medium text-text-100">{bookingType.maxPlayers}</span>
                            </div>
                            <div>
                              <span className="block">Exclusive:</span>
                              <span className="font-medium text-text-100">
                                {bookingType.isExclusive ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div>
                              <span className="block">Max Concurrent:</span>
                              <span className="font-medium text-text-100">{bookingType.maxConcurrent}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-h6 font-generalsans font-semibold text-text-100">
                  Status
                </h3>
                
                <div className="flex items-center gap-5 justify-between p-4 bg-background-200 rounded-lg">
                  <div>
                    <label htmlFor="isActive" className="font-medium text-text-100">
                      Turf Status
                    </label>
                    <p className="text-body-sm text-text-200">
                      Toggle to activate or deactivate this turf
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-body-sm font-medium ${formData.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-background-300">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-200 hover:bg-primary-300 text-background-100 flex-1"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Icons.loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Icons.save className="w-4 h-4 mr-2" />
                      Update Turf
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </Fragment>
  );
};