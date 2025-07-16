
export default function RoleChooserPage({ setRole }) {
  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold mb-4">Choose Your Role</h2>
      <button className="bg-purple-600 text-white px-4 py-2 m-2" onClick={() => setRole('fan')}>I'm a Fan</button>
      <button className="bg-orange-600 text-white px-4 py-2 m-2" onClick={() => setRole('club_owner')}>I'm a Club Owner</button>
    </div>
  );
}
