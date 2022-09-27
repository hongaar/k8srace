import { Collection } from "../api"
import { useLiveCollection } from "../hooks"

export function Workshops() {
  const workshops = useLiveCollection(Collection.Workshops)

  return (
    <div className="workshops">
      <ul>
        {workshops?.map((doc) => (
          <li>
            {doc.id}: {doc.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
