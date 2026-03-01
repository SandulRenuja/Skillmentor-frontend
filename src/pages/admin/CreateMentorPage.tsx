// src/pages/admin/CreateMentorPage.tsx
import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useToast } from "@/components/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CreateMentorPage() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    title: "",
    profession: "",
    company: "",
    experienceYears: 0,
    bio: "",
    profileImageUrl: "",
    isCertified: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/mentors`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error();
      toast({ title: "Mentor Added", description: "The mentor profile is now live." });
    } catch (err) {
      toast({ variant: "destructive", title: "Failed", description: "Email might already exist." });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Add Professional Mentor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Title (e.g. Senior Dev)</Label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Bio</Label>
              <textarea 
                className="w-full p-2 border rounded-md min-h-[120px] bg-background"
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="certified"
                checked={formData.isCertified}
                onChange={e => setFormData({...formData, isCertified: e.target.checked})}
              />
              <Label htmlFor="certified">Mark as Certified Teacher</Label>
            </div>
            <Button type="submit" className="md:col-span-2 bg-black text-white hover:bg-black/90">
              Save Mentor Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}