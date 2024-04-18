import '../styles/timesheet.css';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../database/firebase';
import { v4 as uuidv4 } from 'uuid';

function Timesheet() {
  const [nameSelected, setNameSelected] = useState('0');
  const [rate, setRate] = useState(0);
  const [totalMinsWorked, setTotalMinsWorked] = useState(0);
  const [lineItems, setLineItems] = useState([]);
  const [description, setDescription] = useState('');
  const [newDate, setNewDate] = useState(new Date());
  const [newMins, setNewMins] = useState(0);

  // Grab a specific timesheet based on the timesheet name
  async function fetchTimesheet(name) {
    const timesheet = (await getDoc(doc(db, "timesheets", name))).data();

    // Set state based on whether timesheet exists or not
    if (timesheet === undefined) {
      updateLineItemsList([]);
      setRate(0);
      setDescription('');
    }
    else {
      updateLineItemsList(timesheet.lineItems);
      setRate(timesheet.rate);
      setDescription(timesheet.description);
    }
  }

  // Add in a new line item to current timesheet
  async function addLineItem() {
    const currTimesheet = doc(db, 'timesheets', nameSelected);
    const newLineItem = {
      date: newDate,
      numMins: newMins,
      id: uuidv4(),
    };

    // Update timesheet database with new line item
    // and retrieve updated items
    try {
      await updateDoc(currTimesheet, {
        lineItems: [...lineItems, newLineItem]
      })

      fetchTimesheet(nameSelected);
    } catch (err) {
      alert(err);
    }
  }

  async function saveTimesheet() {
    const currTimesheet = doc(db, 'timesheets', nameSelected);

    // Update timesheet database with rate and description
    try {
      await updateDoc(currTimesheet, {
        rate: rate,
        description: description
      })
      alert("Timesheet was saved!");
    } catch (err) {
      alert(err);
    }
  }

  // Load in timesheet data upon startup
  useEffect(() => {
    fetchTimesheet(nameSelected);
  }, [])

  // Load in new timesheet data when name changes
  useEffect(() => {
    fetchTimesheet(nameSelected);
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
      alert(`Timesheet ${nameSelected} does not exist.`);
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
    const date = lineItem.date.toDate().toDateString();
    const mins = lineItem.numMins;
    const id = lineItem.id;
    itemsToJSX.push(
      <tr key={id}>
        <th>Date:</th>
        <td>{date}</td>
        <th>Time:</th>
        <td>{mins}</td>
      </tr>
    );
  }

  return (
    <table>
      <tbody>
        {itemsToJSX}
      </tbody>
    </table>
  )
}

  return (
    <div className="timesheet">
      {/* TODO: restrict input to only select timecard names that exist */}
      <div>
        <label>
          Timesheet:
          <input value={nameSelected} onChange={updateNameSelected}/>
        </label>

        <label>
          Rate:
          <input value={rate} type='number' onChange={updateRate}/>
        </label>

        <label>
          Description:
          <input value={description} onChange={(e) => setDescription(e.target.value)}/>
        </label>

        <button onClick={saveTimesheet}>
            Save
          </button>
      </div>

      <div>
        <label>
          Add new line:
          <input value={newDate} onChange={(e) => setNewDate(e.target.value)}/>
          <input value={newMins} type='number' onChange={(e) => setNewMins(parseInt(e.target.value))}/>
          <button onClick={addLineItem}>
            Add Item
          </button>
        </label>
      </div>

      {buildLineItemsTable(lineItems)}

      <div>
        Total Time: {totalMinsWorked}
      </div>

      <div>
        Total Cost: {calcTotalCost(totalMinsWorked, rate)}
      </div>
    </div>
  )
}

export default Timesheet;