import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";

const TaskItem = ({ task, isOpen, onClose, onSave }) => {
  const [name, setName] = useState(task.text);
  const [date, setDate] = useState(task.date || "");
  const [time, setTime] = useState(task.time || "");

  useEffect(() => {
    if (isOpen) {
      setName(task.text);
      setDate(task.date || "");
      setTime(task.time || "");
    }
  }, [isOpen, task]);

  const handleSave = () => {
    onSave({ ...task, text: name, date, time });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full space-y-4">
          <Dialog.Title className="text-lg font-medium">Edit Task</Dialog.Title>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Task Name"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input input-bordered w-full"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="input input-bordered w-full"
          />
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="btn btn-sm">
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-sm btn-primary">
              Save
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default TaskItem;

