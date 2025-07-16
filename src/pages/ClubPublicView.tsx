
export default function ClubPublicView({ clubId }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Public Club View</h1>
      <p>You're viewing the public profile of club ID: {clubId}</p>
    </div>
  );
}
