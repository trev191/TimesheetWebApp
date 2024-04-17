import './App.css';
import Timesheet from './components/Timesheet';

function App() {
  return (
    <div className="App">
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
