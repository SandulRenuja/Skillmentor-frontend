import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@clerk/clerk-react";
import { adminCreateMentor } from "@/lib/api-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertCircle,
  User,
  Briefcase,
  Image as ImageIcon,
  Award,
} from "lucide-react";

const mentorSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Must be a valid email"),
  phoneNumber: z.string().max(20).optional().or(z.literal("")),
  title: z.string().max(100).optional().or(z.literal("")),
  profession: z.string().max(100).optional().or(z.literal("")),
  company: z.string().max(100).optional().or(z.literal("")),
  // Use string in the form, parse to number on submit
  experienceYears: z
    .string()
    .min(1, "Required")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 60, {
      message: "Must be a number between 0 and 60",
    }),
  bio: z.string().max(500).optional().or(z.literal("")),
  profileImageUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  isCertified: z.boolean(),
  startYear: z.string().max(10).optional().or(z.literal("")),
  positiveReviews: z
    .string()
    .optional()
    .refine((v) => v === "" || v === undefined || (!isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100), {
      message: "Must be 0–100",
    }),
  totalEnrollments: z
    .string()
    .optional()
    .refine((v) => v === "" || v === undefined || (!isNaN(Number(v)) && Number(v) >= 0), {
      message: "Must be 0 or more",
    }),
});

type MentorFormValues = z.infer<typeof mentorSchema>;

interface FieldGroupProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function FieldGroup({ title, icon, children }: FieldGroupProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
        <span className="text-amber-400">{icon}</span>
        <h3 className="text-zinc-300 text-sm font-semibold uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

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

export default function CreateMentorPage() {
  const { getToken } = useAuth();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MentorFormValues>({
    resolver: zodResolver(mentorSchema),
    defaultValues: {
      isCertified: false,
      experienceYears: "0",
      positiveReviews: "0",
      totalEnrollments: "0",
    },
  });

  const profileImageUrl = watch("profileImageUrl");
  const firstName = watch("firstName");
  const lastName = watch("lastName");

  const onSubmit = async (data: MentorFormValues) => {
    setStatus("idle");
    try {
      const token = await getToken({ template: "skillmentor-auth" });
      if (!token) throw new Error("Not authenticated");

      await adminCreateMentor(token, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber || undefined,
        title: data.title || undefined,
        profession: data.profession || undefined,
        company: data.company || undefined,
        experienceYears: Number(data.experienceYears),
        bio: data.bio || undefined,
        profileImageUrl: data.profileImageUrl || undefined,
        isCertified: data.isCertified,
        startYear: data.startYear || undefined,
        positiveReviews: data.positiveReviews ? Number(data.positiveReviews) : undefined,
        totalEnrollments: data.totalEnrollments ? Number(data.totalEnrollments) : undefined,
      });

      setStatus("success");
      reset();
    } catch (e: unknown) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Failed to create mentor");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Create Mentor</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Add a new mentor profile to the SkillMentor platform
        </p>
      </div>

      {status === "success" && (
        <Alert className="mb-6 border-green-500/30 bg-green-500/10">
          <CheckCircle className="size-4 text-green-400" />
          <AlertDescription className="text-green-300">
            Mentor created successfully! They can now be assigned subjects.
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
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6 space-y-8">

                <FieldGroup title="Identity" icon={<User className="size-4" />}>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="First Name" required error={errors.firstName?.message}>
                      <Input
                        {...register("firstName")}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400/30 focus-visible:border-amber-400/50"
                        placeholder="John"
                      />
                    </FormField>
                    <FormField label="Last Name" required error={errors.lastName?.message}>
                      <Input
                        {...register("lastName")}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400/30 focus-visible:border-amber-400/50"
                        placeholder="Doe"
                      />
                    </FormField>
                  </div>
                  <FormField label="Email" required error={errors.email?.message}>
                    <Input
                      {...register("email")}
                      type="email"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400/30 focus-visible:border-amber-400/50"
                      placeholder="john@example.com"
                    />
                  </FormField>
                  <FormField label="Phone Number" error={errors.phoneNumber?.message}>
                    <Input
                      {...register("phoneNumber")}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400/30 focus-visible:border-amber-400/50"
                      placeholder="+1 (555) 000-0000"
                    />
                  </FormField>
                </FieldGroup>

                <FieldGroup title="Professional" icon={<Briefcase className="size-4" />}>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Title" error={errors.title?.message}>
                      <Input
                        {...register("title")}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400/30 focus-visible:border-amber-400/50"
                        placeholder="Senior Engineer"
                      />
                    </FormField>
                    <FormField label="Profession" error={errors.profession?.message}>
                      <Input
                        {...register("profession")}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400/30 focus-visible:border-amber-400/50"
                        placeholder="Software Engineer"
                      />
                    </FormField>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Company" error={errors.company?.message}>
                      <Input
                        {...register("company")}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400/30 focus-visible:border-amber-400/50"
                        placeholder="Acme Corp"
                      />
                    </FormField>
                    <FormField label="Experience (years)" error={errors.experienceYears?.message}>
                      <Input
                        {...register("experienceYears")}
                        type="number"
                        min={0}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400/30 focus-visible:border-amber-400/50"
                        placeholder="5"
                      />
                    </FormField>
                  </div>
                  <FormField label="Bio" error={errors.bio?.message}>
                    <textarea
                      {...register("bio")}
                      rows={4}
                      className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/50 resize-none"
                      placeholder="A short bio about the mentor..."
                    />
                    <p className="text-zinc-500 text-xs text-right">
                      {watch("bio")?.length ?? 0}/500
                    </p>
                  </FormField>
                </FieldGroup>

                <FieldGroup title="Profile & Credentials" icon={<Award className="size-4" />}>
                  <FormField label="Profile Image URL" error={errors.profileImageUrl?.message}>
                    <div className="flex gap-2 items-center">
                      <ImageIcon className="size-4 text-zinc-500 shrink-0" />
                      <Input
                        {...register("profileImageUrl")}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400/30 focus-visible:border-amber-400/50"
                        placeholder="https://..."
                      />
                    </div>
                  </FormField>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Start Year" error={errors.startYear?.message}>
                      <Input
                        {...register("startYear")}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400/30 focus-visible:border-amber-400/50"
                        placeholder="2018"
                      />
                    </FormField>
                    <FormField label="Positive Reviews (%)" error={errors.positiveReviews?.message}>
                      <Input
                        {...register("positiveReviews")}
                        type="number"
                        min={0}
                        max={100}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400/30 focus-visible:border-amber-400/50"
                        placeholder="95"
                      />
                    </FormField>
                  </div>
                  <FormField label="Total Enrollments" error={errors.totalEnrollments?.message}>
                    <Input
                      {...register("totalEnrollments")}
                      type="number"
                      min={0}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400/30 focus-visible:border-amber-400/50"
                      placeholder="0"
                    />
                  </FormField>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      {...register("isCertified")}
                      className="size-4 rounded border-zinc-600 bg-zinc-800 text-amber-400 accent-amber-400"
                    />
                    <div>
                      <p className="text-zinc-300 text-sm font-medium">
                        Certified Teacher
                      </p>
                      <p className="text-zinc-500 text-xs">
                        Shows a verified badge on the mentor card
                      </p>
                    </div>
                  </label>
                </FieldGroup>

              </CardContent>
            </Card>

            <div className="flex gap-3">
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
                  "Create Mentor"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                className="border-zinc-700 text-zinc-800 hover:bg-zinc-800 hover:text-white"
              >
                Reset
              </Button>
            </div>
          </form>
        </div>

        {/* Preview Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-3">
              Preview
            </p>
            <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
              <CardHeader className="pb-0">
                <div className="flex items-center gap-3">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Preview"
                      className="size-12 rounded-full object-cover object-top border-2 border-zinc-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="size-12 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-lg font-bold text-zinc-400">
                      {firstName ? firstName.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-white text-base">
                      {firstName || lastName
                        ? `${firstName ?? ""} ${lastName ?? ""}`.trim()
                        : "Mentor Name"}
                    </CardTitle>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      {watch("title") || "Title"}
                      {watch("company") && ` @ ${watch("company")}`}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-3 space-y-2">
                <p className="text-zinc-400 text-xs line-clamp-3">
                  {watch("bio") || "Bio will appear here..."}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {watch("isCertified") && (
                    <span className="bg-amber-400/10 text-amber-400 text-xs px-2 py-0.5 rounded-full border border-amber-400/20">
                      ✓ Certified
                    </span>
                  )}
                  {watch("experienceYears") && Number(watch("experienceYears")) > 0 && (
                    <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full">
                      {watch("experienceYears")}y exp
                    </span>
                  )}
                  {watch("startYear") && (
                    <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full">
                      Since {watch("startYear")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}