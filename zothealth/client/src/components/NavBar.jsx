import React from 'react';
export default function NavBar({ user, onLogout }) {
  return (
    <nav className="flex items-center justify-between p-4 border-b">
      <a href="/" className="font-bold">ZotHealth</a>
      <div className="space-x-4">
        <a href="/dashboard">Dashboard</a>
        <a href="/exercises">Exercises</a>
        <a href="/meal-planner">Meal Planner</a>
        {user ? (<button className="px-3 py-1 border rounded" onClick={onLogout}>Logout</button>) : (<><a href="/login">Login</a><a href="/signup">Signup</a></>)}
      </div>
    </nav>
  );
}
