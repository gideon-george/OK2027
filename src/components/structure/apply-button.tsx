"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

// The form (react-hook-form + zod + dialog) is a meaningful download and most
// visitors to /vacancies are reading, not applying. It arrives on first click.
const ApplyDialog = dynamic(
  () => import("./apply-dialog").then((m) => m.ApplyDialog),
  { ssr: false }
);

export function ApplyButton({
  appointmentSlug,
  postTitle,
}: {
  appointmentSlug: string;
  postTitle: string;
}) {
  const [requested, setRequested] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        onClick={() => {
          setRequested(true);
          setOpen(true);
        }}
      >
        Apply
      </Button>
      {requested && (
        <ApplyDialog
          appointmentSlug={appointmentSlug}
          postTitle={postTitle}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
}
