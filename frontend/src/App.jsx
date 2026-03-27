import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center px-6">
      
      <div className="max-w-5xl w-full text-center">
        
        {/* Badge */}
        <div className="mb-6">
          <span className="px-4 py-1 text-sm rounded-full bg-white/10 backdrop-blur border border-white/20">
            🚀 Hackathon Project
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          VS Code
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
          Building innovative solutions with AI, modern web technologies, and scalable backend systems.
        </p>

        {/* Team Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Member 1 */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg hover:scale-105 transition">
            <h2 className="text-xl font-semibold">Vrajesh Sharma</h2>
            <p className="text-sm text-gray-400 mt-2">
              Team Lead • AI/ML Developer
            </p>
          </div>

          {/* Member 2 */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg hover:scale-105 transition">
            <h2 className="text-xl font-semibold">Krina Parmar</h2>
            <p className="text-sm text-gray-400 mt-2">
              Frontend Developer
            </p>
          </div>

          {/* Member 3 */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg hover:scale-105 transition">
            <h2 className="text-xl font-semibold">Hardik Manglani</h2>
            <p className="text-sm text-gray-400 mt-2">
              Backend Developer
            </p>
          </div>

        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">
          <a
            href="https://github.com/Vrajesh-Sharma"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition font-semibold"
          >
            View Project
          </a>
          <button className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;