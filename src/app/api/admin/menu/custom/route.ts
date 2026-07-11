import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth/admin-session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  const price = typeof body.price === "number" ? Math.round(body.price) : 0;
  if (price <= 0) return NextResponse.json({ error: "Price must be greater than 0." }, { status: 400 });

  const categoryId = typeof body.categoryId === "string" ? body.categoryId.trim() : "";
  if (!categoryId) return NextResponse.json({ error: "Category is required." }, { status: 400 });

  // Generate a slug-based ID from the name
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const id = `custom-${slug}-${Date.now().toString(36)}`;

  const row = {
    id,
    name,
    description: typeof body.description === "string" ? body.description.trim() : "",
    price,
    emoji: typeof body.emoji === "string" && body.emoji.trim() ? body.emoji.trim() : "🍽️",
    image_url: typeof body.imageUrl === "string" && body.imageUrl.trim() ? body.imageUrl.trim() : null,
    category_id: categoryId,
    diet: typeof body.diet === "string" ? body.diet : null,
    spicy: body.spicy === true,
    bestseller: body.bestseller === true,
    is_available: true,
    sort_order: typeof body.sortOrder === "number" ? body.sortOrder : 0,
  };

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("custom_menu_items").insert(row);
  if (error) {
    return NextResponse.json({ error: "Could not create item." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id });
}
