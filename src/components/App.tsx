import { Route, Switch } from "wouter"
import { Admin } from "./Admin"
import { Exercises } from "./Exercises"
import { Session } from "./Session"
import { Workshops } from "./Workshops"

export function App() {
  console.debug("Rendering App")

  return (
    <div className="app">
      <Session />
      <Switch>
        <Route path="/:workshop" component={Exercises} />
        <Route path="/:workshop/admin" component={Admin} />
        <Route component={Workshops} />
      </Switch>
    </div>
  )
}
