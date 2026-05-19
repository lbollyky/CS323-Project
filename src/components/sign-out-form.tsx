import { signOut } from "@/app/track/actions";

export function SignOutForm() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-full px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        Sign out
      </button>
    </form>
  );
}
