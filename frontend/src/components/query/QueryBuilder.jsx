import { useState, useEffect } from "react";
import { optimizeQuery, simulateCost } from "../../api/schemaLenzApi";

const DB_TEMPLATES = {
    "Social Media": [
        {
            id: "posts_by_user",
            label: "Find all posts by a user",
            sql: "SELECT Users.name, Posts.content FROM Users JOIN Posts ON Users.user_id = Posts.user_id WHERE Users.name = 'Alice'"
        },
        {
            id: "top_liked_posts",
            label: "Top liked posts with author name",
            sql: "SELECT Users.name, Posts.likes FROM Posts JOIN Users ON Posts.user_id = Users.user_id ORDER BY Posts.likes DESC"
        },
        {
            id: "post_comments",
            label: "Comments on a post with user info",
            sql: "SELECT Comments.content, Users.name FROM Comments JOIN Users ON Comments.user_id = Users.user_id WHERE Comments.post_id = 101"
        }
    ],
    "University": [
        {
            id: "student_courses",
            label: "Courses taken by a specific student",
            sql: "SELECT Students.name, Courses.course_name FROM Students JOIN Enrollments ON Students.student_id = Enrollments.student_id JOIN Courses ON Enrollments.course_id = Courses.course_id WHERE Students.name = 'John Doe'"
        },
        {
            id: "course_enrollments",
            label: "List students enrolled in a course",
            sql: "SELECT Courses.course_name, Students.name FROM Courses JOIN Enrollments ON Courses.course_id = Enrollments.course_id JOIN Students ON Enrollments.student_id = Students.student_id WHERE Courses.course_name = 'Database Systems'"
        },
        {
            id: "dept_courses",
            label: "Courses by department",
            sql: "SELECT course_name, credits FROM Courses WHERE department = 'Computer Science'"
        }
    ],
    "Employee": [
        {
            id: "emp_dept",
            label: "Employees in a department",
            sql: "SELECT name, position FROM Employees WHERE department = 'Engineering'"
        },
        {
            id: "project_managers",
            label: "Projects managed by specific employees",
            sql: "SELECT Projects.project_name, Employees.name FROM Projects JOIN Employees ON Projects.manager_id = Employees.emp_id"
        }
    ]
};

export default function QueryBuilder({ onPlan, currentDB = "Social Media", databases = {}, baseRowCount = 10 }) {
    const templates = [
        { id: "custom", label: "Custom Query...", sql: "-- Enter custom SQL here" },
        ...(DB_TEMPLATES[currentDB] || [])
    ];

    const [selectedTemplate, setSelectedTemplate] = useState("custom");
    const [sql, setSql] = useState(templates[0].sql);
    const [loading, setLoading] = useState(false);

    // Reset when DB changes
    useEffect(() => {
        const firstTemplate = templates[0];
        setSelectedTemplate(firstTemplate.id);
        setSql(firstTemplate.sql);
    }, [currentDB]);

    const handleTemplateChange = (e) => {
        const tId = e.target.value;
        setSelectedTemplate(tId);
        const template = templates.find(t => t.id === tId);
        if (template) {
            setSql(template.sql);
        }
    };

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            // Calculate actual row counts for all tables in the current DB
            const dbTables = databases[currentDB] || [];
            const tableStats = {};
            dbTables.forEach(t => {
                tableStats[t.name] = t.data ? t.data.length : 0;
            });

            // If the user hasn't decomposed yet, the "Universal" file is the source
            const universalFile = dbTables.find(t => t.name.includes("Universal"));
            const universalCount = universalFile?.data?.length || baseRowCount;

            const optRes = await optimizeQuery(sql, tableStats);
            
            // For the join cost comparison card, we'll use the costs from the optimized plan
            // or fall back to realistic defaults if the plan doesn't have multiple branches
            const plan = optRes.data.optimizedPlan;
            let leftRows = universalCount;
            let rightRows = Math.round(universalCount / 2);

            // If it's a join, try to get actual branch costs
            if (plan && plan.children && plan.children.length > 0) {
                const child = plan.children[0];
                if (child.name.includes("JOIN") && child.children && child.children.length > 1) {
                    leftRows = child.children[0].cost || leftRows;
                    rightRows = child.children[1].cost || rightRows;
                }
            }

            const costRes = await simulateCost(leftRows, rightRows);
            
            onPlan({
                original: optRes.data.originalPlan,
                optimized: optRes.data.optimizedPlan,
                cost: costRes.data
            });
        } catch (error) {
            console.error("Query optimization failed", error);
            alert("Error parsing SQL or optimizing. Ensure JSqlParser can handle the syntax.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="query-builder">
            <div className="input-group" style={{ marginBottom: "16px" }}>
                <label className="section-label" style={{ display: "block", marginBottom: "8px", color: "#63f7ff", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Query Templates
                </label>
                <select 
                    value={selectedTemplate} 
                    onChange={handleTemplateChange}
                    style={{
                        width: "100%", padding: "10px 14px", background: "#0e0e13", color: "#e4e1e9",
                        border: "1px solid #3a494a", borderRadius: "8px", fontFamily: "Space Grotesk",
                        fontSize: "13px", cursor: "pointer", outline: "none"
                    }}
                >
                    {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                </select>
            </div>

            <div className="input-group">
                <label className="section-label" style={{ color: "#63f7ff", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>SQL Query Editor</label>
                <textarea 
                    className="mono-code"
                    rows={6}
                    value={sql}
                    onChange={e => { setSql(e.target.value); setSelectedTemplate("custom"); }}
                    placeholder="-- Enter SELECT statement here..."
                    style={{marginTop: '0.5rem', width: '100%', padding: '12px', background: '#0e0e13', color: '#e4e1e9', border: '1px solid #3a494a', borderRadius: '8px', fontFamily: 'Fira Code, monospace', fontSize: '13px', resize: 'vertical'}}
                />
            </div>
            
            <div style={{marginTop: '24px'}}>
                <button 
                    onClick={handleAnalyze} 
                    disabled={loading}
                    style={{
                        background: "#8fdb00", color: "#003739", border: "none", padding: "12px 24px",
                        borderRadius: "8px", fontFamily: "Space Grotesk", fontSize: "13px", fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                        transition: "all 0.2s"
                    }}
                >
                    {loading ? "PROCESSING QUERY..." : "RUN VISUAL EXECUTION"}
                </button>
            </div>
        </div>
    );
}