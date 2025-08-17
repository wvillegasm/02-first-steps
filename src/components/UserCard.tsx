
import './UserCard.css'

interface Props {
    name: string
    email: string
    address: string
}
export const UserCard = ({ name, email, address }: Props) => {
    return (
        <div className="user-card">
            <h2>{name}</h2>
            <p>{email}</p>
            <p>{address}</p>
        </div>
    )
}
