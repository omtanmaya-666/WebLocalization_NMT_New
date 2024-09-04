import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Home.css'; // Import the CSS file for additional styling

function Home() {
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'zh', name: 'Chinese' },
    { code: 'as', name: 'Assamese' },
    { code: 'bn', name: 'Bengali' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'mr', name: 'Marathi' },
    { code: 'or', name: 'Odia' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'ur', name: 'Urdu' },
    { code: 'sd', name: 'Sindhi' },
    { code: 'doi', name: 'Dogri' },
    { code: 'kon', name: 'Konkani' },
    { code: 'brx', name: 'Bodo' },
    { code: 'ks', name: 'Kashmiri' },
    { code: 'mai', name: 'Maithili' },
    { code: 'mni', name: 'Manipuri' },
    { code: 'sa', name: 'Sanskrit' },
    { code: 'sat', name: 'Santhali' },
  ];

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleSearch = async () => {
    setError(null);

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/localize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, language }),
      });

      const result = await response.json();

      if (result.success) {
        document.open();
        document.write(result.content);
        document.close();
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Home flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <motion.header
        className="Home-header text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <h1 className="text-4xl font-bold text-purple-600 mb-8">
          Web Localization Project
        </h1>
        <motion.div
          className="form-container space-y-4"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <input
            type="text"
            placeholder="Enter your URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input-field w-full px-4 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-transform transform hover:scale-105"
            disabled={loading}
            aria-label="URL input"
          />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input-field w-full px-4 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-transform transform hover:scale-105"
            disabled={loading}
            aria-label="Language selection"
          >
            <option value="" disabled>
              Select Your Language
            </option>
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <motion.button
            onClick={handleSearch}
            className="search-button w-full px-4 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? 'Processing...' : 'Search'}
          </motion.button>
        </motion.div>
        {error && (
          <motion.div
            className="error-message text-red-500 mt-4"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 50 }}
            aria-live="assertive"
          >
            {error}
          </motion.div>
        )}
      </motion.header>
    </div>
  );
}

export default Home;




// // Live Edit Feature 
// import React, { useState } from 'react';
// import './Home.css'; // Import the CSS file for styling

// function Home() {
//   const [url, setUrl] = useState('');
//   const [language, setLanguage] = useState('');
//   const [loading, setLoading] = useState(false); // State for loading indication
//   const [error, setError] = useState(null); // State for error handling
//   const [pageContent, setPageContent] = useState(''); // State for holding page content
//   const [isEditing, setIsEditing] = useState(false); // State for editing mode
//   const [languages] = useState([
//     { code: 'en', name: 'English' },
//     { code: 'es', name: 'Spanish' },
//     { code: 'fr', name: 'French' },
//     { code: 'hi', name: 'Hindi' },
//     { code: 'zh', name: 'Chinese' },
//     { code: 'as', name: 'Assamese' },
//     { code: 'bn', name: 'Bengali' },
//     { code: 'gu', name: 'Gujarati' },
//     { code: 'kn', name: 'Kannada' },
//     { code: 'ml', name: 'Malayalam' },
//     { code: 'mr', name: 'Marathi' },
//     { code: 'or', name: 'Odia' },
//     { code: 'pa', name: 'Punjabi' },
//     { code: 'ta', name: 'Tamil' },
//     { code: 'te', name: 'Telugu' },
//     { code: 'ur', name: 'Urdu' },
//     { code: 'sd', name: 'Sindhi' },
//     { code: 'doi', name: 'Dogri' },
//     { code: 'kon', name: 'Konkani' },
//     { code: 'brx', name: 'Bodo' },
//     { code: 'ks', name: 'Kashmiri' },
//     { code: 'mai', name: 'Maithili' },
//     { code: 'mni', name: 'Manipuri' },
//     { code: 'sa', name: 'Sanskrit' },
//     { code: 'sat', name: 'Santhali' },
//   ]);

//   const isValidUrl = (string) => {
//     try {
//       new URL(string);
//       return true;
//     } catch (err) {
//       return false;
//     }
//   };

//   const handleSearch = async () => {
//     setError(null);

//     if (!isValidUrl(url)) {
//       setError('Please enter a valid URL.');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch('http://localhost:5000/api/localize', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ url, language }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         setPageContent(result.content); // Set the fetched HTML content to state
//       } else {
//         setError(result.message);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       setError('A network error occurred. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleContentBlur = (e) => {
//     setPageContent(e.target.innerHTML); // Update state with edited content
//     // Optionally, you can save this updated content back to the server here
//   };

//   const toggleEditMode = () => {
//     setIsEditing(!isEditing); // Toggle the editing mode
//   };

//   return (
//     <div className="Home">
//       <header className="Home-header">
//         <h1>Web Localization Project</h1>
//         <div className="form-container">
//           <input
//             type="text"
//             placeholder="Enter your URL"
//             value={url}
//             onChange={(e) => setUrl(e.target.value)}
//             className="input-field"
//             disabled={loading}
//             aria-label="URL input"
//           />
//           <select
//             value={language}
//             onChange={(e) => setLanguage(e.target.value)}
//             className="input-field"
//             disabled={loading}
//             aria-label="Language selection"
//           >
//             <option value="" disabled>
//               Select Your Language
//             </option>
//             {languages.map((lang) => (
//               <option key={lang.code} value={lang.code}>
//                 {lang.name}
//               </option>
//             ))}
//           </select>
//           <button onClick={handleSearch} className="search-button" disabled={loading}>
//             {loading ? 'Processing...' : 'Search'}
//           </button>
//         </div>
//         {error && <div className="error-message" aria-live="assertive">{error}</div>}
        
//         {/* Button to toggle live edit mode */}
//         {pageContent && (
//           <button onClick={toggleEditMode} className="edit-button">
//             {isEditing ? 'Stop Live Edit' : 'Start Live Edit'}
//           </button>
//         )}

//         {/* Editable Content Section */}
//         {isEditing && (
//           <div
//             className="editable-page-content"
//             contentEditable
//             suppressContentEditableWarning
//             onBlur={handleContentBlur}
//             dangerouslySetInnerHTML={{ __html: pageContent }}
//           />
//         )}
//       </header>
//     </div>
//   );
// }

// export default Home;
