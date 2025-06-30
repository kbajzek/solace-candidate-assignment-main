import db from "../../../db";
import { advocates } from "../../../db/schema";
import { ilike, or, sql, eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search")?.trim();
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const offset = (page - 1) * limit;

  const isNumeric = !isNaN(Number(search));

  const whereClause = search
  ? or(
      ilike(advocates.firstName, `%${search}%`),
      ilike(advocates.lastName, `%${search}%`),
      ilike(advocates.city, `%${search}%`),
      ilike(advocates.degree, `%${search}%`),
      sql`${advocates.specialties}::text ILIKE ${`%${search}%`}`,
      isNumeric
        ? eq(advocates.yearsOfExperience, Number(search))
        : undefined
    )
  : undefined;

  const data = await db
    .select()
    .from(advocates)
    .limit(limit)
    .where(whereClause)
    .offset(offset)
    .execute();

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(advocates)
    .where(whereClause)
    .execute();

  return Response.json({
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    },
  });
}
