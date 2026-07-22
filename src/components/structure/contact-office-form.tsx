"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
import { BackendNotice } from "@/components/shared/backend-notice";
import { getSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  contactOfficeSchema,
  type ContactOfficeInput,
} from "@/lib/validators/forms";

/**
 * Routes a message to an office without publishing anyone's phone number.
 * Officer contact details live in Supabase behind row-level security and are
 * never exposed to the public site.
 */
export function ContactOfficeForm({
  appointmentSlug,
  officeTitle,
}: {
  appointmentSlug: string;
  officeTitle: string;
}) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ContactOfficeInput>({
    resolver: zodResolver(contactOfficeSchema),
    defaultValues: {
      fromName: "",
      fromContact: "",
      subject: "",
      message: "",
    },
  });

  if (!isSupabaseConfigured) {
    return <BackendNotice action="Messaging an office directly" />;
  }

  async function onSubmit(values: ContactOfficeInput) {
    setError(null);
    const supabase = await getSupabase();
    const { error } = await supabase
      .from("office_messages")
      .insert({
        appointment_slug: appointmentSlug,
        from_name: values.fromName,
        from_contact: values.fromContact,
        subject: values.subject,
        message: values.message,
      });

    if (error) {
      setError("That didn't send. Please check your connection and try again.");
      return;
    }
    setSent(true);
    form.reset();
  }

  if (sent) {
    return (
      <div className="border-brand-green/40 bg-brand-green/5 rounded-lg border p-4 text-sm">
        <p className="font-medium">Message sent</p>
        <p className="text-muted-foreground pt-1">
          The {officeTitle} has received it and will reply on the contact you
          gave.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fromName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your name</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fromContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone or email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>So the office can reply to you.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Sending…" : "Send message"}
        </Button>
      </form>
    </Form>
  );
}
