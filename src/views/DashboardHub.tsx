import { useDiscordAuth } from '../context/DiscordAuth'
import { isStaff } from '../lib/data'
import { ClientDashboard } from './ClientDashboard'
import { StaffDashboard } from './StaffDashboard'

export function DashboardHub() {
  const { userName, isAdmin } = useDiscordAuth()
  const staff = isAdmin || isStaff(userName)
  return staff ? <StaffDashboard /> : <ClientDashboard />
}
