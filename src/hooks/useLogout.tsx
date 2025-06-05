import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function useLogout() {
  const router = useRouter()

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user')
        }
        
        toast.success('Logged out successfully')
        router.push('/login')
        router.refresh()
      } else {
        toast.error('Failed to logout')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('An error occurred during logout')
    }
  }

  return { logout }
}