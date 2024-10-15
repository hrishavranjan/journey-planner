import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig'; // Import Firestore
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import './Journey.css'; // Import the CSS file

const Journey = ({ user }) => {
  const [trips, setTrips] = useState([]);
  const [destination, setDestination] = useState('');
  const [travelOptions, setTravelOptions] = useState([]);
  const [packingList, setPackingList] = useState([{ name: '', packed: false, added: false }]);
  const [placesToVisit, setPlacesToVisit] = useState([{ name: '', visited: false, added: false }]);
  const [localContacts, setLocalContacts] = useState([{ name: '', number: '', added: false }]);
  const [expenses, setExpenses] = useState([{ amount: '', description: '', added: false }]);
  const [notes, setNotes] = useState(''); // Added notes state
  const [showPopup, setShowPopup] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setTrips(userDoc.data().journeyItems || []);
      }
    };

    fetchUserData();
  }, [user.uid]);

  const handleAddTrip = async () => {
    const tripData = {
      destination,
      travelOptions,
      packingList,
      placesToVisit,
      localContacts,
      notes, // Included notes in trip data
      expenses,
    };

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        journeyItems: [...trips, tripData],
      });

      setTrips((prevTrips) => [...prevTrips, tripData]);

      // Reset form fields
      setDestination('');
      setTravelOptions([]);
      setPackingList([{ name: '', packed: false, added: false }]);
      setPlacesToVisit([{ name: '', visited: false, added: false }]);
      setLocalContacts([{ name: '', number: '', added: false }]);
      setNotes(''); // Reset notes
      setExpenses([{ amount: '', description: '', added: false }]);
      setShowPopup(false);
    } catch (e) {
      console.error("Error adding trip: ", e);
    }
  };

  const handleDeleteTrip = (index) => {
    const updatedTrips = trips.filter((_, i) => i !== index);
    setTrips(updatedTrips);
    // Update Firestore here as well
  };

  const handleAddPackingItem = (index) => {
    const updatedList = packingList.map((item, i) =>
      i === index ? { ...item, added: true } : item
    );
    setPackingList(updatedList);
  };

  const handleAddPlaceToVisit = (index) => {
    const updatedPlaces = placesToVisit.map((place, i) =>
      i === index ? { ...place, added: true } : place
    );
    setPlacesToVisit(updatedPlaces);
  };

  const handleAddContact = (index) => {
    const updatedContacts = localContacts.map((contact, i) =>
      i === index ? { ...contact, added: true } : contact
    );
    setLocalContacts(updatedContacts);
  };

  const handleAddExpense = (index) => {
    const updatedExpenses = expenses.map((expense, i) =>
      i === index ? { ...expense, added: true } : expense
    );
    setExpenses(updatedExpenses);
  };

  const handleTogglePacked = (index) => {
    const updatedList = packingList.map((item, i) =>
      i === index ? { ...item, packed: !item.packed } : item
    );
    setPackingList(updatedList);
  };

  const handleToggleVisited = (index) => {
    const updatedPlaces = placesToVisit.map((place, i) =>
      i === index ? { ...place, visited: !place.visited } : place
    );
    setPlacesToVisit(updatedPlaces);
  };

  const toggleShowMore = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="journey-container">
      <div className="header-section">
        <h2 className="journey-title">Journey-planner :)</h2>
      </div>
      <h2 className="welcome-message">Welcome, {user.guest ? "Guest" : user.displayName}!</h2>
      <div className="new-journey-container">
        <button className="new-journey-button" onClick={() => setShowPopup(true)}>New Journey</button>
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Add New Trip</h3>
            <div className="input-group">
              <input
                type="text"
                placeholder="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
              <div className="travel-options">
                {['train', 'bus', 'flight', 'cab'].map(option => (
                  <label key={option}>
                    <input
                      type="checkbox"
                      value={option}
                      onChange={(e) => {
                        const options = e.target.checked
                          ? [...travelOptions, e.target.value]
                          : travelOptions.filter(opt => opt !== e.target.value);
                        setTravelOptions(options);
                      }}
                    /> {option.charAt(0).toUpperCase() + option.slice(1)}
                  </label>
                ))}
              </div>

              {/* Packing List */}
              <div className="packing-list">
                <h4>Packing Items:</h4>
                {packingList.map((item, index) => (
                  <div key={index} className="packing-item">
                    {item.added ? (
                      <div>
                        <input
                          type="checkbox"
                          checked={item.packed}
                          onChange={() => handleTogglePacked(index)}
                        />
                        <span className={item.packed ? 'packed-strikethrough' : ''}>
                          {item.name}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="text"
                          placeholder="Item Name"
                          value={item.name}
                          onChange={(e) => {
                            const updatedList = packingList.map((i, idx) =>
                              idx === index ? { ...i, name: e.target.value } : i
                            );
                            setPackingList(updatedList);
                          }}
                        />
                        <button
                          onClick={() => handleAddPackingItem(index)}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={() => setPackingList([...packingList, { name: '', packed: false, added: false }])}>
                  Add Packing Item
                </button>
              </div>

              {/* Places to Visit */}
              <div className="places-to-visit">
                <h4>Places to Visit:</h4>
                {placesToVisit.map((place, index) => (
                  <div key={index} className="place-item">
                    {place.added ? (
                      <div>
                        <input
                          type="checkbox"
                          checked={place.visited}
                          onChange={() => handleToggleVisited(index)}
                        />
                        <span className={place.visited ? 'visited-strikethrough' : ''}>
                          {place.name}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="text"
                          placeholder="Place Name"
                          value={place.name}
                          onChange={(e) => {
                            const updatedPlaces = placesToVisit.map((p, idx) =>
                              idx === index ? { ...p, name: e.target.value } : p
                            );
                            setPlacesToVisit(updatedPlaces);
                          }}
                        />
                        <button
                          onClick={() => handleAddPlaceToVisit(index)}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={() => setPlacesToVisit([...placesToVisit, { name: '', visited: false, added: false }])}>
                  Add Place
                </button>
              </div>

              {/* Local Contacts */}
              <div className="local-contacts">
                <h4>Local Contacts:</h4>
                {localContacts.map((contact, index) => (
                  <div key={index}>
                    {contact.added ? (
                      <div>
                        <span>{contact.name} - {contact.number}</span>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="text"
                          placeholder="Name"
                          value={contact.name}
                          onChange={(e) => {
                            const updatedContacts = localContacts.map((c, idx) =>
                              idx === index ? { ...c, name: e.target.value } : c
                            );
                            setLocalContacts(updatedContacts);
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Number"
                          value={contact.number}
                          onChange={(e) => {
                            const updatedContacts = localContacts.map((c, idx) =>
                              idx === index ? { ...c, number: e.target.value } : c
                            );
                            setLocalContacts(updatedContacts);
                          }}
                        />
                        <button
                          onClick={() => handleAddContact(index)}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={() => setLocalContacts([...localContacts, { name: '', number: '', added: false }])}>
                  Add Contact
                </button>
              </div>

              {/* Expenses */}
              <div className="expenses">
                <h4>Expenses:</h4>
                {expenses.map((expense, index) => (
                  <div key={index}>
                    <input
                      type="text"
                      placeholder="Amount"
                      value={expense.amount}
                      onChange={(e) => {
                        const updatedExpenses = expenses.map((ex, idx) =>
                          idx === index ? { ...ex, amount: e.target.value } : ex
                        );
                        setExpenses(updatedExpenses);
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={expense.description}
                      onChange={(e) => {
                        const updatedExpenses = expenses.map((ex, idx) =>
                          idx === index ? { ...ex, description: e.target.value } : ex
                        );
                        setExpenses(updatedExpenses);
                      }}
                    />
                    <button
                      onClick={() => handleAddExpense(index)}
                    >
                      Add
                    </button>
                  </div>
                ))}
                <button onClick={() => setExpenses([...expenses, { amount: '', description: '', added: false }])}>
                  Add Expense
                </button>
              </div>

              {/* Notes */}
              <div className="notes">
                <h4>Notes:</h4>
                <textarea
                  placeholder="Enter your notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button onClick={handleAddTrip}>Add Trip</button>
            </div>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}

      <div className="trips-container">
        {trips.map((trip, index) => (
          <div key={index} className="trip-box">
            <h3>{trip.destination}</h3>
            <button onClick={() => toggleShowMore(index)}>
              {expandedIndex === index ? 'Show Less<-' : 'Show More->'}
            </button>

            {expandedIndex === index && (
              <div className="trip-details">
                <h4>Travel Options: {trip.travelOptions.join(', ')}</h4>

                {/* Packing List Display */}
                <div className="packing-list-display">
                  <h5>Packing List:</h5>
                  {trip.packingList.map((item, idx) => (
                    <div key={idx}>
                      <input type="checkbox" checked={item.packed} readOnly />
                      <span className={item.packed ? 'packed-strikethrough' : ''}>{item.name}</span>
                    </div>
                  ))}
                </div>

                {/* Places to Visit Display */}
                <div className="places-to-visit-display">
                  <h5>Places to Visit:</h5>
                  {trip.placesToVisit.map((place, idx) => (
                    <div key={idx}>
                      <input type="checkbox" checked={place.visited} readOnly />
                      <span className={place.visited ? 'visited-strikethrough' : ''}>{place.name}</span>
                    </div>
                  ))}
                </div>

                {/* Local Contacts Display */}
                <div className="local-contacts-display">
                  <h5>Local Contacts:</h5>
                  {trip.localContacts.map((contact, idx) => (
                    <div key={idx}>{contact.name} - {contact.number}</div>
                  ))}
                </div>

                {/* Expenses Display */}
                <div className="expenses-display">
                  <h5>Expenses:</h5>
                  {trip.expenses.map((expense, idx) => (
                    <div key={idx}>{expense.amount} - {expense.description}</div>
                  ))}
                </div>

                {/* Notes Display */}
                <div className="notes-display">
                  <h5>Notes:</h5>
                  <p>{trip.notes}</p>
                </div>

                <button onClick={() => handleDeleteTrip(index)}>Delete Trip</button>
              </div>
            )}
          </div>
        ))}
      </div>
      
    </div>
  );
};


export default Journey;
