import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, prospectLeads } from '@/db';
import { eq, and, or, like, desc, asc, isNull, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function mapLead(r: typeof prospectLeads.$inferSelect) {
  return {
    ...r,
    aiScore: r.aiScore ?? undefined,
    scrapedAt: r.scrapedAt?.toISOString() ?? null,
    scoredAt: r.scoredAt?.toISOString() ?? null,
    createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: r.updatedAt?.toISOString() ?? null,
  };
}

// GET — fetch saved prospects
export async function GET(request: NextRequest) {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!session?.user?.id || !adminEmail || session.user.email !== adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const conditions = [];
    if (status && status !== 'all') conditions.push(eq(prospectLeads.status, status));
    if (search) {
      conditions.push(
        or(
          like(prospectLeads.organisatie, `%${search}%`),
          like(prospectLeads.plaats, `%${search}%`),
          like(prospectLeads.email, `%${search}%`),
          like(prospectLeads.naam, `%${search}%`),
        ),
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(prospectLeads)
        .where(where)
        .orderBy(
          desc(prospectLeads.starred),
          desc(prospectLeads.aiScore),
          desc(prospectLeads.createdAt),
        )
        .limit(limit)
        .offset(offset),
      db
        .select({ total: sql<number>`count(*)` })
        .from(prospectLeads)
        .where(where),
    ]);

    const total = Number(countResult[0]?.total ?? 0);

    return NextResponse.json({
      leads: rows.map(mapLead),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Prospect leads GET error:', error);
    return NextResponse.json({ error: 'Ophalen mislukt', leads: [] }, { status: 500 });
  }
}

// POST — save a new prospect
export async function POST(request: NextRequest) {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!session?.user?.id || !adminEmail || session.user.email !== adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      organisatie, naam, email, telefoon, website,
      aiScore, aiRationale, sbiDescription,
    } = body;

    if (!email && !organisatie) {
      return NextResponse.json({ error: 'E-mail of organisatie is verplicht' }, { status: 400 });
    }

    const now = new Date();
    const inserted = await db
      .insert(prospectLeads)
      .values({
        organisatie: organisatie ?? null,
        naam: naam ?? null,
        email: email ?? '',
        telefoon: telefoon ?? null,
        website: website ?? null,
        aiScore: aiScore ?? null,
        aiRationale: aiRationale ?? null,
        sbiBeschrijving: sbiDescription ?? null,
        bron: 'websearch',
        status: 'nieuw',
        scrapedAt: email || telefoon ? now : null,
        scoredAt: aiScore != null ? now : null,
      })
      .returning();

    return NextResponse.json({ lead: mapLead(inserted[0]) }, { status: 201 });
  } catch (error) {
    console.error('Prospect leads POST error:', error);
    return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 });
  }
}

// PUT — update status / starred / notes
export async function PUT(request: NextRequest) {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!session?.user?.id || !adminEmail || session.user.email !== adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status, starred, notitie } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID ontbreekt' }, { status: 400 });

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (starred !== undefined) updateData.starred = starred;
    if (notitie !== undefined) updateData.notitie = notitie;

    const updated = await db
      .update(prospectLeads)
      .set(updateData)
      .where(eq(prospectLeads.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    }

    return NextResponse.json({ lead: mapLead(updated[0]) });
  } catch (error) {
    console.error('Prospect leads PUT error:', error);
    return NextResponse.json({ error: 'Bijwerken mislukt' }, { status: 500 });
  }
}

// DELETE — remove a prospect
export async function DELETE(request: NextRequest) {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!session?.user?.id || !adminEmail || session.user.email !== adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID ontbreekt' }, { status: 400 });

    await db.delete(prospectLeads).where(eq(prospectLeads.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Prospect leads DELETE error:', error);
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 });
  }
}
