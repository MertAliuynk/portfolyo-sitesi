"use client";

import { Loader2, LockKeyhole } from "lucide-react";
import { useActionState } from "react";

import { login, type LoginState } from "~/app/admin/giris/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: null });

  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="text-[13px] font-medium text-[#44403c]">Şifre</span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          className="mt-1.5 h-11 w-full rounded-lg border border-[#d6d3d1] bg-white px-3 text-[15px] outline-none transition focus:border-[#1c1917] focus:ring-4 focus:ring-[#1c1917]/10"
        />
      </label>
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1c1917] text-[14px] font-medium text-white transition hover:bg-[#292524] disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
        Giriş yap
      </button>
    </form>
  );
}
