import { useState, useEffect } from "react";

const Admin = () => {
    const [contestData, setContestData] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
    });

    const [problemData, setProblemData] = useState({
        title: "",
        description: "",
        testCases: "",
        difficulty: "Easy",
    });

    const [contests, setContests] = useState([]);
    const [problems, setProblems] = useState([]);

    // Fetch existing contests and problems
    useEffect(() => {
        fetch("/api/contests")
            .then((res) => res.json())
            .then((data) => setContests(data))
            .catch((err) => console.error("Error fetching contests:", err));

        fetch("/api/problems")
            .then((res) => res.json())
            .then((data) => setProblems(data))
            .catch((err) => console.error("Error fetching problems:", err));
    }, []);

    // Handle input change for both contest and problem forms
    const handleChange = (e, type) => {
        if (type === "contest") {
            setContestData({ ...contestData, [e.target.name]: e.target.value });
        } else {
            setProblemData({ ...problemData, [e.target.name]: e.target.value });
        }
    };

    // Submit Contest
    const submitContest = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/create-contest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contestData),
            });
            const data = await res.json();
            if (res.ok) {
                alert("Contest created successfully!");
                setContests([...contests, data.contest]);
            } else {
                alert("Error creating contest: " + data.error);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    // Submit Problem
    const submitProblem = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/upload-problem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(problemData),
            });
            const data = await res.json();
            if (res.ok) {
                alert("Problem uploaded successfully!");
                setProblems([...problems, data.problem]);
            } else {
                alert("Error uploading problem: " + data.error);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Admin Dashboard</h2>

            {/* Create Contest Form */}
            <form onSubmit={submitContest} style={{ marginBottom: "20px" }}>
                <h3>Create Contest</h3>
                <input
                    type="text"
                    name="title"
                    placeholder="Contest Title"
                    value={contestData.title}
                    onChange={(e) => handleChange(e, "contest")}
                    required
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={contestData.description}
                    onChange={(e) => handleChange(e, "contest")}
                    required
                />
                <input
                    type="datetime-local"
                    name="startDate"
                    value={contestData.startDate}
                    onChange={(e) => handleChange(e, "contest")}
                    required
                />
                <input
                    type="datetime-local"
                    name="endDate"
                    value={contestData.endDate}
                    onChange={(e) => handleChange(e, "contest")}
                    required
                />
                <button type="submit">Create Contest</button>
            </form>

            {/* Upload Problem Form */}
            <form onSubmit={submitProblem}>
                <h3>Upload Problem</h3>
                <input
                    type="text"
                    name="title"
                    placeholder="Problem Title"
                    value={problemData.title}
                    onChange={(e) => handleChange(e, "problem")}
                    required
                />
                <textarea
                    name="description"
                    placeholder="Problem Description"
                    value={problemData.description}
                    onChange={(e) => handleChange(e, "problem")}
                    required
                />
                <textarea
                    name="testCases"
                    placeholder="Test Cases (comma separated)"
                    value={problemData.testCases}
                    onChange={(e) => handleChange(e, "problem")}
                    required
                />
                <select
                    name="difficulty"
                    value={problemData.difficulty}
                    onChange={(e) => handleChange(e, "problem")}
                    required
                >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
                <button type="submit">Upload Problem</button>
            </form>

            {/* List Contests */}
            <h3>Existing Contests</h3>
            <ul>
                {contests.map((contest) => (
                    <li key={contest._id}>
                        {contest.title} (Starts: {new Date(contest.startDate).toLocaleString()} | Ends: {new Date(contest.endDate).toLocaleString()})
                    </li>
                ))}
            </ul>

            {/* List Problems */}
            <h3>Existing Problems</h3>
            <ul>
                {problems.map((problem) => (
                    <li key={problem._id}>
                        {problem.title} - {problem.difficulty}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Admin;

