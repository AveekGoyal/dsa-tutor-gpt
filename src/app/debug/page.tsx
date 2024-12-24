'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface DebugData {
  [collection: string]: any[];
}

export default function DebugPage() {
  const [data, setData] = useState<DebugData>({});
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchDebugData();
    }
  }, [status]);

  const fetchDebugData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug');
      if (response.ok) {
        const debugData = await response.json();
        setData(debugData);
        if (!selectedCollection && Object.keys(debugData).length > 0) {
          setSelectedCollection(Object.keys(debugData)[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch debug data:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCollection = async (collection: string) => {
    if (!confirm(`Are you sure you want to clear all data from ${collection}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/debug', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection })
      });

      if (response.ok) {
        await fetchDebugData();
      }
    } catch (error) {
      console.error('Failed to clear collection:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">MongoDB Debug Panel</h1>
        <button
          onClick={fetchDebugData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Collections Sidebar */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-4">Collections</h2>
          <ul className="space-y-2">
            {Object.keys(data).map((collection) => (
              <li
                key={collection}
                className={`cursor-pointer p-2 rounded ${
                  selectedCollection === collection
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedCollection(collection)}
              >
                {collection}
                <span className="ml-2 text-sm text-gray-500">
                  ({data[collection].length})
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Collection Data View */}
        <div className="md:col-span-3 bg-white p-4 rounded-lg shadow">
          {selectedCollection ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">
                  {selectedCollection} Data
                </h2>
                <button
                  onClick={() => clearCollection(selectedCollection)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Clear Collection
                </button>
              </div>
              <div className="overflow-auto max-h-[calc(100vh-300px)]">
                {data[selectedCollection].map((item, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded">
                    <pre className="whitespace-pre-wrap break-words text-sm">
                      {JSON.stringify(item, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">
              Select a collection to view data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
