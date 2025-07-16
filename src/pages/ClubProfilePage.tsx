
export default function ClubProfilePage({ clubId }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Club Profile</h1>
      <p>Details for club ID: {clubId}</p>
    </div>
  );
}
