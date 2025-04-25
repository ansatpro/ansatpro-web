"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, MessageSquare, User, Calendar, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function NotificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Get feedback data from localStorage
        const storedFeedbacks = localStorage.getItem('ansatpro_feedbacks');
        
        if (storedFeedbacks) {
          const feedbacks = JSON.parse(storedFeedbacks);
          
          // Filter feedbacks with flag_discuss_with_facilitator set to true
          const discussFeedbacks = feedbacks.filter(
            feedback => feedback.flag_discuss_with_facilitator === true
          );
          
          // Map feedbacks to notification format
          const notificationItems = discussFeedbacks.map(feedback => ({
            id: feedback.id,
            studentName: feedback.studentName,
            studentId: feedback.studentId,
            university: feedback.university,
            preceptor: feedback.preceptor,
            date: feedback.date,
            message: "Preceptor marked this feedback for discussion.",
            read: false
          }));
          
          setNotifications(notificationItems);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // If less than 24 hours, show relative time
      if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffTime / (1000 * 60));
          return `${diffMinutes} minutes ago`;
        }
        return `${diffHours} hours ago`;
      } 
      // If less than 7 days, show days ago
      else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } 
      // Otherwise show full date
      else {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString || "N/A";
    }
  };

  // Mark notification as read and navigate to feedback details
  const handleNotificationClick = (notification) => {
    // Update notification as read
    const updatedNotifications = notifications.map(item => 
      item.id === notification.id ? { ...item, read: true } : item
    );
    setNotifications(updatedNotifications);
    
    // Navigate to feedback details page
    router.push(`/facilitator/feedback/${notification.id}/studentDetail`);
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(item => ({ ...item, read: true }));
    setNotifications(updatedNotifications);
  };

  return (
    <div className="text-foreground">
      {/* Header with back button */}
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 border bg-background text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Notifications</h1>
        </div>
        
        {notifications.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllAsRead}
            className="border bg-background text-foreground text-xs md:text-sm"
          >
            Mark all as read
          </Button>
        )}
      </header>

      {/* Notifications content */}
      <section className="space-y-6">
        <CardHeader className="px-0">
          <CardTitle className="text-xl text-foreground">
            Discussion Requests
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Feedback items marked for discussion with facilitator
          </CardDescription>
        </CardHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-lg text-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card className="bg-card border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2 text-foreground">No Notifications</h3>
              <p className="text-center text-muted-foreground">
                You don't have any feedback items marked for discussion.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <Card 
                key={notification.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md bg-card border ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-3 w-full md:w-auto">
                      <div className="mt-1 p-2 bg-blue-100 rounded-full">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      </div>
                      
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-foreground break-words">
                            {notification.studentName}
                          </h3>
                          {!notification.read && (
                            <Badge variant="default" className="bg-blue-500 text-white">New</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground break-words line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="break-words">ID: {notification.studentId}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span className="break-words">Preceptor: {notification.preceptor}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(notification.date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 text-xs bg-background hover:bg-muted text-foreground w-full md:w-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationClick(notification);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
      
      <footer className="mt-8 text-center text-sm text-muted-foreground hidden md:block">
        <p>© 2025 ANSAT Pro. All rights reserved.</p>
      </footer>
    </div>
  );
} 