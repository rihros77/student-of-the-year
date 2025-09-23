import StudentCard from "@/components/students/StudentCard";

export default function Leaderboard({ students = [] }) {
  if (!students.length) {
    return <p className="text-center mt-4">No students found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {students.map((student) => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  );
}
