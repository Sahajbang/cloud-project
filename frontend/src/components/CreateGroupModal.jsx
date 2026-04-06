import { useState } from "react";
import { useChatStore } from "../store/useChatStore";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const { users, createGroup } = useChatStore(); // You'll implement `createGroup` in the store
  const [groupName, setGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const handleUserToggle = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createGroup(groupName, selectedUserIds);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="input input-bordered w-full mb-4"
            required
          />

          <div className="max-h-60 overflow-y-auto mb-4">
            {users.map((user) => (
              <label key={user._id} className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(user._id)}
                  onChange={() => handleUserToggle(user._id)}
                  className="checkbox checkbox-sm"
                />
                <span>{user.fullName}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
