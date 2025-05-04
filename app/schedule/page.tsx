"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, CheckCircle2, Clock, PlusCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { StudySessionType, addStudySession, deleteStudySession, getStudySessions, toggleSessionComplete } from "@/actions/studySchedule";
import { toast } from "sonner";

export default function SchedulePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<StudySessionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [duration, setDuration] = useState("30 minutes");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch study sessions on component mount
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const data = await getStudySessions();
        
        if (data) {
          setSessions(data);
        } else {
          setError("Failed to fetch study sessions");
        }
      } catch (err) {
        setError("Error loading study sessions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !duration) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addStudySession({
        title,
        description,
        date: date!,
        duration,
      });
      
      // Check if the operation was successful and data exists
      if (result.success && result.data) {
        // Add new session to state
        setSessions([...sessions, result.data]);
        
        // Reset form
        setTitle("");
        setDescription("");
        setDate(new Date());
        setDuration("30 minutes");
        
        toast.success("Study session added successfully");
      } else {
        // Handle the error from the server action
        toast.error(result.error || "Failed to add study session");
      }
      
      router.refresh();
    } catch (error) {
      toast.error("Failed to add study session");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      const result = await deleteStudySession(id);
      
      if (result.success) {
        setSessions(sessions.filter(session => session.id !== id));
        toast.success("Study session deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete study session");
      }
      
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete study session");
      console.error(error);
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const result = await toggleSessionComplete(id, !completed);
      
      if (result.success) {
        setSessions(
          sessions.map(session => 
            session.id === id 
              ? { ...session, completed: !completed } 
              : session
          )
        );
        toast.success(`Study session marked as ${!completed ? "completed" : "incomplete"}`);
      } else {
        toast.error(result.error || "Failed to update study session");
      }
      
      router.refresh();
    } catch (error) {
      toast.error("Failed to update study session");
      console.error(error);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-10">Loading study schedule...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Study Schedule</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Study Sessions List */}
        <div className="md:col-span-7 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
          
          {sessions.length === 0 ? (
            <p className="text-muted-foreground">No study sessions scheduled. Add one to get started!</p>
          ) : (
            <div className="space-y-4 pr-2">
              {sessions.map((session) => (
                <Card key={session.id} className={cn(
                  "transition-all",
                  Boolean(session.completed) ? "bg-muted/50" : ""
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className={cn(
                        Boolean(session.completed) ? "line-through text-muted-foreground" : ""
                      )}>
                        {session.title}
                      </CardTitle>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleToggleComplete(session.id, Boolean(session.completed))}
                        >
                          <CheckCircle2 
                            className={cn(
                              "h-5 w-5",
                              Boolean(session.completed) ? "text-green-500" : "text-muted-foreground"
                            )} 
                          />
                          <span className="sr-only">
                            {Boolean(session.completed) ? "Mark as incomplete" : "Mark as complete"}
                          </span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteSession(session.id)}
                        >
                          <Trash2 className="h-5 w-5 text-muted-foreground" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{format(new Date(session.date), "PPP")}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {session.description && (
                      <p className={cn(
                        "text-sm mb-2",
                        Boolean(session.completed) ? "text-muted-foreground line-through" : ""
                      )}>
                        {session.description}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {session.duration}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Add New Session Form */}
        <div className="md:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Add New Study Session</CardTitle>
              <CardDescription>
                Schedule your next study session
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="What will you study?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add details about this session"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        id="date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select 
                    value={duration} 
                    onValueChange={setDuration}
                  >
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15 minutes">15 minutes</SelectItem>
                      <SelectItem value="30 minutes">30 minutes</SelectItem>
                      <SelectItem value="45 minutes">45 minutes</SelectItem>
                      <SelectItem value="1 hour">1 hour</SelectItem>
                      <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                      <SelectItem value="2 hours">2 hours</SelectItem>
                      <SelectItem value="3 hours">3 hours</SelectItem>
                      <SelectItem value="4 hours">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span>Adding...</span>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Study Session
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}