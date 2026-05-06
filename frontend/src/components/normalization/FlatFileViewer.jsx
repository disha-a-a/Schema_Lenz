import React, { useState } from "react";
import * as SocialDB from "../../data/socialDB";
import * as UniversityDB from "../../data/universityDB";
import * as EmployeeDB from "../../data/employeeDB";
import { Database } from "lucide-react";

export default function FlatFileViewer() {
  const [selectedDB, setSelectedDB] = useState("Social");

  const DB_DATA = {
    "Social": SocialDB.Social_Universal_Flat_File,
    "University": UniversityDB.University_Universal_Flat_File,
    "Employee": EmployeeDB.Employee_Universal_Flat_File
  };

  const data = DB_DATA[selectedDB];
  if (!data || data.length === 0) return null;

  const headers = Object.keys(data[0]);

  // Logic to identify redundancy: group by the first column (usually the primary ID)
  const firstCol = headers[0];
  const counts = data.reduce((acc, row) => {
    acc[row[firstCol]] = (acc[row[firstCol]] || 0) + 1;
    return acc;
  }, {});

  // Attributes that typically repeat in these unnormalized datasets
  const redundantFields = ["name", "email", "city", "s_name", "s_dept", "c_name", "inst_name", "emp_name", "dept_name", "dept_manager", "project_name"];

  return (
    <div style={{ padding: "24px", background: "#131318", height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontFamily: "Space Grotesk", fontSize: "18px", color: "#63f7ff", marginBottom: "4px" }}>
            Unnormalized Universal Relation
          </h2>
          <p style={{ color: "#849495", fontSize: "12px" }}>
            Choose a database to view its flat file. Notice the redundant data patterns highlighted in red.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {Object.keys(DB_DATA).map(db => (
            <button
              key={db}
              onClick={() => setSelectedDB(db)}
              style={{
                padding: "8px 16px", borderRadius: "8px", border: "1px solid",
                fontFamily: "Space Grotesk", fontSize: "12px", fontWeight: 700,
                cursor: "pointer", transition: "all 0.2s",
                background: selectedDB === db ? "rgba(99, 247, 255, 0.1)" : "#1b1b20",
                color: selectedDB === db ? "#63f7ff" : "#849495",
                borderColor: selectedDB === db ? "#63f7ff" : "#3a494a",
              }}
            >
              {db}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #3a494a", borderRadius: "8px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#e4e1e9" }}>
          <thead>
            <tr style={{ background: "#1b1b20", borderBottom: "1px solid #3a494a" }}>
              {headers.map(h => (
                <th key={h} style={{ padding: "12px", textAlign: "left", color: "#63f7ff", fontWeight: 700, textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.05em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const isRedundant = counts[row[firstCol]] > 1;
              return (
                <tr key={i} style={{ 
                  borderBottom: "1px solid #2a292f", 
                  background: isRedundant ? "rgba(255, 75, 137, 0.05)" : "transparent",
                  transition: "background 0.2s"
                }}>
                  {headers.map(h => (
                    <td key={h} style={{ 
                      padding: "12px", 
                      color: redundantFields.includes(h) && isRedundant ? "#ff4b89" : "inherit",
                      fontWeight: redundantFields.includes(h) && isRedundant ? 600 : 400
                    }}>
                      {row[h] || <span style={{ color: "#3a494a" }}>NULL</span>}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
