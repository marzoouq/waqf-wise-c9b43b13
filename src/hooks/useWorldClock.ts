/**
 * Custom hook for managing world clock state
 * Provides real-time time updates for multiple timezones
 */

import { useState, useEffect, useCallback } from 'react';
import { WORLD_TIMEZONES, TimeZoneInfo } from '@/lib/timeUtils';

export interface WorldClockState {
  currentTime: Date;
  is24Hour: boolean;
  selectedTimezones: TimeZoneInfo[];
  availableTimezones: TimeZoneInfo[];
}

export function useWorldClock() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [is24Hour, setIs24Hour] = useState<boolean>(true);
  const [selectedTimezones, setSelectedTimezones] = useState<TimeZoneInfo[]>(
    WORLD_TIMEZONES.slice(0, 7) // Default: show first 7 timezones
  );

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Toggle between 24-hour and 12-hour format
  const toggleFormat = useCallback(() => {
    setIs24Hour((prev) => !prev);
  }, []);

  // Add a timezone to the selected list
  const addTimezone = useCallback((timezone: TimeZoneInfo) => {
    setSelectedTimezones((prev) => {
      // Avoid duplicates
      if (prev.some((tz) => tz.id === timezone.id)) {
        return prev;
      }
      return [...prev, timezone];
    });
  }, []);

  // Remove a timezone from the selected list
  const removeTimezone = useCallback((timezoneId: string) => {
    setSelectedTimezones((prev) => prev.filter((tz) => tz.id !== timezoneId));
  }, []);

  // Reset to default timezones
  const resetTimezones = useCallback(() => {
    setSelectedTimezones(WORLD_TIMEZONES.slice(0, 7));
  }, []);

  return {
    currentTime,
    is24Hour,
    selectedTimezones,
    availableTimezones: WORLD_TIMEZONES,
    toggleFormat,
    addTimezone,
    removeTimezone,
    resetTimezones,
  };
}
