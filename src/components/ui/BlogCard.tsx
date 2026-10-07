"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { RouterOutputs } from "~/trpc/react";

type Post = RouterOutputs["post"]["all"][number];

export function BlogCard({ post, index }: { post: Post; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group glass-panel block h-full rounded-2xl p-6 transition hover:border-white/20 hover:bg-white/[0.07]"
      >
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-cyan">
            {post.tag}
          </span>
          <span className="text-xs text-paper/40">
            {post.readingTime} dk okuma
          </span>
        </div>
        <h3 className="mt-4 font-display text-xl font-bold text-paper group-hover:text-gradient">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-paper/60">
          {post.excerpt}
        </p>
        <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-paper/70 group-hover:text-paper">
          Oku
          <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </Link>
    </motion.div>
  );
}
