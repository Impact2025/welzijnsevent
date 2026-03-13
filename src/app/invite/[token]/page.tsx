import { db, orgInvites, organizations, orgMembers, authUsers } from "@/db";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { CheckCircle2, XCircle, Users } from "lucide-react";

export default async function AcceptInvitePage({
  params,
}: {
  params: { token: string };
}) {
  const [invite] = await db
    .select()
    .from(orgInvites)
    .where(eq(orgInvites.token, params.token));

  if (!invite) {
    return <ErrorState message="Uitnodiging niet gevonden of al gebruikt." />;
  }

  if (invite.expiresAt < new Date()) {
    return <ErrorState message="Deze uitnodiging is verlopen (geldig 7 dagen)." />;
  }

  if (invite.acceptedAt) {
    return <ErrorState message="Deze uitnodiging is al geaccepteerd." />;
  }

  const [org] = await db.select().from(organizations).where(eq(organizations.id, invite.organizationId));

  const session = await auth();

  // Niet ingelogd — redirect naar sign-in met return URL
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=/invite/${params.token}`);
  }

  // Controleer of e-mail overeenkomt
  if (session.user.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <ErrorState message={`Je bent ingelogd als ${session.user.email}, maar de uitnodiging is voor ${invite.email}. Log in met het juiste account.`} />
    );
  }

  // Accepteer uitnodiging: voeg toe als teamlid
  const [existingMember] = await db
    .select()
    .from(orgMembers)
    .where(and(eq(orgMembers.organizationId, invite.organizationId), eq(orgMembers.userId, session.user.id)));

  if (!existingMember) {
    await db.insert(orgMembers).values({
      organizationId: invite.organizationId,
      userId:         session.user.id,
      role:           invite.role ?? "member",
      invitedBy:      invite.invitedBy,
    });
  }

  // Markeer invite als geaccepteerd
  await db
    .update(orgInvites)
    .set({ acceptedAt: new Date() })
    .where(eq(orgInvites.id, invite.id));

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-ink mb-2">Welkom bij het team!</h1>
        <p className="text-ink-muted text-sm mb-6">
          Je bent nu lid van <strong>{org?.name ?? "de organisatie"}</strong> en hebt toegang tot het dashboard.
        </p>
        <div className="flex items-center justify-center gap-2 mb-6 bg-sand/50 rounded-2xl px-4 py-3">
          <Users size={16} className="text-terra-500" />
          <p className="text-sm font-semibold text-ink">{org?.name}</p>
          <span className="text-[10px] font-bold text-white bg-terra-500 px-2 py-0.5 rounded-full uppercase ml-1">
            {invite.role ?? "member"}
          </span>
        </div>
        <Link
          href="/dashboard"
          className="w-full block bg-terra-500 hover:bg-terra-600 text-white font-bold py-3 rounded-xl transition-colors"
        >
          Naar het dashboard →
        </Link>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle size={32} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-ink mb-2">Uitnodiging ongeldig</h1>
        <p className="text-ink-muted text-sm mb-6">{message}</p>
        <Link
          href="/dashboard"
          className="w-full block bg-terra-500 hover:bg-terra-600 text-white font-bold py-3 rounded-xl transition-colors"
        >
          Naar het dashboard
        </Link>
      </div>
    </div>
  );
}
