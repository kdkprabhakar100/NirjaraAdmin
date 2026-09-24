import type { TeamMember } from "../../types/team";

type TeamTableProps = {
  members: TeamMember[];
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (member: TeamMember) => void;
};

export default function TeamTable({
  members,
  onEdit,
  onDelete,
  onToggleStatus,
}: TeamTableProps) {
  return (
    <div className="overflow-hidden rounded-[28px] bg-surface shadow-sm">

      <div className="border-b border-[#E75480]/10 px-6 py-6 sm:px-8">
        <h2 className="font-serif text-3xl text-ink">
          Team Members
        </h2>

        <p className="mt-1 text-sm text-muted">
          {members.length} team member
          {members.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="overflow-x-auto">

        <table className="w-full min-w-[900px] border-collapse">

          <thead className="bg-blush text-left text-sm text-[#E75480]">
            <tr>
              <th className="p-5">
                Photo
              </th>

              <th className="p-5">
                Name
              </th>

              <th className="p-5">
                Designation
              </th>

              <th className="p-5">
                Order
              </th>

              <th className="p-5">
                Status
              </th>

              <th className="p-5">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>

            {members.map((member) => (
              <tr
                key={member._id}
                className="border-t border-[#E75480]/10"
              >

                <td className="p-5">
                  <div className="h-16 w-16 overflow-hidden rounded-2xl bg-soft">

                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xl text-[#E75480]">
                        ♡
                      </div>
                    )}

                  </div>
                </td>

                <td className="p-5">
                  <p className="font-medium text-ink">
                    {member.name}
                  </p>

                  {member.bio && (
                    <p className="mt-1 max-w-[260px] truncate text-xs text-muted">
                      {member.bio}
                    </p>
                  )}
                </td>

                <td className="p-5 text-sm text-muted">
                  {member.designation}
                </td>

                <td className="p-5 text-sm text-muted">
                  {member.displayOrder}
                </td>

                <td className="p-5">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs ${
                      member.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {member.status}
                  </span>
                </td>

                <td className="p-5">
                  <div className="flex flex-wrap gap-2">

                    <button
                      type="button"
                      onClick={() => onEdit(member)}
                      className="rounded-full border border-[#E75480] px-4 py-2 text-xs text-[#E75480]"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onToggleStatus(member)
                      }
                      className="rounded-full bg-soft px-4 py-2 text-xs text-[#E75480]"
                    >
                      {member.status === "Active"
                        ? "Hide"
                        : "Show"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onDelete(member._id)
                      }
                      className="rounded-full bg-red-50 px-4 py-2 text-xs text-red-600"
                    >
                      Delete
                    </button>

                  </div>
                </td>

              </tr>
            ))}

            {members.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-12 text-center text-muted"
                >
                  No team members have been added yet.
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
}