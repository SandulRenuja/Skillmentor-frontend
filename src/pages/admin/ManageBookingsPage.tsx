import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"; 
import { Button } from "@/components/ui/button"; //
import { StatusPill } from "@/components/StatusPill"; //
import { getAllSessions, updateSessionStatus } from "@/lib/api"; //
import type { Enrollment } from "@/types"; //

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState<Enrollment[]>([]);
  const { getToken } = useAuth(); //

  // 1. Memoize the fetcher function to prevent the "cascading" loop
  const loadBookings = useCallback(async () => {
    try {
      // Use the specific template name you've used in other pages
      const token = await getToken({ template: "skillmentor-auth" }); 
      if (token) {
        const data = await getAllSessions(token); //
        setBookings(data);
      }
    } catch (error) {
      console.error("Failed to load platform bookings:", error);
    }
  }, [getToken]);

  // 2. Use an async pattern inside useEffect that respects the component lifecycle
  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      if (active) {
        await loadBookings();
      }
    };

    fetchData();

    return () => {
      active = false; // Cleanup to prevent state updates on unmounted components
    };
  }, [loadBookings]);

  const handleAction = async (id: number, status: string) => {
    try {
      const token = await getToken({ template: "skillmentor-auth" });
      if (token) {
        await updateSessionStatus(token, id, status); //
        await loadBookings(); // Refresh the list after update
      }
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage All Bookings</h1>
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Mentor</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No platform bookings found.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-mono text-xs">#{booking.id}</TableCell>
                  <TableCell>{booking.mentorName}</TableCell>
                  <TableCell>{booking.subjectName}</TableCell>
                  <TableCell>{new Date(booking.sessionAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <StatusPill status={booking.paymentStatus} />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {booking.paymentStatus === "pending" && (
                      <Button 
                        size="sm" 
                        onClick={() => handleAction(booking.id, "accepted")}
                      >
                        Confirm Payment
                      </Button>
                    )}
                    {booking.paymentStatus === "accepted" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAction(booking.id, "completed")}
                      >
                        Complete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}