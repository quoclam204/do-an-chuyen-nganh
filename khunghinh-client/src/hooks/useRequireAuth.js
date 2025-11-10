import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const getMeFromStorage = () => {
    try {
        return JSON.parse(localStorage.getItem('kh_me') || 'null')
    } catch {
        return null
    }
}

export default function useRequireAuth() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)

    useEffect(() => {
        const currentUser = getMeFromStorage()
        setUser(currentUser)

        if (!currentUser) {
            navigate('/', { replace: true })
            return
        }

        setLoading(false)
    }, [navigate])

    return { user, loading }
}