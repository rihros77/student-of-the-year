export default function StudentCard({ student }) {
  return (
    <div className="border p-4 rounded shadow mb-2 flex justify-between items-center hover:shadow-lg transition">
      <div>
        <h2 className="font-bold text-lg">{student.name}</h2>
        <p className="text-gray-600">
          Department: {student.department?.name || "N/A"}
        </p>
      </div>
      <div className="font-bold text-xl text-blue-600">
        {student.points} pts
      </div>
    </div>
  );
}
