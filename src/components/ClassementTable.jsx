import { useState } from "react";

export default function ClassementTable({ classement }) {
  const [sortKey, setSortKey] = useState("points");
  const [sortOrder, setSortOrder] = useState("desc");

  const sortedClassement = [...classement].sort((a, b) => {
    const valA = a[sortKey] ?? 0;
    const valB = b[sortKey] ?? 0;

    if (typeof valA === "string") {
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  return (
    <table className="classement-table">
      <thead>
        <tr>
          <th>#</th>
          <th onClick={() => handleSort("displayName")} style={{ cursor: "pointer" }}>
            Joueur {sortKey === "displayName" && (sortOrder === "asc" ? "▲" : "▼")}
          </th>
          <th onClick={() => handleSort("points")} style={{ cursor: "pointer" }}>
            Points {sortKey === "points" && (sortOrder === "asc" ? "▲" : "▼")}
          </th>
          <th>V</th>
          <th>N</th>
          <th>D</th>
          <th>BP</th>
          <th>BC</th>
        </tr>
      </thead>
      <tbody>
        {sortedClassement.map((c, idx) => (
          <tr key={c.uid || idx}>
            <td>{idx + 1}</td>
            <td>{c.displayName || c.uid}</td>
            <td>{c.points}</td>
            <td>{c.victoires}</td>
            <td>{c.nul}</td>
            <td>{c.defaites}</td>
            <td>{c.bp ?? 0}</td>
            <td>{c.bc ?? 0}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}