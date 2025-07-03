import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import {
  doc, getDoc, getDocs, collection,
  query, orderBy, where, limit, startAfter, deleteDoc
} from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PAGE_SIZE = 5;

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const fetchHistory = async (initial = true) => {
    if (!currentUser) return;

    if (initial) {
      // get user info
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUser(userSnap.data());
      }
    }

    let q = query(
      collection(db, 'users', currentUser.uid, 'classifications'),
      orderBy('createdAt', 'desc')
    );

    if (selectedDate) {
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
      q = query(q, where('createdAt', '>=', start), where('createdAt', '<=', end));
    }

    q = query(q, limit(PAGE_SIZE));

    if (!initial && lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snap = await getDocs(q);
    const newHistory = snap.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        text: d.text,
        prediction: d.prediction,
        createdAt: d.createdAt,
        date: d.createdAt?.toDate().toLocaleString() || 'N/A'
      };
    });

    setHistory(prev => initial ? newHistory : [...prev, ...newHistory]);
    setLastDoc(snap.docs[snap.docs.length - 1]);
  };

  useEffect(() => {
    fetchHistory(true);
    // eslint-disable-next-line
  }, [currentUser, selectedDate]);

  const handleShowMore = async () => {
    setLoadingMore(true);
    await fetchHistory(false);
    setLoadingMore(false);
  };

  const handleDeleteHistory = async () => {
    if (window.confirm("Are you sure you want to delete all your history?")) {
      const snap = await getDocs(collection(db, 'users', currentUser.uid, 'classifications'));
      const deletions = snap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletions);
      setHistory([]);
    }
  };

  const handleExportPDF = () => {
    if (history.length === 0) {
      alert("No data available to export. Please select a valid date or view all.");
      return;
    }
  
    const docPDF = new jsPDF();
    docPDF.text("Test Case Classification History", 14, 20);
    const tableData = history.map(h => [h.text, h.prediction, h.date]);
    autoTable(docPDF, {
      head: [['Test Case', 'Prediction', 'Date']],
      body: tableData,
      startY: 30,
    });
    docPDF.save("TestTagger_History.pdf");
  };
  

  return (
    <div className="d-flex flex-column min-vh-100" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Navbar />

      <header className="bg-light py-5">
        <div className="container text-center">
          <h1 className="display-5 fw-bold">Hello, {user ? user.username : 'User'}!</h1>
          <p className="text-muted mb-0">Email: {currentUser?.email}</p>
        </div>
      </header>

      <section className="py-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Recent Test Case Classifications</h4>
            <div>
              <button className="btn btn-danger btn-sm me-2" onClick={handleDeleteHistory}>Delete History</button>
              <button className="btn btn-success btn-sm" onClick={handleExportPDF}>Download PDF</button>
            </div>
          </div>

          <div className="col-md-6">
  <label>Choose Date:</label>
  <div className="input-group py-3">
    <input
      type="date"
      className="form-control"
      value={selectedDate}
      onChange={e => setSelectedDate(e.target.value)}
    />
    <button
      className="btn btn-outline-secondary"
      type="button"
      onClick={() => setSelectedDate('')}
    >
      View All
    </button>
  </div>
</div>


          {history.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered text-center">
                <thead className="table-light">
                  <tr>
                    <th>Test Case</th>
                    <th>Prediction</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.text}</td>
                      <td>{item.prediction}</td>
                      <td>{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {lastDoc && (
                <div className="text-center">
                  <button className="btn btn-secondary" onClick={handleShowMore} disabled={loadingMore}>
                    {loadingMore ? 'Loading...' : 'Show More'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p>No classification history available for this date.</p>
          )}
        </div>
      </section>

      <footer className="bg-light py-3 text-center mt-auto">
        <p>&copy; 2025 TestTagger. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default ProfilePage;
