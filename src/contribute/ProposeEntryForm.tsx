import { useState } from "react";
import ProposeEntryRecord from "./ProposeEntryRecord";
import './proposeEntry.css'; // Import the CSS file

export default function App() {
  const [formData, setFormData] = useState({ name: "", email: "" });

  const handleChange = (e : any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e : any) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4">React Form</h2>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
          required
        />
        <p/>
        <ProposeEntryRecord/>
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">Submit</button>
      </form>
    </div>
  );
}
