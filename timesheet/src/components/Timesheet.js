import '../styles/timesheet.css';
import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, updateDoc, setDoc } from "firebase/firestore";
import { db } from '../database/firebase';
import { v4 as uuidv4 } from 'uuid';

function Timesheet() {
  const [timesheetNames, setTimesheetNames] = useState([]);
  const [nameSelected, setNameSelected] = useState('');
  const [rate, setRate] = useState(0);
  const [totalMinsWorked, setTotalMinsWorked] = useState(0);
  const [lineItems, setLineItems] = useState([]);
  const [description, setDescription] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newMins, setNewMins] = useState(0);

  function resetState() {
    updateLineItemsList([]);
    setRate(0);
    setDescription('');
  }

  // Grab a specific timesheet based on the timesheet name
  async function fetchTimesheet() {
    // Edge case for empty strings
    if (nameSelected === '') {
      resetState();
      return;
    }
    const timesheet = (await getDoc(doc(db, "timesheets", nameSelected))).data();

    // Set state based on whether timesheet exists or not
    if (timesheet === undefined) {
      resetState();
    }
    else {
      updateLineItemsList(timesheet.lineItems);
      setRate(timesheet.rate);
      setDescription(timesheet.description);
    }
  }

  // Grab list of all timesheet names
  async function fetchTimesheetNames() {
    await getDocs(collection(db, "timesheets"))
            .then((querySnapshot) => {
              const timesheets = querySnapshot.docs
                                .map((doc) => ({...doc.data(), name: doc.id}));
              const names = timesheets.map((timesheet) => (timesheet.name));
              setTimesheetNames(names);
            })
  }

  // Add a new line item to current state
  function addLineItem() {
    // Edge case - no date entered
    if (newDate === '') {
      alert("Cannot add item without a valid date.");
      return;
    }

    const newLineItem = {
      date: newDate,
      numMins: newMins,
      id: uuidv4(),
    };

    setLineItems([...lineItems, newLineItem]);
  }

  // Remove a new line item from current timesheet
  function delLineItem(id) {
    // Update state with removed line item
    const newLineItems = lineItems.filter((item) => item.id !== id)
    setLineItems(newLineItems);
  }

  // Remove all line items from current timesheet
  function clearLineItems() {
    // Update state with empty line items
    setLineItems([]);
  }

  // Update timesheet database with rate and description
  async function saveTimesheet() {
    // Edge case - empty name
    if (nameSelected === '') {
      alert("Cannot save timesheet without a name.");
      return;
    }

    const currTimesheet = doc(db, 'timesheets', nameSelected);

    try {
      await setDoc(currTimesheet, {
        rate: rate,
        description: description,
        lineItems: lineItems
      })
      fetchTimesheetNames();
      alert("Timesheet was saved!");
    } catch (err) {
      alert(err);
    }
  }

  // Load in timesheet data upon startup
  useEffect(() => {
    fetchTimesheet();
    fetchTimesheetNames();
  }, [])

  // Load in new timesheet data when name changes
  useEffect(() => {
    fetchTimesheet();
  }, [nameSelected])

  // Calculate new total mins when lineItems array updates
  useEffect(() => {
    calcTotalMinsWorked(lineItems);
  }, [lineItems])

  function updateNameSelected(event) {
    setNameSelected(event.target.value);
  }

  function updateLineItemsList(items) {
    if (items === undefined || items.length === 0) {
      setLineItems([]);
      return;
    }
    else {
      setLineItems(items);
    }
  }

  function updateRate(event) {
    let val = event.target.value;
    if (val === '') {
      val = 0;
    }

    setRate(parseInt(val));
  }

  function calcTotalCost(minsWorked, costRate) {
    return minsWorked * costRate;
  }

// Add total total minutes worked from items list
function calcTotalMinsWorked(items) {
  let total = 0;
  for (const item of items) {
    total += item.numMins;
  }
  setTotalMinsWorked(total);
}

// Build JSX list from items
function buildLineItemsTable(items) {
  let itemsToJSX = [];
  for (const lineItem of items) {
    const date = new Date(lineItem.date).toLocaleString();
    const mins = lineItem.numMins;
    const id = lineItem.id;
    itemsToJSX.push(
      <tr key={id}>
        <td scope="row">{date}</td>
        <td>{mins}</td>
        <td>
          <button className="btn btn-outline-danger" onClick={() => delLineItem(id)}>X</button>
        </td>
      </tr>
    );
  }

  return (
    <table className="table">
      <thead className="thead-light">
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Minutes</th>
          <th scope="col">
            <button type="button" className="btn btn-danger" onClick={clearLineItems}>Clear</button>
          </th>
        </tr>
      </thead>
      <tbody>
        {itemsToJSX}
      </tbody>
    </table>
  )
}

function buildNamesDropdownItems(names) {
  // NOTE: Adding key to <option> below prevents the select field from reflecting what's
  // currently selected. However, it's added here to mute the React error for missing keys
  const nameOptions = names.map((name) =>
    <option onClick={() => setNameSelected(name)} value={name} key={uuidv4()}>{name}</option>
  );

  return (
    <select id="timesheetNames">
      <option onClick={() => setNameSelected('')} value={''} />
      {nameOptions}
    </select>
  )
}

  return (
    <div>
      <div className="settings">
        {/* Timesheet Name */}
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text" id="basic-addon1">Timesheet name:</span>
          </div>
          <input value={nameSelected} onChange={updateNameSelected} placeholder='Create new...'/>
          
          <div className="input-group-prepend">
            <span className="input-group-text" id="basic-addon1">Select existing:</span>
          </div>
            {buildNamesDropdownItems(timesheetNames)}
        </div>

        <div className="input-group mb-2">
          {/* Rate */}
          <div className="input-group-prepend">
            <span className="input-group-text" id="inputGroup-sizing-sm">
              Rate:
            </span>
          </div>
          <input
            className="form-control"
            aria-label="Small"
            aria-describedby="inputGroup-sizing-sm"
            value={rate}
            type='number'
            onChange={updateRate}
          />

          {/* Description */}
          <div className="input-group-prepend">
            <span className="input-group-text" id="inputGroup-sizing-sm">
              Description:
            </span>
          </div>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button type="button" className="btn btn-primary" onClick={saveTimesheet}>
          Save Timesheet
        </button>
      </div>

      <div className='newItem'>
        <div className="input-group mb-2">
          {/* Date */}
          <div className="input-group-prepend">
            <span className="input-group-text" id="">Date:</span>
          </div>
          <input
            className="form-control"
            type="datetime-local"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />

          {/* Number of Minutes */}
          <div className="input-group-prepend">
            <span className="input-group-text" id="">Number of Minutes:</span>
          </div>
          <input
            className="form-control"
            value={newMins}
            type='number'
            onChange={(e) => setNewMins(parseInt(e.target.value))}
          />
        </div>
        <button type="button" className="btn btn-primary" onClick={addLineItem}>
          Add Item
        </button>

      </div>

      <div className="data">
        {buildLineItemsTable(lineItems)}
      </div>

      <div className="card-body">
        <div>
          Total Time: {totalMinsWorked}
        </div>

        <div>
          Total Cost: {calcTotalCost(totalMinsWorked, rate)}
        </div>
      </div>
    </div>
  )
}

export default Timesheet;