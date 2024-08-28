import React, { useState, useEffect } from 'react';
import './Home.css'; // Import the CSS file for styling

function Home() {
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState('');
  const [loading, setLoading] = useState(false); // State for loading indication
  const [error, setError] = useState(null); // State for error handling
  const [languages, setLanguages] = useState([
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
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
  ]);
  

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
        // Open the translated content in the same tab to ensure script functionality
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
    <div className="Home">
      <header className="Home-header">
        <h1>Web Localization Project</h1>
        <div className="form-container">
          <input
            type="text"
            placeholder="Enter your URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input-field"
            disabled={loading}
            aria-label="URL input"
          />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input-field"
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
          <button onClick={handleSearch} className="search-button" disabled={loading}>
            {loading ? 'Processing...' : 'Search'}
          </button>
        </div>
        {error && <div className="error-message" aria-live="assertive">{error}</div>}
      </header>
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
