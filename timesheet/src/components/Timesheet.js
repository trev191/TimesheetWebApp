import '../styles/timesheet.css';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from '../database/firebase';
import { v4 as uuidv4 } from 'uuid';

function Timesheet() {
  const [nameSelected, setNameSelected] = useState('0');
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

  // Add in a new line item to current timesheet
  async function addLineItem() {
    // Edge case - empty name
    if (nameSelected === '') {
      alert("Cannot add to timesheet without a name.");
      return;
    }

    // Edge case - no date entered
    if (newDate === '') {
      alert("Cannot add to timesheet without a valid date.");
      return;
    }

    const currTimesheet = doc(db, 'timesheets', nameSelected);

    const newLineItem = {
      date: newDate,
      numMins: newMins,
      id: uuidv4(),
    };

    // Update timesheet database with new line item
    // and add to state
    try {
      await updateDoc(currTimesheet, {
        lineItems: [...lineItems, newLineItem]
      })

      setLineItems([...lineItems, newLineItem]);
    } catch (err) {
      alert("Cannot add to timesheet that does not yet exist. Save the timesheet from above first.");
    }
  }

  // Remove a new line item from current timesheet
  async function delLineItem(id) {
    const currTimesheet = doc(db, 'timesheets', nameSelected);

    const newLineItems = lineItems.filter((item) => item.id !== id)

    // Update timesheet database with deleted line
    // item and update state
    try {
      await updateDoc(currTimesheet, {
        lineItems: newLineItems
      })

      setLineItems(newLineItems);
    } catch (err) {
      alert(err);
    }
  }

  // Remove all line items from current timesheet
  async function clearLineItems() {
    const currTimesheet = doc(db, 'timesheets', nameSelected);

    // Update timesheet database and state
    try {
      await updateDoc(currTimesheet, {
        lineItems: []
      })

      setLineItems([]);
    } catch (err) {
      alert(err);
    }
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
      alert("Timesheet was saved!");
    } catch (err) {
      alert(err);
    }
  }

  // Load in timesheet data upon startup
  useEffect(() => {
    fetchTimesheet();
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
        {itemsToJSX.length === 0 ? <tr> <td /> <td /> <td /> </tr> : itemsToJSX}
      </tbody>
    </table>
  )
}

  return (
    <div className="timesheet">
      {/* TODO: restrict input to only select timecard names that exist */}
      <div className="settings">
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text" id="basic-addon1">Timesheet name:</span>
          </div>
          <input type="text"
            className="form-control"
            aria-describedby="basic-addon1"
            value={nameSelected}
            onChange={updateNameSelected}
          />
        </div>

        <div className="input-group input-group-sm mb-2">
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
          Save
        </button>
      </div>

      <div className='newItem'>
        <div className="input-group mb-2">
          <div className="input-group-prepend">
            <span className="input-group-text" id="">Date and Number of Minutes</span>
          </div>
          <input
              className="form-control"
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
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