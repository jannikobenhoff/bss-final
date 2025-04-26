"use client";

import React, { useMemo } from 'react';
import { format, eachDayOfInterval, subMonths } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ActivityGridProps {
  activityData: Map<string, number>;
}

export default function ActivityGrid({ activityData }: ActivityGridProps) {
    console.log(activityData);
  // Generate dates for the last 3 months
  const today = new Date();
  const threeMonthsAgo = subMonths(today, 12);
  
  const dates = useMemo(() => {
    return eachDayOfInterval({
      start: threeMonthsAgo,
      end: today
    });
  }, [threeMonthsAgo, today]);

  // Group dates by week for the grid layout
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    let currentWeek: Date[] = [];
    
    dates.forEach((date: Date, i: number) => {
      currentWeek.push(date);
      
      // Start a new week on Sunday or if it's the last day
      if (date.getDay() === 6 || i === dates.length - 1) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    
    return result;
  }, [dates]);

  // Function to get color - just active (orange) or inactive (grey)
  const getSquareColor = (count: number): string => {
    return count > 0 
      ? 'bg-orange-500 dark:bg-orange-600' 
      : 'bg-gray-100 dark:bg-gray-800';
  };

  // Get activity count for a specific day
  const getActivityCount = (date: Date): number => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return activityData.get(dateKey) || 0;
  };

  // Days of the week for labels
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex flex-col w-full">
        <div className="flex w-full">
          {/* Day of week labels - now aligned with the grid properly */}
          <div className="flex flex-col mr-2 text-xs text-muted-foreground">
            {daysOfWeek.map((day) => (
              <div key={day} className="h-5 w-10 flex items-center">
                {day}
              </div>
            ))}
          </div>
          
          {/* Grid - increased width and height of squares */}
          <div className="flex flex-row gap-1 flex-grow">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1 flex-1">
                {week.map((day, dayIndex) => {
                  const count = getActivityCount(day);
                  return (
                    <TooltipProvider key={dayIndex}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className={`h-4 w-4 rounded-sm ${getSquareColor(count)} hover:ring-1 hover:ring-orange-500`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {format(day, 'MMM d, yyyy')}: {count ? 'Active' : 'Inactive'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* Month labels above the grid */}
        <div className="flex mt-4 ml-12">
          {/* Generate month labels by getting first day of each month in the range */}
          {Array.from(new Set(dates.map(date => format(date, 'MMM')))).map((month, i) => (
            <div key={i} className="text-xs text-muted-foreground pr-8">
              {month}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-end mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
              <span>Inactive</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 rounded-sm bg-orange-500 dark:bg-orange-600"></div>
              <span>Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 