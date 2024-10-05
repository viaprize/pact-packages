import {
  type ContestantStage,
  Contestants,
} from "@/components/prize/details/vfc-details/contestants-card";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from "date-fns";

export function containsUppercase(str: string) {
  return /^[A-Z]+$/.test(str);
}

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export function timeAgo(givenDate: Date): string {
  const now = new Date();

  // Calculate the difference in days
  const daysDiff = differenceInDays(now, givenDate);
  if (daysDiff >= 1) {
    return "a long time ago";
  }

  // Calculate the difference in hours
  const hoursDiff = differenceInHours(now, givenDate);
  if (hoursDiff >= 1) {
    return `${hoursDiff} hours ago`;
  }

  // Calculate the difference in minutes
  const minutesDiff = differenceInMinutes(now, givenDate);
  if (minutesDiff >= 1) {
    return `${minutesDiff} minutes ago`;
  }

  // Calculate the difference in seconds
  const secondsDiff = differenceInSeconds(now, givenDate);
  return `${secondsDiff} seconds ago`;
}

// Example usage:
const pastDate = new Date("2023-09-15T14:00:00"); // Use your given date

export const getContestantStage = (
  contestants: Contestants,
  username?: string
): ContestantStage => {
  if (!username) {
    return "LOGIN";
  }
  if (!contestants) {
    return "NOT_JOINED";
  }
  if (contestants.some((c) => c.username === username)) {
    return "JOINED";
  }
  return "NOT_JOINED";
};
