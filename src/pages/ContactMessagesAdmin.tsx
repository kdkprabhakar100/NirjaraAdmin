import { useEffect, useState } from "react";

type Message = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
};

export default function ContactMessagesAdmin() {
  const [messages, setMessages] = useState<Message[]>([]);

  const fetchMessages = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id: string) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/contact/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
      body: JSON.stringify({ status: "Read" }),
    });

    fetchMessages();
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/contact/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    fetchMessages();
  };

  return (
    <div>
      <h1 className="font-serif text-5xl text-[#E75480]">
        Contact Messages
      </h1>

      <p className="mt-2 text-[#8A6F78]">
        View and manage messages sent from the contact page.
      </p>

      <div className="mt-10 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className="rounded-3xl bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-[#E75480]">
                  {msg.subject}
                </h2>

                <p className="mt-2 text-sm text-[#8A6F78]">
                  {msg.name} • {msg.email}
                </p>
              </div>

              <span
                className={`rounded-full px-4 py-1 text-xs ${
                  msg.status === "Read"
                    ? "bg-green-100 text-green-700"
                    : "bg-[#FCE7EF] text-[#E75480]"
                }`}
              >
                {msg.status}
              </span>
            </div>

            <p className="mt-5 leading-7 text-[#3A2A2F]">{msg.message}</p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => markAsRead(msg._id)}
                className="rounded-full border border-[#E75480] px-5 py-2 text-xs text-[#E75480]"
              >
                Mark Read
              </button>

              <button
                onClick={() => deleteMessage(msg._id)}
                className="rounded-full bg-[#FCE7EF] px-5 py-2 text-xs text-[#E75480]"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <p className="text-center text-[#8A6F78]">No messages yet.</p>
        )}
      </div>
    </div>
  );
}