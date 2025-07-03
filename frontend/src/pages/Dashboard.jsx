import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import 'bootstrap/dist/css/bootstrap.min.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Navbar from "../components/Navbar";
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [testCases, setTestCases] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const labels = ['Functional', 'Performance', 'Usability', 'Security'];

  const saveResultsToFirestore = async (newResults) => {
    if (currentUser) {
      const userRef = collection(db, 'users', currentUser.uid, 'classifications');
      try {
        const writeOps = newResults.map(r => 
          addDoc(userRef, {
            text: r.text,
            prediction: r.prediction,
            createdAt: serverTimestamp()
          })
        );
        await Promise.all(writeOps);
        console.log("Results saved to Firestore");
      } catch (err) {
        console.error("Error saving to Firestore:", err);
      }
    }
  };

  const processAndSaveTestCases = async (casesArray) => {
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const newResults = await Promise.all(
        casesArray.map(async (tc) => {
          try {
            const response = await fetch('/classify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: tc, labels }),
            });

            if (!response.ok) {
              return { text: tc, prediction: 'Error: API failed' };
            }

            const data = await response.json();
            return {
              text: tc,
              prediction: data.label || 'No prediction',
            };
          } catch (err) {
            return { text: tc, prediction: 'Error: Fetch failed' };
          }
        })
      );

      setResults(newResults);
      await saveResultsToFirestore(newResults);
    } catch (err) {
      console.error("Error processing test cases:", err);
      setError('Failed to process test cases.');
    } finally {
      setLoading(false);
    }
  };

  const handleClassify = async () => {
    const trimmedCases = testCases
      .split(',')
      .map(tc => tc.trim())
      .filter(tc => tc);

    if (trimmedCases.length === 0) {
      setError('Please enter at least one test case.');
      return;
    }

    const tooShort = trimmedCases.find(tc => tc.length < 10);
    if (tooShort) {
      setError(`Test case "${tooShort}" must be at least 10 characters.`);
      return;
    }

    await processAndSaveTestCases(trimmedCases);
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setTestCases('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async function (results) {
        const rows = results.data;
        const casesArray = rows
          .map(row => row['Text'])
          .filter(text => text && text.trim());

        if (casesArray.length === 0) {
          setError('CSV file has no valid test cases.');
          return;
        }

        await processAndSaveTestCases(casesArray);
      },
      error: function (err) {
        setError('CSV parsing error: ' + err.message);
      },
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Test Case Classification Results", 14, 20);

    const tableData = results.map(r => [r.text, r.prediction]);

    autoTable(doc, {
      head: [['Test Case', 'Prediction']],
      body: tableData,
      startY: 30,
    });

    doc.save("classification_results.pdf");
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Navbar />

      <header className="bg-light py-5">
        <div className="container px-5 my-5 text-center">
          <h1 className="display-4 fw-bold">Test Case Categorization Assistant</h1>
          <p className="lead">Enter or upload your test cases for categorization.</p>
        </div>
      </header>

      <section className="py-4">
        <div className="container px-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <textarea
                className="form-control mb-3"
                rows="4"
                placeholder="Enter test cases, separated by commas..."
                value={testCases}
                onChange={(e) => setTestCases(e.target.value)}
              />
              <button className="btn btn-primary w-100" onClick={handleClassify} disabled={loading}>
                {loading ? 'Classifying...' : 'Classify Test Cases'}
              </button>
              {error && <div className="alert alert-danger mt-3">{error}</div>}
            </div>
          </div>
        </div>
      </section>

      {results.length > 0 && (
        <section className="py-4">
          <div className="container px-5">
            <h3 className="text-center mb-4">Classification Results</h3>
            <div className="table-responsive">
              <table className="table table-bordered text-center">
                <thead className="table-light">
                  <tr>
                    <th>Test Case</th>
                    <th>Prediction</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.text}</td>
                      <td>{r.prediction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-center">
              <button className="btn btn-success mt-3" onClick={handleExportPDF}>
                Export Results to PDF
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="py-4">
        <div className="container px-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <input
                type="file"
                className="form-control mb-2"
                accept=".csv"
                onChange={handleCSVUpload}
              />
              <button className="btn btn-secondary w-100" disabled={loading}>
                {loading ? 'Processing CSV...' : 'Upload CSV for Classification'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-light py-3 text-center mt-auto">
        <p>&copy; 2025 TestTagger. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
