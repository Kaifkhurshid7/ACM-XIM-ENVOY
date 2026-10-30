/**
 * Event Utilities
 *
 * Shared logic for interpreting event records so the listing page, the detail
 * page, and structured data always agree with one another.
 *
 * Every value here is derived from fields the backend actually stores on an
 * event: `title`, `description`, `date`, `location`, `registrationLink`, and
 * `isPast`. Nothing is invented.
 *
 * @module utils/events
 */

import { absoluteUrl, SITE } from "../constants/site";

/**
 * True when a timestamp carries no meaningful time-of-day.
 *
 * The admin event form uses an `<input type="date">`, so submitted values look
 * like "2026-09-15" and are stored as midnight UTC. Rendering those in local
 * time would show a misleading "12:00 AM" and, in any timezone west of UTC,
 * would display the previous day. Detecting the case lets us format in UTC and
 * omit the time entirely.
 *
 * @param {Date} date
 * @returns {boolean}
 */
const isDateOnly = (date) =>
  date.getUTCHours() === 0 &&
  date.getUTCMinutes() === 0 &&
  date.getUTCSeconds() === 0 &&
  date.getUTCMilliseconds() === 0;

/**
 * Parses an event date, returning null for missing or malformed values.
 *
 * @param {string|Date} value
 * @returns {Date|null}
 */
export const parseEventDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Formats an event date for display.
 *
 * @param {string|Date} value - Raw event.date
 * @param {object} [options]
 * @param {boolean} [options.long=true] - Include the weekday
 * @returns {string} Formatted date, or "Date to be announced"
 */
export const formatEventDate = (value, { long = true } = {}) => {
  const date = parseEventDate(value);
  if (!date) return "Date to be announced";

  const dateOnly = isDateOnly(date);

  return date.toLocaleDateString("en-IN", {
    ...(long ? { weekday: "long" } : {}),
    day: "numeric",
    month: long ? "long" : "short",
    year: "numeric",
    // Date-only values are anchored to UTC midnight; formatting them in UTC
    // keeps the calendar day the admin selected.
    ...(dateOnly ? { timeZone: "UTC" } : {}),
  });
};

/**
 * Formats an event's time of day, or returns null when the record has none.
 *
 * @param {string|Date} value - Raw event.date
 * @returns {string|null}
 */
export const formatEventTime = (value) => {
  const date = parseEventDate(value);
  if (!date || isDateOnly(date)) return null;

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

/**
 * Machine-readable date for <time dateTime> and schema.org.
 *
 * @param {string|Date} value
 * @returns {string|null} ISO 8601 string, date-only where applicable
 */
export const toISODate = (value) => {
  const date = parseEventDate(value);
  if (!date) return null;
  return isDateOnly(date) ? date.toISOString().slice(0, 10) : date.toISOString();
};

/**
 * Event lifecycle states.
 */
export const EVENT_STATUS = {
  UPCOMING: "upcoming",
  TODAY: "today",
  PAST: "past",
  UNSCHEDULED: "unscheduled",
};

/**
 * Determines where an event sits in its lifecycle.
 *
 * Uses the admin-controlled `isPast` flag as an override, then falls back to
 * comparing the event date against today. Comparison happens at day
 * granularity because events are stored without a time of day.
 *
 * @param {object} event
 * @returns {{ status: string, label: string, isPast: boolean }}
 */
export const getEventStatus = (event) => {
  const date = parseEventDate(event?.date);

  if (event?.isPast) {
    return { status: EVENT_STATUS.PAST, label: "Completed", isPast: true };
  }

  if (!date) {
    return {
      status: EVENT_STATUS.UNSCHEDULED,
      label: "Date to be announced",
      isPast: false,
    };
  }

  // Compare calendar days, not instants, so an event today never reads "Completed".
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const eventDay = isDateOnly(date)
    ? new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    : new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (eventDay.getTime() === startOfToday.getTime()) {
    return { status: EVENT_STATUS.TODAY, label: "Happening today", isPast: false };
  }

  if (eventDay < startOfToday) {
    return { status: EVENT_STATUS.PAST, label: "Completed", isPast: true };
  }

  return { status: EVENT_STATUS.UPCOMING, label: "Upcoming", isPast: false };
};

/**
 * Describes whether a visitor can register right now.
 *
 * Derived strictly from what is known: whether the event has passed, and
 * whether an admin has attached a registration link. The backend stores no
 * deadline, capacity, or eligibility fields, so none are claimed here.
 *
 * @param {object} event
 * @returns {{ state: "open"|"closed"|"pending", label: string, hint: string }}
 */
export const getRegistrationState = (event) => {
  const { isPast } = getEventStatus(event);

  if (isPast) {
    return {
      state: "closed",
      label: "Registration closed",
      hint: "This event has already taken place.",
    };
  }

  if (event?.registrationLink) {
    return {
      state: "open",
      label: "Registration open",
      hint: "Registration is handled on the chapter's registration form.",
    };
  }

  return {
    state: "pending",
    label: "Registration not open yet",
    hint: "Registration details will be added here once they are confirmed.",
  };
};

/**
 * True when a location string describes an online venue.
 *
 * @param {string} location
 * @returns {boolean}
 */
export const isOnlineLocation = (location = "") =>
  /\b(online|virtual|remote|zoom|google meet|gmeet|meet|teams|webinar|discord)\b/i.test(
    location
  );

/**
 * Sorts events by date. Upcoming events read soonest-first; past events read
 * most-recent-first, which is the useful order in each case.
 *
 * @param {object[]} events
 * @returns {{ upcoming: object[], past: object[] }}
 */
export const groupEventsByStatus = (events = []) => {
  const upcoming = [];
  const past = [];

  events.forEach((event) => {
    if (getEventStatus(event).isPast) past.push(event);
    else upcoming.push(event);
  });

  const time = (event) => parseEventDate(event?.date)?.getTime() ?? 0;

  upcoming.sort((a, b) => time(a) - time(b));
  past.sort((a, b) => time(b) - time(a));

  return { upcoming, past };
};

/**
 * Trims a description into a meta-description-sized summary.
 *
 * @param {string} text
 * @param {number} [max=155]
 * @returns {string}
 */
export const summarize = (text = "", max = 155) => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  // Cut on a word boundary so the summary doesn't end mid-word.
  return `${clean.slice(0, clean.lastIndexOf(" ", max - 1))}…`;
};

/**
 * Builds schema.org Event structured data from a stored event.
 *
 * Only fields the backend genuinely holds are emitted. `eventStatus` reflects
 * whether the event has happened; attendance mode and location type are
 * inferred from the location string.
 *
 * @param {object} event
 * @returns {object|null}
 */
export const eventSchema = (event) => {
  if (!event?.title) return null;

  const online = isOnlineLocation(event.location);
  const { isPast } = getEventStatus(event);
  const startDate = toISODate(event.date);

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    ...(event.description ? { description: summarize(event.description, 300) } : {}),
    ...(startDate ? { startDate } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: online
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    ...(event.location
      ? {
          location: online
            ? { "@type": "VirtualLocation", name: event.location }
            : { "@type": "Place", name: event.location, address: event.location },
        }
      : {}),
    organizer: {
      "@type": "Organization",
      name: SITE.legalName,
      url: SITE.url,
    },
    url: absoluteUrl(`/events/${event._id}`),
    image: SITE.ogImage,
    ...(event.registrationLink && !isPast
      ? {
          offers: {
            "@type": "Offer",
            url: event.registrationLink,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
};
