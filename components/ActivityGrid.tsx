"use client";

import React, { useMemo, useState, useEffect } from 'react';
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
  
  // State to track if we should show compact view (every other day label)
  const [compactView, setCompactView] = useState(false);
  
  // Determine which days to show based on compactView
  const visibleDays = useMemo(() => {
    return daysOfWeek.filter((_, index) => 
      !compactView || index % 2 === 0
    );
  }, [compactView]);
  
  // Calculate visible day indices for rendering squares
  const visibleDayIndices = useMemo(() => {
    return Array(7).fill(0).map((_, i) => 
      !compactView || i % 2 === 0
    );
  }, [compactView]);
  
  // Update compact view based on container height
  useEffect(() => {
    const checkHeight = () => {
      const gridContainer = document.getElementById('activity-grid-container');
      if (gridContainer) {
        const containerHeight = gridContainer.clientHeight;
        const minRegularHeight = 200; // Adjust this threshold as needed
        setCompactView(containerHeight < minRegularHeight);
      }
    };
    
    checkHeight();
    window.addEventListener('resize', checkHeight);
    
    return () => {
      window.removeEventListener('resize', checkHeight);
    };
  }, []);

  return (
    <div className="w-full" id="activity-grid-container">
      <div className="flex flex-col w-full">
        {/* Month labels */}
        <div className="flex ml-12 mb-1 relative">
          {Array.from(new Set(dates.map(date => format(date, 'MMM')))).map((month, i, arr) => (
            <div 
              key={i} 
              className="text-xs text-muted-foreground"
              style={{ 
                width: `${100 / arr.length}%`,
                paddingLeft: i === 0 ? '0' : '8px'
              }}
            >
              {month}
            </div>
          ))}
        </div>
        
        <div className="flex w-full">
          {/* Grid */}
          <div className="w-full overflow-x-auto">
            <div className="flex flex-nowrap" style={{ minWidth: "100%", gap: "2px" }}>
              {weeks.map((week, weekIndex) => (
                <div 
                  key={weekIndex} 
                  className="flex flex-col" 
                  style={{ 
                    gap: "2px",
                    flex: "1 0 auto",
                    minWidth: "0"
                  }}
                >
                  {Array(7).fill(0).map((_, dayIndex) => {
                    // Skip rendering if in compact mode and not a visible day
                    
                    const day = week[dayIndex];
                    if (!day) return <div key={dayIndex} className="aspect-square invisible" style={{ minWidth: "12px" }} />;
                    
                    const count = getActivityCount(day);
                    return (
                      <TooltipProvider key={dayIndex}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={`aspect-square rounded-sm ${getSquareColor(count)} hover:ring-1 hover:ring-orange-500`}
                              style={{ minWidth: "12px" }}
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