export async function GET() {
  return Response.json(
    {
      mentor: !!process.env.OPENAI_API_KEY,
      accountDeletion: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
