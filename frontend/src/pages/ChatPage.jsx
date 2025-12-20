import { useAuthStore } from "../store/useAuthStore";

const ChatPage = () => {
    const { authUser, logout } = useAuthStore();

    return (
        <div className="flex flex-col justify-center items-center z-10">
            <h1 className="text-2xl mb-4">Hello {authUser?.fullName}!</h1>
            <button onClick={logout} className="btn btn-accent">Logout</button>
        </div>
    )
}

export default ChatPage;