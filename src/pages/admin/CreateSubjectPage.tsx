// src/pages/admin/CreateSubjectPage.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useToast } from "@/components/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getPublicMentors, createSubject } from "@/lib/api";
import type { Mentor } from "@/types";

export default function CreateSubjectPage() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [formData, setFormData] = useState({
    subjectName: "",
    description: "",
    courseImageUrl: "",
    mentorId: ""
  });

  useEffect(() => {
    getPublicMentors().then(data => setMentors(data.content));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();
    if (!token) return;

    try {
      await createSubject(token, {
        ...formData,
        mentorId: parseInt(formData.mentorId)
      });
      toast({ title: "Success", description: "Subject created successfully!" });
      setFormData({ subjectName: "", description: "", courseImageUrl: "", mentorId: "" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create subject" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Subject Name</Label>
              <Input 
                value={formData.subjectName}
                onChange={e => setFormData({...formData, subjectName: e.target.value})}
                placeholder="e.g. AWS Developer Associate" required 
              />
            </div>
            <div className="space-y-2">
              <Label>Mentor</Label>
              <select 
                className="w-full p-2 border rounded-md bg-background"
                value={formData.mentorId}
                onChange={e => setFormData({...formData, mentorId: e.target.value})}
                required
              >
                <option value="">Select a Mentor</option>
                {mentors.map(m => (
                  <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea 
                className="w-full p-2 border rounded-md min-h-[100px] bg-background"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Briefly describe the course content..." required
              />
            </div>
            <div className="space-y-2">
              <Label>Course Image URL</Label>
              <Input 
                value={formData.courseImageUrl}
                onChange={e => setFormData({...formData, courseImageUrl: e.target.value})}
                placeholder="https://image-url.com/subject.jpg" 
              />
            </div>
            <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90">
              Create Subject
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}