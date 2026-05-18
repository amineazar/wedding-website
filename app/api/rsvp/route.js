const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzZhvIYFFdLhgwhAjlUIjLkJlk4t5GJrro9CYoIU43afvlr6Fhdt3k0Zijh9KfJ44F9/exec';

export async function POST(request) {
  try {
    const data = await request.json();

    // Google Apps Script reads form fields via e.parameter — requires URL-encoded body.
    // Sending application/x-www-form-urlencoded so e.parameter.name, e.parameter.email, etc. are populated.
    const params = new URLSearchParams(data);
    const response = await fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('RSVP proxy error:', err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
