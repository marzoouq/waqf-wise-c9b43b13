/**
 * WorldClock Page
 * Displays current time in multiple time zones simultaneously
 */

import { useState } from 'react';
import { Clock, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TimeZoneCard } from '@/components/shared/TimeZoneCard';
import { useWorldClock } from '@/hooks/useWorldClock';
import type { TimeZoneInfo } from '@/lib/timeUtils';

export default function WorldClock() {
  const {
    currentTime,
    is24Hour,
    selectedTimezones,
    availableTimezones,
    toggleFormat,
    addTimezone,
    removeTimezone,
    resetTimezones,
  } = useWorldClock();

  const [selectedTimezoneId, setSelectedTimezoneId] = useState<string>('');

  const handleAddTimezone = () => {
    const timezone = availableTimezones.find((tz) => tz.id === selectedTimezoneId);
    if (timezone) {
      addTimezone(timezone);
      setSelectedTimezoneId('');
    }
  };

  const unselectedTimezones = availableTimezones.filter(
    (tz) => !selectedTimezones.some((selected) => selected.id === tz.id)
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="h-8 w-8 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold">World Clock</h1>
        </div>
        <p className="text-lg sm:text-xl text-muted-foreground font-arabic">
          الساعة العالمية - عرض الوقت في مناطق زمنية متعددة
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Configure clock display preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Time Format Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="time-format" className="text-base">
              Time Format: {is24Hour ? '24-hour' : '12-hour'}
            </Label>
            <Switch
              id="time-format"
              checked={is24Hour}
              onCheckedChange={toggleFormat}
            />
          </div>

          {/* Add Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone-select" className="text-base">
              Add Time Zone
            </Label>
            <div className="flex gap-2">
              <Select
                value={selectedTimezoneId}
                onValueChange={setSelectedTimezoneId}
              >
                <SelectTrigger id="timezone-select" className="flex-1">
                  <SelectValue placeholder="Select a timezone to add" />
                </SelectTrigger>
                <SelectContent>
                  {unselectedTimezones.length === 0 ? (
                    <SelectItem value="none" disabled>
                      All timezones added
                    </SelectItem>
                  ) : (
                    unselectedTimezones.map((tz) => (
                      <SelectItem key={tz.id} value={tz.id}>
                        {tz.name} ({tz.nameAr})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddTimezone}
                disabled={!selectedTimezoneId || unselectedTimezones.length === 0}
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Reset Button */}
          <div>
            <Button
              variant="outline"
              onClick={resetTimezones}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Time Zones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {selectedTimezones.map((timezone, index) => (
          <TimeZoneCard
            key={timezone.id}
            timezone={timezone}
            currentTime={currentTime}
            is24Hour={is24Hour}
            onRemove={removeTimezone}
            isRemovable={selectedTimezones.length > 1}
          />
        ))}
      </div>

      {/* Empty State */}
      {selectedTimezones.length === 0 && (
        <Card className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">
            No time zones selected. Add some from the settings above.
          </p>
        </Card>
      )}

      {/* Info Card */}
      <Card className="mt-6 bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Note:</strong> All times update in real-time every second. Times are synchronized
            across all time zones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
