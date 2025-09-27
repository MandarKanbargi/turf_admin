"use client";

import { useState, Fragment, useEffect } from "react";
import { useNavigate } from "react-router";
import { Icons } from "@/components/icons";
import { Button } from "@/components/elements";
import { Switch } from "@/components/elements";


interface TurfMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  isPrimary: boolean;
  caption?: string;
  uploadedAt: string;
}

interface Turf {
  id: string;
  name: string;
  city: string;
  address: string;
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  
  image?: string;
  images?: string[];
  media?: TurfMedia[];
}

interface ApiResponse {
  success: boolean;
  data: Turf[];
  message?: string;
  timestamp: string;
}

interface MediaResponse {
  success: boolean;
  data: TurfMedia[];
  message?: string;
}


const apiService = {
  baseURL: import.meta.env.VITE_BASE_API_URL || "https://api.theplayarena.co.in",

  async getMyTurfs(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/v1/turfs/my-turfs`, {
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
      console.error("Error fetching turfs:", error);
      throw error;
    }
  },

  async getTurfMedia(turfId: string): Promise<MediaResponse> {
    try {
      const response = await fetch(`${this.baseURL}/v1/turfs/${turfId}/media`, {
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
      console.error("Error fetching turf media:", error);
      throw error;
    }
  },

  async updateTurfStatus(turfId: string, isActive: boolean): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/v1/turfs/${turfId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: isActive }),
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

      return await response.json();
    } catch (error) {
      console.error("Error updating turf status:", error);
      throw error;
    }
  }
};

const AppHeaderWithLogout = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; 
    
    setIsLoggingOut(true);
    
    try {
      
      try {
        await fetch(`${apiService.baseURL}/v1/auth/logout`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
       
        console.log("Logout API call failed, continuing with client-side cleanup");
      }

      
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      
     
      sessionStorage.clear();


      const cookiesToClear = [
        'authToken', 
        'refreshToken', 
        'sessionId', 
        'connect.sid',
        'session'
      ];
      
      cookiesToClear.forEach(cookieName => {
 
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;

        const domain = window.location.hostname.split('.').slice(-2).join('.');
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
      });

    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoggingOut(false);
    
      navigate("/auth/login", { replace: true });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background-100 shadow-sm border-b border-background-300 z-50">
      <div className="px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            
              <Icons.home className="w-5 h-5 text-white fallback-icon hidden" />
            </div>
            <span className="text-2xl font-generalsans font-semibold text-text-100">
              Turf Owner
            </span>
          </div>

          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-primary-200 text-background-100 flex w-auto items-center justify-center gap-2 font-medium sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <div className="w-4 h-4 border-2 border-background-100 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Icons.logOut className="size-4" />
            )}
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </header>
  );
};

const ImageCarousel = ({ media, turfName }: { media: TurfMedia[]; turfName: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const images = media.filter(item => item.type === 'image');
  
  if (images.length === 0) {
    return (
      <div className="h-40 w-full bg-gray-200 flex items-center justify-center sm:h-48">
        <div className="text-center">
          <Icons.image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-body-sm text-gray-500">No images available</p>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative group">
      {/* Main Image */}
      <div className="relative h-40 w-full overflow-hidden sm:h-48">
        <img
          src={images[currentIndex]?.url}
          alt={`${turfName} - Image ${currentIndex + 1}`}
          className="h-full w-full object-cover transition-opacity duration-300"
          onLoad={() => setIsLoading(false)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
            setIsLoading(false);
          }}
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <Icons.image className="w-8 h-8 text-gray-400" />
          </div>
        )}

        
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Previous image"
            >
              <Icons.chevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Next image"
            >
              <Icons.chevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Primary Badge */}
        {images[currentIndex]?.isPrimary && (
          <div className="absolute top-2 right-2 bg-primary-200 text-white px-2 py-1 rounded text-xs font-medium">
            Primary
          </div>
        )}
      </div>

      {/* Dot Indicators - only show if more than 1 image */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};


const TurfCardSkeleton = () => (
  <div className="bg-background-100 shadow-down overflow-hidden rounded-xl animate-pulse">
    <div className="h-40 sm:h-48 bg-gray-300"></div>
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-6 bg-gray-300 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
        <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
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
      <div>
        <div className="h-4 bg-gray-300 rounded mb-1"></div>
        <div className="h-6 bg-gray-300 rounded w-1/2"></div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-10 bg-gray-300 rounded"></div>
        <div className="h-10 bg-gray-300 rounded"></div>
        <div className="h-10 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
);


const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
    <Icons.alertCircle className="w-12 h-12 text-error bg-error mb-4" />
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
    <Icons.home className="w-12 h-12 text-text-200 mb-4" />
    <h3 className="text-h6 font-generalsans font-semibold text-text-100 mb-2">
      No Turfs Found
    </h3>
    <p className="text-body text-text-200 mb-4 max-w-md">
      You haven't added any turf facilities yet. Get started by adding your first turf.
    </p>
    <Button className="bg-primary-200 hover:bg-primary-300 text-background-100">
      <Icons.plus className="w-4 h-4 mr-2" />
      Add Your First Turf
    </Button>
  </div>
);


// const RatingStars = ({ rating, totalReviews }: { rating: number; totalReviews: number }) => {
//   const stars = [];
//   const fullStars = Math.floor(rating);
//   const hasHalfStar = rating % 1 >= 0.5;
  
//   for (let i = 0; i < 5; i++) {
//     if (i < fullStars) {
//       stars.push(
//         <Icons.star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
//       );
//     } else if (i === fullStars && hasHalfStar) {
//       stars.push(
//         <Icons.star key={i} className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
//       );
//     } else {
//       stars.push(
//         <Icons.star key={i} className="w-4 h-4 text-gray-300" />
//       );
//     }
//   }
  
//   return (
//     <div className="flex items-center gap-1">
//       <div className="flex items-center">
//         {stars}
//       </div>
//       {totalReviews > 0 && (
//         <span className="text-body-sm text-text-200 ml-1">
//           ({totalReviews})
//         </span>
//       )}
//     </div>
//   );
// };

export const TurfsManagement = () => {
  const navigate = useNavigate();
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [mediaLoading, setMediaLoading] = useState<Set<string>>(new Set());


  useEffect(() => {
    fetchTurfs();
  }, []);

  const fetchTurfs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.getMyTurfs();

      if (response.success && response.data) {
        setTurfs(response.data);
        // Fetch media for each turf
        await fetchAllTurfMedia(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch turfs");
      }
    } catch (err) {
      console.error("Error fetching turfs:", err);
      setError(err instanceof Error ? err.message : "Failed to load turfs");

      if (err instanceof Error && (err.message.includes("Authentication") || err.message.includes("401"))) {
        navigate("/auth/login", { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllTurfMedia = async (turfList: Turf[]) => {
    
    const mediaPromises = turfList.map(async (turf) => {
      try {
        setMediaLoading(prev => new Set(prev).add(turf.id));
        const mediaResponse = await apiService.getTurfMedia(turf.id);
        
        if (mediaResponse.success && mediaResponse.data) {
          return { turfId: turf.id, media: mediaResponse.data };
        }
        return { turfId: turf.id, media: [] };
      } catch (error) {
        console.error(`Error fetching media for turf ${turf.id}:`, error);
        return { turfId: turf.id, media: [] };
      } finally {
        setMediaLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(turf.id);
          return newSet;
        });
      }
    });

    const mediaResults = await Promise.allSettled(mediaPromises);
    
    setTurfs(prevTurfs => 
      prevTurfs.map(turf => {
        const mediaResult = mediaResults.find((result) => 
          result.status === 'fulfilled' && result.value.turfId === turf.id
        );
        
        if (mediaResult && mediaResult.status === 'fulfilled') {
          return { ...turf, media: mediaResult.value.media };
        }
        return { ...turf, media: [] };
      })
    );
  };

  const handleToggleActive = async (turfId: string) => {
    const turf = turfs.find(t => t.id === turfId);
    if (!turf) return;

    try {
      setUpdatingStatus(turfId);

      setTurfs((prev) =>
        prev.map((t) =>
          t.id === turfId
            ? {
              ...t,
              isActive: !t.isActive,
            }
            : t,
        ),
      );

      await apiService.updateTurfStatus(turfId, !turf.isActive);

    } catch (error) {
      console.error("Error updating turf status:", error);

      setTurfs((prev) =>
        prev.map((t) =>
          t.id === turfId
            ? {
              ...t,
              isActive: turf.isActive,
            }
            : t,
        ),
      );

      alert("Failed to update turf status. Please try again.");

      if (error instanceof Error && (error.message.includes("Authentication") || error.message.includes("401"))) {
        navigate("/auth/login", { replace: true });
      }
    } finally {
      setUpdatingStatus(null);
    }
  };


  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString('en-IN', {
  //     day: 'numeric',
  //     month: 'short',
  //     year: 'numeric'
  //   });
  // };

  return (
    <Fragment>
      <AppHeaderWithLogout />

      <section className="bg-background-200 min-h-screen py-6 sm:px-5 pt-18 sm:pt-28">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="grid gap-2">
              <h4 className="text-xl text-text-100 font-generalsans font-semibold">
                Turf Management
              </h4>
              <p className="text-sm text-text-200 font-normal">
                Manage your turf facilities and settings.
              </p>
            </div>
          </div>

          {/* Stats Summary */}
          {!isLoading && !error && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="bg-background-100 rounded-xl p-4">
                <p className="text-body-sm text-text-200">Total Turfs</p>
                <p className="text-h5 font-generalsans font-semibold text-text-100">{turfs.length}</p>
              </div>
              <div className="bg-background-100 rounded-xl p-4">
                <p className="text-body-sm text-text-200">Active Turfs</p>
                <p className="text-h5 font-generalsans font-semibold text-text-100">
                  {turfs.filter(t => t.isActive).length}
                </p>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TurfCardSkeleton key={index} />
              ))
            ) : error ? (
              <ErrorState message={error} onRetry={fetchTurfs} />
            ) : turfs.length === 0 ? (
              <EmptyState />
            ) : (
              turfs.map((turf) => (
                <div
                  key={turf.id}
                  className="bg-background-100 shadow-down overflow-hidden rounded-xl"
                >
                  {/* Image Carousel with Status Badge */}
                  <div className="relative">
                    {turf.media && turf.media.length > 0 ? (
                      <ImageCarousel media={turf.media} turfName={turf.name} />
                    ) : (
                      <div className="h-40 w-full bg-gray-200 flex items-center justify-center sm:h-48">
                        {mediaLoading.has(turf.id) ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-200"></div>
                        ) : (
                          <div className="text-center">
                            <Icons.image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-body-sm text-gray-500">No images available</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-label-sm rounded-full px-2 py-1 font-medium sm:px-3 ${
                          turf.isActive
                            ? "bg-text-300 text-success  border-success/20 border"
                            : "bg-text-300 text-error border-error/20 border"
                        }`}
                      >
                        {turf.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 sm:p-6">
                    {/* Turf Info */}
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl text-text-100 font-generalsans truncate font-semibold">
                          {turf.name}
                        </h3>
                        <p className="text-body-md text-text-200 font-normal mb-2">
                          {turf.city} 
                        </p>
                        <p className="text-body-md text-text-200 font-normal ">
                           {turf.address} 
                        </p>
                      </div>
                      {/* Toggle Switch */}
                      <Switch
                        id={`status-toggle-${turf.id}`}
                        checked={turf.isActive}
                        onCheckedChange={() => handleToggleActive(turf.id)}
                        disabled={updatingStatus === turf.id}
                      />
                    </div>

                    {/* Media Count */}
                    {turf.media && turf.media.length > 0 && (
                      <div className="flex items-center gap-2 text-body-md text-text-200">
                        <Icons.image className="w-4 h-4" />
                        <span>{turf.media.filter(m => m.type === 'image').length} images</span>
                        {turf.media.some(m => m.type === 'video') && (
                          <>
                            <span>•</span>
                            <Icons.video className="w-4 h-4" />
                            <span>{turf.media.filter(m => m.type === 'video').length} videos</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => navigate(`/dashboard/turfs/${turf.id}/bookings`)}
                        variant="outline"
                        className="border-primary-200/20 bg-primary-200 hover:bg-primary-100 text-background-100 flex-1"
                      >
                        <Icons.calendar className="size-4 mr-1" />
                        View Bookings
                      </Button>
                      <Button
                        variant="outline"
                        className="border-text-200/20 bg-primary-200 hover:bg-primary-100 text-background-100 flex-1"
                        onClick={() => navigate(`/dashboard/turfs/${turf.id}/edit`)}
                      >
                        <Icons.edit3 className="size-4 mr-1" />
                        Edit Turf
                      </Button>
                      <Button
                        variant="outline"
                        className="border-text-200/20 bg-primary-200 hover:bg-primary-100 text-background-100 flex-1"
                        onClick={() => navigate(`/dashboard/turfs/${turf.id}/slots`)}
                        disabled={!turf.isActive}
                      >
                        <Icons.clock className="size-4 mr-1" />
                        Book Slot
                      </Button>
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