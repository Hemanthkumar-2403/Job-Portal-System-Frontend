import React, { useEffect, useState } from "react"; // ✅ useState ADDED
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicJobs, applyJob, fetchAppliedJobs } from "../../../redux/jobSlice";
import JobCardSeeker from "../../../components/JobCardseeker";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const FindJobs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { jobs, applied, loading, error } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);

  // ✅ SEARCH STATE (ADDED)
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchPublicJobs());
    dispatch(fetchAppliedJobs()); // <-- VERY IMPORTANT
  }, [dispatch]);

  // ✅ FILTER LOGIC (ADDED)
  const filteredJobs = jobs?.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApply = async (job) => {
    if (!user) {
      toast.error("Please login to apply.");
      navigate("/signin");
      return;
    }

    if (user.role !== "jobseeker") {
      toast.error("Only job seekers can apply.");
      return;
    }

    const result = await dispatch(applyJob(job._id));

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Applied successfully!");
      dispatch(fetchAppliedJobs()); // refresh applied list
    } else {
      toast.error(result.payload || "Failed to apply");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <h1 className="text-3xl font-semibold mb-5 text-center">Find Jobs</h1>

      {/* 🔍 SEARCH BAR – Right aligned (UI only) */}
<div className="mb-6 flex justify-end">
  <div className="relative w-full md:w-1/3">
    <input
      type="text"
      placeholder="Search jobs"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-10 pr-4 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
    />

    {/* Search Icon */}
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width="18"
      height="18"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
      />
    </svg>
  </div>
</div>


      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* ✅ ONLY CHANGE: jobs -> filteredJobs */}
        {filteredJobs?.map((job) => (
          <JobCardSeeker
            key={job._id}
            job={job}
            onApply={handleApply}
            appliedJobs={applied} // <-- SEND LIST HERE
          />
        ))}
      </div>
    </div>
  );
};

export default FindJobs;
