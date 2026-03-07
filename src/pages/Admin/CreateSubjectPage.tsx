import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@clerk/clerk-react";
import { adminCreateSubject } from "@/lib/api-admin";
import { getPublicMentors } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertCircle,
  BookOpen,
  Image as ImageIcon,
} from "lucide-react";
import type { Mentor } from "@/types";

const subjectSchema = z.object({
  subjectName: z
    .string()
    .min(5, "Subject name must be at least 5 characters")
    .max(255, "Subject name must not exceed 255 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must not exceed 500 characters"),
  courseImageUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  // Keep as string in the form — convert to number on submit
  mentorId: z
    .string()
    .min(1, "Please select a mentor")
    .refine((v) => v !== "", { message: "Please select a mentor" }),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-zinc-300 text-sm">
        {label}
        {required && <span className="text-amber-400 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function CreateSubjectPage() {
  const { getToken } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      mentorId: "",
    },
  });

  useEffect(() => {
    getPublicMentors(0, 100)
      .then((d) => setMentors(d.content))
      .catch(console.error)
      .finally(() => setLoadingMentors(false));
  }, []);

  const selectedMentorId = watch("mentorId");
  const selectedMentor = mentors.find((m) => String(m.id) === selectedMentorId);

  const onSubmit = async (data: SubjectFormValues) => {
    setStatus("idle");
    try {
      const token = await getToken({ template: "skillmentor-auth" });
      if (!token) throw new Error("Not authenticated");

      await adminCreateSubject(token, {
        subjectName: data.subjectName,
        description: data.description,
        courseImageUrl: data.courseImageUrl || undefined,
        mentorId: Number(data.mentorId), // convert string → number here
      });

      setStatus("success");
      reset();
    } catch (e: unknown) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Failed to create subject");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Create Subject</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Create a new subject and assign it to a mentor
        </p>
      </div>

      {status === "success" && (
        <Alert className="mb-6 border-green-500/30 bg-green-500/10">
          <CheckCircle className="size-4 text-green-400" />
          <AlertDescription className="text-green-300">
            Subject created successfully and assigned to the mentor!
          </AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert className="mb-6 border-red-500/30 bg-red-500/10">
          <AlertCircle className="size-4 text-red-400" />
          <AlertDescription className="text-red-300">{errorMsg}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6 space-y-5">

                <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                  <BookOpen className="size-4 text-amber-400" />
                  <h3 className="text-zinc-300 text-sm font-semibold uppercase tracking-wider">
                    Subject Details
                  </h3>
                </div>

                <FormField
                  label="Subject Name"
                  required
                  error={errors.subjectName?.message}
                >
                  <Input
                    {...register("subjectName")}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400/30 focus-visible:border-amber-400/50"
                    placeholder="e.g. AWS Developer Associate"
                  />
                </FormField>

                <FormField
                  label="Description"
                  required
                  error={errors.description?.message}
                >
                  <textarea
                    {...register("description")}
                    rows={4}
                    className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/50 resize-none"
                    placeholder="Describe what students will learn..."
                  />
                  <p className="text-zinc-500 text-xs text-right">
                    {watch("description")?.length ?? 0}/500
                  </p>
                </FormField>

                <FormField
                  label="Course Image URL"
                  error={errors.courseImageUrl?.message}
                >
                  <div className="flex gap-2 items-center">
                    <ImageIcon className="size-4 text-zinc-500 shrink-0" />
                    <Input
                      {...register("courseImageUrl")}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400/30 focus-visible:border-amber-400/50"
                      placeholder="https://..."
                    />
                  </div>
                </FormField>

                <FormField
                  label="Assign to Mentor"
                  required
                  error={errors.mentorId?.message}
                >
                  <select
                    {...register("mentorId")}
                    disabled={loadingMentors}
                    className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/50 disabled:opacity-50"
                  >
                    <option value="">
                      {loadingMentors ? "Loading mentors..." : "Select a mentor..."}
                    </option>
                    {mentors.map((mentor) => (
                      <option key={mentor.id} value={String(mentor.id)}>
                        {mentor.firstName} {mentor.lastName}
                        {mentor.company ? ` — ${mentor.company}` : ""}
                      </option>
                    ))}
                  </select>
                </FormField>

              </CardContent>
            </Card>

            <div className="flex gap-3 mt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-400 text-zinc-900 hover:bg-amber-300 font-semibold"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="size-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  "Create Subject"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Reset
              </Button>
            </div>
          </form>
        </div>

        {/* Mentor Preview */}
        <div className="lg:col-span-1">
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-3">
            Assigned Mentor
          </p>
          {selectedMentor ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4 flex items-center gap-3">
                {selectedMentor.profileImageUrl ? (
                  <img
                    src={selectedMentor.profileImageUrl}
                    alt={selectedMentor.firstName}
                    className="size-10 rounded-full object-cover object-top border border-zinc-700"
                  />
                ) : (
                  <div className="size-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-400">
                    {selectedMentor.firstName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-white text-sm font-medium">
                    {selectedMentor.firstName} {selectedMentor.lastName}
                  </p>
                  <p className="text-zinc-400 text-xs">
                    {selectedMentor.title || selectedMentor.profession || "Mentor"}
                  </p>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {selectedMentor.subjects.length} subject
                    {selectedMentor.subjects.length !== 1 ? "s" : ""} currently
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-xl border border-zinc-800 border-dashed p-6 flex flex-col items-center gap-2 text-center">
              <BookOpen className="size-8 text-zinc-600" />
              <p className="text-zinc-500 text-sm">
                Select a mentor to see their profile
              </p>
            </div>
          )}

          {watch("courseImageUrl") && (
            <div className="mt-4">
              <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-3">
                Course Image
              </p>
              <img
                src={watch("courseImageUrl")}
                alt="Course preview"
                className="rounded-lg border border-zinc-700 w-full object-cover aspect-video"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}