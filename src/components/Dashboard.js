import React, { Component } from "react";
import classnames from "classnames";
import Loading from "./Loading";
import Panel from "./Panel";
import axios from "axios";
import {
  getTotalInterviews,
  getLeastPopularTimeSlot,
  getMostPopularDay,
  getInterviewsPerDay
 } from "helpers/selectors";
 import { setInterview } from "helpers/reducers";

 
// pass the helper function that can get a value, instead of the value itself
const data = [
  {
    id: 1,
    label: "Total Interviews",
    getValue: getTotalInterviews
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    getValue: getLeastPopularTimeSlot
  },
  {
    id: 3,
    label: "Most Popular Day",
    getValue: getMostPopularDay
  },
  {
    id: 4,
    label: "Interviews Per Day",
    getValue: getInterviewsPerDay
  }
];


class Dashboard extends Component {

  state = { 
    loading: true,
    focused: null, // either null or 1 to 4, representing the 4 panels
    days: [],
    appointments: {},
    interviews: {},

  };

  componentDidMount() {
    const focused = JSON.parse(localStorage.getItem("focused"));

    if (focused) {
      this.setState({ focused });
    }
    Promise.all([
      axios.get("/api/days"),
      axios.get("/api/appointments"),
      axios.get("/api/interviewers")
    ]).then(([days, appointments, interviewers]) => {
      this.setState({
        loading: false,
        days: days.data,
        appointments: appointments.data,
        interviewers: interviewers.data
      });
    });

    this.socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

    this.socket.onmessage = event => {
      const data = JSON.parse(event.data);
    
      if (typeof data === "object" && data.type === "SET_INTERVIEW") {
        this.setState(previousState =>
          setInterview(previousState, data.id, data.interview)
        );
      }
    };    

  }

  componentDidUpdate(previousProps, previousState) {
    if (previousState.focused !== this.state.focused) {
      localStorage.setItem("focused", JSON.stringify(this.state.focused));
    }
  }

  componentWillUnmount() {
    this.socket.close();
  }

  selectPanel(id) {
    this.setState(prev => ({
      focused: (prev.focused) ? null : id
    }))
   }

  render() {
    console.log(this.state)
    const dashboardClasses = classnames("dashboard", {"dashboard--focused": this.state.focused});

    if (this.state.loading) {
      return <Loading />;
    }
    // filter panel data before converting it to components.
    const panels = (this.state.focused ? data.filter(panel => this.state.focused === panel.id) : data)
    .map((panel) => 
      <Panel 
        key={panel.id} 
        label={panel.label} 
        value={panel.getValue(this.state)} 
        onSelect={event => this.selectPanel(panel.id)} // We will "use arrow function in render" to handle this as we pass the reference around. Remove the id prop from the Panel component declaration and wrap the this.selectPanel function call in an arrow function with the panel.id argument.
      />)

    return (
      <main className={dashboardClasses}>
        {panels}
      </main>
    )
  }
}

export default Dashboard;
