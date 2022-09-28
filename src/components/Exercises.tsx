import { differenceInSeconds, formatDistance, formatDuration } from "date-fns"
import { where } from "firebase/firestore"
import {
  calculateTotalScore,
  Collection,
  hasScore,
  sortSessionsForExercise,
} from "../api"
import {
  useCollection,
  useDocument,
  useDocWriter,
  useQuery,
  useSession,
  useTime,
} from "../hooks"

export function Exercises({ params }: { params: { workshop: string } }) {
  console.debug("Rendering Exercises")

  const workshop = useDocument(Collection.Workshops, params.workshop)
  const activeExerciseId = workshop?.activeExcercise || "UNKNOWN"
  const exercises = useQuery(
    Collection.Exercises,
    where("workshop", "==", params.workshop)
  )
  const activeExercise = exercises.find(
    (exercise) => exercise.id === activeExerciseId
  )
  const sessions = useCollection(Collection.Sessions)
  const { name } = useSession()
  const activeSession = sessions.find((session) => session.id === name)
  const writeSession = useDocWriter(Collection.Sessions)
  const currentTime = useTime()

  const exerciseStartedAt = activeExercise?.started_at?.toDate() || Date.now()
  const hasFinished = hasScore(activeExerciseId, activeSession)

  function finish() {
    const seconds = differenceInSeconds(currentTime, exerciseStartedAt)
    writeSession(name || "UNKNOWN", {
      scores: {
        [activeExerciseId]: seconds,
      },
    })
  }

  if (!activeSession) {
    return <div>Please join first</div>
  }

  return (
    <div className="exercises">
      {workshop?.activeExcercise ? (
        <div>
          <h1>
            <span className="prefix">Exercise:</span> {activeExercise?.name}
          </h1>
          {hasFinished ? (
            <div className="player-list">
              <ul>
                {sessions
                  .filter((session) => session.online === true)
                  .sort(sortSessionsForExercise(activeExerciseId))
                  .map((session) => (
                    <li
                      key={session.id}
                      className={session.id === name ? "active" : ""}
                    >
                      <span className="badge-spacer">
                        <span
                          className="badge"
                          style={{ backgroundColor: session.color }}
                        >
                          {session.id}
                        </span>
                      </span>
                      :{" "}
                      {typeof session.scores !== "undefined" &&
                      typeof session.scores[activeExerciseId] !== "undefined"
                        ? formatDuration({
                            seconds: session.scores[activeExerciseId],
                          })
                        : "not finished yet"}
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <div>
              <p>Once you're finished, hit the big green button below:</p>
              <button className="finish" onClick={finish}>
                {formatDistance(currentTime, exerciseStartedAt, {
                  includeSeconds: true,
                })}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="player-list">
          <h1>Podium</h1>
          <ul>
            {sessions
              .filter((session) => session.online === true)
              .map(calculateTotalScore(exercises, sessions))
              .sort((a, b) => {
                if (a.total_score < b.total_score) return 1
                if (a.total_score > b.total_score) return -1
                return 0
              })
              .map((session, index) => (
                <li
                  key={session.id}
                  className={session.id === name ? "active" : ""}
                >
                  <span className="emoji-spacer">
                    {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : ""}
                  </span>
                  <span className="badge-spacer">
                    <span
                      className="badge"
                      style={{ backgroundColor: session.color }}
                    >
                      {session.id}
                    </span>
                  </span>
                  : {session.total_score}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}
