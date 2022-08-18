import React, { Component } from "react";
import classnames from "classnames";
import Loading from "./Loading";
import Panel from "./Panel";

// FAKE DATA
const data = [
  {
    id: 1,
    label: "Total Interviews",
    value: 6
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    value: "1pm"
  },
  {
    id: 3,
    label: "Most Popular Day",
    value: "Wednesday"
  },
  {
    id: 4,
    label: "Interviews Per Day",
    value: "2.3"
  }
];

class Dashboard extends Component {

  state = { 
    loading: false,
    focused: null // either null or 1 to 4, representing the 4 panels
  };

  selectPanel(id) {
    this.setState(prev => ({
      focused: (prev.focused) ? null : id
    }))
   }

  render() {
  
    const dashboardClasses = classnames("dashboard", {
      "dashboard--focused": this.state.focused
     });

    if (this.state.loading) {
      return <Loading />;
    }
    // filter panel data before converting it to components.
    const panels = (this.state.focused ? data.filter(panel => this.state.focused === panel.id) : data)
    .map((panel) => 
      <Panel 
        key={panel.id} 
        label={panel.label} 
        value={panel.value} 
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
