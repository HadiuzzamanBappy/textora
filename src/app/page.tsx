import React from "react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white font-sans">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-3 animate-pulse">
          Textora
        </h1>
        <p className="text-slate-400 text-lg">
          Root project initialized. Ready for development.
        </p>
      </div>
    </main>
  );
}


