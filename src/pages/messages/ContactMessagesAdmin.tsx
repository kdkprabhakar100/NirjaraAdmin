import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../../components/CustomTable";

import DialogBox from "../../components/DialogBox";

import RowActionsMenu from "../../components/RowActionsMenu";

// ========================================
// TYPES
// ========================================

type Message = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
};

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

export default function ContactMessagesAdmin() {
  const [messages, setMessages] =
    useState<Message[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  // The message being read in the details
  // dialog. Null means it is closed.
  const [
    selectedMessage,
    setSelectedMessage,
  ] = useState<Message | null>(null);

  // The message awaiting delete
  // confirmation.
  const [
    messageToDelete,
    setMessageToDelete,
  ] = useState<Message | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  // ============================
  // FETCH MESSAGES
  // ============================

  const fetchMessages = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/contact`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await res.json();

      setMessages(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Fetch messages error:",
        error
      );

      toast.error(
        "Failed to load messages"
      );

      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // ============================
  // MARK AS READ
  // ============================

  const markAsRead = async (
    message: Message
  ) => {
    try {
      setProcessingId(message._id);

      await fetch(
        `${import.meta.env.VITE_API_URL}/api/contact/${message._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            status: "Read",
          }),
        }
      );

      // Update UI immediately
      setMessages((previous) =>
        previous.map((item) =>
          item._id === message._id
            ? {
                ...item,
                status: "Read",
              }
            : item
        )
      );

      toast.success(
        "Message marked as read!"
      );
    } catch (error) {
      console.error(
        "Update message error:",
        error
      );

      toast.error(
        "Unable to update the message"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ============================
  // DELETE
  //
  // Asking happens in the dialog; this
  // only runs once the admin confirms.
  // ============================

  const confirmDelete = async () => {
    if (!messageToDelete) {
      return;
    }

    const id = messageToDelete._id;

    try {
      setDeleting(true);

      await fetch(
        `${import.meta.env.VITE_API_URL}/api/contact/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      // Remove from UI immediately
      setMessages((previous) =>
        previous.filter(
          (item) => item._id !== id
        )
      );

      toast.success(
        "Message deleted successfully!"
      );

      if (
        selectedMessage?._id === id
      ) {
        setSelectedMessage(null);
      }

      setMessageToDelete(null);
    } catch (error) {
      console.error(
        "Delete message error:",
        error
      );

      toast.error(
        "Unable to delete the message"
      );

      // Dialog stays open so the admin can
      // retry.
    } finally {
      setDeleting(false);
    }
  };

  // ============================
  // ROW PIECES
  // ============================

  const statusBadge = (
    message: Message
  ) => (
    <span
      className={`inline-block rounded-full px-4 py-1 text-xs ${
        message.status === "Read"
          ? "bg-green-100 text-green-700"
          : "bg-blush text-[#E75480]"
      }`}
    >
      {message.status}
    </span>
  );

  const renderActions = (
    message: Message
  ) => (
    <RowActionsMenu
      label={`Actions for ${message.subject}`}
      busy={
        processingId === message._id
      }
      actions={[
        {
          key: "view",
          label: "View",
          icon: "👁",
          onSelect: () =>
            setSelectedMessage(message),
        },
        {
          key: "read",
          label: "Mark read",
          icon: "✓",
          tone: "success",
          disabled:
            message.status === "Read",
          onSelect: () =>
            markAsRead(message),
        },
        {
          key: "delete",
          label: "Delete",
          icon: "🗑",
          tone: "danger",
          dividerBefore: true,
          onSelect: () =>
            setMessageToDelete(message),
        },
      ]}
    />
  );

  // ============================
  // COLUMNS
  // ============================

  const columns: TableColumn<Message>[] =
    [
      {
        key: "subject",
        header: "Subject",
        hideOnMobile: true,
        cellClassName:
          "font-medium text-ink",
        render: (message) =>
          message.subject,
      },
      {
        key: "name",
        header: "Name",
        render: (message) =>
          message.name,
      },
      {
        key: "email",
        header: "Email",
        cellClassName: "break-all",
        render: (message) =>
          message.email,
      },
      {
        key: "message",
        header: "Message",
        cellClassName: "max-w-sm",
        render: (message) => (
          <p className="line-clamp-2 leading-6">
            {message.message}
          </p>
        ),
      },
      {
        key: "status",
        header: "Status",
        hideOnMobile: true,
        render: statusBadge,
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        width: "90px",
        hideOnMobile: true,
        render: renderActions,
      },
    ];

  // ============================
  // UI
  // ============================

  return (
    <div>
      {/* HEADER */}

      <div>
        <p className="text-xs uppercase tracking-[3px] text-[#E75480]">
          Management
        </p>

        <h1 className="mt-2 font-serif text-4xl text-[#E75480] md:text-5xl">
          Contact Messages
        </h1>

        <p className="mt-2 text-muted">
          View and manage messages sent from
          the contact page.
        </p>
      </div>

      {/* TABLE */}

      <CustomTable
        className="mt-10"
        columns={columns}
        rows={messages}
        rowKey={(message) => message._id}
        loading={loading}
        loadingMessage="Loading messages..."
        emptyIcon="✉"
        emptyTitle="No messages yet"
        emptyMessage="Messages sent from the contact page will show up here."
        minWidth="1000px"
        mobileTitle={(message) =>
          message.subject
        }
        mobileSubtitle={(message) =>
          message.name
        }
        mobileBadge={statusBadge}
        mobileActions={renderActions}
      />

      {/* ============================ */}
      {/* MESSAGE DETAILS              */}
      {/* ============================ */}

      <DialogBox
        open={Boolean(selectedMessage)}
        onClose={() =>
          setSelectedMessage(null)
        }
        eyebrow="Contact Message"
        title={
          selectedMessage?.subject ??
          "Message"
        }
        size="md"
        cancelLabel="Close"
      >
        {selectedMessage && (
          <div className="space-y-5 text-sm">
            <div>
              <p className="text-xs uppercase tracking-[1px] text-muted">
                From
              </p>

              <p className="mt-1 text-ink">
                {selectedMessage.name}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[1px] text-muted">
                Email
              </p>

              <p className="mt-1 break-words text-ink">
                {selectedMessage.email}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[1px] text-muted">
                Status
              </p>

              <div className="mt-2">
                {statusBadge(
                  selectedMessage
                )}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[1px] text-muted">
                Message
              </p>

              <p className="mt-1 whitespace-pre-line leading-7 text-ink">
                {
                  selectedMessage.message
                }
              </p>
            </div>
          </div>
        )}
      </DialogBox>

      {/* ============================ */}
      {/* DELETE CONFIRMATION          */}
      {/* ============================ */}

      <DialogBox
        open={Boolean(messageToDelete)}
        onClose={() =>
          setMessageToDelete(null)
        }
        eyebrow="Confirm"
        title="Delete message?"
        description={
          messageToDelete
            ? `The message from ${messageToDelete.name} will be removed. This cannot be undone.`
            : undefined
        }
        size="sm"
        destructive
        confirmLabel="Delete"
        submittingLabel="Deleting..."
        submitting={deleting}
        onConfirm={confirmDelete}
      >
        <p className="text-sm text-muted">
          You will lose the customer's
          contact details along with the
          message.
        </p>
      </DialogBox>
    </div>
  );
}
