"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { BackendNotice } from "@/components/shared/backend-notice";
import { getSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { applicationSchema, type ApplicationInput } from "@/lib/validators/forms";
import { currentPolicyVersion } from "@/lib/site";

/**
 * The application form itself. Controlled from outside and loaded on demand by
 * ApplyButton, so the vacancies page — which lists every open post — doesn't
 * ship a form bundle per row to people who are only browsing.
 */
export function ApplyDialog({
  appointmentSlug,
  postTitle,
  open,
  onOpenChange,
}: {
  appointmentSlug: string;
  postTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { fullName: "", phone: "", statement: "" },
  });

  async function onSubmit(values: ApplicationInput) {
    setError(null);
    const supabase = await getSupabase();
    const { error } = await supabase.from("applications").insert({
      appointment_slug: appointmentSlug,
      full_name: values.fullName,
      phone: values.phone,
      statement: values.statement,
      consent_version: currentPolicyVersion,
      status: "submitted",
    });

    if (error) {
      setError("That didn't send. Check your connection and try again.");
      return;
    }
    setSent(true);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply — {postTitle}</DialogTitle>
          <DialogDescription>
            Applications are screened and vetted by the movement before any
            appointment is confirmed.
          </DialogDescription>
        </DialogHeader>

        {!isSupabaseConfigured ? (
          <BackendNotice action="Applying for a post online" />
        ) : sent ? (
          <div className="border-brand-green/40 bg-brand-green/5 rounded-lg border p-4 text-sm">
            <p className="font-medium">Application received</p>
            <p className="text-muted-foreground pt-1">
              The relevant coordinating office will contact you on the number
              you gave once screening begins.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="08031234567"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="statement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why you</FormLabel>
                    <FormControl>
                      <Textarea rows={6} {...field} />
                    </FormControl>
                    <FormDescription>
                      Your experience, your reach in the area, and what you would
                      do in the first month.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="consent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="text-sm font-normal">
                        I agree that NOkM may store and process these details to
                        screen and vet this application.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {error && <p className="text-destructive text-sm">{error}</p>}

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending…" : "Submit application"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
