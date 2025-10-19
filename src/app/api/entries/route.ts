import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, dob, email } = body;

    // Validate input
    if (!name || !dob || !email) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check for duplicate email or name+dob combination
    const checkDuplicate = db.prepare(
      'SELECT * FROM entries WHERE email = ? OR (name = ? AND dob = ?)'
    );
    const duplicate = checkDuplicate.get(email, name, dob);

    if (duplicate) {
      return NextResponse.json(
        { error: 'Duplicate entry found. This email or name/date of birth combination already exists.' },
        { status: 409 }
      );
    }

    // Insert new entry
    const insert = db.prepare(
      'INSERT INTO entries (name, dob, email) VALUES (?, ?, ?)'
    );
    const result = insert.run(name, dob, email);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Entry submitted successfully!',
        id: result.lastInsertRowid 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error submitting entry:', error);
    return NextResponse.json(
      { error: 'Failed to submit entry' },
      { status: 500 }
    );
  }
}