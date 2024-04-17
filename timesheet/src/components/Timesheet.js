import '../styles/timesheet.css';
import { useState } from 'react';

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

// Lookup timesheet name in database and calc total minutes worked
function calcTotalMinsWorked(name) {
  const items = database[name];

  if (items === undefined) {
    return 0;
  }

  let total = 0;
  for (const item of items) {
    total += item.numMins;
  }
  return total;
}

// Lookup timesheet name in database and build list from items
function buildLineItemsTable(name) {
  if (database[name] === undefined) {
    alert(`Timesheet ${name} does not exist.`);
    return;
  }

  let itemsFromDatabase = [];
  for (const lineItem of database[name]) {
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

function Timesheet() {
  const [nameSelected, setNameSelected] = useState('0');

  function updateNameSelected(event) {
    setNameSelected(event.target.value);
  }

  return (
    <div className="timesheet">
      {/* TODO: restrict input to only select timecard names that exist */}
      <input defaultValue={nameSelected} onChange={updateNameSelected}/>
      {buildLineItemsTable(nameSelected)}
      <div className='totalMinsWorked'>
        Total Mins Worked: {calcTotalMinsWorked(nameSelected)}
      </div>
    </div>
  )
}

export default Timesheet;