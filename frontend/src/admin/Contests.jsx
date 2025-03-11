import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ManageContests = () => {
  const [contests, setContests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: new Date(),
    endTime: new Date(),
    difficulty: "",
    rules: "",
    status: "Upcoming",
    allowedLanguages: "",
    maxAttempts: "",
    problems: [
      { question: "", options: ["", "", "", ""], correctOption: null },
    ],
  });
  console.log(form)

  const fetchContests = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/contest", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid response format");

      setContests(data);
      console.log(data)
    } catch (error) {
      console.log(error)
      console.error("Error fetching contests:", error.message);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]:
        name === "allowedLanguages"
          ? value.split(",").map((lang) => lang.trim())
          : value,
    }));
  };

  const addQuestion = () => {
    setForm((prevForm) => ({
      ...prevForm,
      problems: [
        ...prevForm.problems,
        { question: "", options: ["", "", "", ""], correctOption: 0 },
      ],
    }));
  };
  const handleQuestionChange = (qIndex, field, value) => {
    setForm((prevForm) => {
      const updatedproblems = [...prevForm.problems];
      updatedproblems[qIndex] = {
        ...updatedproblems[qIndex],
        [field]: value,
      };
      return { ...prevForm, problems: updatedproblems };
    });
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updatedproblems = [...form.problems];
    updatedproblems[qIndex].options[optIndex] = value;
    setForm((prevForm) => ({ ...prevForm, problems: updatedproblems }));
  };

  const handleCorrectOptionChange = (qIndex, optIndex) => {
    const updatedproblems = [...form.problems];
    updatedproblems[qIndex].correctOption = optIndex;
    setForm((prevForm) => ({ ...prevForm, problems: updatedproblems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:5000/api/contest",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();
      console.log("data" , data)
      alert("Contest created successfully!");
      fetchContests();
      setForm({
        title: "",
        description: "",
        startTime: new Date(),
        endTime: new Date(),
        difficulty: "",
        rules: "",
        status: "Upcoming",
        allowedLanguages: "",
        maxAttempts: "",
        problems: [],
      });
    } catch (error) {
      console.error("Error creating contest:", error.message);
    }
  };

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
      <h2 className="text-4xl font-bold mb-6 text-center text-blue-400">
        Manage Contests
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-3xl mx-auto"
      >
        <input
          type="text"
          name="title"
          placeholder="Contest Title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full p-3 mb-3 border rounded bg-gray-700 text-white"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
          className="w-full p-3 mb-3 border rounded bg-gray-700 text-white"
        />

        <label className="text-gray-300">Start Time</label>
        <DatePicker
          selected={form.startTime}
          onChange={(date) => setForm({ ...form, startTime: date })}
          showTimeSelect
          dateFormat="Pp"
          className="w-full p-3 mb-3 border rounded bg-gray-700 text-white"
        />

        <label className="text-gray-300">End Time</label>
        <DatePicker
          selected={form.endTime}
          onChange={(date) => setForm({ ...form, endTime: date })}
          showTimeSelect
          dateFormat="Pp"
          className="w-full p-3 mb-3 border rounded bg-gray-700 text-white"
        />

        <input
          type="text"
          name="difficulty"
          placeholder="Difficulty"
          value={form.difficulty}
          onChange={handleChange}
          required
          className="w-full p-3 mb-3 border rounded bg-gray-700 text-white"
        />
        <textarea
          name="rules"
          placeholder="Rules"
          value={form.rules}
          onChange={handleChange}
          required
          className="w-full p-3 mb-3 border rounded bg-gray-700 text-white"
        />
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded bg-gray-700 text-white"
        >
          <option value="Upcoming">Upcoming</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
        </select>
        <input
          type="text"
          name="allowedLanguages"
          placeholder="Allowed Languages (comma-separated)"
          value={form.allowedLanguages}
          onChange={handleChange}
          required
          className="w-full p-3 mb-3 border rounded bg-gray-700 text-white"
        />
        <input
          type="number"
          name="maxAttempts"
          placeholder="Max Attempts"
          value={form.maxAttempts}
          onChange={handleChange}
          required
          className="w-full p-3 mb-3 border rounded bg-gray-700 text-white"
        />

        <button
          type="button"
          onClick={addQuestion}
          className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 mb-3"
        >
          Add Question
        </button>

        {form.problems.map((q, qIndex) => (
          <div key={qIndex} className="mb-3 bg-gray-700 p-3 rounded-lg">
            <input
              type="text"
              placeholder="Question"
              value={q.question}
              onChange={(e) =>
                handleQuestionChange(qIndex, "question", e.target.value)
              }
              className="w-full p-2 border rounded bg-gray-800 text-white mb-2"
            />

            {q.options.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center mb-2">
                <input
                  type="text"
                  placeholder={`Option ${optIndex + 1}`}
                  value={option}
                  onChange={(e) =>
                    handleOptionChange(qIndex, optIndex, e.target.value)
                  }
                  className="w-full p-2 border rounded bg-gray-800 text-white mr-2"
                />
                <input
                  type="radio"
                  name={`correctOption-${qIndex}`}
                  checked={q.correctOption === optIndex}
                  onChange={() => handleCorrectOptionChange(qIndex, optIndex)}
                  className="w-5 h-5"
                />
              </div>
            ))}
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          Create Contest
        </button>
      </form>

      <table className="w-full mt-6 border-collapse border border-gray-700 text-white">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-3 border border-gray-600">Title</th>
            <th className="p-3 border border-gray-600">Difficulty</th>
            <th className="p-3 border border-gray-600">Status</th>
          </tr>
        </thead>
        <tbody>
          {getFilteredContests().map((contest, index) => (
            <tr key={index} className="bg-gray-700 hover:bg-gray-600">
              <td className="p-3 border border-gray-600">{contest.title}</td>
              <td className="p-3 border border-gray-600">
                {contest.difficulty}
              </td>
              <td className="p-3 border border-gray-600">{contest.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageContests;