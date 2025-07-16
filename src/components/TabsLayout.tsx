
export default function TabsLayout({ children, onLogout }) {
  return (
    <div>
      <header className="bg-gray-800 text-white p-4 flex justify-between">
        <h1 className="text-lg font-bold">ClubConnect</h1>
        <button onClick={onLogout} className="bg-red-500 px-4 py-1 rounded">Logout</button>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
