export interface IUser {
    _id: string
    id?: string
    firstName?: string
    lastName?: string
    name?: string
    email?: string
    image?: string
    role?: string
    country?: string
    profession?: string | Array<{ name: string; price?: string; isGVA?: boolean }>
    rating?: number
    status?: string
    orgRole?: string
    access?: string[]
}

export interface IOrg {
    _id: string
    name?: string
    image?: string
    description?: string
}
