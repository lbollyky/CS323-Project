import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productIds, goals, symptoms } = await req.json();

  const { error } = await supabase
    .from("users")
    .update({
      goal_profile: {
        protocol_product_ids: productIds,
        goals: goals ?? [],
        symptoms: symptoms ?? [],
        updated_at: new Date().toISOString(),
      },
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from("users")
    .select("goal_profile")
    .eq("id", user.id)
    .single();

  const productIds: string[] =
    userData?.goal_profile?.protocol_product_ids ?? [];

  if (productIds.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds);

  return NextResponse.json({ products: products ?? [] });
}
