import '../styles/timesheet.css';
import { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../database/firebase';

function Timesheet() {
  const [nameSelected, setNameSelected] = useState('0');
  const [rate, setRate] = useState(0);
  const [totalMinsWorked, setTotalMinsWorked] = useState(0);
  const [lineItems, setLineItems] = useState([]);
  const [description, setDescription] = useState('');

  // Grab a specific timesheet based on the timesheet name
  async function fetchTimesheet(name) {
    await getDocs(collection(db, "timesheets"))
            .then((querySnapshot) => {
              // Grab all timesheets from firestore collection
              const timesheets = querySnapshot.docs
                                .map((doc) => ({...doc.data(), id: doc.id}));

              // Search for the specific timesheet name
              const filteredTimesheet = timesheets.find((sheet) => sheet.name === name);
              if (filteredTimesheet === undefined) {
                updateLineItemsList([]);
                setRate(0);
                setDescription('');
              }
              
              else {
                updateLineItemsList(filteredTimesheet.lineItems);
                setRate(filteredTimesheet.rate);
                setDescription(filteredTimesheet.description);
              }

            })
  }

  // Load in timesheet data upon startup
  useEffect(() => {
    fetchTimesheet(nameSelected);
  }, [])

    // Set line items list upon startup
    useEffect(() => {
      fetchTimesheet(nameSelected);
    }, [nameSelected])

  // Calculate new total mins when lineItems array updates
  useEffect(() => {
    calcTotalMinsWorked(lineItems);
  }, [lineItems])

  // When name selected changes, update name state as well as line items list
  function updateNameSelected(event) {
    setNameSelected(event.target.value);
  }

  // When name selected changes, update name state as well as line items list
  function updateDescription(event) {
    setDescription(event.target.value);
  }

  function updateLineItemsList(items) {
    if (items.length === 0) {
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
    // TODO: generate uuid when creating a new line item
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
          <input value={description} onChange={updateDescription}/>
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