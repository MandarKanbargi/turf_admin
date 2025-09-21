export const maskIndianNumber = (phoneNumber: string) => {
  const num = phoneNumber.replace(/^\+91/, "").replace(/\D/g, "");
  return `+91 ${num.substring(0, 3)}XX XX${num.substring(7)}`;
};

export const getNext7Days = () => {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);

    const day = daysOfWeek[date.getDay()];
    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
    }); // e.g. 27/06

    // Build YYYY-MM-DD in local time
    const fullDate = date.toLocaleDateString("en-CA"); // gives YYYY-MM-DD

    return { day, date: formattedDate, fullDate };
  });
};

// Function to check if current time is within a period
export const getCurrentPeriod = (
  periods: { id: number; name: string; start: string; end: string }[],
) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let period of periods) {
    const [startH, startM] = period.start.split(":").map(Number);
    const [endH, endM] = period.end.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes < endMinutes) {
      // Normal case
      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        return period.name;
      }
    } else {
      // Wrap around midnight (e.g., Night)
      if (currentMinutes >= startMinutes || currentMinutes < endMinutes) {
        return period.name;
      }
    }
  }

  return null; // fallback if no match
};

export const toStandardCase = (str: string) => {
  // Replace underscores with spaces
  const withSpaces = str.replace(/_/g, " ");
  // Capitalize the first letter of each word
  return withSpaces.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const formatTime12Hour = (time24: string) => {
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // Convert 0 => 12, 13 => 1, etc.
  return `${hour}:${minute} ${ampm}`;
};

// Convert time string (HH:MM:SS or HH:MM) to minutes
export const timeToMinutes = (timeString: string) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

export const formatTimeRange = (startTime: string, endTime: string) => {
  const formatTime = (time: string) => {
    const [hourStr, minuteStr] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // convert 0 -> 12 for midnight
    return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
};
