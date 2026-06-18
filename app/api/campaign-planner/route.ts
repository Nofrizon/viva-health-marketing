// app/api/campaign-planner/route.ts
// CRUD API for Campaign Plans stored in Supabase
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: List all campaign plans
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let query = supabase
      .from('campaign_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (month) query = query.eq('campaign_month', parseInt(month));
    if (year) query = query.eq('campaign_year', parseInt(year));

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ plans: data || [] });
  } catch (error) {
    console.error('Campaign Planner GET Error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data campaign plans', plans: [] },
      { status: 500 }
    );
  }
}

// POST: Create new campaign plan
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      description,
      goal,
      campaign_month,
      campaign_year,
      selected_keyword,
      selected_event_name,
      selected_event_date,
      generated_ideas,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Nama campaign wajib diisi' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('campaign_plans')
      .insert({
        name,
        description: description || '',
        goal: goal || '',
        campaign_month: campaign_month || new Date().getMonth() + 1,
        campaign_year: campaign_year || new Date().getFullYear(),
        selected_keyword: selected_keyword || null,
        selected_event_name: selected_event_name || null,
        selected_event_date: selected_event_date || null,
        generated_ideas: generated_ideas || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ plan: data }, { status: 201 });
  } catch (error) {
    console.error('Campaign Planner POST Error:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan campaign plan' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a campaign plan
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID campaign plan diperlukan' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('campaign_plans')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Campaign Planner DELETE Error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus campaign plan' },
      { status: 500 }
    );
  }
}