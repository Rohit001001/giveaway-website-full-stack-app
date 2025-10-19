import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // Get all entries
    const entries = db.prepare('SELECT * FROM entries').all();

    if (entries.length === 0) {
      return NextResponse.json(
        { error: 'No entries found in the database' },
        { status: 404 }
      );
    }

    // Pick a random winner
    const randomIndex = Math.floor(Math.random() * entries.length);
    const winner = entries[randomIndex];

    return NextResponse.json({
      success: true,
      winner: {
        name: winner.name,
        email: winner.email,
        dob: winner.dob
      }
    });
  } catch (error) {
    console.error('Error selecting winner:', error);
    return NextResponse.json(
      { error: 'Failed to select winner' },
      { status: 500 }
    );
  }
}