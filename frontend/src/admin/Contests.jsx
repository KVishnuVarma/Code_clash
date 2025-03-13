import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";

function App() {
  const [contests, setContests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState({});
  const [selectedContest, setSelectedContest] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
    problems: [{ question: "", options: ["", "", "", ""], correctOption: 0 }],
  });

  const fetchContests = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/contest", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid response format");

      // Update status if endTime has passed
      const now = new Date();
      const updatedContests = data.map((contest) => {
        const endTime = new Date(contest.endTime);
        const startTime = new Date(contest.startTime);
        
        // Determine status based on time
        if (endTime < now) {
          contest.status = "Completed";
        } else if (startTime <= now && endTime >= now) {
          contest.status = "Ongoing";
        } else {
          contest.status = "Upcoming";
        }
        
        return contest;
      });

      setContests(updatedContests);
    } catch (error) {
      console.error("Error fetching contests:", error.message);
    }
  };

  useEffect(() => {
    fetchContests();
    // Set up an interval to check contest status every minute
    const interval = setInterval(fetchContests, 60000);
    return () => clearInterval(interval);
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

  const toggleOptions = (index) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleQuestionChange = (qIndex, field, value) => {
    setForm((prevForm) => {
      const updatedProblems = [...prevForm.problems];
      updatedProblems[qIndex] = {
        ...updatedProblems[qIndex],
        [field]: value,
      };
      return { ...prevForm, problems: updatedProblems };
    });
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updatedProblems = [...form.problems];
    updatedProblems[qIndex].options[optIndex] = value;
    setForm((prevForm) => ({ ...prevForm, problems: updatedProblems }));
  };

  const handleCorrectOptionChange = (qIndex, optIndex) => {
    const updatedProblems = [...form.problems];
    updatedProblems[qIndex].correctOption = optIndex;
    setForm((prevForm) => ({ ...prevForm, problems: updatedProblems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/contest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      await response.json();
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

  const openModal = async (contest) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/contest/${contest._id}/participants`
      );
      const participantData = await response.json();
      setSelectedContest({ ...contest, ...participantData });
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching participant data:", error);
    }
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

        <div className="flex items-center gap-9 mb-3">
          <div className="w-1/2 flex flex-col">
            <label className="text-gray-300 mb-2">Start Time</label>
            <DatePicker
              selected={form.startTime}
              onChange={(date) => setForm({ ...form, startTime: date })}
              showTimeSelect
              dateFormat="Pp"
              className="w-full p-4 mt-2 border rounded bg-gray-700 text-white"
            />
          </div>

          <div className="w-1/2 flex flex-col">
            <label className="text-gray-300 mb-2">End Time</label>
            <DatePicker
              selected={form.endTime}
              onChange={(date) => setForm({ ...form, endTime: date })}
              showTimeSelect
              dateFormat="Pp"
              className="w-full p-4 mt-2 border rounded bg-gray-700 text-white"
            />
          </div>
        </div>

        <select
          name="difficulty"
          value={form.difficulty}
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded bg-gray-700 text-white"
        >
          <option value="">Select Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
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
            <div className="flex justify-between items-center">
              <input
                type="text"
                placeholder="Question"
                value={q.question}
                onChange={(e) =>
                  handleQuestionChange(qIndex, "question", e.target.value)
                }
                className="w-full p-2 border rounded bg-gray-800 text-white"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOptions(qIndex);
                }}
                className="ml-2 text-white p-2 rounded-full bg-gray-600 hover:bg-gray-500 transition"
              >
                {expanded[qIndex] ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>

            {expanded[qIndex] && (
              <div className="mt-2">
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
            )}
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          Create Contest
        </button>
      </form>

      <div className="flex justify-center space-x-5 mb-9 mt-7">
        {["all", "upcoming", "ongoing", "completed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg ${
              filter === status ? "bg-blue-500" : "bg-gray-700"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <table className="w-full mt-6 border-collapse border border-gray-700 text-white">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-3 border border-gray-600">Title</th>
            <th className="p-3 border border-gray-600">Difficulty</th>
            <th className="p-3 border border-gray-600">Status</th>
            <th className="p-3 border border-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {getFilteredContests().map((contest) => (
            <tr key={contest._id} className="bg-gray-700 hover:bg-gray-600">
              <td
                className="p-5 border border-gray-600 max-w-[200px] truncate"
                title={contest.title}
              >
                {contest.title.length > 30
                  ? `${contest.title.substring(0, 30)}...`
                  : contest.title}
              </td>
              <td className="p-5 border border-gray-600 text-center">
                {contest.difficulty}
              </td>
              <td className="p-3 border border-gray-600 text-center">
                {contest.status}
              </td>
              <td className="p-3 border border-gray-600 text-center">
                {contest.status === "Completed" && (
                  <button
                    onClick={() => openModal(contest)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    View Results
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && selectedContest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-white max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">
              {selectedContest.title} - Results
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-lg mb-2">Total Participants</p>
                <p className="text-3xl font-bold text-blue-400">
                  {selectedContest.totalParticipants || 0}
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-lg mb-2">Cleared Participants</p>
                <p className="text-3xl font-bold text-green-400">
                  {selectedContest.clearedParticipants || 0}
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-lg mb-2">Failed Participants</p>
                <p className="text-3xl font-bold text-red-400">
                  {selectedContest.failedParticipants || 0}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;