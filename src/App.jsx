import React, { useState, useEffect } from 'react';
import { Briefcase, Home, Linkedin, Github, Twitter, Mail, FileText, BookOpen, Layers, Menu, X, Book, Film, Sparkles, Loader2 } from 'lucide-react';
import profileImage from './assets/profile.jpg';
// --- Placeholder Data (Replace with your own) ---

const profile = {
  name: "Mashiur Rahman",
  email: "mashiurm2@gmail.com",
  // Using a placeholder image as local assets aren't accessible
  // The original image was logo.png
  imageUrl: "https://placehold.co/128x128/facc15/1f2937?text=MR", 
  bio: "BSc in Materials Science & Engineering at Rajshahi University of Engineering & Technology. Like to explore Technology.",
  resumeUrl: "https://drive.google.com/file/d/1dy1MzGTJsaT8-U7yU5s-75IuYRaM2bXd/view?usp=drive_link",
  linkedinUrl: "https://www.linkedin.com/in/mashiur-rahman-ruet/",
  githubUrl: "https://github.com/moshi021",
  twitterUrl: "#", // Add your twitter URL
  facebookUrl: "https://www.facebook.com/moshiur.rahman.mosiur",
};

const interests = [
  {
    title: "Materials Science & Engineering",
    description: "Elon Musk once said: 'Take Materials Science 101. You won't regret it.' So I took it."
  },
  {
    title: "Machine Learning",
    description: "Began as an exploration and quickly fell in love with its potential."
  }
];

const projects = [
  {
    title: "Geopolymer Compressive Strength Predictor",
    description: "This Streamlit web application predicts the compressive strength of geopolymer concrete based on 13 input parameters. It helps to  know its strength without costly physical testing.",
    // 👇 FIX: Changed 'skills' to 'techStack'
    techStack: ["Computational Materials Scince", "Machine Learning", "Materilas Propety Prediction"],
    link: "https://geopolymer-strength-predictor.streamlit.app/"
  },
  {
    title: "Project Metamorph",
    description: "I did this project when i participated on NASA Space App Cahllenge 2025. Growing Plant using the wastes."
    // 👇 FIX: Changed 'skills' to 'techStack'
    techStack: ["Materials Scince", "Waste Management", "Turning Trash to Treasure"],
    link: "https://project-metamorph.vercel.app/"
  },
  
];

const publications = [
  {
    title: "The Impact of Novel Materials in Semiconductor Technology",
    journal: "Journal of Advanced Materials, Vol. 42, Issue 3",
    year: 2024,
    link: "#",
    authors: "Rahman, M., et al."
  },
  {
    title: "A Study on Predictive Modeling for Material Failure",
    journal: "International Conference on Machine Learning (ICML)",
    year: 2023,
    link: "#",
    authors: "Rahman, M., Doe, J."
  }
];

const favouriteBooks = [
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    imageUrl: "https://placehold.co/150x220/374151/e5e7eb?text=Sapiens"
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    imageUrl: "https://placehold.co/150x220/374151/e5e7eb?text=Atomic+Habits"
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    imageUrl: "https://placehold.co/150x220/374151/e5e7eb?text=The+Catcher"
  }
];

const favouriteMovies = [
  {
    title: "Inception",
    director: "Christopher Nolan",
    imageUrl: "https://placehold.co/250x140/374151/e5e7eb?text=Inception"
  },
  {
    title: "The Matrix",
    director: "The Wachowskis",
    imageUrl: "https://placehold.co/250x140/374151/e5e7eb?text=The+Matrix"
  },
  {
    title: "Parasite",
    director: "Bong Joon-ho",
    imageUrl: "https://placehold.co/250x140/374151/e5e7eb?text=Parasite"
  }
];

// --- Gemini API Configuration ---

// LEAVE API KEY AS IS
const apiKey = "";
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

// --- API Helper Functions ---

/**
 * Retries a fetch request with exponential backoff.
 */
async function retryWithExponentialBackoff(fetchFn, maxRetries = 5, initialDelay = 1000) {
  let delay = initialDelay;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      // Don't log retries to console
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

/**
 * Calls the Gemini API.
 */
async function callGeminiApi(prompt) {
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  const fetchFn = () => fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const response = await retryWithExponentialBackoff(fetchFn);

  if (!response.ok) {
    throw new Error(`API call failed with status ${response.status}`);
  }

  const result = await response.json();
  const candidate = result.candidates?.[0];

  if (candidate && candidate.content?.parts?.[0]?.text) {
    return candidate.content.parts[0].text;
  } else {
    throw new Error("Unexpected API response format.");
  }
}


// --- Reusable UI Components ---

/**
 * A simple loading spinner
 */
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <Loader2 size={40} className="animate-spin text-red-500" />
  </div>
);

/**
 * A reusable modal component
 */
const Modal = ({ isOpen, onClose, title, children, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="text-gray-700" style={{ whiteSpace: 'pre-wrap' }}>
              {children}
            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="p-4 border-t bg-gray-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Navigation Components ---

const NavItem = ({ href, children, onClick }) => (
  <a
    href={href}
    onClick={onClick}
    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
  >
    {children}
  </a>
);

const MobileNavItem = ({ href, children, onClick }) => (
  <a
    href={href}
    onClick={onClick}
    className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
  >
    {children}
  </a>
);

const SocialLink = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="text-gray-400 hover:text-white transition-colors"
  >
    {React.createElement(icon, { size: 20 })}
  </a>
);

function Header({ activeSection, setActiveSection }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (e, section) => {
    e.preventDefault();
    setActiveSection(section);
    setIsOpen(false); // Close mobile menu on click
  };

  return (
    <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo/Name */}
          <div className="flex-shrink-0">
            <a 
              href="#" 
              onClick={(e) => handleNavClick(e, 'home')}
              className="text-2xl font-bold text-white"
            >
              <span className="text-red-500">M</span>oshiur
            </a>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <NavItem href="#" onClick={(e) => handleNavClick(e, 'home')}>
                Home
              </NavItem>
              <NavItem href="#" onClick={(e) => handleNavClick(e, 'projects')}>
                Projects
              </NavItem>
              <NavItem href="#" onClick={(e) => handleNavClick(e, 'publications')}>
                Publications
              </NavItem>
              <NavItem href="#" onClick={(e) => handleNavClick(e, 'favourites')}>
                Favourites
              </NavItem>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors"
              >
                <FileText size={18} className="mr-2" />
                Resume
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <MobileNavItem href="#" onClick={(e) => handleNavClick(e, 'home')}>
            Home
          </MobileNavItem>
          <MobileNavItem href="#" onClick={(e) => handleNavClick(e, 'projects')}>
            Projects
          </MobileNavItem>
          <MobileNavItem href="#" onClick={(e) => handleNavClick(e, 'publications')}>
            Publications
          </MobileNavItem>
          <MobileNavItem href="#" onClick={(e) => handleNavClick(e, 'favourites')}>
            Favourites
          </MobileNavItem>
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
          >
            Resume
          </a>
        </div>
      </div>
    </nav>
  );
}


// --- Page Section Components ---

function HeroSection() {
  return (
    <div className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 lg:flex lg:items-center lg:justify-between">
        
        {/* Text Content */}
        <div className="lg:w-1/2">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Hi, I'm <span className="text-red-500">{profile.name}</span>
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-lg">
            {profile.bio}
          </p>
          <div className="mt-8 flex items-center gap-4">
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors"
            >
              <Mail size={20} className="mr-2" />
              Get in Touch
            </a>
            <div className="flex space-x-4">
              <SocialLink href={profile.linkedinUrl} icon={Linkedin} label="LinkedIn" />
              <SocialLink href={profile.githubUrl} icon={Github} label="GitHub" />
              <SocialLink href={profile.twitterUrl} icon={Twitter} label="Twitter" />
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="mt-12 lg:mt-0 lg:w-1/2 lg:pl-12 flex justify-center">
          <img
            className="h-48 w-48 rounded-full sm:h-64 sm:w-64 lg:h-80 lg:w-80 object-cover shadow-xl border-4 border-red-500"
            src={profileImage}
            alt="Profile picture of Moshiur Rahman"
            onError={(e) => { e.target.src = 'https://placehold.co/128x128/facc15/1f2937?text=MR'; e.target.onerror = null; }}
          />
        </div>
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Passionate About...
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Passionate about turning creative ideas into impactful experiences.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:max-w-2xl md:mx-auto">
          {interests.map((item) => (
            <div key={item.title} className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
              <h3 className="text-xl font-bold mb-2 text-gray-900">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectsSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleProjectBrainstorm = async (project) => {
    setModalTitle(`✨ AI Brainstorm: ${project.title}`);
    setIsModalOpen(true);
    setIsLoading(true);
    setModalContent(""); // Clear previous content

    const prompt = `You are an expert tech advisor. A developer has a project called "${project.title}" using these technologies: ${project.techStack.join(', ')}.
    
Based on this, generate a bulleted list of 3-5 innovative future features or improvements they could add. Provide a brief 1-sentence description for each.`;

    try {
      const aiResponse = await callGeminiApi(prompt);
      setModalContent(aiResponse);
    } catch (error) {
      console.error(error);
      setModalContent(`Sorry, an error occurred while brainstorming: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section id="projects" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Projects
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              A few things I've built.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.title} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
                <div className="p-6 flex-grow">
                  <h3 className="text-xl font-bold mb-2 text-white">{project.title}</h3>
                  <p className="text-gray-400 mb-4 h-24 overflow-hidden">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.techStack.map(tech => (
                      <span key={tech} className="text-xs font-medium bg-red-600 text-white px-2 py-1 rounded-full">{tech}</span>
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-gray-700 flex justify-between items-center">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 font-medium transition-colors"
                  >
                    Learn more &rarr;
                  </a>
                  <button
                    onClick={() => handleProjectBrainstorm(project)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors"
                  >
                    <Sparkles size={16} className="mr-2" />
                    Brainstorm
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        isLoading={isLoading}
      >
        {modalContent}
      </Modal>
    </>
  );
}

function PublicationsSection() {
  return (
    <section id="publications" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Publications
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            My research and academic contributions.
          </p>
        </div>
        <div className="mt-16 space-y-8 max-w-3xl mx-auto">
          {publications.map((pub) => (
            <div key={pub.title} className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-900">{pub.title}</h3>
              <p className="text-md text-gray-700 mt-1 italic">{pub.journal}</p>
              <p className="text-sm text-gray-500 mt-2">{pub.authors} ({pub.year})</p>
              <a
                href={pub.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-red-600 hover:text-red-800 font-medium transition-colors"
              >
                Read paper &rarr;
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FavouritesSection() {
  const [activeTab, setActiveTab] = useState('books');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGetRecommendations = async () => {
    const isBooks = activeTab === 'books';
    const list = isBooks 
      ? favouriteBooks.map(b => b.title).join(', ')
      : favouriteMovies.map(m => m.title).join(', ');
    
    const prompt = `You are a recommendation engine. A user loves the following ${isBooks ? 'books' : 'movies'}: ${list}.
    
Please recommend 3 new ${isBooks ? 'books' : 'movies'} they might enjoy. For each, provide a 1-sentence reason why it's a good match. Format as a bulleted list.`;

    setModalTitle(`✨ AI ${isBooks ? 'Book' : 'Movie'} Recommendations`);
    setIsModalOpen(true);
    setIsLoading(true);
    setModalContent("");

    try {
      const aiResponse = await callGeminiApi(prompt);
      setModalContent(aiResponse);
    } catch (error) {
      console.error(error);
      setModalContent(`Sorry, an error occurred while getting recommendations: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section id="favourites" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Favourites
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              A few books and movies I love.
            </p>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex justify-center border-b border-gray-700">
            <button
              onClick={() => setActiveTab('books')}
              className={`flex items-center px-6 py-3 font-medium text-lg transition-colors ${
                activeTab === 'books'
                  ? 'border-b-2 border-red-500 text-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Book size={20} className="mr-2" />
              Books
            </button>
            <button
              onClick={() => setActiveTab('movies')}
              className={`flex items-center px-6 py-3 font-medium text-lg transition-colors ${
                activeTab === 'movies'
                  ? 'border-b-2 border-red-500 text-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Film size={20} className="mr-2" />
              Movies
            </button>
          </div>

          {/* AI Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleGetRecommendations}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 transition-colors"
            >
              <Sparkles size={20} className="mr-2" />
              Get AI Recommendations
            </button>
          </div>

          {/* Content */}
          <div className="mt-16">
            {activeTab === 'books' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {favouriteBooks.map((book) => (
                  <div key={book.title} className="text-center">
                    <img 
                      src={book.imageUrl} 
                      alt={book.title} 
                      className="w-full h-auto object-cover rounded-lg shadow-lg mb-4 transform hover:scale-105 transition-transform"
                      onError={(e) => { e.target.src = 'https://placehold.co/150x220/374151/e5e7eb?text=Book'; e.target.onerror = null; }}
                    />
                    <h3 className="text-md font-bold text-white">{book.title}</h3>
                    <p className="text-sm text-gray-400">{book.author}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'movies' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {favouriteMovies.map((movie) => (
                  <div key={movie.title} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <img 
                      src={movie.imageUrl} 
                      alt={movie.title} 
                      className="w-full h-40 object-cover"
                      onError={(e) => { e.target.src = 'https://placehold.co/250x140/374151/e5e7eb?text=Movie'; e.target.onerror = null; }}
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white">{movie.title}</h3>
                      <p className="text-sm text-gray-400">{movie.director}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        isLoading={isLoading}
      >
        {modalContent}
      </Modal>
    </>
  );
}


function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center space-x-6 mb-4">
          <SocialLink href={profile.linkedinUrl} icon={Linkedin} label="LinkedIn" />
          <SocialLink href={profile.githubUrl} icon={Github} label="GitHub" />
          <SocialLink href={profile.twitterUrl} icon={Twitter} label="Twitter" />
          <SocialLink href={profile.facebookUrl} icon={Layers} label="Facebook" />
        </div>
        <p>&copy; {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}

// --- Main App Component ---

export default function App() {
  const [activeSection, setActiveSection] = useState('home');

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return (
          <>
            <HeroSection />
            <AboutSection />
          </>
        );
      case 'projects':
        return <ProjectsSection />;
      case 'publications':
        return <PublicationsSection />;
      case 'favourites':
        return <FavouritesSection />;
      default:
        return (
          <>
            <HeroSection />
            <AboutSection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      <main>
        {renderSection()}
      </main>
      <Footer />
    </div>
  );
}

