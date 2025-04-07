import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const MyFlights = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Authentication protection
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/signin"); // Redirect if not logged in
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const user = auth.currentUser;

      if (!user) {
        alert("Please log in to view saved flights.");
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setFavorites(docSnap.data().favorites || []);
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
      setLoading(false);
    };

    fetchFavorites();
  }, []);

  const deleteFavorite = async (flight) => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userRef, {
        favorites: arrayRemove(flight),
      });
      setFavorites((prevFavorites) => prevFavorites.filter((f) => f !== flight));
    } catch (error) {
      console.error("Error deleting favorite flight:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-400">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-400 via-orange-400 to-red-400 flex flex-col items-center pb-20">
      <h1
        className="text-4xl font-bold text-white cursor-pointer absolute top-4 left-4"
        onClick={() => window.location.href = '/'}
      >
        Flylow
      </h1>
      <button
          onClick={() => {
              navigate('/'); 
          }}
          className="bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition duration-300 absolute top-4 right-4"
        >
          Home
        </button>
      <h1 className="text-4xl font-bold text-white mt-8">My Flights</h1>
      <div className="mt-10 w-full max-w-4xl p-6 bg-white rounded-lg shadow-lg">
        {favorites.length > 0 ? (
          <ul>
            {favorites.map((flight, index) => (
              <li
                key={index}
                className="mb-4 p-4 border rounded-md hover:shadow-md transition-shadow bg-yellow-100 relative"
              >
                <button
                  onClick={() => deleteFavorite(flight)}
                  className="absolute top-2 right-2 bg-red-400 text-white py-1 px-3 rounded-lg hover:bg-red-500 transition duration-300"
                >
                  Remove
                </button>
                <div className="flex items-center mb-2">
                  <img
                    src={flight.logo}
                    alt={flight.airline}
                    className="w-10 h-10 mr-4"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                  <p className="text-orange-700 font-semibold">
                    {flight.airline}
                  </p>
                </div>
                <p><strong>Flight Number:</strong> {flight.flightNumber}</p>
                <p><strong>Price:</strong> {flight.price}</p>
                <p><strong>Duration:</strong> {flight.duration}</p>
                <p><strong>Departure Time:</strong> {flight.departure}</p>
                <p><strong>Arrival Time:</strong> {flight.arrival}</p>
                <p><strong>Stops:</strong> {flight.stops}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lg text-gray-700">No saved flights.</p>
        )}
      </div>
    </div>
  );
};

export default MyFlights;
