import './App.css';
import Timesheet from './components/Timesheet';

function App() {
  return (
    <div className="App">
      {/* Bootstrap CSS */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossOrigin="anonymous"></link>
      <div className="App-header">
        <p>
          Timesheet Web App
        </p>
      </div>
      <div className="timesheet">
        <Timesheet />
      </div>
    </div>
  );
}

export default App;
