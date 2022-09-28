import { orderBy, Timestamp, where } from "firebase/firestore"
import { Collection } from "../api"
import { useDocument, useDocWriter, useQuery } from "../hooks"

export function Admin({ params }: { params: { workshop: string } }) {
  console.debug("Rendering Exercises")

  const exercises = useQuery(
    Collection.Exercises,
    where("workshop", "==", params.workshop),
    orderBy("order")
  )
  const workshop = useDocument(Collection.Workshops, params.workshop)
  const writeWorkshop = useDocWriter(Collection.Workshops)
  const activeExerciseId = workshop?.activeExcercise
  const writeExercise = useDocWriter(Collection.Exercises)

  function makeActive(exerciseId: string | null) {
    writeWorkshop(params.workshop, { activeExcercise: exerciseId })
  }

  function startTimer(exerciseId: string | null) {
    writeExercise(exerciseId || "UNKNOWN", {
      started_at: Timestamp.fromDate(new Date()),
    })
  }

  function makeActiveAndStartTimer(exerciseId: string | null) {
    makeActive(exerciseId)
    startTimer(exerciseId)
  }

  return (
    <div className="admin">
      <h1>Admin {params.workshop}</h1>
      <button onClick={(e) => makeActive(null)}>Show podium</button>
      <ul>
        {exercises?.map((exercise) => (
          <li
            key={exercise.id}
            className={
              exercise.id === activeExerciseId
                ? "active"
                : exercise.started_at
                ? "started"
                : ""
            }
          >
            {exercise.name}{" "}
            {exercise.started_at ? (
              <>
                (already started){" "}
                <button onClick={(e) => makeActive(exercise.id)}>
                  Make active again
                </button>
              </>
            ) : (
              <button onClick={(e) => makeActiveAndStartTimer(exercise.id)}>
                Make active &amp; reset time
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
