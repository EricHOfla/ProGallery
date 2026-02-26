import { useState, useEffect } from "react";
import { contactMessagesAPI } from "../../services/api";

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await contactMessagesAPI.getAll();
      setMessages(data);
    } catch (err) {
      alert("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      await contactMessagesAPI.delete(id);
      fetchMessages();
    } catch (err) {
      alert("Failed to delete message");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>
        <div className="bg-white rounded-lg shadow">
          <div className="animate-pulse space-y-4 p-6">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>

      {messages.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No messages yet</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{message.name}</h3>
                  <p className="text-sm text-gray-600">{message.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(message.id)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Delete
                </button>
              </div>

              {message.subject && (
                <p className="font-medium text-gray-800 mb-2">
                  Subject: {message.subject}
                </p>
              )}

              <p className="text-gray-700 whitespace-pre-wrap">
                {message.message}
              </p>

              <div className="mt-4 pt-4 border-t flex gap-4">
                <a
                  href={`mailto:${message.email}`}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Reply via Email
                </a>
                <button
                  onClick={() => setSelectedMessage(message)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Message Details</h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Name</label>
                <p className="text-gray-900">{selectedMessage.name}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <p className="text-gray-900">{selectedMessage.email}</p>
              </div>
              {selectedMessage.subject && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Subject</label>
                  <p className="text-gray-900">{selectedMessage.subject}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-gray-700">Message</label>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Received</label>
                <p className="text-gray-900">
                  {new Date(selectedMessage.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <a
                href={`mailto:${selectedMessage.email}`}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-center"
              >
                Reply via Email
              </a>
              <button
                onClick={() => {
                  handleDelete(selectedMessage.id);
                  setSelectedMessage(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
