import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { db, auth } from "../firebaseConfig";
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { from, to, departureDate } = location.state || {};

  // State
  const [flightResults, setFlightResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceScore, setPriceScore] = useState(0);
  const [bestBuyDate, setBestBuyDate] = useState('');
  const [favorites, setFavorites] = useState([]);


  // Authentication protection
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/signin'); // Redirect to signin if not authenticated
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchFlightData = async () => {
      try {
        setLoading(true);

        // Fetch airport data to get IDs
        const airportsResponse = await fetch('/information/complete_airports_data.json');
        const airportsData = await airportsResponse.json();

        // Find matching airports
        const origin = airportsData.find(airport => airport.suggestionTitle === from);
        const destination = airportsData.find(airport => airport.suggestionTitle === to);

        if (!origin || !destination) {
          throw new Error('Airport data not found for selected locations.');
        }

        const options = {
          method: 'GET',
          url: 'https://sky-scrapper.p.rapidapi.com/api/v2/flights/searchFlights',
          params: {
            originSkyId: origin.skyId,
            destinationSkyId: destination.skyId,
            originEntityId: origin.entityId,
            destinationEntityId: destination.entityId,
            cabinClass: 'economy',
            adults: '1',
            sortBy: 'price_low',
            currency: 'EUR',
            market: 'en-GB',
            countryCode: 'IE',
            date: departureDate
          },
          headers: {
            'x-rapidapi-key': '485f9c74bdmshab3851cb91ffd2bp1b71cbjsn749a24f72f31',
            'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com'
          }
        };

        const response = await axios.request(options);
        console.log('Full API Response:', JSON.stringify(response.data, null, 2));

        if (response.data && response.data.data && response.data.data.itineraries) {
          const itineraries = response.data.data.itineraries.map(itinerary => {
            const leg = itinerary.legs[0];
            const price = itinerary.price.formatted;
            const airline = leg.carriers.marketing[0].name;
            const logo = leg.carriers.marketing[0].logoUrl;
            const duration = `${Math.floor(leg.durationInMinutes / 60)}h ${leg.durationInMinutes % 60}m`;
            const departure = new Date(leg.departure).toLocaleTimeString();
            const arrival = new Date(leg.arrival).toLocaleTimeString();
            const flightNumber = leg.segments[0].flightNumber;

            return {
              airline,
              logo,
              price,
              duration,
              departure,
              arrival,
              stops: leg.stopCount,
              flightNumber
            };
          });
          setFlightResults(itineraries);

          const score = calculatePriceScore(departureDate);
          setPriceScore(score.toFixed(2));
          const bestDate = findBestBuyDate(departureDate);
          setBestBuyDate(bestDate);
        } else {
          throw new Error('No flight data available. Check input parameters or API settings.');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching flight data:', error);
        setError('Failed to load flight data. Please check the input parameters or try again later.');
        setLoading(false);
      }
    };

    fetchFlightData();
  }, []);

  const calculatePriceScore = (departure) => {
    const today = new Date();
    const [year, month, day] = departure.split('-');
    const departureDay = new Date(year, month - 1, day);

    const bestBuyDay = new Date(departureDay);
    bestBuyDay.setDate(bestBuyDay.getDate() - 49);

    const diffDays = Math.ceil((today - bestBuyDay) / (1000 * 60 * 60 * 24));
    let score = 95;

    if (diffDays < 0) {
      score -= Math.abs(diffDays) * 0.1;
    } else if (diffDays > 0) {
      score -= diffDays * 1.2;
    }

    return Math.max(score, 25);
  };

  const findBestBuyDate = (departure) => {
    const today = new Date();
    const [year, month, day] = departure.split('-');
    const departureDay = new Date(year, month - 1, day);

    const bestBuyDay = new Date(departureDay);
    bestBuyDay.setDate(bestBuyDay.getDate() - 49);

    if (bestBuyDay < today) {
      return 'Today';
    }

    if (bestBuyDay > departureDay) {
      return departureDay.toDateString();
    }

    return bestBuyDay.toDateString();
  };

  const toggleFavorite = (index) => {
    setFavorites((prev) => {
      const updatedFavorites = [...prev];
      if (updatedFavorites.includes(index)) {
        return updatedFavorites.filter(i => i !== index);
      } else {
        return [...updatedFavorites, index];
      }
    });
  };


  const saveFavoriteFlight = async (flight) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to save flights.");
      return;
    }
  
    const userRef = doc(db, "users", user.uid);
  
    try {
      // Check if the document exists
      const docSnap = await getDoc(userRef);
  
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(userRef, {
          favorites: arrayUnion(flight),
        });
      } else {
        // Create a new document
        await setDoc(userRef, {
          favorites: [flight],
        });
      }
    } catch (error) {
      console.error("Error saving favorite flight:", error);
      alert("Failed to save flight.");
    }
  };
  
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-400 via-orange-400 to-red-400 flex flex-col items-center pb-20">
      <h1 className="text-4xl font-bold text-white cursor-pointer absolute top-4 left-4" onClick={() => window.location.href = '/'}>Flylow</h1>
      <button
          onClick={() => {
              navigate('/myflights'); 
          }}
          className="bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition duration-300 absolute top-4 right-4"
        >
          My Flights
        </button>
      <h1 className="text-4xl font-bold text-white mt-8">Search Results</h1>
      <p className="mt-4 text-lg text-white">From: {from}</p>
      <p className="mt-2 text-lg text-white">To: {to}</p>
      <p className="mt-4 text-lg text-white">Departure Date: {departureDate}</p>
      
      <div className="mt-6 p-4 bg-white rounded-lg shadow-md text-center w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-orange-500">Price Score</h2>
        <p className="text-xl mt-2 text-gray-700">{priceScore}%</p>
      </div>

      <div className="mt-6 p-4 bg-white rounded-lg shadow-md text-center w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-orange-500">Estimated Best Date to Buy</h2>
        <p className="text-xl mt-2 text-gray-700">{bestBuyDate}</p>
      </div>

      <div className="mt-10 w-full max-w-4xl p-6 bg-white rounded-lg shadow-lg">
        {loading ? (
          <p className="text-orange-500">Loading flight data...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-orange-500">Available Flights</h2>
            {flightResults.length > 0 ? (
              <ul>
                {flightResults.map((flight, index) => (
                  <li key={index} className="mb-4 p-4 border rounded-md hover:shadow-md transition-shadow bg-yellow-100 relative">
                    <button 
                      onClick={() => {
                        toggleFavorite(index);
                        saveFavoriteFlight(flight); // Save to Firebase
                      }} 
                      className={`absolute top-2 right-2 text-4xl px-3 py-3 ${favorites.includes(index) ? 'text-yellow-500' : 'text-gray-300'}`}>
                      ★
                    </button>
                    <div className="flex items-center mb-2">
                      <img src={flight.logo} alt={flight.airline} className="w-10 h-10 mr-4" />
                      <p className="text-orange-700 font-semibold">{flight.airline}</p>
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
              <p>No flights available for the selected criteria.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;

