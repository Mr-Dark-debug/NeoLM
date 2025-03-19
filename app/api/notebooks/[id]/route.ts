import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Make a request to your backend API to delete the notebook
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to delete notebook' },
        { status: response.status }
      );
    }

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notebook:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the notebook' },
      { status: 500 }
    );
  }
}
