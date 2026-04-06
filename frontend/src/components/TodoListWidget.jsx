import { useEffect, useState } from "react";
import { CalendarDays, Clock, Pencil, Trash2 } from "lucide-react";
import { useTodoStore } from "../store/useTodoStore";

const TodoListWidget = () => {
  const {
    todos,
    fetchTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
  } = useTodoStore();

  const [text, setText] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddTodo = async() => {
    if (!text.trim()) return;
    await addTodo({ text, date, time });
    setText("");
    setDate("");
    setTime("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddTodo();
    }
  };

  return (
    <div className="w-full p-4 bg-base-200 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-3">To-Do List</h2>

      {/* Add Task Input Area */}
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input
          type="text"
          placeholder="Add task..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input input-sm input-bordered flex-1 min-w-[150px]"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input input-sm input-bordered"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="input input-sm input-bordered"
        />
        <button
          onClick={handleAddTodo}
          className="btn btn-sm btn-primary whitespace-nowrap"
        >
          Add +
        </button>
      </div>

      {/* Task List */}
      <ul className="space-y-2 overflow-auto">
        {todos.map((todo) => (
          <li
            key={todo._id}
            className={`p-3 rounded-lg flex flex-col bg-base-100 shadow ${
              todo.done ? "line-through text-gray-400" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm rounded-full"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo._id)}
                />
                <span className="text-base">{todo.text}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Pencil
                  size={16}
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => alert("Edit coming soon")}
                />
                <div className="w-px h-4 bg-gray-400" />
                <Trash2
                  size={16}
                  className="cursor-pointer hover:text-red-600"
                  onClick={() => deleteTodo(todo._id)}
                />
              </div>
            </div>

            {(todo.date || todo.time) && (
              <div className="text-xs text-gray-400 mt-1 flex gap-4 ml-6">
                {todo.date && (
                  <span className="flex items-center gap-1">
                    <CalendarDays size={14} />
                    {new Date(todo.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
                {todo.time && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(`2025-01-01T${todo.time}`).toLocaleTimeString(
                      "en-US",
                      { hour: "2-digit", minute: "2-digit", hour12: true }
                    )}
                  </span>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoListWidget;


// ============ Working TodoListWidget.jsx without UI/UX enhancements ========

// import { useEffect, useState } from "react";
// import { CalendarDays, Clock, Pencil, Trash2, X } from "lucide-react";
// import { useTodoStore } from "../store/useTodoStore";

// const TodoListWidget = () => {
//   const {
//     todos,
//     fetchTodos,
//     addTodo,
//     toggleTodo,
//     deleteTodo,
//     updateTodo,
//   } = useTodoStore();

//   const [newTodo, setNewTodo] = useState("");
//   const [newDate, setNewDate] = useState("");
//   const [newTime, setNewTime] = useState("");
//   const [editingTask, setEditingTask] = useState(null);
//   const [editText, setEditText] = useState("");
//   const [editDate, setEditDate] = useState("");
//   const [editTime, setEditTime] = useState("");

//   useEffect(() => {
//     fetchTodos();
//   }, []);

//   const handleAddTodo = async () => {
//     if (!newTodo.trim()) return;
//     await addTodo(newTodo, newDate, newTime);
//     setNewTodo("");
//     setNewDate("");
//     setNewTime("");
//   };

//   const handleEditClick = (task) => {
//     setEditingTask(task);
//     setEditText(task.text);
//     setEditDate(task.date || "");
//     setEditTime(task.time || "");
//   };

//   const handleSaveEdit = () => {
//     updateTodo({
//       ...editingTask,
//       text: editText,
//       date: editDate,
//       time: editTime,
//     });
//     setEditingTask(null);
//   };

//   return (
//     <div className="w-full max-w-full overflow-hidden">
//       <h2 className="text-xl font-semibold mb-4">📝 To-Do List</h2>

//       {/* Add Task Section */}
//       <div className="bg-base-200 p-4 rounded-lg shadow mb-6">
//         <div className="flex items-center gap-2 mb-2">
//           <input
//             type="text"
//             value={newTodo}
//             onChange={(e) => setNewTodo(e.target.value)}
//             placeholder="Add a task..."
//             className="input input-bordered flex-1 text-sm px-3 py-2"
//           />
//           <button
//             onClick={handleAddTodo}
//             className="btn btn-sm btn-primary px-4 py-2"
//           >
//             Add +
//           </button>
//         </div>
//         <div className="flex items-center gap-3">
//           <div className="flex items-center gap-1 w-full">
//             <CalendarDays size={16} />
//             <input
//               type="date"
//               value={newDate}
//               onChange={(e) => setNewDate(e.target.value)}
//               className="input input-bordered input-sm w-full"
//             />
//           </div>
//           <div className="flex items-center gap-1 w-full">
//             <Clock size={16} />
//             <input
//               type="time"
//               value={newTime}
//               onChange={(e) => setNewTime(e.target.value)}
//               className="input input-bordered input-sm w-full"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Task List */}
//       <ul className="space-y-3 overflow-y-auto max-h-[calc(100vh-300px)] pr-1">
//         {todos.map((todo) => (
//           <li
//             key={todo._id}
//             className={`p-3 rounded-md bg-base-100 shadow flex flex-col gap-2 ${
//               todo.done ? "line-through text-gray-400" : ""
//             }`}
//           >
//             <div className="flex justify-between items-center">
//               <div className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   checked={todo.done}
//                   onChange={() => toggleTodo(todo._id)}
//                   className="checkbox checkbox-sm"
//                 />
//                 <span className="text-sm">{todo.text}</span>
//               </div>
//               <div className="flex items-center gap-2 text-gray-500">
//                 <Pencil
//                   size={16}
//                   className="cursor-pointer hover:text-blue-500"
//                   onClick={() => handleEditClick(todo)}
//                 />
//                 <div className="h-4 w-px bg-gray-400" />
//                 <Trash2
//                   size={16}
//                   className="cursor-pointer hover:text-red-500"
//                   onClick={() => deleteTodo(todo._id)}
//                 />
//               </div>
//             </div>
//             {(todo.date || todo.time) && (
//               <div className="text-xs text-gray-500 ml-6 flex gap-4">
//                 {todo.date && (
//                   <span className="flex items-center gap-1">
//                     <CalendarDays size={12} />
//                     {new Date(todo.date).toLocaleDateString("en-GB", {
//                       day: "numeric",
//                       month: "short",
//                       year: "numeric",
//                     })}
//                   </span>
//                 )}
//                 {todo.time && (
//                   <span className="flex items-center gap-1">
//                     <Clock size={12} />
//                     {todo.time}
//                   </span>
//                 )}
//               </div>
//             )}
//           </li>
//         ))}
//       </ul>

//       {/* Edit Task Modal */}
//       {editingTask && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md relative">
//             <button
//               onClick={() => setEditingTask(null)}
//               className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
//             >
//               <X size={20} />
//             </button>
//             <h3 className="text-lg font-semibold mb-4">Edit Task</h3>
//             <input
//               type="text"
//               value={editText}
//               onChange={(e) => setEditText(e.target.value)}
//               className="input input-bordered w-full mb-3"
//             />
//             <input
//               type="date"
//               value={editDate}
//               onChange={(e) => setEditDate(e.target.value)}
//               className="input input-bordered w-full mb-3"
//             />
//             <input
//               type="time"
//               value={editTime}
//               onChange={(e) => setEditTime(e.target.value)}
//               className="input input-bordered w-full mb-4"
//             />
//             <button onClick={handleSaveEdit} className="btn btn-primary w-full">
//               Save Changes
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TodoListWidget;


// import { useEffect, useState } from "react";
// import { CalendarDays, Clock, Pencil, Trash2 } from "lucide-react";
// import TaskItem from "./TaskItem";
// import { useTodoStore } from "../store/useTodoStore";

// const TodoListWidget = () => {
//   const {
//     todos,
//     fetchTodos,
//     addTodo,
//     toggleTodo,
//     deleteTodo,
//     updateTodo,
//   } = useTodoStore();

//   const [newTodo, setNewTodo] = useState("");
//   const [editingTask, setEditingTask] = useState(null);

//   useEffect(() => {
//     fetchTodos();
//   }, []);

//   const handleAddTodo = () => {
//     if (!newTodo.trim()) return;
//     addTodo(newTodo);
//     setNewTodo("");
//   };

//   const handleSaveEdit = (updatedTask) => {
//     updateTodo(updatedTask);
//     setEditingTask(null);
//   };

//   return (
//     <div className="w-full">
//       <h2 className="text-lg font-semibold mb-3">To-Do List</h2>
//       <div className="flex gap-2 mb-3">
//         <input
//           type="text"
//           value={newTodo}
//           onChange={(e) => setNewTodo(e.target.value)}
//           className="input input-sm input-bordered w-full"
//           placeholder="Add task..."
//         />
//         <button onClick={handleAddTodo} className="btn btn-sm btn-primary">
//           Add
//         </button>
//       </div>
//       <ul className="space-y-2">
//         {todos.map((todo) => (
//           <li
//             key={todo._id}
//             className={`p-3 rounded-lg flex flex-col bg-base-100 shadow ${
//               todo.done ? "line-through text-gray-400" : ""
//             }`}
//           >
//             <div className="flex items-center justify-between gap-3">
//               <div className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   className="checkbox checkbox-sm rounded-full"
//                   checked={todo.done}
//                   onChange={() => toggleTodo(todo._id)}
//                 />
//                 <span className="text-base">{todo.text}</span>
//               </div>
//               <div className="flex items-center gap-2 text-sm text-gray-500">
//                 <Pencil
//                   size={16}
//                   className="cursor-pointer hover:text-blue-600"
//                   onClick={() => setEditingTask(todo)}
//                 />
//                 <div className="w-px h-4 bg-gray-400" />
//                 <Trash2
//                   size={16}
//                   className="cursor-pointer hover:text-red-600"
//                   onClick={() => deleteTodo(todo._id)}
//                 />
//               </div>
//             </div>
//             {(todo.date || todo.time) && (
//               <div className="text-xs text-gray-400 mt-1 flex gap-4 ml-6">
//                 {todo.date && (
//                   <span className="flex items-center gap-1">
//                     <CalendarDays size={14} />
//                     {new Date(todo.date).toLocaleDateString("en-GB", {
//                       day: "numeric",
//                       month: "long",
//                       year: "numeric",
//                     })}
//                   </span>
//                 )}
//                 {todo.time && (
//                   <span className="flex items-center gap-1">
//                     <Clock size={14} />
//                     {new Date(`2025-01-01T${todo.time}`).toLocaleTimeString("en-US", {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </span>
//                 )}
//               </div>
//             )}
//           </li>
//         ))}
//       </ul>

//       {editingTask && (
//         <TaskItem
//           task={editingTask}
//           isOpen={true}
//           onClose={() => setEditingTask(null)}
//           onSave={handleSaveEdit}
//         />
//       )}
//     </div>
//   );
// };

// export default TodoListWidget;


