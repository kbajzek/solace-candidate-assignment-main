"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Advocate = {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
  createdAt: string;
};

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search")?.trim() || "";
  const initialPage = parseInt(searchParams.get("page") || "1");

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const limit = 10;

  useEffect(() => {
    const urlSearch = searchParams.get("search")?.trim() || "";
    const urlPage = parseInt(searchParams.get("page") || "1");
    setSearchTerm(urlSearch);
    setPage(urlPage);
  }, [searchParams]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData(searchTerm, page);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, page]);

  const fetchData = async (query: string, page: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/advocates?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );
      const json = await res.json();
      setAdvocates(json.data);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateUrl = (newSearch: string, newPage: number) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    if (newPage > 1) params.set("page", newPage.toString());
    router.push(`/?${params.toString()}`);
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setPage(1);
    updateUrl(newValue.trim(), 1);
  };

  const onReset = () => {
    setSearchTerm("");
    setPage(1);
    updateUrl("", 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      updateUrl(searchTerm.trim(), newPage);
    }
  };

  return (
    <main style={{ margin: "24px" }}>
      <div className="mt-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">Solace Advocates</h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
          <label htmlFor="search" className="text-sm font-medium text-gray-700">
            Search:
          </label>

          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Name, city, degree, specialty..."
            className="w-full sm:w-64 px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <button
            onClick={onReset}
            className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Reset
          </button>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          Searching for: <span className="font-medium">{searchTerm || "—"}</span>
        </p>
      </div>

      <br />
      <p className="min-h-[24px] text-sm text-gray-400 mt-2">
        {loading ? "Refreshing results..." : ""}
      </p>

      <div className="overflow-x-auto mt-6">
        <table className="min-w-full border border-gray-200 text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 border-b">First Name</th>
              <th className="px-4 py-3 border-b">Last Name</th>
              <th className="px-4 py-3 border-b">City</th>
              <th className="px-4 py-3 border-b">Degree</th>
              <th className="px-4 py-3 border-b">Specialties</th>
              <th className="px-4 py-3 border-b">Years of Experience</th>
              <th className="px-4 py-3 border-b">Phone Number</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {advocates.map((advocate) => (
              <tr key={advocate.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{advocate.firstName}</td>
                <td className="px-4 py-2">{advocate.lastName}</td>
                <td className="px-4 py-2">{advocate.city}</td>
                <td className="px-4 py-2">{advocate.degree}</td>
                <td className="px-4 py-2">{advocate.specialties.join(", ")}</td>
                <td className="px-4 py-2">{advocate.yearsOfExperience}</td>
                <td className="px-4 py-2">{advocate.phoneNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center items-center space-x-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className={`px-3 py-1.5 rounded border text-sm ${
            page === 1
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          Prev
        </button>

        <span className="text-sm text-gray-600">
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </span>

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className={`px-3 py-1.5 rounded border text-sm ${
            page === totalPages
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          Next
        </button>
      </div>
    </main>
  );
}
