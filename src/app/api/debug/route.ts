import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';

// Get all collections data
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get all collections
    const collections = await db.listCollections().toArray();
    const data: { [key: string]: any[] } = {};

    // Get data from each collection
    for (const collection of collections) {
      const collectionData = await db
        .collection(collection.name)
        .find({})
        .toArray();
      data[collection.name] = collectionData;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Debug data fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch debug data' }, { status: 500 });
  }
}

// Clear all data from a specific collection
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collection } = await req.json();
    if (!collection) {
      return NextResponse.json({ error: 'Collection name required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    await db.collection(collection).deleteMany({});

    return NextResponse.json({ success: true, message: `Collection ${collection} cleared` });
  } catch (error) {
    console.error('Debug data clear error:', error);
    return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 });
  }
}
