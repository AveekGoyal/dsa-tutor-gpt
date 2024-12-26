/**
 * @dev Individual chat management API endpoints
 * Features: CRUD operations for chat sessions, message management, access control
 */

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';

/**
 * @dev GET handler for retrieving specific chat
 * @param chatId - ID of the chat to retrieve
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const chats = client.db().collection('chats');
    
    const chat = await chats.findOne({
      _id: new ObjectId(params.chatId),
      userEmail: session.user.email
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
  }
}

/**
 * @dev PATCH handler for updating chat details
 * @param chatId - ID of the chat to update
 * Updates title or appends new messages to chat history
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, message } = await req.json();
    const client = await clientPromise;
    const chats = client.db().collection('chats');

    const updateData: any = {};
    const updateOperation: any = {
      $set: {
        updatedAt: new Date()
      }
    };

    if (title) {
      updateOperation.$set.title = title;
    }

    if (message) {
      updateOperation.$push = { messages: message };
    }

    const result = await chats.findOneAndUpdate(
      { _id: new ObjectId(params.chatId), userEmail: session.user.email },
      updateOperation,
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Update chat error:', error);
    return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 });
  }
}

/**
 * @dev DELETE handler for removing chat sessions
 * @param chatId - ID of the chat to delete
 * Verifies user ownership before deletion
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const chats = client.db().collection('chats');
    
    const result = await chats.deleteOne({
      _id: new ObjectId(params.chatId),
      userEmail: session.user.email
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}
