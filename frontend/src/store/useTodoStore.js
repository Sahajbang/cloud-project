import { create } from "zustand";
import { axiosInstance } from "../lib/axios"; // ✅ correct import

export const useTodoStore = create((set, get) => ({
  todos: [],
  loading: false,

  fetchTodos: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/tasks");
      set({ todos: res.data });
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      set({ loading: false });
    }
  },

  addTodo: async (task) => {
    try {
      const response = await axiosInstance.post("/tasks",task);
      set((state) => ({
        todos: [...state.todos, response.data],
      }));
    } catch (err) {
      console.error("❌ Failed to create task:", err.response?.data || err.message);
    }
  },

  // addTodo: async (text, date, time) => {
  //   try {
  //     const taskData = { text, date, time }; // Explicitly create the task data object
  //     const response = await axiosInstance.post("/tasks", taskData);
  //     set((state) => ({
  //       todos: [...state.todos, response.data],
  //     }));
  //   } catch (err) {
  //     console.error("❌ Failed to create task:", err.response?.data || err.message);
  //   }
  // },

  deleteTodo: async (id) => {
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      set((state) => ({
        todos: state.todos.filter((t) => t._id !== id),
      }));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  },

  toggleTodo: async (id) => {
    const { todos } = get();
    const todo = todos.find((t) => t._id === id);
    if (!todo) return;

    const updatedTodo = { ...todo, done: !todo.done };

    try {
      const res = await axiosInstance.put(`/tasks/${id}`, updatedTodo);
      set((state) => ({
        todos: state.todos.map((t) => (t._id === id ? res.data : t)),
      }));
    } catch (err) {
      console.error("Failed to toggle task status:", err);
    }
  },

  updateTodo: async (updatedTask) => {
    try {
      const res = await axiosInstance.put(`/tasks/${updatedTask._id}`, updatedTask);
      set((state) => ({
        todos: state.todos.map((t) =>
          t._id === updatedTask._id ? res.data : t
        ),
      }));
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  },
}));

