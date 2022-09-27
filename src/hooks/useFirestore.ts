import {
  collection,
  doc,
  DocumentData,
  getFirestore,
  onSnapshot,
  setDoc,
} from "firebase/firestore"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Collection, Doc } from "../api"
import { useFirebase } from "./useFirebase"

type AddId<T> = { id: string } & T

export function useFirestore() {
  const firebase = useFirebase()
  const firestore = useMemo(() => {
    return getFirestore(firebase.app)
  }, [firebase])

  return firestore
}

export function useCollectionRef(collectionId: Collection) {
  const firestore = useFirestore()

  return useMemo(
    () => collection(firestore, collectionId),
    [collectionId, firestore]
  )
}

export function useLiveCollection<T extends Collection>(collectionId: T) {
  const [data, setData] = useState<AddId<Doc[T]>[]>()
  const collectionRef = useCollectionRef(collectionId)

  useEffect(() => {
    console.debug("registering listener for " + collectionId)

    const unsubscribe = onSnapshot(collectionRef, function (querySnapshot) {
      console.debug("received new snapshot for " + collectionId)
      const data: AddId<Doc[T]>[] = []
      querySnapshot.forEach(function (doc) {
        data.push({ id: doc.id, ...doc.data() } as AddId<Doc[T]>)
      })
      setData(data)
    })

    return () => {
      console.debug("unregistering listener for " + collectionId)
      unsubscribe()
    }
  }, [collectionId, collectionRef])

  return data
}

export function useDocRef(collectionId: Collection, docId: string) {
  const firestore = useFirestore()

  return useMemo(
    () => doc(collection(firestore, collectionId), docId),
    [collectionId, docId, firestore]
  )
}

export function useLiveDoc<T extends DocumentData>(
  collectionId: Collection,
  docId: string
) {
  const [data, setData] = useState<T>()
  const docRef = useDocRef(collectionId, docId)

  useEffect(() => {
    console.debug("registering listener for " + collectionId + ":" + docId)

    const unsubscribe = onSnapshot(docRef, function (doc) {
      console.debug("received new snapshot for " + collectionId + ":" + docId)
      setData(doc.data() as T)
    })

    return () => {
      console.debug("unregistering listener for " + collectionId + ":" + docId)
      unsubscribe()
    }
  }, [collectionId, docId, docRef])

  return data
}

export function useDocWriter<T extends DocumentData>(
  collectionId: Collection,
  docId: string
) {
  const docRef = useDocRef(collectionId, docId)

  return useCallback(
    async function (data: T) {
      await setDoc(docRef, data)
    },
    [docRef]
  )
}
