import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata = { title: "Admin — Bijeen" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || session.user.email !== adminEmail) redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-[#F5F4F0]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto min-h-screen md:pt-0">
        {children}
      </main>
    </div>
  );
}
