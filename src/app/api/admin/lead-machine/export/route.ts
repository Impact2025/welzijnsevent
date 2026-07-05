import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, prospectLeads } from '@/db';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!session?.user?.id || !adminEmail || session.user.email !== adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const leads = await db
      .select()
      .from(prospectLeads)
      .orderBy(desc(prospectLeads.createdAt));

    const header = 'Organisatie;Email;Telefoon;Website;Plaats;AI Score;Status;Datum';
    const rows = leads.map((l) =>
      [
        l.organisatie ?? '',
        l.email ?? '',
        l.telefoon ?? '',
        l.website ?? '',
        l.plaats ?? '',
        l.aiScore ?? '',
        l.status,
        l.createdAt ? new Date(l.createdAt).toLocaleDateString('nl-NL') : '',
      ].join(';'),
    );

    const csv = '\uFEFF' + [header, ...rows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="leads-bijeen.csv"',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export mislukt' }, { status: 500 });
  }
}
