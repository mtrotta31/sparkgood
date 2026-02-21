// Utility to format hours JSONB data into human-readable strings
// Input: { "Monday": ["9AM-5PM"], "Tuesday": ["9AM-5PM"], ... } or string
// Output: "Mon-Fri: 9AM-5PM, Sat: 10AM-2PM"

type HoursData = Record<string, string[] | string> | string;

// Day abbreviations
const DAY_ABBR: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

// Day order for sorting
const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

/**
 * Format hours JSONB data into a human-readable string
 * Handles various formats:
 * - { "Monday": ["9AM-5PM"], "Tuesday": ["9AM-5PM"], ... }
 * - { "Monday": "9AM-5PM", "Tuesday": "9AM-5PM", ... }
 * - Plain string (returned as-is)
 * - null/undefined (returns null)
 */
export function formatHours(hours: HoursData | null | undefined): string | null {
  if (!hours) return null;

  // If it's already a simple string, return it or parse it
  if (typeof hours === "string") {
    // Check if it looks like JSON
    if (hours.startsWith("{")) {
      try {
        const parsed = JSON.parse(hours);
        hours = parsed as HoursData;
      } catch {
        // Return the original string if JSON parsing fails
        return hours as string;
      }
    } else {
      return hours;
    }
  }

  // At this point, hours should be an object
  if (typeof hours !== "object" || hours === null) {
    return null;
  }

  // Normalize the data: convert all values to strings
  const normalizedHours: Record<string, string> = {};
  for (const [day, times] of Object.entries(hours)) {
    const dayLower = day.toLowerCase();
    if (DAY_ORDER.includes(dayLower)) {
      const timeStr = Array.isArray(times) ? times.join(", ") : String(times);
      normalizedHours[dayLower] = timeStr;
    }
  }

  if (Object.keys(normalizedHours).length === 0) {
    return null;
  }

  // Group consecutive days with the same hours
  const groups: { days: string[]; hours: string }[] = [];
  let currentGroup: { days: string[]; hours: string } | null = null;

  for (const day of DAY_ORDER) {
    const dayHours = normalizedHours[day];

    if (!dayHours) {
      // Day not open, end current group
      if (currentGroup) {
        groups.push(currentGroup);
        currentGroup = null;
      }
      continue;
    }

    if (currentGroup && currentGroup.hours === dayHours) {
      // Same hours, extend the group
      currentGroup.days.push(day);
    } else {
      // Different hours, start new group
      if (currentGroup) {
        groups.push(currentGroup);
      }
      currentGroup = { days: [day], hours: dayHours };
    }
  }

  // Don't forget the last group
  if (currentGroup) {
    groups.push(currentGroup);
  }

  if (groups.length === 0) {
    return null;
  }

  // Format the groups
  const formatted = groups.map((group) => {
    const { days, hours: timeStr } = group;

    if (days.length === 1) {
      return `${DAY_ABBR[days[0]]}: ${timeStr}`;
    } else if (days.length === 7) {
      return `Daily: ${timeStr}`;
    } else if (days.length === 5 &&
               days[0] === "monday" &&
               days[4] === "friday" &&
               days.every((d, i) => d === DAY_ORDER[i])) {
      return `Mon-Fri: ${timeStr}`;
    } else {
      // Range format
      const firstDay = DAY_ABBR[days[0]];
      const lastDay = DAY_ABBR[days[days.length - 1]];
      return `${firstDay}-${lastDay}: ${timeStr}`;
    }
  });

  return formatted.join(", ");
}

/**
 * Check if currently open based on hours data
 * Returns: "Open", "Closed", "Opens at X", or null if unknown
 */
export function getOpenStatus(hours: HoursData | null | undefined): string | null {
  if (!hours || typeof hours === "string") return null;

  try {
    const hoursObj = typeof hours === "string" ? JSON.parse(hours) : hours;
    if (typeof hoursObj !== "object" || hoursObj === null) return null;

    const now = new Date();
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const currentDay = dayNames[now.getDay()];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const todayHours = hoursObj[currentDay] || hoursObj[currentDay.charAt(0).toUpperCase() + currentDay.slice(1)];

    if (!todayHours) return "Closed today";

    const timeRanges = Array.isArray(todayHours) ? todayHours : [todayHours];

    for (const range of timeRanges) {
      const parsed = parseTimeRange(range);
      if (parsed) {
        const { openMinutes, closeMinutes } = parsed;
        if (currentTime >= openMinutes && currentTime < closeMinutes) {
          return "Open now";
        } else if (currentTime < openMinutes) {
          return `Opens at ${formatMinutesToTime(openMinutes)}`;
        }
      }
    }

    return "Closed";
  } catch {
    return null;
  }
}

// Parse time range like "9AM-5PM" into minutes from midnight
function parseTimeRange(range: string): { openMinutes: number; closeMinutes: number } | null {
  const match = range.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!match) return null;

  const [, openHour, openMin = "0", openAmpm = "AM", closeHour, closeMin = "0", closeAmpm = "PM"] = match;

  let openH = parseInt(openHour, 10);
  let closeH = parseInt(closeHour, 10);

  if (openAmpm.toUpperCase() === "PM" && openH !== 12) openH += 12;
  if (openAmpm.toUpperCase() === "AM" && openH === 12) openH = 0;
  if (closeAmpm.toUpperCase() === "PM" && closeH !== 12) closeH += 12;
  if (closeAmpm.toUpperCase() === "AM" && closeH === 12) closeH = 0;

  return {
    openMinutes: openH * 60 + parseInt(openMin, 10),
    closeMinutes: closeH * 60 + parseInt(closeMin, 10),
  };
}

// Format minutes from midnight back to time string
function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return mins > 0 ? `${displayHour}:${mins.toString().padStart(2, "0")}${ampm}` : `${displayHour}${ampm}`;
}
