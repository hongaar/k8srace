export enum Collection {
  Workshops = "workshops",
  Excercises = "excercises",
  Users = "users",
}

export type Doc = {
  [Collection.Workshops]: {
    name: string
  }
  [Collection.Excercises]: {}
  [Collection.Users]: {}
}
