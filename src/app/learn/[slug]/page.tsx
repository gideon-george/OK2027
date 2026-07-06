import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { lessons, getLesson } from "@/lib/lessons";

interface LessonPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return {};
  return { title: lesson.title, description: lesson.summary };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const index = lessons.findIndex((l) => l.slug === lesson.slug);
  const prev = index > 0 ? lessons[index - 1] : null;
  const next = index < lessons.length - 1 ? lessons[index + 1] : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/learn"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3" /> All lessons
      </Link>
      <div className="flex items-center gap-3 pt-6 text-sm text-muted-foreground">
        <span>Lesson {lesson.orderIndex} of {lessons.length}</span>
        <span className="flex items-center gap-1">
          <Clock className="size-3" />
          {lesson.minutes} min read
        </span>
      </div>
      <h1 className="font-display pt-2 text-3xl font-bold tracking-tight">
        {lesson.title}
      </h1>
      <p className="pt-3 text-lg text-muted-foreground">{lesson.summary}</p>

      <div className="space-y-8 pt-8">
        {lesson.sections.map((section, i) => (
          <section key={i} className="space-y-3">
            {section.heading && (
              <h2 className="font-display text-xl font-semibold">
                {section.heading}
              </h2>
            )}
            {section.paragraphs.map((paragraph, j) => (
              <p key={j} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <nav className="mt-12 flex items-center justify-between gap-4 border-t pt-6">
        {prev ? (
          <Link
            href={`/learn/${prev.slug}`}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="size-3" />
            {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/learn/${next.slug}`}
            className="flex items-center gap-1 text-right text-sm text-primary hover:underline"
          >
            {next.title}
            <ArrowRight className="size-3" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
