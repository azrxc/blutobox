import { NextResponse } from "next/server";

function retired() { return NextResponse.json({ error: "This AI experience has retired. Visit /study." }, { status: 410 }); }
export function GET() { return retired(); }
export function POST() { return retired(); }
export function DELETE() { return retired(); }
