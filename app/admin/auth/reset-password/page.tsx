import { redirect } from "next/navigation";

export default async function AdminResetPasswordRedirectPage({
  searchParams,
}: {
  searchParams:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await Promise.resolve(searchParams);
  const raw = params.code;
  const code = Array.isArray(raw) ? raw[0] : raw;

  if (!code || !String(code).trim()) {
    redirect("/forgot-password");
  }

  redirect(`/change-password?code=${encodeURIComponent(String(code))}`);
}
