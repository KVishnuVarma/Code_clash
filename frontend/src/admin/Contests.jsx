import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ManageContests = () => {
  const [contests, setContests] = useState([]);
  const [filter, setFilter] = useState("all"); // all | upcoming | ongoing | completed
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: new Date(),
    endTime: new Date(),
    difficulty: "",
    rules: "",
    allowedLanguages: "",
    maxAttempts: "",
    questions: [],
  });

  // Fetch Contests
  const fetchContests = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/contest/api/contests", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid response format");

      setContests(data);
    } catch (error) {
      console.error("Error fetching contests:", error.message);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: name === "allowedLanguages" ? value.split(",").map((lang) => lang.trim()) : value,
    }));
  };

  // Handle Question Changes
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...form.questions];
    updatedQuestions[index][field] = value;
    setForm((prevForm) => ({ ...prevForm, questions: updatedQuestions }));
  };

  // Add New Question
  const addQuestion = () => {
    setForm((prevForm) => ({
      ...prevForm,
      questions: [...prevForm.questions, { question: "", options: ["", "", "", ""], correctOption: "" }],
    }));
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/contest/api/contests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Failed to create contest: ${data.message || "Unknown error"}`);
      }

      alert("Contest created successfully!");
      fetchContests();
      setForm({
        title: "",
        description: "",
        startTime: new Date(),
        endTime: new Date(),
        difficulty: "",
        rules: "",
        allowedLanguages: "",
        maxAttempts: "",
        questions: [],
      });
    } catch (error) {
      console.error("Error creating contest:", error.message);
    }
  };

  // Filter Contests Based on Time
  const getFilteredContests = () => {
    const now = new Date();
    return contests.filter((contest) => {
      const startTime = new Date(contest.startTime);
      const endTime = new Date(contest.endTime);

      if (filter === "upcoming") return startTime > now;
      if (filter === "ongoing") return startTime <= now && endTime >= now;
      if (filter === "completed") return endTime < now;
      return true;
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <h2 className="text-4xl font-bold mb-6 text-center text-blue-400">Manage Contests</h2>

      {/* Form to Create Contest */}
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
        <input type="text" name="title" placeholder="Contest Title" value={form.title} onChange={handleChange} required className="w-full p-3 mb-3 border rounded bg-gray-700 text-white" />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required className="w-full p-3 mb-3 border rounded bg-gray-700 text-white" />

        <label className="text-gray-300">Start Time</label>
        <DatePicker selected={form.startTime} onChange={(date) => setForm({ ...form, startTime: date })} showTimeSelect dateFormat="Pp" className="w-full p-3 mb-3 border rounded bg-gray-700 text-white" />

        <label className="text-gray-300">End Time</label>
        <DatePicker selected={form.endTime} onChange={(date) => setForm({ ...form, endTime: date })} showTimeSelect dateFormat="Pp" className="w-full p-3 mb-3 border rounded bg-gray-700 text-white" />

        <input type="text" name="difficulty" placeholder="Difficulty" value={form.difficulty} onChange={handleChange} required className="w-full p-3 mb-3 border rounded bg-gray-700 text-white" />
        <textarea name="rules" placeholder="Rules" value={form.rules} onChange={handleChange} required className="w-full p-3 mb-3 border rounded bg-gray-700 text-white" />
        <input type="text" name="allowedLanguages" placeholder="Allowed Languages (comma-separated)" value={form.allowedLanguages} onChange={handleChange} required className="w-full p-3 mb-3 border rounded bg-gray-700 text-white" />
        <input type="number" name="maxAttempts" placeholder="Max Attempts" value={form.maxAttempts} onChange={handleChange} required className="w-full p-3 mb-3 border rounded bg-gray-700 text-white" />

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">Create Contest</button>
      </form>

      {/* Filter Buttons */}
      <div className="flex justify-center gap-4 mt-6">
        {["all", "upcoming", "ongoing", "completed"].map((type) => (
          <button key={type} onClick={() => setFilter(type)} className={`p-2 px-4 rounded-lg text-white ${filter === type ? "bg-blue-500" : "bg-gray-700"} hover:bg-blue-600`}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Contest Table */}
      <table className="w-full mt-6 border-collapse border border-gray-700 text-white">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-3 border border-gray-600">Title</th>
            <th className="p-3 border border-gray-600">Difficulty</th>
            <th className="p-3 border border-gray-600">Status</th>
            <th className="p-3 border border-gray-600">Participants</th>
          </tr>
        </thead>
        <tbody>
          {getFilteredContests().map((contest, index) => (
            <tr key={index} className="bg-gray-700 hover:bg-gray-600">
              <td className="p-3 border border-gray-600">{contest.title}</td>
              <td className="p-3 border border-gray-600">{contest.difficulty}</td>
              <td className="p-3 border border-gray-600">{contest.status}</td>
              <td className="p-3 border border-gray-600">{contest.totalParticipants}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageContests;
