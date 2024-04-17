import '../styles/timesheet.css';
import { useState, useEffect } from 'react';

// Hardcoded database for line items
// TODO: transfer to cloud database
const database = {
  '0': [
    {
      'id': 1,
      'date': new Date(2000, 0, 1),
      'numMins': 10
    },
    {
      'id': 2,
      'date': new Date(2005, 2, 5),
      'numMins': 20
    },
    {
      'id': 3,
      'date': new Date(2010, 7, 16),
      'numMins': 33
    },
  ],
  
  '1': [
    {
      'id': 1,
      'date': new Date(1900, 0, 1),
      'numMins': 11
    },
    {
      'id': 2,
      'date': new Date(1905, 2, 5),
      'numMins': 22
    },
    {
      'id': 3,
      'date': new Date(1910, 7, 16),
      'numMins': 36
    },
  ]
}

function Timesheet() {
  const [nameSelected, setNameSelected] = useState('0');
  const [rate, setRate] = useState(50);
  const [totalMinsWorked, setTotalMinsWorked] = useState(0);
  const [lineItems, setLineItems] = useState([]);

  // Set line items list upon startup
  useEffect(() => {
    updateLineItemsList(nameSelected);
  }, [])

  // Calculate new total mins when lineItems array updates
  useEffect(() => {
    calcTotalMinsWorked(lineItems);
  }, [lineItems])

  // When name selected changes, update name state as well as line items list
  function updateNameSelected(event) {
    setNameSelected(event.target.value);
    updateLineItemsList(event.target.value);
  }

  function updateLineItemsList(name) {
    if (database[name] === undefined) {
      alert(`Timesheet ${name} does not exist.`);
      setLineItems([]);
      return;
    }
    else {
      setLineItems(database[name]);
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
  let itemsFromDatabase = [];
  for (const lineItem of items) {
    const date = lineItem.date.toDateString();
    const mins = lineItem.numMins;
    const id = lineItem.id;
    itemsFromDatabase.push(
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
        {itemsFromDatabase}
      </tbody>
    </table>
  )
}

  return (
    <div className="timesheet">
      {/* TODO: restrict input to only select timecard names that exist */}
      <label>
        Timesheet:
        <input defaultValue={nameSelected} onChange={updateNameSelected}/>
      </label>

      <label>
        Rate:
        <input defaultValue={rate} type='number' onChange={updateRate}/>
      </label>

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